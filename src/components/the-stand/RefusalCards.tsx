import { STAND_REFUSALS } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function RefusalCards() {
  return (
    <section
      aria-label="What was refused"
      className="px-6 lg:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            What was refused
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]">
            Three refusals. One conscience.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STAND_REFUSALS.map((card, i) => (
            <Reveal key={card.id} delay={i * 120}>
              <article className="stand-card rounded-2xl p-8 h-full flex flex-col">
                <p
                  lang="en"
                  className="text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))]"
                >
                  {card.label}
                </p>
                <p
                  lang="bn"
                  className="mt-8 font-display text-2xl md:text-[1.7rem] leading-snug text-[hsl(var(--stand-ink))]"
                >
                  {card.bn}
                </p>
                <div className="stand-hairline my-6" aria-hidden />
                <p
                  lang="en"
                  className="text-sm leading-relaxed text-[hsl(var(--stand-muted))]"
                >
                  {card.en}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
