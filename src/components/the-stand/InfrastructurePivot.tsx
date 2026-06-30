import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_INFRA_BN, STAND_INFRA_EN } from "@/content/theStand";
import { Reveal } from "./Reveal";

/**
 * Quiet bridge to the TrendFlux Ecosystem. A single editorial paragraph
 * and one understated inline link — no pillar grid.
 */
export function InfrastructurePivot() {
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_INFRA_BN : STAND_INFRA_EN;

  return (
    <section
      aria-label="After The Stand"
      className="relative overflow-hidden px-6 lg:px-10 py-32 md:py-44 bg-[hsl(var(--stand-charcoal))] text-[hsl(var(--stand-bone))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[hsl(var(--stand-red))]/15 blur-[120px]"
      />
      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red-glow))]"
          >
            {t.eyebrow}
          </p>
          <h2
            lang={lang}
            className="mt-8 font-display text-4xl md:text-6xl font-semibold leading-[1.1]"
          >
            {t.headline}
          </h2>
          <p
            lang={lang}
            className="mt-8 text-base md:text-lg text-[hsl(var(--stand-bone))] leading-relaxed"
          >
            {t.body}
          </p>
          <a
            href="/"
            lang={lang}
            className="mt-12 inline-block border-b border-[hsl(var(--stand-red-glow))]/50 pb-1 text-sm uppercase tracking-[0.3em] text-[hsl(var(--stand-bone))] transition-colors hover:text-[hsl(var(--stand-red-glow))] hover:border-[hsl(var(--stand-red-glow))]"
          >
            {t.link}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
