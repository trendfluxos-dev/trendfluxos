import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Cpu, Megaphone, Workflow, Layers, Sparkles, ArrowUpRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { caseStudies, type System, type CaseStudy } from "@/data/caseStudies";

const SYSTEMS: Record<
  System,
  { label: string; color: string; dot: string; icon: typeof Cpu; description: string }
> = {
  automation: {
    label: "Business Automation",
    color: "text-primary",
    dot: "bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.9)]",
    icon: Cpu,
    description: "AI-driven CRM, lead routing & workflow ops.",
  },
  media: {
    label: "Performance Media",
    color: "text-gold",
    dot: "bg-gold shadow-[0_0_18px_hsl(var(--gold)/0.9)]",
    icon: Megaphone,
    description: "Paid social & search engineered for ROAS.",
  },
  ecosystem: {
    label: "Ecosystem Design",
    color: "text-primary-glow",
    dot: "bg-primary-glow shadow-[0_0_18px_hsl(var(--primary-glow)/0.9)]",
    icon: Workflow,
    description: "End-to-end funnels stitched into one OS.",
  },
  brand: {
    label: "Brand Architecture",
    color: "text-foreground",
    dot: "bg-foreground shadow-[0_0_18px_hsl(var(--foreground)/0.7)]",
    icon: Layers,
    description: "Identity systems built for compounding trust.",
  },
};

type Props = {
  /** Slugs of case studies currently matching external filters. If undefined, all match. */
  matchingSlugs?: string[];
  /** Optional reset handler shown in the empty-state overlay. */
  onResetFilters?: () => void;
};

