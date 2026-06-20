import {
  ExternalLink,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Cpu,
  Workflow,
  Database,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { EDTECH } from "@/config/edtech";
import { track } from "@/lib/analytics";

const STACK = ["React", "TypeScript", "Tailwind", "Supabase", "Vercel"];

const HIGHLIGHTS = [
  "Cohort-based AI Masterclass",
  "Modular curriculum & recordings",
  "Founder-grade learning OS",
];

const PREVIEW_MODULES = [
  { icon: Cpu, n: "01", title: "AI Foundation & Prompting", meta: "60 min" },
  { icon: Workflow, n: "02", title: "Workflow Automation", meta: "90 min" },
  { icon: Database, n: "03", title: "CRM & Data Systems", meta: "75 min" },
  { icon: LineChart, n: "04", title: "Analytics & Growth", meta: "60 min" },
];

/**
 * Featured-project showcase for KormoShikkha. Renders a hand-crafted in-browser
 * preview (no iframe, no AI image) so the card stays crisp, on-brand, and
 * immune to the platform's X-Frame-Options block.
 */
export const KormoShikkhaShowcase = () => {
  const onOpen = (location: string) =>
    track("edtech_platform_open", { location });

  return (
    <section
      aria-labelledby="kormoshikkha-title"
      className="relative isolate overflow-hidden border-y border-border bg-background py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/8 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            <Sparkles className="h-3 w-3" aria-hidden />
            Featured Project · Live
          </p>
          <h2
            id="kormoshikkha-title"
            className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]"
          >
            KormoShikkha — TrendFlux Online Edtech Platform
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
            A cohort-based AI learning platform built and operated end-to-end.
            All TrendFlux masterclasses, modules and recordings live here.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {/* Hand-crafted in-browser preview */}
          <a
            href={EDTECH.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpen("showcase_preview")}
            aria-label="Open KormoShikkha platform in a new tab"
            className="group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              </span>
              <div className="ml-2 flex flex-1 items-center gap-2 truncate rounded-md border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                <span className="truncate">kormoshikkha.trendflux.digital</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
            </div>

            {/* Rendered "page" preview */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/40 p-6 sm:p-8">
              {/* Top mini-nav */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="font-display text-[13px] font-semibold tracking-tight text-foreground">
                    KormoShikkha
                  </span>
                </div>
                <div className="hidden items-center gap-4 text-[10px] text-muted-foreground sm:flex">
                  <span>Courses</span>
                  <span>Cohorts</span>
                  <span>Library</span>
                  <span className="rounded-full bg-foreground px-2.5 py-1 text-[9px] font-semibold text-background">
                    Sign in
                  </span>
                </div>
              </div>

              {/* Hero */}
              <div className="mt-6 sm:mt-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  Live cohort · open
                </span>
                <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-foreground sm:text-[22px] sm:leading-[1.15]">
                  Advanced AI Masterclass
                  <span className="block text-muted-foreground font-normal text-[11px] sm:text-xs mt-1.5">
                    Operator-grade training · 7 modules · capstone build
                  </span>
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold text-primary-foreground">
                    Enroll now <ArrowRight className="h-2.5 w-2.5" aria-hidden />
                  </span>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[9px] font-semibold text-foreground">
                    View syllabus
                  </span>
                </div>
              </div>

              {/* Module grid */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-2.5">
                {PREVIEW_MODULES.map((m) => (
                  <div
                    key={m.n}
                    className="rounded-lg border border-border bg-background/80 p-2.5 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <m.icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                      <span className="text-[8px] font-medium text-muted-foreground">
                        {m.n}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[10px] font-semibold leading-tight text-foreground">
                      {m.title}
                    </p>
                    <p className="mt-1 text-[8px] text-muted-foreground">{m.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover overlay CTA */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-foreground/85 to-transparent px-4 py-4 text-[11px] font-semibold text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Open live platform <ExternalLink className="h-3 w-3" aria-hidden />
            </span>
          </a>

          {/* Project metadata */}
          <div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary"
                aria-hidden
              >
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Role · Founder, Designer, Operator
                </p>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {EDTECH.name}
                </h3>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {HIGHLIGHTS.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2.5 text-[14px] text-foreground/85"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Built with
              </p>
              <ul className="flex flex-wrap gap-2">
                {STACK.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={EDTECH.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpen("showcase_primary_cta")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Visit Live Platform
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="/showcase"
                onClick={() => track("showcase_open", { location: "kormoshikkha_showcase" })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                See More Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
