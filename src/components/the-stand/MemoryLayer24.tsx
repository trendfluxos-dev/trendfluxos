import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_MEMORY_24_BN, STAND_MEMORY_24_EN } from "@/content/theStand";
import { Reveal } from "./Reveal";

/**
 * July 2024 — civic memory layer. Cinematic, archival, restrained.
 * Treats "24" as public memory, not political branding. No slogans,
 * no posters, no aggressive red — just a quiet timeline against
 * deep charcoal, breathing room, editorial pacing.
 */
export function MemoryLayer24() {
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_MEMORY_24_BN : STAND_MEMORY_24_EN;

  return (
    <section
      aria-label="July 2024 — civic memory layer"
      className="relative overflow-hidden px-6 lg:px-10 py-32 md:py-44 bg-[hsl(var(--stand-charcoal))] text-[hsl(var(--stand-bone))]"
    >
      {/* Soft archival vignette — never a glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--stand-bone) / 0.4) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative mx-auto max-w-4xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red-glow))]"
          >
            {t.eyebrow}
          </p>
          <h2
            lang={lang}
            className="mt-8 max-w-3xl font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight"
          >
            {t.title}
          </h2>
          <p
            lang={lang}
            className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-[hsl(var(--stand-bone))]"
          >
            {t.intro}
          </p>
        </Reveal>

        {/* Cinematic timeline — wide spacing, minimal chrome */}
        <ol className="relative mt-24 border-l border-[hsl(var(--stand-bone))]/15 pl-8 md:pl-12">
          {t.beats.map((beat, i) => (
            <Reveal as="li" key={beat.title + i} delay={i * 80}>
              <div className="relative pb-20 md:pb-24 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[33px] md:-left-[49px] top-2 h-2 w-2 rounded-full bg-[hsl(var(--stand-red-glow))]/80"
                />
                <p
                  lang={lang}
                  className="font-mono text-[11px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red-glow))]"
                >
                  {beat.stamp}
                </p>
                <h3
                  lang={lang}
                  className="mt-4 font-display text-xl md:text-3xl font-semibold leading-tight text-[hsl(var(--stand-bone))]"
                >
                  {beat.title}
                </h3>
                <p
                  lang={lang}
                  className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-[hsl(var(--stand-bone))]"
                >
                  {beat.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120}>
          <p
            lang={lang}
            className="mt-12 max-w-2xl border-t border-[hsl(var(--stand-bone))]/15 pt-10 text-sm md:text-base italic text-[hsl(var(--stand-bone))]"
          >
            {t.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
