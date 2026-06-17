import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, ArrowUpRight, Headphones } from "lucide-react";
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
      className="relative isolate overflow-hidden bg-black py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.08), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.05), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {/* eyebrow rail */}
        <div className="mb-8 flex items-center gap-3 sm:mb-12">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="font-serif text-[10px] uppercase tracking-[0.38em] text-amber-400/90 sm:text-[11px] sm:tracking-[0.42em]">
            Audio · The Stand
          </span>
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="hidden font-serif text-[10px] uppercase tracking-[0.3em] text-white/40 sm:inline">
            ≈ 15 min
          </span>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <p
              lang="bn"
              className="font-serif text-[11px] uppercase tracking-[0.32em] text-amber-300/80"
            >
              শোনার মতো একটি গল্প
            </p>
            <h2
              id="audio-story-teaser-heading"
              lang="bn"
              className="mt-5 font-serif text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[44px]"
            >
              অ্যালগরিদম আর টর্চার সেলের{" "}
              <span className="text-amber-300">রুদ্ধশ্বাস জীবন</span>
            </h2>
            <p
              lang="bn"
              className="mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70 sm:text-base"
            >
              একটি রাত, একটি হলঘর, একটি প্রজন্মের নীরব সাক্ষ্য — প্রযুক্তি, ভয় ও
              বিবেক যেখানে একই সরলরেখায় এসে দাঁড়ায়।
            </p>

            <blockquote
              lang="bn"
              className="mt-8 border-l border-amber-400/60 pl-5 font-serif text-lg italic leading-snug text-amber-100/90 sm:text-xl"
            >
              “মায়ের নিষেধ আছে।”
            </blockquote>
          </div>

          {/* Player card */}
          <div className="rounded-sm border border-amber-400/[0.18] bg-white/[0.02] p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
              <span className="inline-flex items-center gap-2">
                <Headphones className="h-3.5 w-3.5" />
                Listen
              </span>
              <span className="font-mono text-white/50">
                {fmt(cur)} / {fmt(dur)}
              </span>
            </div>

            <audio ref={ref} preload="metadata" src={audioAsset.url} />

            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.6)] transition-transform hover:scale-[1.04] hover:bg-amber-300"
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
                  className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]"
                >
                  <div
                    className="h-full bg-amber-400 transition-[width] duration-150"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p
                  lang="bn"
                  className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/50"
                >
                  Chapter I · জাতীয় দলিল
                </p>
              </div>
            </div>

            <Link
              to="/the-stand"
              className="group mt-6 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em] text-amber-300 transition-colors hover:text-amber-200"
            >
              Read the full story
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}