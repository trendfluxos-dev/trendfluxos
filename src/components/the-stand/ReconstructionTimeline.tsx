import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_RECONSTRUCTION, STAND_RECONSTRUCTION_EN } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function ReconstructionTimeline() {
  const { lang } = useStandLang();
  const t = lang === "bn"
    ? {
        eyebrow: STAND_RECONSTRUCTION.eyebrow,
        title: STAND_RECONSTRUCTION.title,
        subtitle: STAND_RECONSTRUCTION.subtitle,
      }
    : STAND_RECONSTRUCTION_EN;
  // Pair Bangla beats (with stamps) to adapted English titles/bodies.
  const beats = STAND_RECONSTRUCTION.beats.map((b, i) => ({
    stamp: b.stamp,
    title: lang === "bn" ? b.title : STAND_RECONSTRUCTION_EN.beats[i]?.title ?? b.title,
    body: lang === "bn" ? b.body : STAND_RECONSTRUCTION_EN.beats[i]?.body ?? b.body,
  }));

  return (
    <section
      aria-label={t.title}
      className="relative px-6 lg:px-10 py-32 md:py-44 bg-[hsl(var(--stand-bone-soft))]"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {t.eyebrow}
          </p>
          <h2
            lang={lang}
            className="mt-6 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
          >
            {t.title}
          </h2>
          <p
            lang={lang}
            className="mt-4 text-sm md:text-base text-[hsl(var(--stand-muted))]"
          >
            {t.subtitle}
          </p>
        </Reveal>

        <ol className="relative mt-20 border-l border-[hsl(var(--stand-hairline))] pl-8 md:pl-12">
          {beats.map((beat, i) => (
            <Reveal as="li" key={beat.title + i} delay={i * 60}>
              <div className="relative pb-20 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[33px] md:-left-[49px] top-1.5 grid h-3 w-3 place-items-center"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--stand-red))]" />
                  <span className="absolute inset-0 rounded-full ring-1 ring-[hsl(var(--stand-red))]/30" />
                </span>
                <p
                  lang={lang}
                  className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--stand-red))]"
                >
                  {beat.stamp}
                </p>
                <h3
                  lang={lang}
                  className="mt-4 font-display text-xl md:text-3xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
                >
                  {beat.title}
                </h3>
                <p
                  lang={lang}
                  className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-[hsl(var(--stand-muted))]"
                >
                  {beat.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
