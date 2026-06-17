import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Headphones, Pause, Play, Share2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import audioAsset from "@/assets/ai-bisheshoggo-emon.mp3.asset.json";
import { AI_EXPERT_EMON_STORY, AI_EXPERT_EMON_THEMES, type StoryLang } from "@/data/aiExpertEmonStory";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const StoryAiExpertEmon = () => {
  const [lang, setLang] = useState<StoryLang>("bn");
  const copy = AI_EXPERT_EMON_STORY[lang];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  useSeo({
    title: `${copy.title} · Zahid Hasan Emon`,
    description: copy.kicker,
    type: "article",
  });

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const t = () => setCur(el.currentTime);
    const m = () => setDur(el.duration);
    const e = () => setPlaying(false);
    el.addEventListener("timeupdate", t);
    el.addEventListener("loadedmetadata", m);
    el.addEventListener("ended", e);
    return () => {
      el.removeEventListener("timeupdate", t);
      el.removeEventListener("loadedmetadata", m);
      el.removeEventListener("ended", e);
    };
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { void el.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const bar = barRef.current;
    if (!el || !bar || !dur) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * dur;
    setCur(el.currentTime);
  };

  const pct = dur ? (cur / dur) * 100 : 0;

  const sharePayload: SharePayload = {
    title: copy.title,
    summary: copy.kicker,
    url: typeof window !== "undefined" ? window.location.href : "https://trendfluxdigitalbd.lovable.app/stories/ai-expert-emon",
    category: "Audio Story",
    tags: AI_EXPERT_EMON_THEMES,
  };

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
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span>{fmt(cur)}</span>
                  <span>{dur ? fmt(dur) : "—:—"}</span>
                </div>
              </div>
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

          {/* Narrative */}
          <div className="mt-14 space-y-6">
            {copy.paragraphs.map((p, i) => (
              <p
                key={i}
                lang={lang}
                className="text-[16px] leading-[1.85] text-foreground/85 sm:text-[17px]"
              >
                {p}
              </p>
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
        </div>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={sharePayload} />
      <Footer />
    </main>
  );
};

export default StoryAiExpertEmon;
