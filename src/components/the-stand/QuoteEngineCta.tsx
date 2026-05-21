import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function QuoteEngineCta() {
  return (
    <section
      aria-label="Quote engine"
      className="px-6 lg:px-10 py-24 md:py-36"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="rounded-2xl border border-[hsl(var(--stand-hairline))] bg-[hsl(var(--stand-bone))] p-10 md:p-14">
            <p
              lang="en"
              className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
            >
              Identity propagation engine
            </p>
            <h2 className="mt-5 font-display text-3xl md:text-4xl font-semibold leading-tight text-[hsl(var(--stand-ink))]">
              Generate cinematic declarations.
            </h2>
            <p
              lang="en"
              className="mt-5 max-w-xl text-base text-[hsl(var(--stand-muted))]"
            >
              Documentary archive · Resistance manifesto · Ethical minimalism · Future memory · Public conscience · AI-era humanism.
            </p>
            <Link
              to="/the-stand/share"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--stand-charcoal))] px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-[hsl(var(--stand-bone))] transition-colors hover:bg-[hsl(var(--stand-red))]"
            >
              Open the engine
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
