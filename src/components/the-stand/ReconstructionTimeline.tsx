import { STAND_RECONSTRUCTION } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function ReconstructionTimeline() {
  return (
    <section
      aria-label={STAND_RECONSTRUCTION.title}
      className="relative px-6 lg:px-10 py-28 md:py-40 bg-[hsl(var(--stand-bone-soft))]"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p
            lang="en"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {STAND_RECONSTRUCTION.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]">
            {STAND_RECONSTRUCTION.title}
          </h2>
          <p
            lang="bn"
            className="mt-3 text-sm md:text-base text-[hsl(var(--stand-muted))]"
          >
            {STAND_RECONSTRUCTION.subtitle}
          </p>
        </Reveal>

        <ol className="relative mt-16 border-l border-[hsl(var(--stand-hairline))] pl-8 md:pl-12">
          {STAND_RECONSTRUCTION.beats.map((beat, i) => (
            <Reveal as="li" key={beat.title + i} delay={i * 80}>
              <div className="relative pb-14 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[33px] md:-left-[49px] top-1.5 grid h-3 w-3 place-items-center"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--stand-red))]" />
                  <span className="absolute inset-0 rounded-full ring-1 ring-[hsl(var(--stand-red))]/30" />
                </span>
                <p
                  lang="en"
                  className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--stand-red))]"
                >
                  {beat.stamp}
                </p>
                <h3
                  lang="bn"
                  className="mt-3 font-display text-xl md:text-2xl font-semibold text-[hsl(var(--stand-ink))]"
                >
                  {beat.title}
                </h3>
                <p
                  lang="bn"
                  className="mt-3 max-w-2xl text-base leading-relaxed text-[hsl(var(--stand-muted))]"
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
