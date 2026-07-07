import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FinalCtaSection = ({ onOpenQuote }: { onOpenQuote: () => void }) => (
  <section className="relative isolate overflow-hidden bg-background py-20 sm:py-24 lg:py-28" aria-label="Final call to action">
    <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg" />
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[180px] tf-glow-pulse"
    />
    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
      <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
        <span className="h-1 w-1 rounded-full bg-primary" />
        Next chapter
      </p>
      <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]">
        Scale Beyond <span className="tf-text-electric">Marketing</span>.
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px]">
        Stop renting agency hours. Own a growth system that compounds — wired for your P&L, auditable on day one.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={onOpenQuote}
          className="tf-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90 sm:w-auto"
        >
          Book Private Strategy Call <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <Link
          to="/ecosystem"
          className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-muted sm:w-auto"
        >
          See the Architecture
        </Link>
      </div>
      <p className="mt-6 text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground">
        Limited engagements per quarter · Founder-to-founder
      </p>
    </div>
  </section>
);