import { STAND_CLOSING } from "@/content/theStand";
import { Reveal } from "./Reveal";

export function ClosingStatement() {
  return (
    <section
      aria-label="Closing statement"
      className="stand-closing relative isolate min-h-[88vh] flex flex-col justify-center px-6 lg:px-10 py-32"
    >
      <div className="mx-auto w-full max-w-4xl text-center">
        <Reveal>
          <p
            lang="bn"
            className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.25] tracking-tight text-[hsl(var(--stand-bone))]"
          >
            {STAND_CLOSING.line1}
            <br />
            <span className="text-[hsl(var(--stand-bone))]/70">
              {STAND_CLOSING.line2}
            </span>
          </p>
        </Reveal>

        <Reveal delay={1200}>
          <div className="mt-24 flex flex-col items-center gap-4">
            <p
              lang="en"
              className="font-mono text-[10px] uppercase tracking-[0.6em] text-[hsl(var(--stand-bone))]/70"
            >
              {STAND_CLOSING.signature}
            </p>
            <div className="stand-redline h-px w-24" aria-hidden />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
