import { STAND_INFRA } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function InfrastructurePivot() {
  return (
    <section
      aria-label="After The Stand"
      className="relative overflow-hidden px-6 lg:px-10 py-28 md:py-44 bg-[hsl(var(--stand-charcoal))] text-[hsl(var(--stand-bone))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[hsl(var(--stand-red))]/15 blur-[120px]"
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red-glow))]"
          >
            {STAND_INFRA.eyebrow}
          </p>
          <h2 className="mt-6 max-w-3xl font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
            {STAND_INFRA.headline}
          </h2>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-[hsl(var(--stand-bone))]/65 leading-relaxed">
            {STAND_INFRA.sub}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-[hsl(var(--stand-bone))]/10">
          {STAND_INFRA.pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <article className="h-full bg-[hsl(var(--stand-charcoal))] p-8 md:p-10">
                <p
                  lang="en"
                  className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--stand-red-glow))]"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3
                  lang="en"
                  className="mt-4 font-display text-xl md:text-2xl font-semibold"
                >
                  {p.title}
                </h3>
                <p
                  lang="bn"
                  className="mt-4 text-sm leading-relaxed text-[hsl(var(--stand-bone))]/65"
                >
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
