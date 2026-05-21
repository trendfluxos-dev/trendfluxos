import { STAND_OPENER } from "@/content/theStand";

export function SilentOpener() {
  return (
    <section
      aria-label="Opening statement"
      className="relative isolate min-h-[92vh] flex flex-col justify-center px-6 lg:px-10 stand-paper"
    >
      <div className="mx-auto w-full max-w-4xl">
        <p
          lang="en"
          className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))]/70 animate-[fadeIn_1.4s_ease-out_both]"
          style={{ animationDelay: "200ms" }}
        >
          The Stand · A preserved moment of conscience
        </p>

        <h1
          lang="bn"
          className="mt-12 font-display text-5xl md:text-7xl lg:text-[6.5rem] font-semibold leading-[1.02] tracking-tight text-[hsl(var(--stand-ink))] animate-[fadeIn_1800ms_ease-out_both]"
          style={{ animationDelay: "700ms" }}
        >
          {STAND_OPENER.bn}
        </h1>

        <div
          className="stand-redline mt-10 w-[60%] md:w-[40%]"
          style={{ animationDelay: "1400ms", animationFillMode: "both" }}
          aria-hidden
        />

        <p
          lang="en"
          className="mt-10 max-w-xl text-base md:text-lg leading-relaxed text-[hsl(var(--stand-muted))] animate-[fadeIn_2000ms_ease-out_both]"
          style={{ animationDelay: "1800ms" }}
        >
          {STAND_OPENER.en}
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center animate-[fadeIn_2400ms_ease-out_both]"
        style={{ animationDelay: "2400ms" }}
        aria-hidden
      >
        <span
          lang="en"
          className="text-[10px] uppercase tracking-[0.5em] text-[hsl(var(--stand-muted))]/60"
        >
          {STAND_OPENER.scrollCue}
        </span>
      </div>
    </section>
  );
}
