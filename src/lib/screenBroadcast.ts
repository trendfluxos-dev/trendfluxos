// One-window screen broadcasting via WebRTC + Supabase Realtime signalling.
// Ported from the standalone Live Class Studio project. The browser's
// getDisplayMedia picker enforces a single chosen surface — only the
// originally selected window/tab/app is ever in the MediaStream, even if
// the teacher opens other windows afterwards.
import { supabase } from "@/integrations/supabase/client";

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
};

export type BroadcastHandle = { stop: () => void };

export async function pickWindowStream(): Promise<MediaStream> {
  // displaySurface "window" hints the browser to default to the Window tab.
  // selfBrowserSurface "exclude" hides the current tab from the picker so a
  // teacher can never accidentally share the Studio itself.
  const constraints: MediaStreamConstraints & Record<string, unknown> = {
    video: { displaySurface: "window", frameRate: { ideal: 24, max: 30 } } as MediaTrackConstraints,
    audio: false,
    selfBrowserSurface: "exclude",
    surfaceSwitching: "exclude",
    systemAudio: "exclude",
  };
  return await navigator.mediaDevices.getDisplayMedia(constraints);
}

export function startTeacherBroadcast(classId: string, stream: MediaStream): BroadcastHandle {
  const peers = new Map<string, RTCPeerConnection>();
  const ch = supabase.channel(`screen:${classId}`, { config: { broadcast: { self: false } } });

  async function handleJoin(peerId: string) {
    const existing = peers.get(peerId);
    if (existing) { try { existing.close(); } catch { /* noop */ } peers.delete(peerId); }
    const pc = new RTCPeerConnection(ICE_CONFIG);
    peers.set(peerId, pc);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ch.send({ type: "broadcast", event: "ice", payload: { to: peerId, from: "teacher", candidate: e.candidate.toJSON() } });
      }
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        try { pc.close(); } catch { /* noop */ }
        peers.delete(peerId);
      }
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ch.send({ type: "broadcast", event: "offer", payload: { to: peerId, sdp: pc.localDescription } });
  }

  ch.on("broadcast", { event: "join" }, ({ payload }) => { void handleJoin(payload.peerId); });
  ch.on("broadcast", { event: "answer" }, async ({ payload }) => {
    const pc = peers.get(payload.from);
    if (pc && !pc.currentRemoteDescription) await pc.setRemoteDescription(payload.sdp);
  });
  ch.on("broadcast", { event: "ice" }, async ({ payload }) => {
    if (payload.to !== "teacher") return;
    const pc = peers.get(payload.from);
    if (pc && payload.candidate) {
      try { await pc.addIceCandidate(payload.candidate); } catch { /* noop */ }
    }
  });

  ch.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      ch.send({ type: "broadcast", event: "teacher-ready", payload: {} });
    }
  });

  // If the teacher clicks the browser's "Stop sharing" toolbar, stop everything.
  stream.getVideoTracks()[0]?.addEventListener("ended", () => stop());

  function stop() {
    peers.forEach((p) => { try { p.close(); } catch { /* noop */ } });
    peers.clear();
    stream.getTracks().forEach((t) => { try { t.stop(); } catch { /* noop */ } });
    supabase.removeChannel(ch);
  }

  return { stop };
}

export function startStudentReceiver(
  classId: string,
  onStream: (stream: MediaStream | null) => void,
): BroadcastHandle {
  const peerId = (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.()
    ?? Math.random().toString(36).slice(2);
  let pc: RTCPeerConnection | null = null;
  const ch = supabase.channel(`screen:${classId}`, { config: { broadcast: { self: false } } });

  function reset() {
    if (pc) { try { pc.close(); } catch { /* noop */ } }
    pc = new RTCPeerConnection(ICE_CONFIG);
    pc.ontrack = (e) => onStream(e.streams[0] ?? null);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ch.send({ type: "broadcast", event: "ice", payload: { to: "teacher", from: peerId, candidate: e.candidate.toJSON() } });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc && ["failed", "closed", "disconnected"].includes(pc.connectionState)) onStream(null);
    };
  }

  ch.on("broadcast", { event: "offer" }, async ({ payload }) => {
    if (payload.to !== peerId) return;
    reset();
    await pc!.setRemoteDescription(payload.sdp);
    const ans = await pc!.createAnswer();
    await pc!.setLocalDescription(ans);
    ch.send({ type: "broadcast", event: "answer", payload: { from: peerId, sdp: pc!.localDescription } });
  });
  ch.on("broadcast", { event: "ice" }, async ({ payload }) => {
    if (payload.to !== peerId || !pc) return;
    if (payload.candidate) { try { await pc.addIceCandidate(payload.candidate); } catch { /* noop */ } }
  });
  ch.on("broadcast", { event: "teacher-ready" }, () => {
    ch.send({ type: "broadcast", event: "join", payload: { peerId } });
  });

  ch.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      ch.send({ type: "broadcast", event: "join", payload: { peerId } });
    }
  });

  return {
    stop() {
      if (pc) { try { pc.close(); } catch { /* noop */ } pc = null; }
      onStream(null);
      supabase.removeChannel(ch);
    },
  };
}