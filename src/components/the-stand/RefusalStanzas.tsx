import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_REFUSALS, STAND_REFUSAL_INTRO } from "@/content/theStand";
import { Reveal } from "./Reveal";

/**
 * Full-bleed stanza sequence. One refusal per scroll viewport.
 * No card chrome — pure editorial pacing, hairline dividers.
 */
export function RefusalStanzas() {
  const { lang } = useStandLang();
  const intro = lang === "bn" ? STAND_REFUSAL_INTRO.bn : STAND_REFUSAL_INTRO.en;

  return (
    <section
      aria-label="What was refused"
      className="px-6 lg:px-10 py-32 md:py-44"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {intro.eyebrow}
          </p>
          <h2
            lang={lang}
            className="mt-6 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
          >
            {intro.title}
          </h2>
        </Reveal>

        <div className="mt-28 space-y-32 md:space-y-44">
          {STAND_REFUSALS.map((card) => (
            <Reveal key={card.id}>
              <article>
                <p
                  lang="en"
                  className="font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))]/70"
                >
                  {card.label}
                </p>
                <p
                  lang={lang}
                  className="mt-10 font-display text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-[hsl(var(--stand-ink))]"
                >
                  {lang === "bn" ? card.bn : card.en}
                </p>
                <div className="stand-hairline mt-14 w-24" aria-hidden />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
