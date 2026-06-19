/**
 * StoryAiExpertEmon — long-form audio story page.
 *
 * Responsibilities:
 * - Render the bilingual (bn/en) narrative, kicker, pull quote, and themes.
 * - Provide a custom audio player with chapter markers, transcript sync,
 *   bookmark, and resume-from-last-position behavior backed by localStorage.
 * - Surface a 5-bullet AI summary, key takeaways, and a downloadable share card.
 * - Emit article-level SEO + Open Graph metadata via `useSeo`.
 *
 * Persistence keys:
 * - `PROGRESS_KEY` — auto-saved playback time, restored as a "Resume?" prompt.
 * - `BOOKMARK_KEY` — single user-pinned moment, drawn on the seek bar.
 *
 * Performance notes:
 * - `timeupdate` fires ~4×/s; we coalesce React state updates to once per
 *   whole second OR a chapter boundary crossing to avoid re-rendering the
 *   full transcript on every tick.
 * - The transcript is split into a memoized child so only the paragraph
 *   whose active state flips re-renders.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Download, Headphones, ListMusic, Pause, Play, RotateCcw, Share2, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import audioAsset from "@/assets/ai-bisheshoggo-emon.mp3.asset.json";
import { CdnStatusChip } from "@/components/media/CdnStatusChip";
import shareCard from "@/assets/ai-expert-emon-share.jpg";
import {
  AI_EXPERT_EMON_CHAPTERS,
  AI_EXPERT_EMON_STORY,
  AI_EXPERT_EMON_SUMMARY,
  AI_EXPERT_EMON_THEMES,
  type StoryLang,
} from "@/data/aiExpertEmonStory";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";

/**
 * Format a duration in seconds as `m:ss`.
 *
 * @param s - Time in seconds. Non-finite or negative values are coerced to 0.
 * @returns A short clock string, e.g. `4:07`.
 */
function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Resolve the chapter index that contains a given playback time.
 *
 * Chapters are stored in ascending `time` order, so a single linear pass
 * over the (small, N ≈ 7) array is faster and simpler than binary search.
 * Times before chapter 0 still return index 0.
 *
 * @param time - Current playback position in seconds.
 * @returns Zero-based chapter index into `AI_EXPERT_EMON_CHAPTERS`.
 */
function chapterIndexAt(time: number): number {
  let idx = 0;
  for (let i = 0; i < AI_EXPERT_EMON_CHAPTERS.length; i++) {
    if (time >= AI_EXPERT_EMON_CHAPTERS[i].time) idx = i;
  }
  return idx;
}

/**
 * Props for {@link TranscriptParagraph}.
 *
 * @property text     - Paragraph body (already localized).
 * @property isActive - True when this paragraph is the current chapter's anchor.
 * @property lang     - Language code, propagated to the DOM `lang` attribute
 *                      for correct hyphenation and screen-reader pronunciation.
 * @property setRef   - Ref setter so the parent can scroll this paragraph
 *                      into view when the chapter / bookmark is jumped to.
 */
type ParagraphProps = {
  text: string;
  isActive: boolean;
  lang: StoryLang;
  setRef: (el: HTMLParagraphElement | null) => void;
};
/**
 * One paragraph of the transcript. Memoized so that re-rendering the page
 * on every audio tick (e.g. seek-bar updates) does not also re-render every
 * paragraph — only the one whose `isActive` flag changed.
 */
const TranscriptParagraph = memo(function TranscriptParagraph({
  text, isActive, lang, setRef,
}: ParagraphProps) {
  return (
    <p
      ref={setRef}
      lang={lang}
      className={`scroll-mt-28 rounded-md border-l-2 py-1 pl-4 text-[16px] leading-[1.85] transition-colors duration-300 sm:text-[17px] ${
        isActive
          ? "border-primary bg-primary/[0.04] text-foreground"
          : "border-transparent text-foreground/85"
      }`}
    >
      {text}
    </p>
  );
});

