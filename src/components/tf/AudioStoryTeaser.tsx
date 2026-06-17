import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, ArrowUpRight, Headphones, Clock } from "lucide-react";
import audioAsset from "@/assets/algorithm-torture-cell.mp3.asset.json";

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * AudioStoryTeaser — compact home-page section featuring the recorded
 * narrative "অ্যালগরিদম আর টর্চার সেলের রুদ্ধশ্বাস জীবন".
 * Premium, minimal, cinematic — matches The Stand visual language.
 */
export default function AudioStoryTeaser() {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const el = ref.current;
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
    const el = ref.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { void el.play(); setPlaying(true); }
  };

  const pct = dur ? (cur / dur) * 100 : 0;

  return (
    <section
      aria-labelledby="audio-story-teaser-heading"
      className="relative isolate overflow-hidden bg-background py-24 sm:py-32"
    >
      {/* hairline top */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        {/* eyebrow */}
        <div className="mb-12 flex items-center justify-center">
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
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.75] text-muted-foreground sm:text-[16px]"
          >
            একটি রাত, একটি হলঘর, একটি প্রজন্মের নীরব সাক্ষ্য — প্রযুক্তি, ভয় ও
            বিবেক যেখানে একই সরলরেখায় এসে দাঁড়ায়।
          </p>
        </div>

        {/* Player card — single, centered, structured */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
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

            <audio ref={ref} preload="metadata" src={audioAsset.url} />

            {/* player row */}
            <div className="mt-6 flex items-center gap-5">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary-glow hover:shadow-[0_14px_36px_-12px_hsl(var(--primary)/0.75)]"
              >
                {playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-[1px]" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(pct)}
                  className="h-[3px] w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full bg-primary transition-[width] duration-150"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span>{fmt(cur)}</span>
                  <span>{fmt(dur)}</span>
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

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Recorded narrative
              </span>
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
      </div>

      {/* hairline bottom */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}