import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, ArrowUpRight, Headphones, Clock, Loader2, ChevronLeft, ChevronRight, Sparkles, Zap, ZapOff, AlertTriangle, Copy, X } from "lucide-react";
import audioAsset from "@/assets/mayer-nishedh-chapter-1.mp3.asset.json";
import { track } from "@/lib/analytics";
import { useAutoplayPreview, useEffectiveReducedMotion } from "@/lib/audioPreferences";
import { CdnStatusChip } from "@/components/media/CdnStatusChip";
import { useCdnHeaderCheck } from "@/lib/cdnHeaderCheck";
import { useNearViewport } from "@/hooks/useNearViewport";

const ANALYTICS_CONTEXT = {
  chapter: "chapter-1",
  story_id: "mayer-nishedh",
  surface: "home-teaser",
} as const;

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function mediaErrorText(code?: number) {
  switch (code) {
    case 1: return "Playback aborted (MEDIA_ERR_ABORTED).";
    case 2: return "Network error while loading audio (MEDIA_ERR_NETWORK).";
    case 3: return "Audio decode failed (MEDIA_ERR_DECODE).";
    case 4: return "Audio source not supported (MEDIA_ERR_SRC_NOT_SUPPORTED).";
    default: return "Unknown media error.";
  }
}

/**
 * AudioStoryTeaser — compact home-page section featuring the recorded
 * narrative "অ্যালগরিদম আর টর্চার সেলের রুদ্ধশ্বাস জীবন".
 * Premium, minimal, cinematic — matches The Stand visual language.
 */