/** localStorage key for the auto-saved playback position (JSON envelope). */
const PROGRESS_KEY = "story:ai-expert-emon:progress";
/** localStorage key for the user's single pinned bookmark (raw float seconds). */
const BOOKMARK_KEY = "story:ai-expert-emon:bookmark";
/**
 * Sanity ceiling for any persisted timestamp. Values larger than this almost
 * certainly indicate corrupted storage (e.g. another tab wrote garbage) and
 * are silently ignored on read.
 */
const MAX_REASONABLE_SECONDS = 60 * 60 * 6; // 6h guard against corrupt storage

/**
 * Localized user-facing strings for player error / success states.
 * Keyed by `StoryLang` so the active language drives every toast and banner.
 */
const MESSAGES = {
  bn: {
    playBlocked: "ব্রাউজার অটোমেটিক প্লে আটকেছে — প্লে বাটনে ট্যাপ করুন।",
    playFailed: "অডিও চালু করা যায়নি। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।",
    loadFailed: "অডিও ফাইল লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    seekFailed: "এই মুহূর্তে নির্দিষ্ট সময়ে যাওয়া যাচ্ছে না।",
    bookmarkSaved: "বুকমার্ক সেভ হয়েছে",
    bookmarkRemoved: "বুকমার্ক মুছে ফেলা হয়েছে",
    bookmarkStorageFull: "ডিভাইস স্টোরেজ ভরা — বুকমার্ক সেভ হয়নি।",
    progressRestored: "আগের জায়গা থেকে চালু হলো",
  },
  en: {
    playBlocked: "Your browser blocked autoplay — tap the play button to start.",
    playFailed: "Couldn't start the audio. Check your connection and try again.",
    loadFailed: "The audio file failed to load. Please try again in a moment.",
    seekFailed: "Couldn't jump to that point right now.",
    bookmarkSaved: "Bookmark saved",
    bookmarkRemoved: "Bookmark removed",
    bookmarkStorageFull: "Device storage is full — bookmark wasn't saved.",
    progressRestored: "Resumed from where you left off",
  },
} as const;

/**
 * Detect whether a thrown error came from `localStorage` exceeding its quota.
 * The browser-standard name is `QuotaExceededError`, but some engines (older
 * iOS Safari) only set the message — we fall back to a substring check.
 *
 * @param err - Any thrown value from a `setItem` call.
 * @returns `true` when the error is recognizably a storage-quota failure.
 */
function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "QuotaExceededError" || /quota/i.test(err.message);
}

/** Shape persisted under {@link PROGRESS_KEY}. */
type SavedProgress = { time: number; updatedAt: number };

/**
 * Load the most recently saved playback position from localStorage.
 *
 * Performs defensive validation so a malformed or out-of-range payload
 * (corrupt storage, third-party JS, older schema) silently degrades to
 * "no saved progress" instead of throwing.
 *
 * @returns The saved `{ time, updatedAt }` envelope, or `null` if none is
 *          available, valid, or far enough in (≤ 2s is considered noise).
 */
function readProgress(): SavedProgress | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as SavedProgress).time !== "number"
    ) {
      return null;
    }
    const v = parsed as SavedProgress;
    if (!Number.isFinite(v.time) || v.time <= 2 || v.time > MAX_REASONABLE_SECONDS) {
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

/**
 * Load the user's single pinned bookmark position from localStorage.
 *
 * @returns Playback time in seconds, or `null` when no valid bookmark
 *          is stored (missing, NaN, negative, or absurdly large).
 */
function readBookmark(): number | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return null;
    const v = Number.parseFloat(raw);
    if (!Number.isFinite(v) || v < 0 || v > MAX_REASONABLE_SECONDS) return null;
    return v;
  } catch {
    return null;
  }
}

