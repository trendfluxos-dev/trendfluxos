import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Copy, ExternalLink, Eye, EyeOff, FileText, Film, File as FileIcon,
  Globe, Image as ImageIcon, Link2, Lock, Pencil, PlayCircle, Play,
  Radio, RotateCcw, Send, StopCircle, Trash2, ChevronDown, MonitorUp, MonitorOff,
  Circle, Square, MonitorPlay, RefreshCw, Minus, Maximize2, X,
} from "lucide-react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import StudioAiPanel from "@/components/edtech/StudioAiPanel";
import { AddMaterialDialog } from "@/components/edtech/AddMaterialDialog";
import { Whiteboard } from "@/components/edtech/Whiteboard";
import { ShareWindowDialog } from "@/components/edtech/ShareWindowDialog";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import {
  formatStartsAt, getLiveClass, setLiveClassStatus, type LiveClass,
} from "@/lib/liveClasses";
import {
  listMaterials, deleteMaterial, signMaterialUrl, type ClassMaterial, type MaterialKind,
} from "@/lib/classMaterials";
import {
  fetchLiveState, setLiveState, type ActiveSourceType,
} from "@/lib/liveState";
import { supabase } from "@/integrations/supabase/client";
import { startTeacherBroadcast, type BroadcastHandle } from "@/lib/screenBroadcast";
import { startClassRecorder, isRecorderSupported, type RecorderHandle } from "@/lib/classRecorder";
import { SaveRecordingDialog } from "@/components/edtech/SaveRecordingDialog";
import { StudentLayoutPreview } from "@/components/edtech/StudentLayoutPreview";
import { resetShareToken } from "@/lib/liveClasses";
import { markOnboarding } from "@/lib/studioOnboarding";

type StageSource =
  | { type: "none"; payload: Record<string, unknown> }
  | { type: "material"; payload: { materialId: string; signed_url?: string; external_url?: string; kind: MaterialKind; title: string } }
  | { type: "web"; payload: { url: string } }
  | { type: "whiteboard"; payload: Record<string, unknown> };

const EMPTY: StageSource = { type: "none", payload: {} };

const KIND_ICON: Record<MaterialKind, typeof FileText> = {
  pdf: FileText, slide: FileText, image: ImageIcon, video: Film,
  audio: Film, doc: FileIcon, link: Link2,
};

const LIBRARY_GROUPS: { label: string; kinds: MaterialKind[] }[] = [
  { label: "Slides", kinds: ["slide"] },
  { label: "PDF",    kinds: ["pdf"] },
  { label: "Video",  kinds: ["video"] },
  { label: "Image",  kinds: ["image"] },
  { label: "Doc",    kinds: ["doc", "audio", "link"] },
];

