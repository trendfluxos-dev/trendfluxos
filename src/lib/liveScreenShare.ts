/**
 * Selective live screen sharing for কর্মশিক্ষা TED Plus live classes.
 *
 * The teacher uses the browser's getDisplayMedia picker to choose ONE
 * surface (window / tab / app). Constraints:
 *   - displaySurface: "window"         → default to a single window
 *   - selfBrowserSurface: "exclude"    → teacher can't accidentally share
 *                                         the Studio tab itself
 *   - surfaceSwitching: "exclude"      → teacher can't swap surfaces mid-stream
 *   - systemAudio: "exclude"           → no system audio capture
 *
 * Whatever else the teacher opens after that point stays private — the
 * MediaStream only ever contains the originally selected surface. This is
 * enforced by the browser, not by us.
 *
 * Signalling rides Supabase Realtime broadcast on `screen:${classId}`.
 * One offer per joining student peer; ICE candidates are exchanged via the
 * same channel. STUN-only (Google's public servers) — fine for the typical
 * Bangladesh classroom where NAT traversal is rarely symmetric. If a
 * student is behind a strict NAT they'll see "reconnecting" indefinitely.
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export type ScreenViewerStatus = "idle" | "connecting" | "live" | "reconnecting";

export interface PickedStream {
  stream: MediaStream;
  /** Human label for the chosen surface, when the browser exposes it. */
  label: string;
}

/**
 * Open the picker and return a single-surface MediaStream.
 * Throws if the user dismisses the picker or denies permission.
 */
export async function pickWindowStream(): Promise<PickedStream> {
  // Cast — TS lib hasn't caught up to the newer DisplayMediaStreamConstraints
  // fields (selfBrowserSurface, surfaceSwitching, systemAudio).
  const constraints = {
    video: { displaySurface: "window", frameRate: { ideal: 24, max: 30 } },
    audio: false,
    selfBrowserSurface: "exclude",
    surfaceSwitching: "exclude",
    systemAudio: "exclude",
  } as unknown as DisplayMediaStreamOptions;

  const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
  const label = stream.getVideoTracks()[0]?.label ?? "Shared window";
  return { stream, label };
}

/**
 * Teacher side: pushes the provided MediaStream to every joining student.
 * Pass `stream = null` to tear the broadcast down.
 */
export function useTeacherBroadcast(
  classId: string | null,
  stream: MediaStream | null,
) {
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!classId || !stream) return;
    const peers = new Map<string, RTCPeerConnection>();
    const channel = supabase.channel(`screen:${classId}`, {
      config: { broadcast: { self: false } },
    });

    const updateCount = () => setViewerCount(peers.size);

    const makeOffer = async (peerId: string) => {
      peers.get(peerId)?.close();
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peers.set(peerId, pc);
      updateCount();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          channel.send({
            type: "broadcast",
            event: "ice",
            payload: { peerId, from: "teacher", candidate: e.candidate.toJSON() },
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          pc.close();
          peers.delete(peerId);
          updateCount();
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channel.send({
        type: "broadcast",
        event: "offer",
        payload: { peerId, sdp: pc.localDescription },
      });
    };

    channel
      .on("broadcast", { event: "join" }, ({ payload }) => {
        if (payload?.peerId) void makeOffer(payload.peerId);
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        const pc = peers.get(payload?.peerId);
        if (pc && payload?.sdp && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(payload.sdp);
        }
      })
      .on("broadcast", { event: "ice" }, async ({ payload }) => {
        if (payload?.from !== "student") return;
        const pc = peers.get(payload.peerId);
        if (pc && payload.candidate) {
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch {
            /* ignore stale ICE */
          }
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "teacher-ready",
            payload: { at: Date.now() },
          });
        }
      });

    // Heartbeat: re-announce so students who joined late or briefly lost
    // realtime can rejoin without us needing to re-pick the window.
    const beat = setInterval(() => {
      channel.send({
        type: "broadcast",
        event: "teacher-ready",
        payload: { at: Date.now() },
      });
    }, 8000);

    return () => {
      clearInterval(beat);
      peers.forEach((pc) => pc.close());
      peers.clear();
      setViewerCount(0);
      supabase.removeChannel(channel);
    };
  }, [classId, stream]);

  return { viewerCount };
}

/**
 * Student side: returns the live MediaStream pushed by the teacher and a
 * status flag for UI feedback. Automatically rejoins after disconnection.
 */
export function useStudentViewer(
  classId: string | null,
  enabled: boolean,
): { stream: MediaStream | null; status: ScreenViewerStatus } {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<ScreenViewerStatus>("idle");
  const peerIdRef = useRef<string>("");

  useEffect(() => {
    if (!classId || !enabled) {
      setStream(null);
      setStatus("idle");
      return;
    }
    if (!peerIdRef.current) peerIdRef.current = crypto.randomUUID();
    const peerId = peerIdRef.current;
    let pc: RTCPeerConnection | null = null;
    let rejoinTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    setStatus("connecting");

    const channel = supabase.channel(`screen:${classId}`, {
      config: { broadcast: { self: false } },
    });

    const scheduleRejoin = (delay = 1500) => {
      if (cancelled) return;
      setStatus("reconnecting");
      if (rejoinTimer) clearTimeout(rejoinTimer);
      rejoinTimer = setTimeout(() => {
        if (cancelled) return;
        channel.send({ type: "broadcast", event: "join", payload: { peerId } });
      }, delay);
    };

    const setupPc = () => {
      pc?.close();
      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc.ontrack = (e) => {
        setStream(e.streams[0] ?? new MediaStream([e.track]));
        setStatus("live");
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          channel.send({
            type: "broadcast",
            event: "ice",
            payload: { peerId, from: "student", candidate: e.candidate.toJSON() },
          });
        }
      };
      pc.onconnectionstatechange = () => {
        if (!pc) return;
        if (pc.connectionState === "connected") setStatus("live");
        else if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          setStream(null);
          scheduleRejoin();
        }
      };
    };

    channel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload?.peerId !== peerId || !payload?.sdp) return;
        setupPc();
        await pc!.setRemoteDescription(payload.sdp);
        const answer = await pc!.createAnswer();
        await pc!.setLocalDescription(answer);
        channel.send({
          type: "broadcast",
          event: "answer",
          payload: { peerId, sdp: pc!.localDescription },
        });
      })
      .on("broadcast", { event: "ice" }, async ({ payload }) => {
        if (payload?.from !== "teacher" || payload?.peerId !== peerId) return;
        if (pc && payload.candidate) {
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch {
            /* ignore stale ICE */
          }
        }
      })
      .on("broadcast", { event: "teacher-ready" }, () => {
        channel.send({ type: "broadcast", event: "join", payload: { peerId } });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({ type: "broadcast", event: "join", payload: { peerId } });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          scheduleRejoin(2000);
        }
      });

    return () => {
      cancelled = true;
      if (rejoinTimer) clearTimeout(rejoinTimer);
      pc?.close();
      pc = null;
      setStream(null);
      setStatus("idle");
      supabase.removeChannel(channel);
    };
  }, [classId, enabled]);

  return { stream, status };
}