import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Headphones, ListMusic, Pause, Play, Share2, Sparkles, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import audioAsset from "@/assets/ai-bisheshoggo-emon.mp3.asset.json";
import shareCard from "@/assets/ai-expert-emon-share.jpg";
import {
  AI_EXPERT_EMON_CHAPTERS,
  AI_EXPERT_EMON_STORY,
  AI_EXPERT_EMON_SUMMARY,
  AI_EXPERT_EMON_THEMES,
  type StoryLang,
} from "@/data/aiExpertEmonStory";
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
  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

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

  const effectiveDur = dur || 960; // fallback ~16 min until metadata loads
  const activeChapterIdx = (() => {
    let idx = 0;
    for (let i = 0; i < AI_EXPERT_EMON_CHAPTERS.length; i++) {
      if (cur >= AI_EXPERT_EMON_CHAPTERS[i].time) idx = i;
    }
    return idx;
  })();

  const jumpTo = (t: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = t;
    setCur(t);
    if (!playing) {
      void el.play();
      setPlaying(true);
    }
    const idx = AI_EXPERT_EMON_CHAPTERS.findIndex((c) => c.time === t);
    if (idx >= 0) {
      const node = paragraphRefs.current[idx];
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const summary = AI_EXPERT_EMON_SUMMARY[lang];

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
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span>{fmt(cur)}</span>
                  <span>{dur ? fmt(dur) : "—:—"}</span>
                </div>
              </div>
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
              <p
                key={i}
                ref={(el) => { paragraphRefs.current[i] = el; }}
                lang={lang}
                className={`scroll-mt-28 rounded-md border-l-2 py-1 pl-4 text-[16px] leading-[1.85] transition-colors duration-300 sm:text-[17px] ${
                  i === activeChapterIdx
                    ? "border-primary bg-primary/[0.04] text-foreground"
                    : "border-transparent text-foreground/85"
                }`}
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
