import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { useStandLang } from "@/context/StandLanguageContext";
import { Reveal } from "./Reveal";
import audioAsset from "@/assets/algorithm-torture-cell.mp3.asset.json";
import { CdnStatusChip } from "@/components/media/CdnStatusChip";
import { useNearViewport } from "@/hooks/useNearViewport";
import { MediaErrorNotice, mediaErrorMessage } from "@/components/media/MediaErrorNotice";

/**
 * AudioStory — a long-form narrative chapter pairing the recorded reflection
 * "অ্যালগরিদম আর টর্চার সেলের রুদ্ধশ্বাস জীবন" with a Bangla-first written story
 * and a curated set of source links. Calm, premium, archive-grade UI.
 */

type Lang = "bn" | "en";

const COPY: Record<Lang, {
  eyebrow: string;
  title: string;
  kicker: string;
  listen: string;
  duration: string;
  paragraphs: string[];
  pullquote: string;
  linksTitle: string;
  links: { label: string; href: string; note: string }[];
  footer: string;
}> = {
  bn: {
    eyebrow: "শোনার মতো একটি গল্প",
    title: "অ্যালগরিদম আর টর্চার সেলের রুদ্ধশ্বাস জীবন",
    kicker:
      "একটি রাত, একটি হলঘর, আর একটি প্রজন্মের নীরব সাক্ষ্য — যেখানে প্রযুক্তি, ভয় ও বিবেক একই সরলরেখায় এসে দাঁড়ায়।",
    listen: "শুনুন",
    duration: "প্রায় ১৫ মিনিট",
    paragraphs: [
      "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের হলঘরগুলোতে রাত নামলে আলো কমে, কিন্তু নজরদারি বাড়ে। অ্যালগরিদম শুধু ফোনের ভেতরেই থাকে না — সে ঢুকে পড়ে করিডোরে, রুমমেটের চোখে, সিনিয়রের প্রশ্নে। কে কখন কোথায় ছিল, কে কার সাথে কথা বলেছে, কোন পোস্টে কে লাইক দিয়েছে — সব কিছুই হয়ে ওঠে নিয়ন্ত্রণের উপাদান।",
      "এই গল্প সেই রাতের, যেখানে একজন শিক্ষার্থী চাঁদাবাজির বিরুদ্ধে ‘না’ বলেছিল। মায়ের নিষেধ ছিল — তাই সে কোনো অন্যায়ে যুক্ত হবে না, কোনো অন্যায় মেনেও নেবে না। কিন্তু সেই ‘না’-এর মূল্য দিতে হয়েছিল একটি টর্চার সেলে, যেখানে রাতভর প্রশ্ন, হুমকি আর নীরব ভয়ের অ্যালগরিদম চলেছে।",
      "প্রযুক্তি এখানে দুই দিকেই কাজ করে। একদিকে সে নিপীড়কের হাতিয়ার — স্ক্রিনশট, লোকেশন, চ্যাট লগ। অন্যদিকে সে-ই হয়ে ওঠে সাক্ষ্য সংরক্ষণের একমাত্র উপায় — রেকর্ডিং, টাইমস্ট্যাম্প, পাবলিক আর্কাইভ। এই দ্বৈততার মাঝখানে দাঁড়িয়ে থাকে একজন মানুষ, যাকে সিদ্ধান্ত নিতে হয়: চুপ থাকবে, না কথা বলবে।",
      "এই অডিও সেই সিদ্ধান্তের পেছনের ভাবনা — ভয়, ক্লান্তি, পরিবার, ভবিষ্যৎ, এবং শেষপর্যন্ত একটি সাধারণ অথচ অসম্ভব কঠিন উপলব্ধি: নীতির মূল্য সবসময় তাৎক্ষণিক নয়, কিন্তু তা কখনোই বৃথা যায় না।",
    ],
    pullquote:
      "“মায়ের নিষেধ আছে” — এই একটি বাক্যই সেই রাতে অ্যালগরিদমের বিরুদ্ধে সবচেয়ে শক্তিশালী প্রতিরোধ ছিল।",
    linksTitle: "প্রসঙ্গ ও সূত্র",
    links: [
      {
        label: "জাবি ছাত্রলীগের অপরাধনামা — Channel 24",
        href: "https://www.channel24bd.tv/politics/article/196733/",
        note: "প্রধান অনুসন্ধানমূলক প্রতিবেদন",
      },
      {
        label: "বারবার পার পেয়ে বেপরোয়া ছাত্রলীগ — Dhaka Tribune",
        href: "https://bangla.dhakatribune.com/bangladesh/76832/",
        note: "প্রাতিষ্ঠানিক দায়মুক্তির বিশ্লেষণ",
      },
      {
        label: "জাবি হলের ‘টর্চার সেল’ ও নির্যাতন — NewsBangla24",
        href: "https://www.newsbangla24.com/education/232640/",
        note: "প্রত্যক্ষ অভিযোগ ও সাক্ষ্য",
      },
    ],
    footer:
      "এই গল্প কোনো ব্যক্তিগত অভিযোগ নয় — এটি একটি প্রজন্মের নীরব দলিল, যাতে ভবিষ্যৎ ভুলে না যায়।",
  },
  en: {
    eyebrow: "A story worth listening to",
    title: "The Algorithm and the Breathless Life of a Torture Cell",
    kicker:
      "One night, one hall, one generation's quiet testimony — where technology, fear and conscience meet on the same straight line.",
    listen: "Listen",
    duration: "approx. 15 minutes",
    paragraphs: [
      "When night falls on the halls of Jahangirnagar University, the lights dim — but the surveillance sharpens. The algorithm doesn't stay inside the phone; it spills into corridors, into a roommate's glance, into a senior's question. Who was where, who spoke to whom, who liked which post — every signal becomes a tool of control.",
      "This is the story of a night when one student said ‘no’ to extortion. His mother had told him never to take part in injustice, and never to accept it. That single ‘no’ cost him a night in a torture cell, where questions, threats and a quiet algorithm of fear ran until morning.",
      "Technology cuts both ways here. On one side it is the oppressor's tool — screenshots, locations, chat logs. On the other, it is the only way to preserve testimony — recordings, timestamps, public archives. Between those two poles stands a single human, forced to decide: stay silent, or speak.",
      "This audio is the thinking behind that decision — fear, exhaustion, family, future, and finally a simple but almost impossible realisation: the value of principle is rarely immediate, but it is never wasted.",
    ],
    pullquote:
      "“My mother forbade it.” That one sentence was, that night, the strongest resistance against the algorithm.",
    linksTitle: "Context & sources",
    links: [
      {
        label: "Crimes of JU Chhatra League — Channel 24",
        href: "https://www.channel24bd.tv/politics/article/196733/",
        note: "Primary investigative report",
      },
      {
        label: "Repeatedly let off, increasingly reckless — Dhaka Tribune",
        href: "https://bangla.dhakatribune.com/bangladesh/76832/",
        note: "Analysis of institutional impunity",
      },
      {
        label: "JU hall torture cells and abuse — NewsBangla24",
        href: "https://www.newsbangla24.com/education/232640/",
        note: "First-hand accounts and testimony",
      },
    ],
    footer:
      "This is not a personal complaint — it is a quiet document of a generation, so that the future does not forget.",
  },
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioStory() {
  const { lang } = useStandLang();
  const copy = COPY[lang];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerCardRef = useRef<HTMLDivElement | null>(null);
  // Observe the visible card, not the <audio> element (which is 0×0).
  const nearAudio = useNearViewport(playerCardRef, "500px");
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaError, setMediaError] = useState<null | { code?: number; message: string }>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => setPlaying(false);
    const onError = () => {
      const err = el.error;
      const message = err?.message || mediaErrorMessage(err?.code, "audio");
      // eslint-disable-next-line no-console
      console.error("[AudioStory] audio failed to load", {
        code: err?.code,
        message,
        src: el.currentSrc || el.src,
      });
      setMediaError({ code: err?.code, message });
      setPlaying(false);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onError);
    };
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      setMediaError(null);
      if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) el.load();
      void el.play().then(() => setPlaying(true)).catch((err: unknown) => {
        const e = err as { name?: string; message?: string };
        // eslint-disable-next-line no-console
        console.error("[AudioStory] play() rejected", e);
        setMediaError({ message: e?.message || "Playback was blocked by your browser." });
        setPlaying(false);
      });
    }
  };

  const retry = () => {
    const el = audioRef.current;
    if (!el) return;
    setMediaError(null);
    try { el.load(); } catch { /* noop */ }
    void el.play().then(() => setPlaying(true)).catch((err: unknown) => {
      const e = err as { name?: string; message?: string };
      // eslint-disable-next-line no-console
      console.error("[AudioStory] retry failed", e);
      setMediaError({ message: e?.message || "Still couldn't play. Please try again." });
    });
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const next = (Number(e.target.value) / 100) * duration;
    el.currentTime = next;
    setCurrent(next);
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <section
      aria-label={copy.title}
      className="px-6 lg:px-10 py-32 md:py-44"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {copy.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2
            lang={lang}
            className="mt-8 font-display text-3xl md:text-5xl leading-[1.2] text-[hsl(var(--stand-ink))]"
          >
            {copy.title}
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p
            lang={lang}
            className="mt-6 text-base md:text-lg leading-[1.7] text-[hsl(var(--stand-muted))]"
          >
            {copy.kicker}
          </p>
        </Reveal>

        {/* Audio player */}
        <Reveal delay={220}>
          <div
            ref={playerCardRef}
            className="mt-12 rounded-2xl border border-[hsl(var(--stand-hairline))] bg-[hsl(var(--stand-ink))]/[0.015] p-5 md:p-6"
          >
            <audio
              ref={audioRef}
              preload={nearAudio ? "metadata" : "none"}
              src={audioAsset.url}
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--stand-ink))] text-[hsl(var(--stand-paper))] transition-transform hover:scale-105"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p
                    lang={lang}
                    className="truncate text-sm font-medium text-[hsl(var(--stand-ink))]"
                  >
                    {copy.listen} · {copy.duration}
                  </p>
                  <span className="font-mono text-[11px] tabular-nums text-[hsl(var(--stand-muted))]">
                    {formatTime(current)} / {formatTime(duration)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progress}
                  onChange={seek}
                  aria-label="Seek"
                  className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-[hsl(var(--stand-hairline))] accent-[hsl(var(--stand-red))]"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--stand-red)) ${progress}%, hsl(var(--stand-hairline)) ${progress}%)`,
                  }}
                />
              </div>
              <Volume2 className="hidden h-4 w-4 text-[hsl(var(--stand-muted))] md:block" />
            </div>
            <div className="mt-4 flex items-center justify-end">
              <CdnStatusChip url={audioAsset.url} expectedTypePrefix="audio/" label="Audio CDN" />
            </div>
            {mediaError && (
              <MediaErrorNotice
                kind="audio"
                code={mediaError.code}
                message={mediaError.message}
                onRetry={retry}
              />
            )}
          </div>
        </Reveal>

        {/* Narrative */}
        <div className="mt-16 space-y-7">
          {copy.paragraphs.map((p, i) => (
            <Reveal key={i} delay={120 + i * 60}>
              <p
                lang={lang}
                className="text-base md:text-lg leading-[1.85] text-[hsl(var(--stand-ink))]/90"
              >
                {p}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Pull quote */}
        <Reveal delay={200}>
          <blockquote
            lang={lang}
            className="mt-16 border-l-2 border-[hsl(var(--stand-red))] pl-6 font-display text-xl md:text-2xl leading-[1.5] text-[hsl(var(--stand-ink))]"
          >
            {copy.pullquote}
          </blockquote>
        </Reveal>

        {/* Source links */}
        <Reveal delay={240}>
          <div className="mt-16">
            <p
              lang={lang}
              className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))]"
            >
              {copy.linksTitle}
            </p>
            <ul className="mt-6 divide-y divide-[hsl(var(--stand-hairline))] border-y border-[hsl(var(--stand-hairline))]">
              {copy.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-6 py-4 transition-colors hover:text-[hsl(var(--stand-red))]"
                  >
                    <span className="flex-1">
                      <span
                        lang={lang}
                        className="block text-sm md:text-base text-[hsl(var(--stand-ink))] group-hover:text-[hsl(var(--stand-red))]"
                      >
                        {l.label}
                      </span>
                      <span
                        lang={lang}
                        className="mt-1 block text-xs text-[hsl(var(--stand-muted))]"
                      >
                        {l.note}
                      </span>
                    </span>
                    <span aria-hidden className="font-mono text-[11px] text-[hsl(var(--stand-muted))] group-hover:text-[hsl(var(--stand-red))]">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <p
            lang={lang}
            className="mt-12 text-xs leading-[1.7] text-[hsl(var(--stand-muted))]"
          >
            {copy.footer}
          </p>
        </Reveal>
      </div>
    </section>
  );
}