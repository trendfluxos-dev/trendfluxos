import { ArrowRight, ShieldCheck } from "lucide-react";
import DashboardMock from "@/components/tf/DashboardMock";

/**
 * Home page hero. Stateless — the parent owns the "Book Strategy Call"
 * dialog and passes `onOpenQuote` so this section stays presentational.
 */
export const HomeHeroSection = ({ onOpenQuote }: { onOpenQuote: () => void }) => (
  <section className="relative isolate overflow-hidden bg-background pt-32 pb-24 sm:pt-44 sm:pb-32">
    <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg" />
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/8 blur-[180px] tf-glow-pulse"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-[140px]"
    />

    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-10">
      <div className="tf-rise text-center lg:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            TrendFlux OS · v2.0 · Live
          </span>
        </div>

        <h1 className="mt-8 font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-[56px] lg:text-[68px] lg:leading-[1.0]">
          Your AI-Powered
          <br />
          <span className="tf-text-electric">Growth Operating System</span>
          <span className="text-primary">.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px] lg:mx-0">
          Replace scattered tools, disconnected workflows, and manual scaling
          with one unified AI-driven ecosystem — built for founders who
          operate beyond marketing.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3.5 lg:justify-start">
          <button
            type="button"
            onClick={onOpenQuote}
            className="tf-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90 sm:w-auto"
          >
            Book Strategy Call <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <a
            href="#ecosystem"
            className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-px hover:border-foreground/20 hover:bg-muted sm:w-auto"
          >
            Explore the OS
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:justify-start">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" /> NDA-ready
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
          <span>$8.4M ad spend</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
          <span>47 ops deployed</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
          <span>4.82x avg ROAS</span>
        </div>
      </div>

      <div className="relative">
        <DashboardMock />
      </div>
    </div>
  </section>
);