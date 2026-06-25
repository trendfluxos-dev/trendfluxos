import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Maximize2, Radio, Volume2, VolumeX } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import {
  formatStartsAt,
  getLiveClass,
  type LiveClass,
} from "@/lib/liveClasses";
// Legacy WebRTC viewer was removed in favor of the controlled-tab broadcast
// model. Students now join via the share-token route (`/class/:token`). This
// page stays as a fallback that renders the "waiting" state.
const useStudentViewer = (_id: string, _enabled: boolean) => ({
  stream: null as MediaStream | null,
  status: "connecting" as const,
});

/**
 * In-app student viewer for a live class. Anyone can open it (no login
 * required) — the teacher's broadcast is the gate: if the teacher hasn't
 * picked a window, the viewer just shows "waiting for teacher".
 */
const EdtechLiveWatch = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [cls, setCls] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { stream, status } = useStudentViewer(id, !!id);

  useSeo({
    title: cls ? `Watch live — ${cls.title}` : "Watch live class",
    description: "Join the কর্মশিক্ষা TED Plus live class — in-app, no install.",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLiveClass(id);
        if (!cancelled) setCls(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const enterFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  };

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <Link
            to={EDTECH.routes.live}
            className="inline-flex items-center gap-1 text-[12px] text-foreground/60 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All live classes
          </Link>

          {loading ? (
            <div className="mt-6 h-8 w-64 animate-pulse rounded bg-card/40" />
          ) : cls ? (
            <header className="mt-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {cls.title}
              </h1>
              <p className="mt-1 text-[13px] text-foreground/65">
                {formatStartsAt(cls.starts_at)} · {cls.duration_min} min · host {cls.host_name}
              </p>
            </header>
          ) : (
            <header className="mt-3">
              <h1 className="font-display text-2xl font-semibold">Live class</h1>
            </header>
          )}

          <div
            ref={containerRef}
            className="relative mt-5 overflow-hidden rounded-3xl border border-border/60 bg-black"
          >
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                className="h-full w-full object-contain"
              />
              {!stream && <ViewerOverlay status={status} />}

              {stream && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                  <Radio className="h-3 w-3" /> Live
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-card/40 px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                Teacher-controlled view · only the window your teacher picked
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[11px] text-foreground/75 hover:bg-background/80"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  {muted ? "Muted" : "Sound on"}
                </button>
                <button
                  type="button"
                  onClick={enterFullscreen}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[11px] text-foreground/75 hover:bg-background/80"
                >
                  <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                </button>
              </div>
            </div>
          </div>

          {cls?.description && (
            <p className="mt-5 max-w-3xl text-[14px] leading-[1.75] text-foreground/70">
              {cls.description}
            </p>
          )}
        </div>
      </section>
    </EdtechShell>
  );
};

const ViewerOverlay = ({ status }: { status: string }) => {
  const map: Record<string, { title: string; sub: string }> = {
    idle: { title: "Connecting…", sub: "Setting up your viewer." },
    connecting: { title: "Connecting…", sub: "Waiting for the teacher's broadcast." },
    reconnecting: { title: "Reconnecting…", sub: "We'll resume as soon as the link is back." },
    live: { title: "Live", sub: "" },
  };
  const m = map[status] ?? map.idle;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-foreground/70" aria-hidden />
      <p className="font-display text-base font-semibold">{m.title}</p>
      {m.sub && <p className="max-w-xs text-center text-[12px] text-foreground/65">{m.sub}</p>}
    </div>
  );
};

export default EdtechLiveWatch;