import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { InlineEditProvider, InlineEditToggle, EditableText } from "@/components/InlineEditable";
import theStandCover from "@/assets/the-stand-cover.jpg";

/**
 * Cinematic cover panel for "The Stand". All headline/quote copy is rendered
 * as inline-editable text overlaid on a fixed JPG backdrop — editors can
 * toggle edit mode in-place without regenerating any imagery.
 */
export const TheStandCoverSection = () => (
  <section
    aria-labelledby="the-stand-cover-heading"
    className="relative isolate overflow-hidden bg-black py-20 sm:py-24 lg:py-28"
  >
    <InlineEditProvider scope="the-stand-cover">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.10), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.85), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="font-serif text-[10px] uppercase tracking-[0.38em] text-amber-400/90 sm:text-[11px] sm:tracking-[0.42em]">
            <EditableText id="eyebrow" defaultText="Featured · The Stand · জাতীয় দলিল" />
          </span>
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="hidden font-serif text-[10px] uppercase tracking-[0.32em] text-white/40 sm:inline">
            <EditableText id="volume-eyebrow" defaultText="Volume I · 2023–2024" />
          </span>
          <InlineEditToggle className="ml-2" />
        </div>

        <figure className="group relative overflow-hidden rounded-sm border border-amber-400/[0.14] bg-black shadow-[0_60px_160px_-40px_rgba(0,0,0,0.95)]">
          <img
            src={theStandCover}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.012]"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.80) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.0) 60%)",
            }}
          />

          <span aria-hidden className="absolute left-3 top-3 h-3.5 w-3.5 border-l border-t border-amber-400/70 sm:left-5 sm:top-5 sm:h-4 sm:w-4" />
          <span aria-hidden className="absolute right-3 top-3 h-3.5 w-3.5 border-r border-t border-amber-400/70 sm:right-5 sm:top-5 sm:h-4 sm:w-4" />
          <span aria-hidden className="absolute bottom-3 left-3 h-3.5 w-3.5 border-b border-l border-amber-400/70 sm:bottom-5 sm:left-5 sm:h-4 sm:w-4" />
          <span aria-hidden className="absolute bottom-3 right-3 h-3.5 w-3.5 border-b border-r border-amber-400/70 sm:bottom-5 sm:right-5 sm:h-4 sm:w-4" />

          <figcaption className="absolute inset-0 flex flex-col justify-between p-5 sm:p-10 lg:p-16">
            <div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.4em] text-amber-300/80 sm:text-[10px]">
              <EditableText id="top-volume" defaultText="Volume I" />
              <EditableText id="top-meta-lg" defaultText="জাতীয় দলিল · ২০২৩–২০২৪" lang="bn" className="hidden sm:inline" />
              <EditableText id="top-meta-sm" defaultText="২০২৩–২০২৪" lang="bn" className="sm:hidden" />
            </div>

            <div className="max-w-2xl">
              <EditableText
                as="h2"
                id="title"
                defaultText="THE STAND"
                className="font-serif text-4xl font-bold leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl"
              />
              <span id="the-stand-cover-heading" className="sr-only">The Stand</span>
              <EditableText
                as="p"
                id="subtitle"
                lang="bn"
                defaultText="একজন তরুণ একা দাঁড়িয়ে — নৈতিক অবস্থানের সিনেমাটিক রূপায়ণ"
                className="mt-3 font-serif text-base font-medium text-amber-200/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:mt-4 sm:text-xl lg:text-2xl"
              />
              <EditableText
                as="p"
                id="standfirst"
                multiline
                defaultText="Zahid Hasan Emon · Jahangirnagar University · a preserved moment of conscience against extortion and torture-cell culture."
                className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:mt-5 sm:text-sm lg:text-base"
              />
            </div>

            <div className="flex items-end justify-between gap-4">
              <blockquote className="max-w-xs">
                <EditableText
                  as="p"
                  id="quote"
                  lang="bn"
                  defaultText="“মায়ের নিষেধ আছে।”"
                  className="font-serif text-lg italic leading-snug text-amber-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:text-2xl lg:text-3xl"
                />
                <footer className="mt-2 font-serif text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-[11px]">
                  <EditableText id="attribution" defaultText="— Zahid Hasan Emon · 2023" lang="bn" />
                </footer>
              </blockquote>
              <EditableText
                id="chapter"
                defaultText="Chapter I"
                className="hidden font-serif text-[10px] uppercase tracking-[0.32em] text-amber-300/70 sm:inline"
              />
            </div>
          </figcaption>
        </figure>

        <div className="mt-10 grid grid-cols-1 items-center gap-8 sm:mt-12 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/the-stand"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-sm bg-amber-400 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.55)] transition-all hover:bg-amber-300 hover:shadow-[0_14px_40px_-10px_rgba(251,191,36,0.7)]"
            >
              Enter The Stand
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              to="/the-stand/share"
              className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-6 py-3.5 text-sm font-medium tracking-wide text-white/90 transition-colors hover:border-amber-400/50 hover:bg-white/[0.03] hover:text-amber-200"
            >
              <span lang="bn">শেয়ার কার্ড</span>
              <span className="text-white/40">·</span>
              <span>Share Kit</span>
            </Link>
          </div>

          <span aria-hidden className="hidden h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

          <dl className="grid grid-cols-3 gap-4 sm:gap-10">
            <div>
              <dt className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-400/70">Chapter</dt>
              <dd className="mt-1.5 font-serif text-[13px] text-white/90 sm:text-sm">I — The Stand</dd>
            </div>
            <div>
              <dt className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-400/70">Year</dt>
              <dd className="mt-1.5 font-serif text-[13px] text-white/90 sm:text-sm">2023–2024</dd>
            </div>
            <div>
              <dt className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-400/70">Status</dt>
              <dd className="mt-1.5 inline-flex items-center gap-1.5 font-serif text-[13px] text-white/90 sm:text-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                Verified
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </InlineEditProvider>
  </section>
);