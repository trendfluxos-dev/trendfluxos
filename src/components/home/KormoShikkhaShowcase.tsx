import {
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Cpu,
  Workflow,
  Database,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
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
 * Featured-project showcase for কর্মশিক্ষা TED Plus. Renders a hand-crafted in-browser
 * preview (no iframe, no AI image) so the card stays crisp, on-brand, and
 * immune to the platform's X-Frame-Options block.
 */
export const কর্মশিক্ষা TED PlusShowcase = () => {
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
            কর্মশিক্ষা TED Plus — TrendFlux Online Edtech Platform
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
            A cohort-based AI learning platform built and operated end-to-end.
            All TrendFlux masterclasses, modules and recordings live here.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {/* Hand-crafted in-browser preview */}
          <Link
            to={EDTECH.routes.home}
            onClick={() => onOpen("showcase_preview")}
            aria-label="Open কর্মশিক্ষা TED Plus platform"
            className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.35)] ring-1 ring-foreground/[0.04] transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_30px_80px_-25px_hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {/* Subtle gradient halo behind the card */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(800px 300px at 50% 0%, hsl(var(--primary) / 0.10), transparent 60%)",
              }}
            />
            {/* Browser chrome */}
            <div className="relative flex items-center gap-2 border-b border-border/60 bg-muted/40 backdrop-blur-md px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15 ring-1 ring-inset ring-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15 ring-1 ring-inset ring-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15 ring-1 ring-inset ring-foreground/10" />
              </span>
              <div className="ml-2 flex flex-1 items-center gap-2 truncate rounded-md border border-border/60 bg-background/70 backdrop-blur px-3 py-1 text-[11px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--lv-gold))] shadow-[0_0_8px_hsl(var(--lv-gold)/0.6)]" aria-hidden />
                <span className="truncate">trendflux.digital/edtech</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
            </div>

            {/* Rendered "page" preview */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 p-6 sm:p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[hsl(var(--lv-gold))]/10 blur-3xl"
              />
              {/* Top mini-nav */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.6)]">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="font-display text-[13px] font-semibold tracking-tight text-foreground">
                    কর্মশিক্ষা TED Plus
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
              <div className="relative mt-7 sm:mt-9">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--lv-gold))]/35 bg-[hsl(var(--lv-gold))]/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--lv-gold))]">
                  <span className="h-1 w-1 rounded-full bg-[hsl(var(--lv-gold))] animate-pulse shadow-[0_0_6px_hsl(var(--lv-gold)/0.8)]" />
                  Live cohort · open
                </span>
                <h3 className="mt-3.5 font-display text-lg font-bold tracking-tight text-foreground sm:text-[22px] sm:leading-[1.15]">
                  Advanced AI Masterclass
                  <span className="block text-muted-foreground font-normal text-[11px] sm:text-xs mt-2">
                    Operator-grade training · 7 modules · capstone build
                  </span>
                </h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary-glow px-2.5 py-1 text-[9px] font-semibold text-primary-foreground shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.6)]">
                    Enroll now <ArrowRight className="h-2.5 w-2.5" aria-hidden />
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/70 backdrop-blur px-2.5 py-1 text-[9px] font-semibold text-foreground">
                    View syllabus
                  </span>
                </div>
              </div>

              {/* Module grid */}
              <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:grid-cols-4 sm:gap-3">
                {PREVIEW_MODULES.map((m) => (
                  <div
                    key={m.n}
                    className="group/mod rounded-xl border border-border/60 bg-background/60 p-2.5 backdrop-blur-md ring-1 ring-inset ring-foreground/[0.03] transition-colors hover:border-primary/30 hover:bg-background/80"
                  >
                    <div className="flex items-center justify-between">
                      <m.icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                      <span className="text-[8px] font-mono font-medium text-muted-foreground/80">
                        {m.n}
                      </span>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[10px] font-semibold leading-tight text-foreground">
                      {m.title}
                    </p>
                    <p className="mt-1 text-[8px] text-muted-foreground/80">{m.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover overlay CTA */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-foreground/90 via-foreground/60 to-transparent px-4 py-5 text-[11px] font-semibold text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Open কর্মশিক্ষা TED Plus <ArrowUpRight className="h-3 w-3" aria-hidden />
            </span>
          </Link>

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
              <Link
                to={EDTECH.routes.home}
                onClick={() => onOpen("showcase_primary_cta")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Open কর্মশিক্ষা TED Plus
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/showcase"
                onClick={() => track("showcase_open", { location: "kormoshikkha_showcase" })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                See More Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
