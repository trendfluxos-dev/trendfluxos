import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cpu, Megaphone, Workflow, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type System = "automation" | "media" | "ecosystem" | "brand";

type Node = {
  id: string;
  city: string;
  region: string;
  /** Position in % of map container */
  x: number;
  y: number;
  system: System;
  outcome: string;
};

const SYSTEMS: Record<
  System,
  { label: string; color: string; ring: string; dot: string; icon: typeof Cpu; description: string }
> = {
  automation: {
    label: "Business Automation",
    color: "text-primary",
    ring: "ring-primary/40",
    dot: "bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.9)]",
    icon: Cpu,
    description: "AI-driven CRM, lead routing & workflow ops.",
  },
  media: {
    label: "Performance Media",
    color: "text-gold",
    ring: "ring-gold/40",
    dot: "bg-gold shadow-[0_0_18px_hsl(var(--gold)/0.9)]",
    icon: Megaphone,
    description: "Paid social & search engineered for ROAS.",
  },
  ecosystem: {
    label: "Ecosystem Design",
    color: "text-primary-glow",
    ring: "ring-primary-glow/40",
    dot: "bg-primary-glow shadow-[0_0_18px_hsl(var(--primary-glow)/0.9)]",
    icon: Workflow,
    description: "End-to-end funnels stitched into one OS.",
  },
  brand: {
    label: "Brand Architecture",
    color: "text-foreground",
    ring: "ring-foreground/30",
    dot: "bg-foreground shadow-[0_0_18px_hsl(var(--foreground)/0.7)]",
    icon: Layers,
    description: "Identity systems built for compounding trust.",
  },
};

const NODES: Node[] = [
  { id: "dhk", city: "Dhaka", region: "HQ · Bangladesh", x: 52, y: 48, system: "ecosystem", outcome: "5× ROAS across 14 brands" },
  { id: "ctg", city: "Chattogram", region: "Coastal Hub", x: 70, y: 70, system: "media", outcome: "₹2.1cr ad spend optimised" },
  { id: "syl", city: "Sylhet", region: "Diaspora Loop", x: 78, y: 32, system: "brand", outcome: "47 brand systems shipped" },
  { id: "rjs", city: "Rajshahi", region: "North Belt", x: 28, y: 32, system: "automation", outcome: "120k workflows automated" },
  { id: "khl", city: "Khulna", region: "South-West", x: 30, y: 70, system: "automation", outcome: "38% CAC reduction" },
  { id: "rng", city: "Rangpur", region: "North Frontier", x: 40, y: 14, system: "media", outcome: "9.2× creator-led reach" },
  { id: "bsl", city: "Barishal", region: "Delta Loop", x: 50, y: 82, system: "ecosystem", outcome: "24/7 conversion ops live" },
];

export const DigitalImpactMap = () => {
  const [active, setActive] = useState<System | "all">("all");

  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">
            <Sparkles className="mr-2 inline h-3 w-3" /> Live Operations Map
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Digital <span className="text-gradient">Impact Map</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
            Each glowing node is a live growth system. Hover to inspect the operation, or filter
            by tier in the legend below.
          </p>
        </div>

        {/* Map */}
        <TooltipProvider delayDuration={80}>
          <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-background via-background to-foreground/[0.03]">
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
            {/* glows */}
            <div className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

            {/* connection lines */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {NODES.filter((n) => n.id !== "dhk").map((n) => (
                <line
                  key={n.id}
                  x1={52}
                  y1={48}
                  x2={n.x}
                  y2={n.y}
                  stroke="hsl(var(--primary) / 0.25)"
                  strokeDasharray="0.6 0.8"
                  strokeWidth="0.2"
                />
              ))}
            </svg>

            {/* nodes */}
            {NODES.map((n) => {
              const cfg = SYSTEMS[n.system];
              const Icon = cfg.icon;
              const dim = active !== "all" && active !== n.system;
              return (
                <Tooltip key={n.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${n.city} — ${cfg.label}`}
                      className={cn(
                        "group absolute -translate-x-1/2 -translate-y-1/2 transition-opacity",
                        dim ? "opacity-25" : "opacity-100"
                      )}
                      style={{ left: `${n.x}%`, top: `${n.y}%` }}
                    >
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", cfg.dot)} />
                        <span className={cn("relative inline-flex h-3 w-3 rounded-full", cfg.dot)} />
                      </span>
                      <span
                        className={cn(
                          "pointer-events-none mt-2 block whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-foreground/70 transition-colors group-hover:text-foreground"
                        )}
                      >
                        {n.city}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] border-foreground/10 bg-background/95 backdrop-blur">
                    <div className="flex items-start gap-2">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cfg.color)} />
                      <div>
                        <p className="font-semibold text-foreground">{n.city}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                          {n.region}
                        </p>
                        <p className={cn("mt-1.5 text-xs font-medium", cfg.color)}>{cfg.label}</p>
                        <p className="mt-1 text-xs text-foreground/70">{cfg.description}</p>
                        <p className="mt-2 text-xs font-semibold text-foreground">
                          Outcome: <span className="font-normal text-foreground/80">{n.outcome}</span>
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setActive("all")}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
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
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                  isActive
                    ? "border-foreground/40 bg-foreground/10"
                    : "border-foreground/15 hover:border-foreground/30",
                  cfg.color
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                <Icon className="h-3.5 w-3.5" />
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
