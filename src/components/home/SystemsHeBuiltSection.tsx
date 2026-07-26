import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, CalendarCheck, TrendingUp } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import { SYSTEMS_HE_BUILT, type OutcomeType } from "@/data/home";
import { cn } from "@/lib/utils";
import ProjectLeadBookingDialog from "@/components/project-lead/ProjectLeadBookingDialog";

const OUTCOME_FILTERS: OutcomeType[] = [
  "CAC",
  "Engagement",
  "Lead Capture",
  "Content Cadence",
];

/**
 * Interactive build-order timeline. The six systems sit on a single
 * horizontal rail (vertical on mobile) connected by an animated dash
 * that "fills" up to the active node. Hover or focus a node to swap
 * the detail panel — no scrolling required to explore the build order.
 */
export const SystemsHeBuiltSection = () => {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeType | "All">("All");
  const [bookingOpen, setBookingOpen] = useState(false);
  const count = SYSTEMS_HE_BUILT.length;

  // Gentle auto-advance until the user interacts.
  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % count), 3800);
    return () => window.clearInterval(t);
  }, [auto, count]);

  const select = useCallback((i: number) => {
    setAuto(false);
    setActive(i);
  }, []);

  const current = SYSTEMS_HE_BUILT[active];
  const progress = count > 1 ? (active / (count - 1)) * 100 : 0;

  const filteredSystems =
    outcomeFilter === "All"
      ? SYSTEMS_HE_BUILT
      : SYSTEMS_HE_BUILT.filter((s) => s.outcomeTypes.includes(outcomeFilter));

  return (
  <TfSection
    id="systems-he-built"
    eyebrow="Systems He Built"
    title="The growth systems TrendFlux delivers, step by step."
    intro="Hover any node to inspect the system. Six stages, one operating layer — explore the entire 90-day build order without scrolling."
  >
    <div className="mx-auto w-full max-w-7xl">
      {/* RAIL — horizontal on lg+, vertical on small screens */}
      <div
        role="tablist"
        aria-label="Growth systems build order"
        className="relative"
        onMouseLeave={() => setAuto(true)}
      >
        {/* Desktop horizontal rail */}
        <div className="relative hidden lg:block">
          {/* base track */}
          <div className="absolute left-[3%] right-[3%] top-7 h-px bg-border" aria-hidden />
          {/* animated fill */}
          <div
            aria-hidden
            className="absolute left-[3%] top-7 h-px bg-gradient-to-r from-primary via-primary to-primary/40 transition-[width] duration-700 ease-out"
            style={{ width: `calc(${progress}% * 0.94)`, boxShadow: "0 0 16px hsl(var(--primary) / 0.55)" }}
          />
          {/* moving pulse dot */}
          <div
            aria-hidden
            className="absolute top-[22px] h-3 w-3 -translate-x-1/2 rounded-full bg-primary transition-[left] duration-700 ease-out"
            style={{ left: `calc(3% + ${progress}% * 0.94)`, boxShadow: "0 0 18px 4px hsl(var(--primary) / 0.55)" }}
          />
          <ul className="relative grid grid-cols-7 gap-2">
            {SYSTEMS_HE_BUILT.map((s, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <li key={s.title} className="flex flex-col items-center text-center">
                  <button
                    role="tab"
                    aria-label={`View stage ${s.step}: ${s.title}`}
                    aria-selected={isActive}
                    onMouseEnter={() => select(i)}
                    onFocus={() => select(i)}
                    onClick={() => select(i)}
                    className={cn(
                      "group relative grid h-14 w-14 place-items-center rounded-full border bg-card transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "scale-110 border-primary bg-primary text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.55)]"
                        : isPast
                          ? "border-primary/60 text-primary hover:scale-105"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:scale-105",
                    )}
                  >
                    <s.icon className="h-5 w-5" aria-hidden />
                    {isActive && (
                      <span aria-hidden className="absolute inset-0 -m-1 rounded-full border border-primary/40 animate-ping" />
                    )}
                  </button>
                  <p className={cn(
                    "mt-3 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}>{s.step}</p>
                  <p className={cn(
                    "mt-1 line-clamp-2 max-w-[14ch] text-[12px] leading-tight transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground/80",
                  )}>{s.title}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile / tablet vertical rail */}
        <ul className="relative lg:hidden">
          <div aria-hidden className="absolute left-[26px] top-2 bottom-2 w-px bg-border" />
          <div
            aria-hidden
            className="absolute left-[26px] top-2 w-px bg-gradient-to-b from-primary to-primary/30 transition-[height] duration-700 ease-out"
            style={{ height: `calc(${progress}% * 0.96)`, boxShadow: "0 0 12px hsl(var(--primary) / 0.45)" }}
          />
          {SYSTEMS_HE_BUILT.map((s, i) => {
            const isActive = i === active;
            return (
              <li key={s.title} className="relative flex items-start gap-4 py-3">
                <button
                  role="tab"
                  aria-label={`View stage ${s.step}: ${s.title}`}
                  aria-selected={isActive}
                  onClick={() => select(i)}
                  className={cn(
                    "relative z-10 grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border bg-card transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.45)]"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <s.icon className="h-5 w-5" aria-hidden />
                </button>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">{s.step} · {s.window}</p>
                  <p className={cn("mt-0.5 font-display text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{s.title}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* DETAIL PANEL — swaps on hover/focus, no layout shift */}
      <div
        aria-live="polite"
        className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:mt-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />
        <div
          key={active}
          className="grid animate-fade-in gap-6 md:grid-cols-[1.2fr,1fr] md:gap-10"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                <current.icon className="h-3.5 w-3.5" aria-hidden />
                {current.step}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{current.window}</span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {current.title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {current.desc}
            </p>
            {current.caseSlug && (
              <Link
                to={`/case-studies/${current.caseSlug}`}
                aria-label={`Read the case study behind ${current.title}`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                See the case study
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Deliverables</p>
            <ul className="mt-3 space-y-2">
              {current.outputs.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>

    {/* CARD GRID — every system + headline outcome, always visible */}
    <div className="mx-auto mt-12 w-full max-w-7xl sm:mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">All Systems · At a glance</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-foreground sm:text-2xl">
            Every system, every outcome.
          </h3>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Six operating systems plus the composite result. Metrics reflect the typical 90-day engagement baseline.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Filter systems by outcome type"
        className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8"
      >
        <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Filter · Outcome
        </span>
        {(["All", ...OUTCOME_FILTERS] as const).map((label) => {
          const isActive = outcomeFilter === label;
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setOutcomeFilter(label)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {label}
            </button>
          );
        })}
        <span
          aria-live="polite"
          className="ml-auto text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {filteredSystems.length} / {SYSTEMS_HE_BUILT.length} systems
        </span>
      </div>

      {filteredSystems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
          No systems match this outcome yet. Try a different filter.
        </div>
      ) : (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSystems.map((s) => (
          <li
            key={`card-${s.title}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md sm:p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            />
            <div className="flex items-start justify-between gap-3">
              <span className="inline-grid h-10 w-10 place-items-center rounded-xl border border-primary/25 bg-primary/[0.06] text-primary">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {s.step} · {s.window}
              </span>
            </div>

            <h4 className="mt-4 font-display text-lg font-semibold text-foreground">
              {s.title}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s.desc}
            </p>

            <ul className="mt-4 space-y-1.5">
              {s.outputs.map((o) => (
                <li key={o} className="flex items-start gap-2 text-[13px] text-foreground/85">
                  <CheckCircle2 className="mt-[3px] h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{o}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
              <div>
                <p className="font-display text-2xl font-semibold leading-none text-primary">
                  {s.outcome.metric}
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {s.outcome.label}
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
            </div>

            {s.caseSlug && (
              <Link
                to={`/case-studies/${s.caseSlug}`}
                aria-label={`Read the case study behind ${s.title}`}
                className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                See the case study
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>
      )}
    </div>

    <div className="mt-10 flex flex-col items-center gap-3 px-2 text-center sm:mt-12">
      <Link
        to="/project-lead#book"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          setBookingOpen(true);
        }}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        Book Direct with Project Lead
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary">
        See how the OS composes <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      <p className="text-xs text-muted-foreground">90-day engagement · Founder-led · You own the stack</p>
    </div>
    <ProjectLeadBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
  </TfSection>
  );
};