import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Circle,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Layout,
  Lock,
  MonitorPlay,
  MousePointer2,
  Pencil,
  Plus,
  Presentation,
  Radio,
  RotateCcw,
  ScreenShare,
  Send,
  StopCircle,
  Type,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import { EDTECH } from "@/config/edtech";
import StudioAiPanel from "@/components/edtech/StudioAiPanel";
import { useSeo } from "@/hooks/useSeo";
import {
  formatStartsAt,
  getLiveClass,
  setLiveClassStatus,
  type LiveClass,
} from "@/lib/liveClasses";
import { pickWindowStream, useTeacherBroadcast } from "@/lib/liveScreenShare";

type StageSource = "empty" | "share" | "whiteboard" | "web";
type StageMode = "slide" | "split" | "screen";

/**
 * Teacher control room. Admin-only (route is wrapped in RequireRole).
 *
 * EISH-style "Presenter Dock": teacher picks a material/web page/whiteboard
 * or shares a window. Stage stays PRIVATE (teacher preview only) until
 * "Send to Live" — only then does the stream propagate to students.
 * Hitting "Hide" pulls it back to private without ending the class.
 */
const EdtechLiveStudio = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [stageSource, setStageSource] = useState<StageSource>("empty");
  const [stageMode, setStageMode] = useState<StageMode>("slide");
  const [livePublic, setLivePublic] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const previewRef = useRef<HTMLVideoElement>(null);
  // Only broadcast to students when teacher has explicitly hit "Send to Live".
  const { viewerCount } = useTeacherBroadcast(id, livePublic ? stream : null);

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

  useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const pickWindow = useCallback(async () => {
    try {
      const picked = await pickWindowStream();
      picked.stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setStream(null);
        setSourceLabel("");
        setStageSource((s) => (s === "share" ? "empty" : s));
        setLivePublic(false);
      });
      setStream(picked.stream);
      setSourceLabel(picked.label);
      setStageSource("share");
      toast.success(`Staged "${picked.label}" privately. Hit Send to Live when ready.`);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "NotAllowedError") {
        console.error(err);
        toast.error(e?.message ?? "Could not start sharing.");
      }
    }
  }, []);

  const sendToLive = useCallback(async () => {
    if (!cls) return;
    if (stageSource === "empty") {
      toast.error("Pick a material, share a tab, or open the whiteboard first.");
      return;
    }
    setLivePublic(true);
    if (cls.status !== "live") {
      try {
        await setLiveClassStatus(cls.id, "live");
        setCls({ ...cls, status: "live" });
      } catch {
        toast.error("Sent to stage, but could not flip class to live.");
        return;
      }
    }
    toast.success("You're live. Students see this stage now.");
  }, [cls, stageSource]);

  const hideFromStudents = useCallback(() => {
    setLivePublic(false);
    toast("Hidden. Stage is private again.");
  }, []);

  const endClass = useCallback(async () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setSourceLabel("");
    setStageSource("empty");
    setLivePublic(false);
    if (cls) {
      try {
        await setLiveClassStatus(cls.id, "ended");
        setCls({ ...cls, status: "ended" });
        toast.success("Class ended.");
      } catch {
        toast.error("Stopped, but could not flip status.");
      }
    }
  }, [stream, cls]);

  const resetStage = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setSourceLabel("");
    setStageSource("empty");
    setLivePublic(false);
    toast("Stage reset.");
  }, [stream]);

  const startClass = useCallback(async () => {
    if (!cls) return;
    try {
      await setLiveClassStatus(cls.id, "live");
      setCls({ ...cls, status: "live" });
      toast.success("Class started. Stage stays private until Send to Live.");
    } catch {
      toast.error("Could not start the class.");
    }
  }, [cls]);

  const copyStudentLink = useCallback(async () => {
    if (!cls) return;
    const url = `${window.location.origin}${EDTECH.routes.liveWatch(cls.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Student join link copied.");
    } catch {
      toast.error(`Copy failed — link: ${url}`);
    }
  }, [cls]);

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
          <p className="mt-2 text-foreground/65">This live session may have been removed.</p>
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

  const studentJoinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${EDTECH.routes.liveWatch(cls.id)}`;

  return (
    <EdtechShell>
      {/* Top utility bar */}
      <section className="border-b border-border/60 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={EDTECH.routes.adminLive}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Classes
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
                {cls.title}
              </h1>
              <p className="truncate text-[11px] text-foreground/55">
                Class ID · {cls.id.slice(0, 8)} · {formatStartsAt(cls.starts_at)} · {cls.duration_min} min
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyStudentLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80"
            >
              <Copy className="h-3.5 w-3.5" /> Copy link
            </button>
            <button
              type="button"
              onClick={resetStage}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <Link
              to={EDTECH.routes.adminLive}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80"
            >
              <Presentation className="h-3.5 w-3.5" /> Schedule
            </Link>
            {cls.status === "live" ? (
              <button
                type="button"
                onClick={endClass}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-500/90"
              >
                <StopCircle className="h-3.5 w-3.5" /> End class
              </button>
            ) : (
              <button
                type="button"
                onClick={startClass}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Radio className="h-3.5 w-3.5" /> Start class
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3-column dock */}
      <main className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 lg:grid-cols-[260px_1fr_320px] lg:px-6">
        {/* LEFT: Presenter Dock */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
                Presenter Dock
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  title="Library"
                  className="rounded-md border border-border/60 bg-background/60 p-1 text-foreground/65 hover:text-foreground"
                >
                  <Layout className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Add material"
                  className="rounded-md border border-border/60 bg-background/60 p-1 text-foreground/65 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Materials
            </p>
            <button
              type="button"
              onClick={() => toast("Material upload — coming in Phase 2 (Bunny Stream)")}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/40 px-3 py-3 text-[12px] text-foreground/60 hover:bg-background/60"
            >
              <Upload className="h-3.5 w-3.5" /> Upload your first material →
            </button>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Web page
            </p>
            <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-2 py-1.5">
              <input
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://…"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground placeholder:text-foreground/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!webUrl) return toast.error("Paste a URL first.");
                  setStageSource("web");
                  toast.success("Web page staged. Send to Live to broadcast.");
                }}
                className="rounded-md bg-primary/90 p-1.5 text-primary-foreground hover:bg-primary"
              >
                <Globe className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStageSource("whiteboard")}
              className={[
                "mt-3 flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                stageSource === "whiteboard"
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 bg-background/40 hover:bg-background/60",
              ].join(" ")}
            >
              <Pencil className="mt-0.5 h-4 w-4 text-foreground/70" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">Whiteboard</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/45">
                  Draw live · Step 2
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={pickWindow}
              className={[
                "mt-2 flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                stageSource === "share"
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 bg-background/40 hover:bg-background/60",
              ].join(" ")}
            >
              <ScreenShare className="mt-0.5 h-4 w-4 text-foreground/70" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">Share tab / window</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                  Implement live for students
                </p>
              </div>
            </button>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
              Student view
            </p>
            <a
              href={studentJoinUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-1 truncate text-[12px] text-primary hover:underline"
            >
              <span className="truncate">{studentJoinUrl}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        </aside>

        {/* CENTER: Stage */}
        <section className="rounded-2xl border border-border/60 bg-card/30">
          {/* Stage status banner */}
          <div
            className={[
              "flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b px-4 py-2.5",
              livePublic
                ? "border-rose-500/30 bg-rose-500/10"
                : "border-border/60 bg-background/40",
            ].join(" ")}
          >
            <div className="inline-flex items-center gap-2 text-[12px] font-medium">
              {livePublic ? (
                <>
                  <Circle className="h-2 w-2 animate-pulse fill-rose-500 text-rose-500" />
                  <span className="text-rose-300">LIVE — students see this stage</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-foreground/55" />
                  <span className="text-foreground/70">Private — nothing is broadcast yet</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {livePublic ? (
                <>
                  <button
                    type="button"
                    onClick={hideFromStudents}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-background/90"
                  >
                    <EyeOff className="h-3 w-3" /> Hide
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-semibold text-white">
                    <Eye className="h-3 w-3" /> Already live
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={sendToLive}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-500/90"
                >
                  <Send className="h-3 w-3" /> Send to Live
                </button>
              )}
            </div>
          </div>

          {/* Stage tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2">
            <p className="inline-flex items-center gap-1.5 text-[11px] text-foreground/55">
              <MonitorPlay className="h-3 w-3" /> Teacher stage (your preview)
            </p>
            <div className="flex items-center gap-1 text-[11px]">
              {(["slide", "split", "screen"] as StageMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setStageMode(m)}
                  className={[
                    "rounded-md px-2 py-1 font-medium capitalize transition",
                    stageMode === m
                      ? "bg-primary/15 text-primary"
                      : "text-foreground/60 hover:text-foreground",
                  ].join(" ")}
                >
                  {m}
                </button>
              ))}
              <button
                type="button"
                onClick={resetStage}
                className="ml-1 rounded-md px-2 py-1 font-medium text-foreground/60 hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Stage canvas */}
          <div
            className="relative w-full overflow-hidden bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.08)_1px,transparent_0)] [background-size:18px_18px]"
            style={{ aspectRatio: "16 / 9" }}
          >
            {stageSource === "share" && stream ? (
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-contain"
              />
            ) : stageSource === "whiteboard" ? (
              <StageEmpty
                icon={<Pencil className="h-10 w-10" />}
                title="Digital Whiteboard"
                hint="Coming in step 2 — tldraw integration"
              />
            ) : stageSource === "web" ? (
              <iframe
                src={webUrl}
                title="Web page preview"
                className="h-full w-full border-0 bg-background"
              />
            ) : (
              <StageEmpty
                icon={<MonitorPlay className="h-10 w-10" />}
                title="Nothing on stage"
                hint="Pick a material, web page, whiteboard, or share a tab/window. It stays private until you press Send to Live."
              />
            )}
            {livePublic && (
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                <Circle className="h-1.5 w-1.5 animate-pulse fill-white" /> Live
              </div>
            )}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-2 py-1 backdrop-blur">
              {[MousePointer2, Type, Pencil, Send].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded-full p-1.5 text-foreground/65 hover:bg-foreground/10 hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-card/40 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">Source</p>
              <p className="mt-0.5 truncate text-[12px] text-foreground/80">
                {sourceLabel || (stageSource === "whiteboard" ? "Whiteboard" : stageSource === "web" ? webUrl : "—")}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] text-foreground/75">
              <Users className="h-3.5 w-3.5" /> {viewerCount} watching
            </span>
          </div>
        </section>

        {/* RIGHT: Teacher-only AI/Notes/Web */}
        <aside>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-1.5">
            <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/90">
              Teacher only
            </p>
            <StudioAiPanel />
          </div>
        </aside>
      </main>
    </EdtechShell>
  );
};

const StageEmpty = ({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-foreground/55">
    <div className="rounded-full border border-border/60 bg-background/60 p-3 text-foreground/60">
      {icon}
    </div>
    <p className="text-sm font-semibold text-foreground/80">{title}</p>
    <p className="max-w-sm text-center text-[11px] leading-relaxed text-foreground/45">{hint}</p>
  </div>
);

export default EdtechLiveStudio;
