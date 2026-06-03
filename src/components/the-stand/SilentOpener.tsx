import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_OPENER_BN, STAND_OPENER_EN } from "@/content/theStand";

export function SilentOpener() {
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_OPENER_BN : STAND_OPENER_EN;

  return (
    <section
      aria-label="Opening statement"
      className="relative isolate min-h-[92vh] flex flex-col justify-center px-6 lg:px-10 stand-paper"
    >
      <div className="mx-auto w-full max-w-4xl">
        <p
          lang={lang}
          className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))]/70 animate-[fadeIn_500ms_ease-out_both]"
          style={{ animationDelay: "80ms" }}
        >
          {t.eyebrow}
        </p>

        <h1
          lang={lang}
          className="mt-12 font-display text-5xl md:text-7xl lg:text-[6.5rem] font-semibold leading-[1.05] tracking-tight text-[hsl(var(--stand-ink))] animate-[fadeIn_700ms_ease-out_both]"
          style={{ animationDelay: "220ms" }}
        >
          {t.headline}
        </h1>

        <div
          className="stand-redline mt-12 w-[60%] md:w-[40%]"
          style={{ animationDelay: "420ms", animationFillMode: "both" }}
          aria-hidden
        />

        <p
          lang={lang}
          className="mt-12 max-w-xl text-base md:text-lg leading-relaxed text-[hsl(var(--stand-muted))] animate-[fadeIn_700ms_ease-out_both]"
          style={{ animationDelay: "520ms" }}
        >
          {t.body}
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center animate-[fadeIn_700ms_ease-out_both]"
        style={{ animationDelay: "780ms" }}
        aria-hidden
      >
        <span
          lang={lang}
          className="text-[10px] uppercase tracking-[0.5em] text-[hsl(var(--stand-muted))]/60"
        >
          {t.scrollCue}
        </span>
      </div>
    </section>
  );
}