export default function AudioStoryTeaser() {
  const ref = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  // Observe the visible section (the <audio> element itself has 0×0 dimensions,
  // which causes IntersectionObserver to never report intersection).
  const sectionRef = useRef<HTMLElement | null>(null);
  const nearViewport = useNearViewport(sectionRef, "500px");
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buffered, setBuffered] = useState(0);
  // Preview: hover or first-click triggers a short low-volume intro
  // that auto-stops after PREVIEW_MS unless the user takes over with Play.
  const PREVIEW_MS = 8000;
  const [previewing, setPreviewing] = useState(false);
  const previewedOnce = useRef(false);
  const previewTimer = useRef<number | null>(null);
  // Track which milestones we've already fired so we never duplicate.
  const milestonesRef = useRef<Set<25 | 50 | 75>>(new Set());
  const completedRef = useRef(false);
  const [liveMsg, setLiveMsg] = useState("");
  const seekCountRef = useRef(0);
  const [autoplayPreview, setAutoplayPreview] = useAutoplayPreview();
  const reducedMotion = useEffectiveReducedMotion();

  // Effective autoplay = user pref AND not reduced-motion.
  const allowAutoPreview = autoplayPreview && !reducedMotion;

  // Diagnostics — surfaces mute/volume/autoplay-policy/source when playback fails.
  const [diag, setDiag] = useState<null | {
    code?: number;
    message: string;
    name?: string;
    at: number;
  }>(null);
  const [diagDismissed, setDiagDismissed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const autoplayPolicy =
    typeof navigator !== "undefined" && "getAutoplayPolicy" in navigator
      // @ts-ignore - experimental API
      ? (navigator.getAutoplayPolicy?.("mediaelement") as string) ?? "unknown"
      : "unknown";
  const canAutoPreview = allowAutoPreview && autoplayPolicy === "allowed";

  // Real-time CDN header verifier — probes Content-Type + HTTP status.
  const cdn = useCdnHeaderCheck(audioAsset.url);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = () => setCur(el.currentTime);
    const m = () => setDur(el.duration);
    const e = () => setPlaying(false);
    const wait = () => setLoading(true);
    const can = () => setLoading(false);
    const onPlay = () => { setPlaying(true); setLoading(false); };
    const onPause = () => setPlaying(false);
    const onProgress = () => {
      try {
        if (el.buffered.length && el.duration) {
          setBuffered((el.buffered.end(el.buffered.length - 1) / el.duration) * 100);
        }
      } catch {}
    };
    el.addEventListener("timeupdate", t);
    el.addEventListener("loadedmetadata", m);
    el.addEventListener("ended", e);
    el.addEventListener("waiting", wait);
    el.addEventListener("canplay", can);
    el.addEventListener("playing", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("progress", onProgress);
    const onVol = () => { setMuted(el.muted); setVolume(el.volume); };
    const onError = () => {
      const err = el.error;
      setDiag({
        code: err?.code,
        message: err?.message || mediaErrorText(err?.code),
        name: "MediaError",
        at: Date.now(),
      });
      setDiagDismissed(false);
      track("audio_error", {
        ...ANALYTICS_CONTEXT,
        code: err?.code,
        message: err?.message || mediaErrorText(err?.code),
        src: el.currentSrc || el.src,
      });
    };
    el.addEventListener("volumechange", onVol);
    el.addEventListener("error", onError);
    onVol();
    const onMilestone = () => {
      if (!el.duration || !Number.isFinite(el.duration)) return;
      const pct = (el.currentTime / el.duration) * 100;
      ([25, 50, 75] as const).forEach((mark) => {
        if (pct >= mark && !milestonesRef.current.has(mark)) {
          milestonesRef.current.add(mark);
          track("audio_progress", {
            ...ANALYTICS_CONTEXT,
            milestone: mark,
            position_sec: Math.round(el.currentTime),
          });
        }
      });
    };
    const onPlayAnalytics = () =>
      track("audio_play", {
        ...ANALYTICS_CONTEXT,
        position_sec: Math.round(el.currentTime),
      });
    const onPauseAnalytics = () => {
      if (completedRef.current) return;
      if (el.currentTime <= 0) return;
      track("audio_pause", {
        ...ANALYTICS_CONTEXT,
        position_sec: Math.round(el.currentTime),
        duration_sec: Math.round(el.duration || 0),
      });
    };
    const onEndedAnalytics = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setLiveMsg("Chapter I finished playing.");
      track("audio_complete", {
        ...ANALYTICS_CONTEXT,
        event_type: "final_completion",
        position_sec: Math.round(el.duration || 0),
        duration_sec: Math.round(el.duration || 0),
        percent_listened: 100,
        seek_count: seekCountRef.current,
      });
    };
    el.addEventListener("timeupdate", onMilestone);
    el.addEventListener("play", onPlayAnalytics);
    el.addEventListener("pause", onPauseAnalytics);
    el.addEventListener("ended", onEndedAnalytics);
    return () => {
      el.removeEventListener("timeupdate", t);
      el.removeEventListener("loadedmetadata", m);
      el.removeEventListener("ended", e);
      el.removeEventListener("waiting", wait);
      el.removeEventListener("canplay", can);
      el.removeEventListener("playing", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("volumechange", onVol);
      el.removeEventListener("error", onError);
      el.removeEventListener("timeupdate", onMilestone);
      el.removeEventListener("play", onPlayAnalytics);
      el.removeEventListener("pause", onPauseAnalytics);
      el.removeEventListener("ended", onEndedAnalytics);
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
  }, []);

  const stopPreview = () => {
    const el = ref.current;
    if (!el) return;
    if (previewTimer.current) {
      window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
    if (previewing) {
      el.pause();
      el.muted = false;
      el.volume = 1;
      el.currentTime = 0;
      setPreviewing(false);
    }
  };

  const startPreview = () => {
    const el = ref.current;
    if (!el || playing || previewing) return;
    if (!canAutoPreview) {
      setLiveMsg("Tap Play to start the audio.");
      return;
    }
    if (previewedOnce.current) return; // only fire once per session
    setLoading(true);
    setDiag(null);
    el.muted = false;
    el.volume = 0.35;
    el.currentTime = 0;
    void el.play().then(() => {
      previewedOnce.current = true;
      setPreviewing(true);
      setLoading(false);
      previewTimer.current = window.setTimeout(() => {
        if (!ref.current) return;
        ref.current.pause();
        ref.current.muted = false;
        ref.current.volume = 1;
        ref.current.currentTime = 0;
        setPreviewing(false);
      }, PREVIEW_MS);
    }).catch(() => {
      setPreviewing(false);
      setLoading(false);
      setLiveMsg("Tap Play to start the audio.");
    });
  };

  const toggle = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    const el = ref.current;
    if (!el) return;
    // Taking over from preview → full-volume playback from start
    if (previewing) {
      if (previewTimer.current) {
        window.clearTimeout(previewTimer.current);
        previewTimer.current = null;
      }
      el.volume = 1;
      el.muted = false;
      setPreviewing(false);
    }
    if (playing) { el.pause(); }
    else {
      setLoading(true);
      setDiag(null);
      el.muted = false;
      if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) el.load();
      void el.play().catch((err: unknown) => {
        setLoading(false);
        const e = err as { name?: string; message?: string };
        setDiag({
          name: e?.name || "PlayError",
          message: e?.message || "Playback was blocked.",
          at: Date.now(),
        });
        setDiagDismissed(false);
        track("audio_error", {
          ...ANALYTICS_CONTEXT,
          name: e?.name,
          message: e?.message,
          src: el.currentSrc || el.src,
        });
      });
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    const bar = barRef.current;
    if (!el || !bar || !dur) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * dur;
    setCur(el.currentTime);
    seekCountRef.current += 1;
    setLiveMsg(`Seeked to ${fmt(el.currentTime)}.`);
    if (ratio < 0.25) {
      milestonesRef.current.clear();
      completedRef.current = false;
    }
    track("audio_seek", {
      ...ANALYTICS_CONTEXT,
      position_sec: Math.round(el.currentTime),
      duration_sec: Math.round(dur),
    });
  };

  // Keyboard scrubbing on the seek slider.
  const onBarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !dur) return;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight": next = Math.min(dur, el.currentTime + 5); break;
      case "ArrowLeft":  next = Math.max(0, el.currentTime - 5); break;
      case "ArrowUp":    next = Math.min(dur, el.currentTime + 10); break;
      case "ArrowDown":  next = Math.max(0, el.currentTime - 10); break;
      case "Home":       next = 0; break;
      case "End":        next = dur; break;
      case " ":
      case "Enter":
        e.preventDefault();
        toggle();
        return;
      default: return;
    }
    if (next == null) return;
    e.preventDefault();
    el.currentTime = next;
    setCur(next);
    seekCountRef.current += 1;
    setLiveMsg(`Seeked to ${fmt(next)}.`);
  };

  const pct = dur ? (cur / dur) * 100 : 0;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="audio-story-teaser-heading"
      className="relative isolate overflow-hidden bg-background py-20 sm:py-24 lg:py-28"
    >
      {/* hairline top */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {/* eyebrow */}
        <div className="mb-10 flex items-center justify-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Audio Story · The Stand
          </span>
        </div>

        {/* Title block — centered, premium hierarchy */}
        <div className="mx-auto max-w-3xl text-center">
          <p
            lang="bn"
            className="text-[12px] font-medium uppercase tracking-[0.32em] text-muted-foreground"
          >
            শোনার মতো একটি গল্প
          </p>
          <h2
            id="audio-story-teaser-heading"
            lang="bn"
            className="mt-5 font-display text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.08]"
          >
            অ্যালগরিদম আর টর্চার সেলের{" "}
            <span className="text-primary">রুদ্ধশ্বাস জীবন</span>
          </h2>
          <p
            lang="bn"
            className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:mt-6 sm:text-[16px]"
          >
            একটি রাত, একটি হলঘর, একটি প্রজন্মের নীরব সাক্ষ্য — প্রযুক্তি, ভয় ও
            বিবেক যেখানে একই সরলরেখায় এসে দাঁড়ায়।
          </p>
        </div>

        {/* Player card — single, centered, structured */}
        <div
          className="mx-auto mt-10 max-w-3xl sm:mt-14"
          onMouseEnter={allowAutoPreview ? startPreview : undefined}
          onMouseLeave={allowAutoPreview ? stopPreview : undefined}
        >
          <div
            className="relative rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:p-8"
          >
            {previewing && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3 w-3" />
                Preview
              </span>
            )}
            {/* meta row */}
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <Headphones className="h-3.5 w-3.5 text-primary" />
                Chapter I
                <span aria-hidden className="text-muted-foreground/40">·</span>
                <span lang="bn">জাতীয় দলিল</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                ≈ 15 min
              </span>
            </div>

            <audio
              ref={ref}
              preload={nearViewport ? "metadata" : "none"}
              src={audioAsset.url}
            />
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {liveMsg}
            </div>

            {/* Always-on CDN/headers verifier */}
            <div className="mt-4 flex items-center justify-end">
              <CdnStatusChip url={audioAsset.url} expectedTypePrefix="audio/" label="Audio CDN" />
            </div>

            {/* player row */}
            <div className="mt-6 flex items-center gap-5">
              <button
                type="button"
                onClick={toggle}
                aria-label={
                  loading
                    ? "Loading Chapter I audio"
                    : playing
                      ? "Pause Chapter I audio"
                      : "Play Chapter I audio"
                }
                aria-pressed={playing}
                aria-busy={loading || undefined}
                className="relative flex h-14 w-14 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary-glow hover:shadow-[0_14px_36px_-12px_hsl(var(--primary)/0.75)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-[1px]" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div
                  ref={barRef}
                  onClick={seek}
                  onKeyDown={onBarKeyDown}
                  role="slider"
                  tabIndex={0}
                  aria-valuemin={0}
                  aria-valuemax={Math.max(1, Math.round(dur))}
                  aria-valuenow={Math.round(cur)}
                  aria-valuetext={dur ? `${fmt(cur)} of ${fmt(dur)}` : "Loading"}
                  aria-label="Seek Chapter I audio"
                  aria-orientation="horizontal"
                  className="group/bar relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  {/* buffered */}
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-primary/15"
                    style={{ width: `${buffered}%` }}
                  />
                  {/* played */}
                  <div
                    className="relative h-full bg-primary transition-[width] duration-150"
                    style={{ width: `${pct}%` }}
                  />
                  {/* scrubber thumb */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow-[0_2px_8px_hsl(var(--primary)/0.45)] ring-2 ring-background transition-opacity group-hover/bar:opacity-100"
                    style={{ left: `${pct}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span className="text-foreground/80">{fmt(cur)}</span>
                  <span className="inline-flex items-center gap-2">
                    {loading && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="inline-flex items-center gap-1 text-primary"
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading
                      </span>
                    )}
                    <span>{dur ? fmt(dur) : "—:—"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* pull quote — sits inside card for unified rhythm */}
            <blockquote
              lang="bn"
              className="mt-7 border-l-2 border-primary/60 pl-5 font-display text-[17px] italic leading-snug text-foreground sm:text-[19px]"
            >
              “মায়ের নিষেধ আছে।”
            </blockquote>

            {diag && !diagDismissed && (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-6 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-4 text-[12px] text-foreground"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-destructive">
                        Playback diagnostics
                      </div>
                      <p className="mt-1 text-foreground/90">{diag.message}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss diagnostics"
                    onClick={() => setDiagDismissed(true)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 font-mono text-[11px] sm:grid-cols-2">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Mute</dt>
                    <dd>{muted ? "muted" : "unmuted"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Volume</dt>
                    <dd>{Math.round(volume * 100)}%</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Autoplay policy</dt>
                    <dd>{autoplayPolicy}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Error code</dt>
                    <dd>{diag.code ?? diag.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">CDN status</dt>
                    <dd className={cdn.ok ? "" : "text-destructive"}>
                      {cdn.checking ? "checking…" : cdn.error ? `error: ${cdn.error}` : `${cdn.status}${cdn.ok ? " OK" : ""}`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Content-Type</dt>
                    <dd
                      className={
                        cdn.contentType && cdn.contentType.toLowerCase().startsWith("audio/")
                          ? ""
                          : "text-destructive"
                      }
                    >
                      {cdn.contentType ?? "—"}
                    </dd>
                  </div>
                  <div className="col-span-full mt-1 flex items-start gap-2">
                    <dt className="shrink-0 text-muted-foreground">Source</dt>
                    <dd className="min-w-0 flex-1 truncate" title={ref.current?.currentSrc || audioAsset.url}>
                      {ref.current?.currentSrc || audioAsset.url}
                    </dd>
                    <button
                      type="button"
                      aria-label="Copy source URL"
                      onClick={() => {
                        const url = ref.current?.currentSrc || audioAsset.url;
                        void navigator.clipboard?.writeText(url);
                        setLiveMsg("Source URL copied.");
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = ref.current;
                      if (!el) return;
                      el.muted = false;
                      el.volume = 1;
                      el.load();
                      setDiag(null);
                      setLoading(true);
                      void el.play().catch(() => setLoading(false));
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Retry playback
                  </button>
                  <a
                    href={ref.current?.currentSrc || audioAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Open source in new tab
                  </a>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoplayPreview}
                  aria-label={
                    autoplayPreview
                      ? "Disable autoplay preview for Chapter I"
                      : "Enable autoplay preview for Chapter I"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !autoplayPreview;
                    setAutoplayPreview(next);
                    if (!next) stopPreview();
                    setLiveMsg(next ? "Autoplay preview enabled." : "Autoplay preview disabled.");
                    track("audio_setting_change", {
                      ...ANALYTICS_CONTEXT,
                      setting: "autoplay_preview",
                      value: next,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  {autoplayPreview ? <Zap className="h-3 w-3 text-primary" /> : <ZapOff className="h-3 w-3" />}
                  Autoplay {autoplayPreview ? "on" : "off"}
                </button>
                <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {reducedMotion
                    ? "Reduced motion · preview off"
                      : previewing
                      ? "Auto-stops in 8s · click play for full"
                        : canAutoPreview
                          ? "Recorded narrative"
                          : "Tap play to listen"}
                </span>
              </div>
              <Link
                to="/the-stand"
                className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-glow"
              >
                Read the full story
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related stories carousel */}
        <RelatedStories />
      </div>

      {/* hairline bottom */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}

/* ============================================================
 * RelatedStories — horizontal-scroll carousel of upcoming /
 * related audio chapters. Keyboard + button navigation, snap.
 * ========================================================== */
const RELATED: {
  id: string;
  chapter: string;
  titleBn: string;
  titleEn: string;
  duration: string;
  status: "Upcoming" | "Draft" | "Live";
  href: string;
}[] = [
  {
    id: "quiet-positions",
    chapter: "Chapter II",
    titleBn: "নীরব অবস্থান",
    titleEn: "Quiet Positions",
    duration: "≈ 12 min",
    status: "Upcoming",
    href: "/quiet-positions?chapter=quiet-positions",
  },
  {
    id: "humanity-restored",
    chapter: "Chapter III",
    titleBn: "মানবতার পুনরুদ্ধার",
    titleEn: "Humanity Restored",
    duration: "≈ 9 min",
    status: "Draft",
    href: "/the-stand?chapter=humanity-restored#humanity-restored",
  },
  {
    id: "justice-appeal",
    chapter: "Dossier",
    titleBn: "ন্যায়বিচারের আবেদন",
    titleEn: "Justice Appeal",
    duration: "≈ 7 min",
    status: "Live",
    href: "/justice-appeal?chapter=justice-appeal",
  },
  {
    id: "media-wall",
    chapter: "Archive",
    titleBn: "প্রেস সংরক্ষণাগার",
    titleEn: "Press Archive",
    duration: "18 sources",
    status: "Live",
    href: "/the-stand?chapter=press#press",
  },
];

function RelatedStories() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 360), behavior: "smooth" });
  };

  return (
    <div className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Continue listening
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-foreground sm:text-2xl">
            Related stories
          </h3>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative -mx-6 sm:mx-0">
        {/* edge fades */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:w-12" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:w-12" />

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 sm:gap-5 sm:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {RELATED.map((s) => (
            <Link
              key={s.id}
              to={s.href}
              className="group relative flex w-[260px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:w-[280px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-primary">
                    {s.chapter}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] " +
                      (s.status === "Live"
                        ? "bg-primary/10 text-primary"
                        : s.status === "Upcoming"
                          ? "bg-muted text-muted-foreground"
                          : "border border-border text-muted-foreground")
                    }
                  >
                    {s.status}
                  </span>
                </div>
                <h4
                  lang="bn"
                  className="mt-4 font-display text-[17px] font-semibold leading-[1.25] text-foreground"
                >
                  {s.titleBn}
                </h4>
                <p className="mt-1 font-display text-[13px] italic text-muted-foreground">
                  {s.titleEn}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {s.duration}
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}