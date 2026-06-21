import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import DashboardMock from "@/components/tf/DashboardMock";

/**
 * Home page hero. Stateless — the parent owns the "Book Strategy Call"
 * dialog and passes `onOpenQuote` so this section stays presentational.
 */
export const HomeHeroSection = ({ onOpenQuote }: { onOpenQuote: () => void }) => (
  <section className="relative isolate overflow-hidden bg-background pt-24 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32">
    <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg" />
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/8 blur-[180px] tf-glow-pulse"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-[140px]"
    />

    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-10">
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

        <h1 className="mt-7 font-display text-[36px] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground sm:text-[52px] lg:text-[68px] lg:leading-[1.0]">
          Your AI-Powered
          <br />
          <span className="tf-text-electric">Growth Operating System</span>
          <span className="text-primary">.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[14.5px] leading-[1.65] text-muted-foreground sm:mt-7 sm:text-[16.5px] sm:leading-[1.7] lg:mx-0">
          One unified AI-driven ecosystem that replaces scattered tools and
          manual scaling — built for founders who operate beyond marketing.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-3.5 lg:justify-start">
          <button
            type="button"
            onClick={onOpenQuote}
            className="tf-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90 sm:w-auto"
          >
            Book Strategy Call <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <a
            href="#quick-access-heading"
            className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-px hover:border-foreground/20 hover:bg-muted sm:w-auto"
          >
            Explore the OS
          </a>
        </div>

        {/* Proof strip — grid on mobile (no awkward wrap), inline on desktop */}
        <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-y-3 gap-x-6 border-t border-border/60 pt-6 text-left text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:border-0 sm:pt-0 lg:justify-start">
          <div className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" />
            <dt className="sr-only">Compliance</dt>
            <dd>NDA-ready</dd>
          </div>
          <span aria-hidden className="hidden h-0.5 w-0.5 rounded-full bg-muted-foreground sm:inline-block" />
          <div><dt className="sr-only">Ad spend managed</dt><dd>$8.4M ad spend</dd></div>
          <span aria-hidden className="hidden h-0.5 w-0.5 rounded-full bg-muted-foreground sm:inline-block" />
          <div><dt className="sr-only">Operations deployed</dt><dd>47 ops deployed</dd></div>
          <span aria-hidden className="hidden h-0.5 w-0.5 rounded-full bg-muted-foreground sm:inline-block" />
          <div><dt className="sr-only">Average ROAS</dt><dd>4.82x avg ROAS</dd></div>
        </dl>

        {/* Subtle bridge to the directory section below — only on mobile/tablet */}
        <a
          href="#quick-access-heading"
          className="mx-auto mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-primary lg:hidden"
        >
          See what's inside
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
        </a>
      </div>

      {/* Dashboard preview — desktop only; on mobile the hero stays focused on
          message + CTAs and the directory grid takes over below. */}
      <div className="relative hidden lg:block">
        <DashboardMock />
        </div>
    </div>
  </section>
);