const EdtechLiveStudio = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [stage, setStage] = useState<StageSource>(EMPTY);
  const [live, setLive] = useState<{ source: StageSource; visible: boolean }>({ source: EMPTY, visible: false });
  const [webUrl, setWebUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [layoutPreviewOpen, setLayoutPreviewOpen] = useState(false);
  const [mirrorOpen, setMirrorOpen] = useState(true);
  const [mirrorMinimized, setMirrorMinimized] = useState(false);
  const broadcastRef = useRef<BroadcastHandle | null>(null);
  const recorderRef = useRef<RecorderHandle | null>(null);
  const shareStreamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const [savePayload, setSavePayload] = useState<{ blob: Blob; mime: string; duration: number } | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setTeacherId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      const started = recorderRef.current?.getStartedAt();
      if (started) setRecElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [recording]);

  const openShareDialog = useCallback(() => {
    if (!id) return;
    setShareDialogOpen(true);
  }, [id]);

  const handleShareConfirmed = useCallback((stream: MediaStream) => {
    if (!id) return;
    // Replace any prior broadcast (supports repick mid-session).
    broadcastRef.current?.stop();
    const handle = startTeacherBroadcast(id, stream);
    broadcastRef.current = handle;
    shareStreamRef.current = stream;
    setSharing(true);
    setShareDialogOpen(false);
    stream.getVideoTracks()[0]?.addEventListener("ended", () => {
      broadcastRef.current = null;
      shareStreamRef.current = null;
      setSharing(false);
      toast("Screen share ended");
    });
    toast.success("Sharing window with students");
  }, [id]);

  const stopWindowShare = useCallback(() => {
    broadcastRef.current?.stop();
    broadcastRef.current = null;
    shareStreamRef.current = null;
    setSharing(false);
    toast("Stopped sharing");
  }, []);

  useEffect(() => () => {
    broadcastRef.current?.stop();
    recorderRef.current?.cancel();
  }, []);

  const startRecording = useCallback(async () => {
    if (!isRecorderSupported()) {
      toast.error("এই browser-এ recording supported না।");
      return;
    }
    const stream = shareStreamRef.current;
    if (!stream) {
      toast.error("আগে Share window করুন তারপর Record করুন।");
      return;
    }
    try {
      const rec = await startClassRecorder(stream);
      recorderRef.current = rec;
      setRecording(true);
      setRecElapsed(0);
      toast.success("Recording শুরু হলো");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recorder শুরু করা গেল না");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    try {
      const blob = await rec.stop();
      const duration = Math.floor((Date.now() - rec.getStartedAt()) / 1000);
      recorderRef.current = null;
      setRecording(false);
      setSavePayload({ blob, mime: rec.getMimeType(), duration });
    } catch (e) {
      recorderRef.current = null;
      setRecording(false);
      toast.error(e instanceof Error ? e.message : "Recording থামানো গেল না");
    }
  }, []);

  useSeo({ title: cls ? `Live studio — ${cls.title}` : "Live studio", noindex: true });

  const reloadMaterials = useCallback(async () => {
    if (!id) return;
    try { setMaterials(await listMaterials(id)); } catch (e) { console.warn(e); }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await getLiveClass(id);
        if (cancelled) return;
        setCls(c);
        const mats = await listMaterials(id);
        if (cancelled) return;
        setMaterials(mats);
        const ls = await fetchLiveState(id);
        if (cancelled) return;
        const sourceFromDb = inflateSource(ls.active_source_type, ls.payload, mats);
        setLive({ source: sourceFromDb, visible: ls.is_live_visible });
        setStage(sourceFromDb);
      } catch {
        toast.error("Could not load this class.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const publish = useCallback(async (src: StageSource, opts?: { silent?: boolean }) => {
    if (src.type === "none") return;
    try {
      await setLiveState(id, {
        active_source_type: src.type as ActiveSourceType,
        payload: src.payload as Record<string, unknown>,
        is_live_visible: true,
      });
      setLive({ source: src, visible: true });
      if (!opts?.silent) toast.success("🔴 Published — students see this now");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    }
  }, [id]);

  const stageSource = useCallback((src: StageSource) => {
    setStage(src);
    if (live.visible && src.type !== "none") void publish(src, { silent: true });
  }, [live.visible, publish]);

  const previewMaterial = useCallback(async (m: ClassMaterial) => {
    try {
      const signed = await signMaterialUrl(m);
      stageSource({
        type: "material",
        payload: {
          materialId: m.id,
          signed_url: signed ?? undefined,
          external_url: m.external_url ?? undefined,
          kind: m.kind,
          title: m.title,
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load material");
    }
  }, [stageSource]);

  const previewWeb = useCallback(() => {
    let u = webUrl.trim();
    if (!u) return toast.error("Paste a URL first.");
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    stageSource({ type: "web", payload: { url: u } });
  }, [webUrl, stageSource]);

  const previewWhiteboard = useCallback(() => {
    stageSource({ type: "whiteboard", payload: {} });
  }, [stageSource]);

  const sendToLive = useCallback(async () => {
    if (stage.type === "none") return toast.error("Stage is empty.");
    await publish(stage);
    markOnboarding("start");
    if (cls && cls.status !== "live") {
      try {
        await setLiveClassStatus(cls.id, "live");
        setCls({ ...cls, status: "live" });
      } catch { /* ignore */ }
    }
  }, [stage, publish, cls]);

  const hideFromStudents = useCallback(async () => {
    try {
      await setLiveState(id, {
        active_source_type: live.source.type as ActiveSourceType,
        payload: live.source.payload as Record<string, unknown>,
        is_live_visible: false,
      });
      // Force-notify students that visibility flipped off.
      const ch = supabase.channel(`class:${id}`);
      await ch.subscribe();
      await ch.send({ type: "broadcast", event: "live_changed", payload: { at: Date.now() } });
      void supabase.removeChannel(ch);
      setLive({ ...live, visible: false });
      toast("Hidden — students see waiting screen");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not hide");
    }
  }, [id, live]);

  const resetStage = useCallback(() => {
    setStage(EMPTY);
    if (live.visible) void hideFromStudents();
    toast("Stage cleared.");
  }, [hideFromStudents, live.visible]);

  const startClass = useCallback(async () => {
    if (!cls) return;
    try {
      await setLiveClassStatus(cls.id, "live");
      setCls({ ...cls, status: "live" });
      toast.success("Class started. Stage stays private until Send to Live.");
    } catch { toast.error("Could not start the class."); }
  }, [cls]);

  const endClass = useCallback(async () => {
    if (!cls) return;
    try {
      if (recorderRef.current) {
        await stopRecording();
      }
      await hideFromStudents().catch(() => {});
      await setLiveClassStatus(cls.id, "ended");
      setCls({ ...cls, status: "ended" });
      toast.success("Class ended.");
    } catch { toast.error("Could not end."); }
  }, [cls, hideFromStudents, stopRecording]);

  const removeMaterial = useCallback(async (m: ClassMaterial) => {
    if (!confirm(`Delete "${m.title}"?`)) return;
    try {
      await deleteMaterial(m);
      setMaterials((prev) => prev.filter((x) => x.id !== m.id));
      if (stage.type === "material" && stage.payload.materialId === m.id) setStage(EMPTY);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }, [stage]);

  const studentUrl = useMemo(() => {
    if (!cls?.share_token || typeof window === "undefined") return "";
    return `${window.location.origin}/class/${cls.share_token}`;
  }, [cls?.share_token]);

  const copyStudentLink = useCallback(async () => {
    if (!studentUrl) return toast.error("No share link on this class.");
    try {
      await navigator.clipboard.writeText(studentUrl);
      markOnboarding("linkCopied");
      toast.success("Student link copied.");
    }
    catch { toast.error(`Link: ${studentUrl}`); }
  }, [studentUrl]);

  const handleResetLink = useCallback(async () => {
    if (!cls) return;
    if (!confirm("পুরোনো student link এখনই কাজ করা বন্ধ করবে। Reset করবেন?")) return;
    try {
      const token = await resetShareToken(cls.id);
      setCls({ ...cls, share_token: token });
      toast.success("নতুন student link তৈরি হয়েছে");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset link");
    }
  }, [cls]);

  const stageIsLive = live.visible && JSON.stringify(stage) === JSON.stringify(live.source);

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
          <button type="button" onClick={() => navigate(EDTECH.routes.adminLive)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to admin
          </button>
        </div>
      </EdtechShell>
    );
  }

  return (
    <EdtechShell>
      {/* Top bar */}
      <section className="border-b border-border/60 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={EDTECH.routes.adminLive} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium text-foreground/70 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Classes
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-semibold leading-tight text-foreground sm:text-lg">{cls.title}</h1>
              <p className="truncate text-[11px] text-foreground/55">
                {formatStartsAt(cls.starts_at)} · {cls.duration_min} min
              </p>
            </div>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary" title="Students দেখবে শুধু আপনি 'Send to Live' করা content।">
              <Lock className="h-3 w-3" /> PRIVATE STUDIO
            </span>
            {cls.status === "live" && (
              <span className="ml-1 animate-pulse rounded-full bg-rose-500/95 px-2 py-0.5 text-[10px] font-semibold text-white">● LIVE</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {studentUrl && (
              <>
                <button type="button" onClick={copyStudentLink} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80">
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </button>
                <a href={studentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80">
                  <ExternalLink className="h-3.5 w-3.5" /> Preview
                </a>
                <button
                  type="button"
                  onClick={() => setLayoutPreviewOpen(true)}
                  title="৩-প্যানেল student layout সিমুলেশন — publish ছাড়াই"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80"
                >
                  <MonitorPlay className="h-3.5 w-3.5" /> Layout
                </button>
                <button
                  type="button"
                  onClick={handleResetLink}
                  title="নতুন student link বানান (পুরোনো link বন্ধ হবে)"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset link
                </button>
              </>
            )}
            <button type="button" onClick={resetStage} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            {sharing ? (
              <>
                <button type="button" onClick={openShareDialog} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80" title="অন্য window বেছে নিন">
                  <MonitorUp className="h-3.5 w-3.5" /> Repick
                </button>
                <button type="button" onClick={stopWindowShare} className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-500/90">
                  <MonitorOff className="h-3.5 w-3.5" /> Stop sharing
                </button>
              </>
            ) : (
              <button type="button" onClick={openShareDialog} className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary/20">
                <MonitorUp className="h-3.5 w-3.5" /> Share window
              </button>
            )}
            {recording ? (
              <button type="button" onClick={stopRecording}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-600/90">
                <Square className="h-3.5 w-3.5" fill="currentColor" />
                Stop rec · {Math.floor(recElapsed / 60).toString().padStart(2,"0")}:{(recElapsed % 60).toString().padStart(2,"0")}
              </button>
            ) : sharing ? (
              <button type="button" onClick={startRecording}
                title="Shared window record করুন (mic সহ)"
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-[12px] font-semibold text-rose-300 hover:bg-rose-500/20">
                <Circle className="h-3.5 w-3.5" fill="currentColor" /> Record
              </button>
            ) : null}
            {cls.status === "live" ? (
              <button type="button" onClick={endClass} className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-500/90">
                <StopCircle className="h-3.5 w-3.5" /> End class
              </button>
            ) : (
              <button type="button" onClick={startClass} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">
                <PlayCircle className="h-3.5 w-3.5" /> Start class
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3-column */}
      <main className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 lg:grid-cols-[280px_1fr_320px] lg:px-6">
        {/* LEFT — Library */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/70">Library</p>
              <AddMaterialDialog classId={id} onAdded={reloadMaterials} />
            </div>

            <div className="space-y-1.5">
              {LIBRARY_GROUPS.map((g) => {
                const items = materials.filter((m) => g.kinds.includes(m.kind));
                return (
                  <LibraryGroup
                    key={g.label}
                    label={g.label}
                    items={items}
                    stage={stage}
                    live={live}
                    onPreview={previewMaterial}
                    onRemove={removeMaterial}
                  />
                );
              })}
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">Web page</p>
            <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-2 py-1.5">
              <input value={webUrl} onChange={(e) => setWebUrl(e.target.value)} placeholder="https://…" className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground placeholder:text-foreground/40 focus:outline-none" />
              <button type="button" onClick={previewWeb} className="rounded-md bg-primary/90 p-1.5 text-primary-foreground hover:bg-primary"><Globe className="h-3.5 w-3.5" /></button>
            </div>

            <button type="button" onClick={previewWhiteboard} className={`mt-3 flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${stage.type === "whiteboard" ? "border-primary/60 bg-primary/10" : "border-border/60 bg-background/40 hover:bg-background/60"}`}>
              <Pencil className="h-4 w-4 text-foreground/70" />
              <span className="text-[13px] font-medium text-foreground">Whiteboard</span>
            </button>
          </div>

          {studentUrl && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/65">Student view</p>
              <a href={studentUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 truncate text-[12px] text-primary hover:underline">
                <span className="truncate">{studentUrl}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
          )}
        </aside>

        {/* CENTER — Stage */}
        <section className="rounded-2xl border border-border/60 bg-card/30">
          <div className={`flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b px-4 py-2.5 ${stageIsLive ? "border-rose-500/30 bg-rose-500/10" : live.visible ? "border-amber-500/40 bg-amber-500/10" : "border-border/60 bg-background/40"}`}>
            <div className="inline-flex items-center gap-2 text-[12px] font-medium">
              {stageIsLive ? (
                <span className="inline-flex items-center gap-1.5 text-rose-300"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />LIVE — students see this stage</span>
              ) : live.visible ? (
                <span className="inline-flex items-center gap-1.5 text-amber-300"><Radio className="h-3.5 w-3.5" />Students see something else — publish this stage to switch</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-foreground/70"><Lock className="h-3.5 w-3.5" />Private — nothing is broadcast yet</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setMirrorOpen((o) => !o); setMirrorMinimized(false); }}
                title="Real-time student mirror (যা student দেখছে)"
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                  mirrorOpen
                    ? "bg-foreground/10 text-foreground"
                    : "border border-border/60 bg-background/70 text-foreground/75 hover:bg-background/90",
                ].join(" ")}
              >
                <Eye className="h-3 w-3" /> {mirrorOpen ? "Mirror on" : "Mirror"}
              </button>
              {live.visible && (
                <button type="button" onClick={hideFromStudents} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-background/90">
                  <EyeOff className="h-3 w-3" /> Hide
                </button>
              )}
              <button type="button" disabled={stage.type === "none" || stageIsLive} onClick={sendToLive} className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-500/90 disabled:cursor-not-allowed disabled:opacity-50">
                <Send className="h-3 w-3" /> {stageIsLive ? "Already live" : "Send to Live"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-border/60 bg-card/40 px-4 py-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />Opened privately — students দেখবে না যতক্ষণ না "Send to Live" চাপেন।</span>
            {stage.type !== "none" && <button type="button" onClick={() => setStage(EMPTY)} className="hover:text-foreground">Clear</button>}
          </div>

          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
            <StageView source={stage} classId={id} />
            {stageIsLive && (
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
              </div>
            )}
            {mirrorOpen && (
              mirrorMinimized ? (
                <button
                  type="button"
                  onClick={() => setMirrorMinimized(false)}
                  className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-medium shadow-lg hover:bg-card"
                >
                  <span className={`h-2 w-2 rounded-full ${live.visible ? "animate-pulse bg-rose-500" : "bg-muted-foreground"}`} />
                  Student Mirror
                  <Maximize2 className="h-3 w-3" />
                </button>
              ) : (
                <div className="absolute bottom-3 right-3 z-20 w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
                  <div className="flex items-center justify-between border-b border-border bg-card/90 px-2.5 py-1.5 text-[11px] backdrop-blur">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <span className={`h-2 w-2 rounded-full ${live.visible ? "animate-pulse bg-rose-500" : "bg-muted-foreground"}`} />
                      {live.visible ? "LIVE — students দেখছে" : "Students অপেক্ষা করছে"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button type="button" title="Minimize" onClick={() => setMirrorMinimized(true)} className="rounded p-1 hover:bg-accent">
                        <Minus className="h-3 w-3" />
                      </button>
                      <button type="button" title="Close" onClick={() => setMirrorOpen(false)} className="rounded p-1 hover:bg-accent">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                    {live.visible && live.source.type !== "none" ? (
                      <div className="pointer-events-none absolute inset-0">
                        <StageView source={live.source} classId={id} />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <Lock className="mx-auto mb-1 h-6 w-6 opacity-50" />
                          <p className="text-[11px] font-medium">
                            {cls.status === "live" ? "কিছু publish হয়নি" : "Class শুরু হয়নি"}
                          </p>
                          <p className="text-[10px]">"Send to Live" চাপলে student দেখবে</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-2.5 py-1 text-[10px] text-muted-foreground">
                    <span>Real-time student view</span>
                    {studentUrl && (
                      <a href={studentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                        <ExternalLink className="h-3 w-3" /> Open full
                      </a>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* RIGHT — AI sidebar */}
        <aside>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-1.5">
            <p className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/90">
              <Lock className="h-3 w-3" /> Teacher only
            </p>
            <StudioAiPanel classId={id} />
          </div>
        </aside>
      </main>
      <ShareWindowDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onConfirm={handleShareConfirmed}
        studentUrl={studentUrl || undefined}
      />
      <SaveRecordingDialog
        open={!!savePayload}
        onOpenChange={(v) => { if (!v) setSavePayload(null); }}
        classId={cls?.id ?? null}
        teacherId={teacherId ?? ""}
        defaultTitle={cls ? `${cls.title} — ${new Date().toLocaleDateString()}` : "Class recording"}
        blob={savePayload?.blob ?? null}
        mimeType={savePayload?.mime ?? "video/webm"}
        durationSec={savePayload?.duration}
        onDiscard={() => setSavePayload(null)}
      />
      <StudentLayoutPreview
        open={layoutPreviewOpen}
        onOpenChange={setLayoutPreviewOpen}
        title={cls?.title ?? ""}
        isLive={cls?.status === "live"}
        hasPublishedContent={live.visible && live.source.type !== "none"}
        hasMeetLink={!!cls?.meeting_url}
        studentUrl={studentUrl}
      />
    </EdtechShell>
  );
};

function inflateSource(type: string, payload: Record<string, unknown>, mats: ClassMaterial[]): StageSource {
  if (type === "web" && typeof payload?.url === "string") return { type: "web", payload: { url: payload.url } };
  if (type === "whiteboard") return { type: "whiteboard", payload: {} };
  if (type === "material" && typeof payload?.materialId === "string") {
    const m = mats.find((x) => x.id === payload.materialId);
    if (m) return {
      type: "material",
      payload: {
        materialId: m.id,
        signed_url: typeof payload.signed_url === "string" ? payload.signed_url : undefined,
        external_url: m.external_url ?? undefined,
        kind: m.kind,
        title: m.title,
      },
    };
  }
  return EMPTY;
}

function StageView({ source, classId }: { source: StageSource; classId: string }) {
  if (source.type === "none") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-white"
           style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 55%, hsl(45 95% 60%) 100%)" }}>
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80">
          <Play className="h-7 w-7 translate-x-[2px]" fill="currentColor" />
        </div>
        <p className="text-[13px] font-medium tracking-wide text-white/95">Live Stage — what students see</p>
      </div>
    );
  }
  if (source.type === "web") return <iframe src={source.payload.url} title="Web preview" className="h-full w-full border-0 bg-white" />;
  if (source.type === "whiteboard") return <Whiteboard classId={classId} mode="edit" />;
  if (source.type === "material") {
    const url = source.payload.signed_url ?? source.payload.external_url ?? "";
    if (!url) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Material unavailable</div>;
    if (source.payload.kind === "image") return <img src={url} alt={source.payload.title} className="h-full w-full object-contain" />;
    if (source.payload.kind === "video") return <video src={url} controls className="h-full w-full bg-black" />;
    if (source.payload.kind === "audio") return <div className="flex h-full items-center justify-center p-6"><audio src={url} controls className="w-full max-w-xl" /></div>;
    return <iframe src={url} title={source.payload.title} className="h-full w-full border-0 bg-white" />;
  }
  return null;
}

export default EdtechLiveStudio;

function LibraryGroup({
  label, items, stage, live, onPreview, onRemove,
}: {
  label: string;
  items: ClassMaterial[];
  stage: StageSource;
  live: { source: StageSource; visible: boolean };
  onPreview: (m: ClassMaterial) => void;
  onRemove: (m: ClassMaterial) => void;
}) {
  const [open, setOpen] = useState(items.length > 0);
  useEffect(() => { if (items.length > 0) setOpen(true); }, [items.length]);
  return (
    <div className="rounded-lg border border-border/60 bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] font-medium text-foreground/85 hover:text-foreground"
      >
        <span>{label}</span>
        <span className="flex items-center gap-1.5 text-[10px] text-foreground/45">
          {items.length > 0 && <span>{items.length}</span>}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && items.length > 0 && (
        <div className="space-y-1 border-t border-border/40 px-2 py-2">
          {items.map((m) => {
            const Icon = KIND_ICON[m.kind] ?? FileIcon;
            const staged = stage.type === "material" && stage.payload.materialId === m.id;
            const onLive = live.visible && live.source.type === "material" && (live.source.payload as { materialId?: string }).materialId === m.id;
            return (
              <div key={m.id} className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] transition ${staged ? "bg-primary/12 text-foreground" : "hover:bg-accent/40"}`}>
                <button type="button" onClick={() => onPreview(m)} className="flex flex-1 items-center gap-2 truncate text-left">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${staged ? "text-primary" : "text-foreground/55"}`} />
                  <span className="truncate">{m.title}</span>
                  {onLive && <span className="rounded-full bg-rose-500 px-1.5 py-0 text-[9px] font-bold text-white">LIVE</span>}
                </button>
                <button type="button" onClick={() => onRemove(m)} className="opacity-0 transition group-hover:opacity-100">
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-rose-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}