export const DigitalImpactMap = ({ matchingSlugs, onResetFilters }: Props = {}) => {
  const [active, setActive] = useState<System | "all">("all");
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = useNavigate();

  const nodes = useMemo(() => caseStudies.filter((c) => c.map), []);
  const matchSet = useMemo(
    () => (matchingSlugs ? new Set(matchingSlugs) : null),
    [matchingSlugs]
  );
  const filtersActive = matchSet !== null;
  const matchedCount = filtersActive
    ? nodes.filter((n) => matchSet!.has(n.slug)).length
    : nodes.length;

  const openCaseStudy = (slug: string) => {
    navigate(`/case-studies/${slug}`);
  };

  const focusNode = (i: number) => {
    const len = nodes.length;
    const idx = ((i % len) + len) % len;
    nodeRefs.current[idx]?.focus();
  };

  const onNodeKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number, c: CaseStudy) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusNode(i + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusNode(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusNode(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusNode(nodes.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCaseStudy(c.slug);
    }
  };

  return (
    <section
      className="relative px-6 py-24 md:px-12 lg:px-20"
      aria-labelledby="impact-map-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">
            <Sparkles className="mr-2 inline h-3 w-3" /> Live Operations Map
          </p>
          <h2 id="impact-map-heading" className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Digital <span className="text-gradient">Impact Map</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
            Each glowing node is a live growth system pulled from our case studies. Tab between
            nodes, press Enter to open the narrative, or filter by tier in the legend below.
          </p>
        </div>

        {/* Map */}
        <TooltipProvider delayDuration={80}>
          <div
            role="group"
            aria-label="Interactive digital impact map. Use Tab to move between nodes and Enter to open case study."
            className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-background via-background to-foreground/[0.03]"
          >
            {/* grid backdrop */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--primary)/0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.25) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

            {/* connection lines from Dhaka */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {nodes
                .filter((c) => c.map.city !== "Dhaka")
                .map((c) => (
                  <line
                    key={c.slug}
                    x1={52}
                    y1={48}
                    x2={c.map.x}
                    y2={c.map.y}
                    stroke="hsl(var(--primary) / 0.25)"
                    strokeDasharray="0.6 0.8"
                    strokeWidth="0.2"
                  />
                ))}
            </svg>

            {/* nodes */}
            {nodes.map((c, i) => {
              const cfg = SYSTEMS[c.map.system];
              const Icon = cfg.icon;
              const matchesFilter = !matchSet || matchSet.has(c.slug);
              const filteredOut = !matchesFilter;
              const dim = (active !== "all" && active !== c.map.system) || filteredOut;
              return (
                <Tooltip key={c.slug}>
                  <TooltipTrigger asChild>
                    <button
                      ref={(el) => (nodeRefs.current[i] = el)}
                      type="button"
                      aria-label={`${c.map.city} — ${cfg.label}: ${c.title}.${
                        filteredOut ? " (No match for current filters.)" : ""
                      } Press Enter to open narrative.`}
                      aria-haspopup="dialog"
                      data-no-match={filteredOut || undefined}
                      onClick={() => openCaseStudy(c.slug)}
                      onKeyDown={(e) => onNodeKeyDown(e, i, c)}
                      className={cn(
                        "group absolute -translate-x-1/2 -translate-y-1/2 transition-opacity touch-manipulation rounded-full",
                        "p-2 -m-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        dim ? "opacity-25" : "opacity-100",
                        filteredOut && "grayscale"
                      )}
                      style={{ left: `${c.map.x}%`, top: `${c.map.y}%` }}
                    >
                      <span className="relative flex h-3.5 w-3.5 items-center justify-center md:h-3 md:w-3">
                        {!filteredOut && (
                          <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", cfg.dot)} />
                        )}
                        <span
                          className={cn(
                            "relative inline-flex h-3.5 w-3.5 rounded-full md:h-3 md:w-3",
                            filteredOut ? "bg-foreground/30 ring-1 ring-dashed ring-foreground/40" : cfg.dot
                          )}
                        />
                      </span>
                      <span className="pointer-events-none mt-2 block whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-foreground/70 transition-colors group-hover:text-foreground group-focus-visible:text-foreground md:text-[10px]">
                        {c.map.city}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    collisionPadding={12}
                    avoidCollisions
                    className="z-50 max-w-[min(280px,calc(100vw-24px))] border-foreground/10 bg-background/95 p-3 backdrop-blur"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cfg.color)} />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{c.map.city}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                          {c.map.region}
                        </p>
                        <p className={cn("mt-1.5 text-xs font-medium", cfg.color)}>{cfg.label}</p>
                        <p className="mt-1 text-xs text-foreground/70 break-words">{c.title}</p>
                        <p className="mt-2 text-xs font-semibold text-foreground break-words">
                          Outcome: <span className="font-normal text-foreground/80">{c.map.outcome}</span>
                        </p>
                        {filteredOut && (
                          <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                            <AlertCircle className="h-3 w-3" /> No match for current filters
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => openCaseStudy(c.slug)}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
                        >
                          View Narrative <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Empty-state overlay when filters match nothing */}
            {filtersActive && matchedCount === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm p-6">
                <div className="max-w-sm rounded-2xl border border-gold/30 bg-background/90 p-6 text-center shadow-gold">
                  <AlertCircle className="mx-auto h-6 w-6 text-gold" />
                  <p className="mt-3 font-display text-lg font-bold">No systems match</p>
                  <p className="mt-2 text-sm text-foreground/65">
                    Your current filters don't match any live operations on the map.
                  </p>
                  {onResetFilters && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="mt-4 inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-foreground hover:scale-105 transition"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipProvider>

        {/* Match summary */}
        <div
          className="mt-5 text-center text-[11px] uppercase tracking-[0.3em] text-foreground/55"
          aria-live="polite"
        >
          {filtersActive ? (
            <>
              <span className={cn("font-semibold", matchedCount === 0 ? "text-gold" : "text-foreground")}>
                {matchedCount}
              </span>{" "}
              of {nodes.length} systems match your filters
            </>
          ) : (
            <>{nodes.length} live growth systems plotted</>
          )}
        </div>

        {/* Legend */}
        <div
          role="toolbar"
          aria-label="Filter map by growth system"
          className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3"
        >
          <button
            type="button"
            onClick={() => setActive("all")}
            aria-pressed={active === "all"}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
              active === "all"
                ? "border-foreground/40 bg-foreground/10 text-foreground"
                : "border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground"
            )}
          >
            All Systems
          </button>
          {(Object.keys(SYSTEMS) as System[]).map((key) => {
            const cfg = SYSTEMS[key];
            const Icon = cfg.icon;
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(isActive ? "all" : key)}
                aria-pressed={isActive}
                aria-label={`Filter by ${cfg.label}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                  isActive
                    ? "border-foreground/40 bg-foreground/10"
                    : "border-foreground/15 hover:border-foreground/30",
                  cfg.color
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", cfg.dot)} aria-hidden />
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DigitalImpactMap;
