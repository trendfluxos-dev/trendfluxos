import { useRef } from "react";
import { useStandLang } from "@/context/StandLanguageContext";
import { Reveal } from "./Reveal";
import { VideoWithDiagnostics } from "@/components/media/VideoWithDiagnostics";
import { useNearViewport } from "@/hooks/useNearViewport";
import algorithmFilm from "@/assets/algorithm-torture-cell.mp4.asset.json";
import algorithmFilmWebm from "@/assets/algorithm-torture-cell.webm.asset.json";
import architectFilm from "@/assets/architect-of-violence.mp4.asset.json";
import architectFilmWebm from "@/assets/architect-of-violence.webm.asset.json";
import algorithmPoster from "@/assets/algorithm-torture-cell-poster.jpg";
import architectPoster from "@/assets/architect-of-violence-poster.jpg";

type Film = {
  id: string;
  sources: { src: string; type: string }[];
  poster: string;
  eyebrow: { bn: string; en: string };
  title: { bn: string; en: string };
  caption: { bn: string; en: string };
};

const FILMS: Film[] = [
  {
    id: "algorithm-torture-cell",
    sources: [
      { src: algorithmFilmWebm.url, type: "video/webm" },
      { src: algorithmFilm.url, type: "video/mp4" },
    ],
    poster: algorithmPoster,
    eyebrow: { bn: "শেয়ারকৃত ফাইল ০১", en: "Shared file 01" },
    title: {
      bn: "অ্যালগরিদম ও টর্চার সেল",
      en: "Algorithm & the Torture Cell",
    },
    caption: {
      bn: "ক্রেডিট: মূল নির্মাতা · নথিভুক্ত করা হয়েছে দলিল হিসেবে।",
      en: "Credit: original creator · preserved here as documentation.",
    },
  },
  {
    id: "architect-of-violence",
    sources: [
      { src: architectFilmWebm.url, type: "video/webm" },
      { src: architectFilm.url, type: "video/mp4" },
    ],
    poster: architectPoster,
    eyebrow: { bn: "শেয়ারকৃত ফাইল ০২", en: "Shared file 02" },
    title: {
      bn: "সহিংসতার স্থপতি",
      en: "Architect of Violence",
    },
    caption: {
      bn: "ক্রেডিট: মূল নির্মাতা · নথিভুক্ত করা হয়েছে দলিল হিসেবে।",
      en: "Credit: original creator · preserved here as documentation.",
    },
  },
];

export function SharedFilms() {
  const { lang } = useStandLang();
  return (
    <section
      aria-label={lang === "bn" ? "শেয়ারকৃত ফাইল" : "Shared files"}
      className="px-6 lg:px-10 py-32 md:py-44 bg-[hsl(var(--stand-bone))]"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {lang === "bn" ? "সংরক্ষিত দলিল" : "Preserved record"}
          </p>
          <h2
            lang={lang}
            className="mt-6 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
          >
            {lang === "bn" ? "শেয়ারকৃত ফাইল" : "Shared Files"}
          </h2>
          <p
            lang={lang}
            className="mt-4 max-w-xl text-base text-[hsl(var(--stand-muted))]"
          >
            {lang === "bn"
              ? "দুটি স্বল্পদৈর্ঘ্য ভিডিও — সর্বজনীনভাবে শেয়ারকৃত, এখানে সংরক্ষিত।"
              : "Two short videos — publicly shared, preserved here for the record."}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-[hsl(var(--stand-hairline))] border border-[hsl(var(--stand-hairline))]">
          {FILMS.map((film, i) => (
            <Reveal key={film.id} delay={i * 80}>
              <figure className="flex h-full flex-col bg-[hsl(var(--stand-bone))] p-6 md:p-8">
                <figcaption
                  lang={lang}
                  className="font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
                >
                  {film.eyebrow[lang]}
                </figcaption>
                <h3
                  lang={lang}
                  className="mt-3 font-display text-xl md:text-2xl font-semibold text-[hsl(var(--stand-ink))]"
                >
                  {film.title[lang]}
                </h3>
                <FilmPlayer film={film} />
                <p
                  lang={lang}
                  className="mt-4 text-xs leading-relaxed text-[hsl(var(--stand-muted))]"
                >
                  {film.caption[lang]}
                </p>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilmPlayer({ film }: { film: Film }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Defer metadata fetch until the card approaches the viewport.
  const near = useNearViewport(wrapRef, "500px");
  return (
    <div
      ref={wrapRef}
      className="mt-5 overflow-hidden border border-[hsl(var(--stand-hairline))] bg-[hsl(var(--stand-charcoal))]"
    >
      <VideoWithDiagnostics
        analyticsId={film.id}
        src={film.src}
        poster={film.poster}
        controls
        preload={near ? "metadata" : "none"}
        playsInline
        className="block aspect-video w-full"
      >
        {film.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </VideoWithDiagnostics>
    </div>
  );
}