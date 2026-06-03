import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_ETHICS, STAND_PRINCIPLES_EN } from "@/content/theStand";
import { Reveal } from "./Reveal";

/**
 * Numbered editorial list. Replaces the previous card grid — generous
 * vertical rhythm, hairline divider between entries, no boxes.
 */
export function PrinciplesList() {
  const { lang } = useStandLang();
  const t = lang === "bn"
    ? { eyebrow: STAND_ETHICS.eyebrow, title: STAND_ETHICS.title, body: STAND_ETHICS.body, items: STAND_ETHICS.items }
    : STAND_PRINCIPLES_EN;

  return (
    <section
      aria-label="Ethical Leadership Index"
      className="px-6 lg:px-10 py-32 md:py-44"
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
            className="mt-6 max-w-2xl text-base md:text-lg text-[hsl(var(--stand-muted))]"
          >
            {t.body}
          </p>
        </Reveal>

        <ol className="mt-20 divide-y divide-[hsl(var(--stand-hairline))]">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.num} delay={i * 80}>
              <div className="grid grid-cols-[auto_1fr] gap-x-8 md:gap-x-16 gap-y-3 py-10 md:py-14">
                <span
                  lang="en"
                  className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--stand-red))] pt-2"
                >
                  {item.num}
                </span>
                <div>
                  <h3
                    lang={lang}
                    className="font-display text-xl md:text-3xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
                  >
                    {item.title}
                  </h3>
                  <p
                    lang={lang}
                    className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-[hsl(var(--stand-muted))]"
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
