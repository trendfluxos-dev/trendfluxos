import { Bot, Database, Megaphone, GitBranch, Palette, BarChart3 } from "lucide-react";
import { TfCard } from "./Section";

const NODES = [
  { icon: Bot, label: "AI Automation", desc: "Agents, prompts, ops bots" },
  { icon: Database, label: "CRM Orchestration", desc: "Unified pipeline + lifecycle" },
  { icon: Megaphone, label: "Meta Ad Systems", desc: "Advantage+ funnels at scale" },
  { icon: GitBranch, label: "Workflow Engine", desc: "Cross-tool sync, zero glue" },
  { icon: Palette, label: "Creative Infra", desc: "Hook-rate creative factory" },
  { icon: BarChart3, label: "Analytics Layer", desc: "One source of truth" },
];

const EcosystemMap = () => (
  <div className="relative">
    {/* animated connection lines (desktop) */}
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="tf-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0" />
          <stop offset="50%" stopColor="#DC2626" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[
        "M150,120 Q500,300 850,120",
        "M150,300 Q500,300 850,300",
        "M150,480 Q500,300 850,480",
        "M500,80 L500,520",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="url(#tf-line)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4 8"
          className="tf-dash-flow"
        />
      ))}
    </svg>

    {/* center node */}
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
      <div className="relative h-44 w-44">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="absolute -inset-3 rounded-full border border-primary/20 tf-orbit-slow" style={{ borderStyle: "dashed" }} />
        <div className="relative flex h-full w-full items-center justify-center rounded-full border border-primary/40 bg-gradient-to-b from-muted to-background shadow-[inset_0_1px_0_0_hsl(var(--border)),0_20px_60px_-10px_rgba(220,38,38,0.25)]">
          <div className="text-center">
            <div className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
              TrendFlux
            </div>
            <div className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
              OS Core
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              v2.0
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="relative z-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {NODES.map((n, i) => (
        <TfCard
          key={n.label}
          className={i === 1 || i === 4 ? "lg:translate-y-10" : ""}
        >
          <div className="flex items-start gap-4">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <div className="absolute inset-0 rounded-xl bg-primary/15 blur-md" />
              <n.icon className="relative h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-base font-semibold tracking-tight text-foreground">
                {n.label}
              </div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {n.desc}
              </div>
            </div>
          </div>
        </TfCard>
      ))}
    </div>
  </div>
);

export default EcosystemMap;
