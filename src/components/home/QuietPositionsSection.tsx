import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const QuietPositionsSection = () => (
  <section
    aria-labelledby="quiet-positions-heading"
    className="relative isolate overflow-hidden bg-muted py-20 sm:py-24 lg:py-28"
  >
    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.04), transparent 60%)" }}
    />
    <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Parallel Chapter · Emotional Archive
        </p>
        <h2
          id="quiet-positions-heading"
          lang="bn"
          className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]"
        >
          নীরব অবস্থান
        </h2>
        <p lang="en" className="mt-3 font-display text-lg italic text-muted-foreground sm:text-xl">
          Quiet Positions
        </p>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
          Not every position is spoken aloud. A restrained, civic reflection on
          how a society remembers the people who chose to stay near without
          making a claim.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Link
            to="/quiet-positions"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary"
          >
            Enter Quiet Positions
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  </section>
);