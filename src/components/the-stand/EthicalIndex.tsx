import { STAND_ETHICS } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function EthicalIndex() {
  return (
    <section
      aria-label="Ethical Leadership Index"
      className="px-6 lg:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {STAND_ETHICS.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]">
            {STAND_ETHICS.title}
          </h2>
          <p
            lang="bn"
            className="mt-5 max-w-2xl text-base md:text-lg text-[hsl(var(--stand-muted))]"
          >
            {STAND_ETHICS.body}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px sm:grid-cols-2 bg-[hsl(var(--stand-hairline))]">
          {STAND_ETHICS.items.map((item, i) => (
            <Reveal key={item.num} delay={i * 100}>
              <article className="h-full bg-[hsl(var(--stand-bone))] p-8 md:p-10">
                <p
                  lang="en"
                  className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--stand-red))]"
                >
                  {item.num}
                </p>
                <h3
                  lang="en"
                  className="mt-4 font-display text-xl md:text-2xl font-semibold text-[hsl(var(--stand-ink))]"
                >
                  {item.title}
                </h3>
                <p
                  lang="bn"
                  className="mt-4 text-sm md:text-base leading-relaxed text-[hsl(var(--stand-muted))]"
                >
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
