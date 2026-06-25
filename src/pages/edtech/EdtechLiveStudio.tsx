import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Circle,
  ExternalLink,
  MonitorPlay,
  Radio,
  ShieldCheck,
  StopCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import {
  formatStartsAt,
  getLiveClass,
  setLiveClassStatus,
  type LiveClass,
} from "@/lib/liveClasses";
import {
  pickWindowStream,
  useTeacherBroadcast,
} from "@/lib/liveScreenShare";

/**
 * Teacher control room. Admin-only (route is wrapped in RequireRole).
 *
 * The teacher clicks "Pick window to share", the browser shows its native
 * picker, and only the chosen surface is ever streamed — anything else the
 * teacher opens stays private. Toggling "Go live" flips the class status
 * so students see a "Watch in-app" call to action on /edtech/live.
 */
const EdtechLiveStudio = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const previewRef = useRef<HTMLVideoElement>(null);
  const { viewerCount } = useTeacherBroadcast(id, stream);

  useSeo({ title: cls ? `Live studio — ${cls.title}` : "Live studio", noindex: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLiveClass(id);
        if (!cancelled) setCls(data);
      } catch {
        toast.error("Could not load this class.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Wire stream into the local preview so teacher sees what students see.
  useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = stream;
  }, [stream]);

  // If the teacher closes the page mid-broadcast, stop tracks + mark ended.
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const pickAndGoLive = useCallback(async () => {
    try {
      const picked = await pickWindowStream();
      // If the teacher hits the browser's "Stop sharing" toolbar, drop the
      // stream and mark the class as ended.
      picked.stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setStream(null);
        setSourceLabel("");
        if (cls) void setLiveClassStatus(cls.id, "ended");
      });
      setStream(picked.stream);
      setSourceLabel(picked.label);
      if (cls && cls.status !== "live") {
        try {
          await setLiveClassStatus(cls.id, "live");
          setCls({ ...cls, status: "live" });
          toast.success("You're live. Students can join from /edtech/live.");
        } catch {
          toast.error("Could not flip class to live. Sharing continues anyway.");
        }
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "NotAllowedError") {
        console.error(err);
        toast.error(e?.message ?? "Could not start sharing.");
      }
    }
  }, [cls]);

  const stopBroadcast = useCallback(async () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setSourceLabel("");
    if (cls) {
      try {
        await setLiveClassStatus(cls.id, "ended");
        setCls({ ...cls, status: "ended" });
        toast.success("Broadcast ended.");
      } catch {
        toast.error("Stopped, but could not flip status.");
      }
    }
  }, [stream, cls]);

  if (loading) {
    return (
      <EdtechShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </EdtechShell>
    );
  }

  if (!cls) {
    return (
      <EdtechShell>
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Class not found</h1>
          <p className="mt-2 text-foreground/65">
            This live session may have been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate(EDTECH.routes.adminLive)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to admin
          </button>
        </div>
      </EdtechShell>
    );
  }

  const broadcasting = !!stream;

  return (
    <EdtechShell>
      <section className="border-b border-border/60 bg-card/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
          <div className="min-w-0">
            <Link
              to={EDTECH.routes.adminLive}
              className="inline-flex items-center gap-1 text-[12px] text-foreground/60 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Admin · Live classes
            </Link>
            <h1 className="mt-1 truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
              {cls.title}
            </h1>
            <p className="mt-1 text-[12px] text-foreground/60">
              {formatStartsAt(cls.starts_at)} · {cls.duration_min} min · host {cls.host_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge live={broadcasting} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[12px] text-foreground/75">
              <Users className="h-3.5 w-3.5" /> {viewerCount} watching
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[2fr_1fr] lg:px-10">
        {/* Preview */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-black">
          <div className="relative aspect-video w-full bg-black">
            {stream ? (
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-foreground/50">
                <MonitorPlay className="h-12 w-12" aria-hidden />
                <p className="text-sm">No window picked yet</p>
                <p className="max-w-xs text-center text-[11px] text-foreground/40">
                  Click "Pick a window" below — only that one window streams.
                  Everything else on your screen stays private.
                </p>
              </div>
            )}
            {broadcasting && (
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                <Circle className="h-2 w-2 animate-pulse fill-white" /> Live
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-card/40 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                Source
              </p>
              <p className="mt-0.5 truncate text-[13px] text-foreground/80">
                {sourceLabel || "—"}
              </p>
            </div>
            <div className="flex gap-2">
              {broadcasting ? (
                <>
                  <button
                    type="button"
                    onClick={pickAndGoLive}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[12px] font-semibold text-foreground hover:bg-background/80"
                  >
                    <MonitorPlay className="h-4 w-4" /> Switch window
                  </button>
                  <button
                    type="button"
                    onClick={stopBroadcast}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-[12px] font-semibold text-white hover:bg-rose-500/90"
                  >
                    <StopCircle className="h-4 w-4" /> End broadcast
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={pickAndGoLive}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Radio className="h-4 w-4" /> Pick a window & go live
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
              <ShieldCheck className="h-3.5 w-3.5" /> Privacy
            </p>
            <ul className="mt-3 space-y-2 text-[13px] leading-[1.7] text-foreground/75">
              <li>• Only the window you pick is shared.</li>
              <li>• Opening another tab or app does not change what students see.</li>
              <li>• System audio and your own browser tab are excluded by default.</li>
              <li>• Hit "End broadcast" or close the browser bar to stop instantly.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
              Student watch link
            </p>
            <Link
              to={EDTECH.routes.liveWatch(cls.id)}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1 truncate text-[13px] text-primary hover:underline"
            >
              {EDTECH.routes.liveWatch(cls.id)} <ExternalLink className="h-3 w-3" />
            </Link>
            <p className="mt-2 text-[11px] text-foreground/55">
              Share this with cohort students if they don't already have access.
            </p>
          </div>
        </aside>
      </main>
    </EdtechShell>
  );
};

const StatusBadge = ({ live }: { live: boolean }) => (
  <span
    className={[
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
      live
        ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
        : "border-border/60 bg-background/60 text-foreground/60",
    ].join(" ")}
  >
    <Circle className={`h-2 w-2 ${live ? "fill-rose-400 animate-pulse" : "fill-foreground/30"}`} />
    {live ? "On air" : "Off air"}
  </span>
);

export default EdtechLiveStudio;