const StoryAiExpertEmon = () => {
  const [lang, setLang] = useState<StoryLang>("bn");
  const copy = AI_EXPERT_EMON_STORY[lang];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [bookmark, setBookmark] = useState<number | null>(null);
  const lastSavedRef = useRef(0);
  const justJumpedToBookmarkRef = useRef(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  /** Localized strings bound to the current language toggle. */
  const msgs = MESSAGES[lang];

  /**
   * Start playback on an `<audio>` element while gracefully handling the
   * Promise rejection returned by modern browsers when playback is blocked
   * (autoplay policy) or cannot start (network / decode error).
   *
   * On `NotAllowedError` / `AbortError` we show an informational toast asking
   * the user to tap Play; on anything else we surface a generic failure toast
   * and reset the `playing` state so the UI doesn't appear stuck.
   *
   * @param el - The `<audio>` element to play (may be `null` during teardown).
   */
  const safePlay = useCallback((el: HTMLAudioElement | null) => {
    if (!el) return;
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.catch((err: unknown) => {
        setPlaying(false);
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "AbortError") {
          toast.info(msgs.playBlocked);
        } else {
          toast.error(msgs.playFailed);
        }
      });
    }
  }, [msgs]);

  useSeo({
    title: `${copy.title} · Zahid Hasan Emon`,
    description: copy.kicker,
    type: "article",
    image: shareCard,
    imageWidth: 1216,
    imageHeight: 640,
    imageType: "image/jpeg",
    imageAlt: `${copy.title} — chapter list and author`,
  });

  /**
   * Wire all `<audio>` element listeners and own their lifecycle.
   *
   * Events handled:
   * - `timeupdate`: throttled state update (see inline note) + auto-save
   *   playback position to localStorage every 2.5s.
   * - `loadedmetadata`: capture the real duration once known.
   * - `ended`: clear saved progress (next visit starts at 0) + reset UI.
   * - `error` / `stalled`: surface friendly inline + toast messages.
   * - `playing`: clear any previously shown error banner.
   *
   * Re-runs only when the language changes (which rebinds the listener
   * closures so they see the latest localized strings).
   */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    // `timeupdate` fires ~4×/s. Re-rendering the whole page (transcript,
    // chapter list, summary, share card) that often is wasteful — the visible
    // UI is second-resolution and chapter highlight only flips at known
    // boundaries. We coalesce state updates to: (a) once per whole second of
    // playback, OR (b) immediately when the active chapter changes.
    let lastSecond = -1;
    let lastActiveChapter = -1;
    const t = () => {
      const time = el.currentTime;
      const second = Math.floor(time);
      const activeChapter = chapterIndexAt(time);
      if (second !== lastSecond || activeChapter !== lastActiveChapter) {
        lastSecond = second;
        lastActiveChapter = activeChapter;
        setCur(time);
      }
      const now = Date.now();
      if (now - lastSavedRef.current > 2500 && time > 2) {
        lastSavedRef.current = now;
        try {
          localStorage.setItem(
            PROGRESS_KEY,
            JSON.stringify({ time, updatedAt: now }),
          );
        } catch {
          /* ignore quota */
        }
      }
    };
    const m = () => setDur(el.duration);
    const e = () => {
      setPlaying(false);
      try {
        localStorage.removeItem(PROGRESS_KEY);
      } catch {
        /* ignore */
      }
      setResumeAt(null);
    };
    const onError = () => {
      setPlaying(false);
      const code = el.error?.code;
      // 1 ABORTED, 2 NETWORK, 3 DECODE, 4 SRC_NOT_SUPPORTED
      const friendly =
        code === 2 ? msgs.loadFailed :
        code === 4 ? msgs.loadFailed :
        msgs.loadFailed;
      setAudioError(friendly);
      toast.error(friendly);
    };
    const onStalled = () => {
      // Show inline notice but don't spam toasts on flaky networks.
      setAudioError(msgs.loadFailed);
    };
    const onPlaying = () => setAudioError(null);
    el.addEventListener("timeupdate", t);
    el.addEventListener("loadedmetadata", m);
    el.addEventListener("ended", e);
    el.addEventListener("error", onError);
    el.addEventListener("stalled", onStalled);
    el.addEventListener("playing", onPlaying);
    return () => {
      el.removeEventListener("timeupdate", t);
      el.removeEventListener("loadedmetadata", m);
      el.removeEventListener("ended", e);
      el.removeEventListener("error", onError);
      el.removeEventListener("stalled", onStalled);
      el.removeEventListener("playing", onPlaying);
    };
  }, [msgs]);

  /**
   * On mount, hydrate UI state from localStorage:
   * - If a valid saved playback position exists, show the "Resume?" banner.
   * - If a bookmark exists, draw its pin on the seek bar.
   */
  useEffect(() => {
    const p = readProgress();
    if (p) setResumeAt(p.time);
    setBookmark(readBookmark());
  }, []);

  /**
   * Best-effort final flush of the playback position on page hide / unload,
   * and on component unmount (e.g. client-side navigation away from the
   * story page). Browsers run `pagehide` reliably on iOS where
   * `beforeunload` is ignored; we register both for cross-browser coverage.
   */
  useEffect(() => {
    const save = () => {
      const el = audioRef.current;
      if (!el || el.currentTime <= 2) return;
      try {
        localStorage.setItem(
          PROGRESS_KEY,
          JSON.stringify({ time: el.currentTime, updatedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    return () => {
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
      save();
    };
  }, []);

  /**
   * Toggle play/pause on the audio element. Also dismisses the "Resume?"
   * banner — pressing Play instead of Resume signals the user wants to start
   * from the current head, not the saved position.
   */
  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else {
      setPlaying(true);
      safePlay(el);
      // Pressing play instead of "Resume" means the user chose to start from
      // the current head — dismiss the stale resume prompt.
      if (resumeAt != null) setResumeAt(null);
    }
  };

  /**
   * Seek to a clicked position on the custom progress bar.
   *
   * @param e - Mouse event from the bar; `clientX` is translated to a 0..1
   *            ratio against the bar's bounding box and applied to `duration`.
   */
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const bar = barRef.current;
    if (!el || !bar || !dur) return;
    try {
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const next = ratio * dur;
      if (!Number.isFinite(next)) return;
      el.currentTime = next;
      setCur(el.currentTime);
      if (resumeAt != null) setResumeAt(null);
    } catch {
      toast.error(msgs.seekFailed);
    }
  };

  /** Progress-bar fill percentage (0..100). */
  const pct = dur ? (cur / dur) * 100 : 0;
  /**
   * Duration used to position chapter ticks before `loadedmetadata` fires.
   * Falls back to ~16 minutes (the recorded length) so ticks don't jump
   * once the real duration is known.
   */
  const effectiveDur = dur || 960;
  /**
   * Index of the chapter the playhead is currently in. Memoized so
   * referential equality holds for memoized children that consume it.
   */
  const activeChapterIdx = useMemo(() => chapterIndexAt(cur), [cur]);

  /**
   * Jump the audio to a specific timestamp, start playback if paused, and
   * scroll the matching transcript paragraph into view.
   *
   * Used by chapter clicks and the "Go to bookmark" affordance.
   *
   * @param t - Target time in seconds. Non-finite or negative values are
   *            rejected with a friendly toast.
   */
  const jumpTo = (t: number) => {
    const el = audioRef.current;
    if (!el) return;
    if (!Number.isFinite(t) || t < 0) {
      toast.error(msgs.seekFailed);
      return;
    }
    try {
      el.currentTime = t;
      setCur(t);
    } catch {
      toast.error(msgs.seekFailed);
      return;
    }
    if (!playing) {
      setPlaying(true);
      safePlay(el);
    }
    // Once the user moves the playhead, the stale "resume" banner is irrelevant.
    if (resumeAt != null) setResumeAt(null);
    const idx = AI_EXPERT_EMON_CHAPTERS.findIndex((c) => c.time === t);
    if (idx >= 0 && idx < paragraphRefs.current.length) {
      const node = paragraphRefs.current[idx];
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  /**
   * Apply the saved "Resume?" position from localStorage.
   *
   * Defends against two real-world failure modes:
   * 1. Stale or corrupted saves that exceed the current track length — the
   *    target is clamped to `duration - 1`.
   * 2. Browsers (e.g. some mobile Safari builds) that silently drop a
   *    `currentTime` write before `loadedmetadata` — when `readyState < 1`
   *    we defer the seek until metadata is ready.
   */
  const resume = () => {
    if (resumeAt == null) return;
    const el = audioRef.current;
    if (!el) return;
    // Clamp against known duration to defend against stale/corrupt saves.
    const ceiling = Number.isFinite(el.duration) && el.duration > 0 ? el.duration - 1 : resumeAt;
    const target = Math.max(0, Math.min(resumeAt, ceiling));
    const applySeek = () => {
      try {
        el.currentTime = target;
      } catch {
        toast.error(msgs.seekFailed);
        return;
      }
      setCur(target);
      setPlaying(true);
      safePlay(el);
      toast.success(msgs.progressRestored);
      let idx = 0;
      for (let i = 0; i < AI_EXPERT_EMON_CHAPTERS.length; i++) {
        if (target >= AI_EXPERT_EMON_CHAPTERS[i].time) idx = i;
      }
      if (idx < paragraphRefs.current.length) {
        const node = paragraphRefs.current[idx];
        if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    // Some browsers silently ignore `currentTime` writes before metadata loads.
    if (el.readyState < 1) {
      const onReady = () => {
        el.removeEventListener("loadedmetadata", onReady);
        applySeek();
      };
      el.addEventListener("loadedmetadata", onReady);
      try {
        el.load();
      } catch {
        /* ignore */
      }
    } else {
      applySeek();
    }
    setResumeAt(null);
  };

  /**
   * Discard the saved playback position and hide the "Resume?" banner so
   * the listener starts fresh from 0.
   */
  const dismissResume = () => {
    setResumeAt(null);
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch {
      /* ignore */
    }
  };

  /**
   * Pin or clear the user's single bookmark.
   *
   * Rules:
   * - If a bookmark is already set within 1.5s of the current playhead
   *   AND the user did not just jump to it, the click is treated as
   *   "remove" (the obvious second-press behavior at the same spot).
   * - Otherwise the click overwrites the bookmark with the current time.
   * - A failed `setItem` (quota / private-mode) is rolled back so UI state
   *   stays consistent with what actually persisted.
   */
  const toggleBookmark = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!Number.isFinite(el.currentTime)) {
      toast.error(msgs.seekFailed);
      return;
    }
    // If the user just jumped to the bookmark, the playhead is right on it —
    // don't interpret the next click as "remove".
    if (
      bookmark != null &&
      !justJumpedToBookmarkRef.current &&
      Math.abs(bookmark - el.currentTime) < 1.5
    ) {
      setBookmark(null);
      try {
        localStorage.removeItem(BOOKMARK_KEY);
      } catch {
        /* ignore */
      }
      toast(msgs.bookmarkRemoved);
    } else {
      const t = el.currentTime;
      setBookmark(t);
      try {
        localStorage.setItem(BOOKMARK_KEY, String(t));
        toast.success(`${msgs.bookmarkSaved} · ${fmt(t)}`);
      } catch (err) {
        // Roll back optimistic state if write actually failed.
        setBookmark(bookmark);
        toast.error(isQuotaError(err) ? msgs.bookmarkStorageFull : msgs.bookmarkSaved);
      }
    }
    justJumpedToBookmarkRef.current = false;
  };

  /**
   * Seek to the saved bookmark, if any. Sets a sentinel so the next
   * {@link toggleBookmark} call doesn't immediately reinterpret the press
   * as a "remove" (because the playhead is now sitting on the bookmark).
   */
  const goToBookmark = () => {
    if (bookmark == null) return;
    justJumpedToBookmarkRef.current = true;
    jumpTo(bookmark);
  };

  const summary = AI_EXPERT_EMON_SUMMARY[lang];

  // Stable identity prevents ShareDialog from re-rendering on every audio tick.
  const sharePayload = useMemo<SharePayload>(() => ({
    title: copy.title,
    summary: copy.kicker,
    url: typeof window !== "undefined"
      ? window.location.href
      : "https://trendfluxdigitalbd.lovable.app/stories/ai-expert-emon",
    category: "Audio Story",
    tags: AI_EXPERT_EMON_THEMES,
  }), [copy.title, copy.kicker]);

  // Per-index stable ref setters so memoized paragraphs don't re-render
  // just because the parent rendered a fresh inline arrow.
  const setParagraphRef = useMemo(() => {
    return copy.paragraphs.map((_, i) => (el: HTMLParagraphElement | null) => {
      paragraphRefs.current[i] = el;
    });
  }, [copy.paragraphs]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[160px]" />

        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>

          {/* Language toggle */}
          <div className="mt-8 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              <Headphones className="h-3 w-3" /> Audio Story · {copy.durationLabel}
            </span>
            <div className="inline-flex rounded-full border border-border bg-card p-0.5 text-[11px] font-medium">
              {(["bn", "en"] as StoryLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "bn" ? "বাংলা" : "EN"}
                </button>
              ))}
            </div>
          </div>

          <h1
            lang={lang}
            className="mt-8 font-display text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.1]"
          >
            {copy.title}
          </h1>
          <p lang={lang} className="mt-6 text-[16px] leading-[1.75] text-muted-foreground">
            {copy.kicker}
          </p>

          {/* Player */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <audio ref={audioRef} preload="metadata" src={audioAsset.url} />

            {audioError && (
              <div
                role="alert"
                className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-[12px] text-destructive"
              >
                <span lang={lang}>{audioError}</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = audioRef.current;
                    if (!el) return;
                    setAudioError(null);
                    try { el.load(); } catch { /* ignore */ }
                    safePlay(el);
                  }}
                  className="rounded-full border border-destructive/40 px-2.5 py-0.5 text-[11px] font-medium text-destructive hover:bg-destructive/10"
                >
                  {lang === "bn" ? "আবার চেষ্টা" : "Retry"}
                </button>
              </div>
            )}

            {resumeAt != null && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2">
                <div className="flex items-center gap-2 text-[12px] text-foreground/85">
                  <RotateCcw className="h-3.5 w-3.5 text-primary" />
                  <span lang={lang}>
                    {lang === "bn" ? "আগের জায়গা থেকে শুরু করবেন?" : "Resume where you left off?"}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{fmt(resumeAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={resume}
                    className="rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground"
                  >
                    {lang === "bn" ? "শুরু করুন" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={dismissResume}
                    className="rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {lang === "bn" ? "শুরু থেকে" : "Start over"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] transition-transform hover:scale-105"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
              </button>
              <div className="min-w-0 flex-1">
                <div
                  ref={barRef}
                  onClick={seek}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(pct)}
                  className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-muted"
                >
                  <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
                  {AI_EXPERT_EMON_CHAPTERS.slice(1).map((c) => {
                    const left = Math.min(100, Math.max(0, (c.time / effectiveDur) * 100));
                    return (
                      <span
                        key={c.time}
                        aria-hidden
                        className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-foreground/40"
                        style={{ left: `${left}%` }}
                      />
                    );
                  })}
                  {bookmark != null && (
                    <span
                      aria-hidden
                      title={`Bookmark · ${fmt(bookmark)}`}
                      className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-sm bg-primary"
                      style={{ left: `${Math.min(100, Math.max(0, (bookmark / effectiveDur) * 100))}%` }}
                    />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span>{fmt(cur)}</span>
                  <span>{dur ? fmt(dur) : "—:—"}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={toggleBookmark}
                  aria-label={bookmark != null ? "Remove bookmark" : "Bookmark this moment"}
                  title={bookmark != null ? `Bookmarked at ${fmt(bookmark)}` : "Bookmark this moment"}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    bookmark != null
                      ? "border-primary/40 bg-primary/[0.08] text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {bookmark != null ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
                {bookmark != null && (
                  <button
                    type="button"
                    onClick={goToBookmark}
                    className="font-mono text-[10px] tabular-nums text-muted-foreground hover:text-primary"
                  >
                    {fmt(bookmark)}
                  </button>
                )}
              </div>
            </div>

            {/* CDN/headers verifier */}
            <div className="mt-4 flex items-center justify-end">
              <CdnStatusChip url={audioAsset.url} expectedTypePrefix="audio/" label="Audio CDN" />
            </div>

            {/* Chapter list */}
            <div className="mt-6 border-t border-border pt-5">
              <div className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                <ListMusic className="h-3 w-3" />
                {lang === "bn" ? "অধ্যায়" : "Chapters"}
              </div>
              <ol className="space-y-0.5">
                {AI_EXPERT_EMON_CHAPTERS.map((c, i) => {
                  const isActive = i === activeChapterIdx;
                  return (
                    <li key={c.time}>
                      <button
                        type="button"
                        onClick={() => jumpTo(c.time)}
                        className={`group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
                          isActive ? "bg-primary/[0.06] text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <span className={`font-mono text-[11px] tabular-nums ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          {fmt(c.time)}
                        </span>
                        <span lang={lang} className="flex-1 text-[13px] leading-snug">
                          {lang === "bn" ? c.bn : c.en}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Share + tags */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {AI_EXPERT_EMON_THEMES.slice(0, 5).map((t) => (
                <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Share
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Summary + Key takeaways */}
          <section className="mt-12 grid gap-5 sm:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-3 sm:p-6">
              <div className="mb-4 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                {lang === "bn" ? "৫ লাইনে সারসংক্ষেপ" : "5-Bullet Summary"}
              </div>
              <ul className="space-y-3">
                {summary.summary.map((s, i) => (
                  <li key={i} lang={lang} className="flex gap-3 text-[14px] leading-[1.65] text-foreground/85">
                    <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2 sm:p-6">
              <div className="mb-4 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                <Lightbulb className="h-3 w-3 text-primary" />
                {lang === "bn" ? "মূল উপলব্ধি" : "Key Takeaways"}
              </div>
              <ul className="space-y-3">
                {summary.takeaways.map((t, i) => (
                  <li key={i} lang={lang} className="text-[13px] leading-[1.6] text-foreground/80">
                    <span className="mr-1.5 font-mono text-[11px] text-primary">0{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Narrative */}
          <div className="mt-14 space-y-6">
            {copy.paragraphs.map((p, i) => (
              <TranscriptParagraph
                key={i}
                text={p}
                lang={lang}
                isActive={i === activeChapterIdx}
                setRef={setParagraphRef[i]}
              />
            ))}
          </div>

          {/* Pull quote */}
          <blockquote
            lang={lang}
            className="mt-14 border-l-2 border-primary pl-5 font-display text-xl leading-[1.5] text-foreground sm:text-2xl"
          >
            “{copy.pullquote}”
          </blockquote>

          <p className="mt-16 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Recorded narrative · Zahid Hasan Emon · 2026
          </p>

          {/* Shareable story card */}
          <section className="mt-14 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                <Share2 className="h-3 w-3 text-primary" />
                {lang === "bn" ? "শেয়ার কার্ড" : "Share Card"}
              </div>
              <a
                href={shareCard}
                download="zahid-hasan-emon-story.jpg"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Download className="h-3.5 w-3.5" />
                {lang === "bn" ? "ডাউনলোড" : "Download"}
              </a>
            </div>
            <img
              src={shareCard}
              width={1216}
              height={640}
              loading="lazy"
              alt={`${copy.title} — chapter list and author`}
              className="w-full rounded-lg border border-border"
            />
          </section>
        </div>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={sharePayload} />
      <Footer />
    </main>
  );
};

export default StoryAiExpertEmon;
