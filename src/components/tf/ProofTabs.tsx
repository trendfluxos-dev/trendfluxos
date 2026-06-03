import { useState } from "react";
import {
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";

type Case = {
  id: string;
  icon: typeof TrendingUp;
  metric: string;
  label: string;
  delta: string;
  before: { label: string; value: string };
  after: { label: string; value: string };
  context: string;
  evidence: "chart" | "pipeline" | "workflow" | "automation";
  workflow?: string[];
  bars?: number[];
  pipeline?: { stage: string; value: string; pct: number }[];
  automations?: { name: string; status: string; runs: string }[];
};

const CASES: Case[] = [
  {
    id: "spend",
    icon: DollarSign,
    metric: "$8.4M",
    label: "Ad spend orchestrated",
    delta: "+312% avg lift",
    before: { label: "Pre-OS spend efficiency", value: "1.6x ROAS" },
    after: { label: "Post-OS spend efficiency", value: "4.82x ROAS" },
    context:
      "Consolidated Meta, Google, and TikTok spend under one creative + routing layer. CAC compounded down as the model learned cross-channel.",
    evidence: "chart",
    bars: [22, 28, 24, 35, 41, 38, 52, 60, 68, 74, 88, 96],
  },
  {
    id: "roas",
    icon: TrendingUp,
    metric: "4.82x",
    label: "Blended ROAS",
    delta: "across 47 ops",
    before: { label: "Pipeline visibility", value: "12% attributed" },
    after: { label: "Pipeline visibility", value: "94% attributed" },
    context:
      "CRM rebuilt around lifecycle stages with revenue attribution wired into every campaign — every dollar traceable to a stage.",
    evidence: "pipeline",
    pipeline: [
      { stage: "MQL", value: "1,284", pct: 100 },
      { stage: "SQL", value: "612", pct: 72 },
      { stage: "Opportunity", value: "284", pct: 48 },
      { stage: "Closed Won", value: "92", pct: 28 },
    ],
  },
  {
    id: "hours",
    icon: Clock,
    metric: "20+",
    label: "Hours reclaimed weekly",
    delta: "per founder",
    before: { label: "Manual ops load", value: "32 hrs/wk" },
    after: { label: "Manual ops load", value: "9 hrs/wk" },
    context:
      "Founder-facing tasks — reporting, lead triage, content QA, ad approvals — moved to AI agents with human-in-the-loop checkpoints.",
    evidence: "workflow",
    workflow: [
      "Capture",
      "Enrich",
      "Score",
      "Route",
      "Notify",
      "Log",
    ],
  },
  {
    id: "routing",
    icon: Zap,
    metric: "99%",
    label: "Lead routing latency cut",
    delta: "sub-5s SLA",
    before: { label: "Lead-to-rep latency", value: "8m 42s" },
    after: { label: "Lead-to-rep latency", value: "4.1s" },
    context:
      "Replaced Zapier-chained handoffs with a deterministic routing engine. Every inbound lead enriched, scored, and assigned in under five seconds.",
    evidence: "automation",
    automations: [
      { name: "Lead enrichment agent", status: "Live", runs: "1,284 today" },
      { name: "Pipeline scoring model", status: "Live", runs: "612 today" },
      { name: "Slack handoff bot", status: "Live", runs: "287 today" },
      { name: "Reporting digest", status: "Live", runs: "4 today" },
    ],
  },
];

const ProofTabs = () => {
  const [activeId, setActiveId] = useState(CASES[0].id);
  const active = CASES.find((c) => c.id === activeId)!;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="Before and after case metrics"
        className="grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        {CASES.map((c) => {
          const isActive = c.id === activeId;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={[
                "group relative rounded-xl border p-4 text-left transition-all duration-300",
                isActive
                  ? "border-primary/40 bg-primary/[0.04] shadow-[0_8px_30px_-12px_rgba(220,38,38,0.4)]"
                  : "border-border bg-background hover:-translate-y-px hover:border-foreground/20",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={[
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                />
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
              <div
                className={[
                  "mt-3 font-display text-2xl font-semibold tracking-tight sm:text-[28px]",
                  isActive ? "text-foreground" : "text-foreground/80",
                ].join(" ")}
              >
                {c.metric}
              </div>
              <div className="mt-1 text-[12px] leading-tight text-muted-foreground">
                {c.label}
              </div>
              <div
                className={[
                  "mt-2 text-[10.5px] font-medium uppercase tracking-[0.18em]",
                  isActive ? "text-primary" : "text-muted-foreground/70",
                ].join(" ")}
              >
                {c.delta}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        key={active.id}
        className="tf-rise mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]"
      >
        {/* Left: Before / After + context */}
        <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
          <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Case · Before → After
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <Circle className="h-2.5 w-2.5" /> Before
              </div>
              <div className="mt-3 font-display text-2xl font-semibold text-muted-foreground line-through decoration-muted-foreground/40">
                {active.before.value}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                {active.before.label}
              </div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
                <CheckCircle2 className="h-2.5 w-2.5" /> After
              </div>
              <div className="mt-3 font-display text-2xl font-semibold text-foreground">
                {active.after.value}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                {active.after.label}
              </div>
            </div>
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
            {active.context}
          </p>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Audit trail available under NDA
          </div>
        </div>

        {/* Right: Evidence */}
        <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Evidence · {evidenceLabel(active.evidence)}
            </div>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-primary">
              <ArrowUpRight className="h-3 w-3" /> live
            </span>
          </div>

          <div className="mt-5">
            {active.evidence === "chart" && <EvidenceChart bars={active.bars!} />}
            {active.evidence === "pipeline" && (
              <EvidencePipeline rows={active.pipeline!} />
            )}
            {active.evidence === "workflow" && (
              <EvidenceWorkflow steps={active.workflow!} />
            )}
            {active.evidence === "automation" && (
              <EvidenceAutomations rows={active.automations!} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const evidenceLabel = (e: Case["evidence"]) =>
  ({
    chart: "Spend efficiency curve",
    pipeline: "Attributed pipeline",
    workflow: "Operator workflow",
    automation: "Live automations",
  }[e]);

const EvidenceChart = ({ bars }: { bars: number[] }) => (
  <div>
    <div className="flex items-end gap-1.5 h-40">
      {bars.map((h, i) => (
        <div
          key={i}
          className="tf-bar flex-1 rounded-t-[3px] bg-gradient-to-t from-primary/25 via-primary/70 to-primary/90 shadow-[0_0_18px_-6px_rgba(220,38,38,0.4)]"
          style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
    <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
      <span>Week 1</span>
      <span>Week 12</span>
    </div>
  </div>
);

const EvidencePipeline = ({
  rows,
}: {
  rows: { stage: string; value: string; pct: number }[];
}) => (
  <div className="space-y-3">
    {rows.map((r, i) => (
      <div key={r.stage} className="tf-rise" style={{ animationDelay: `${i * 70}ms` }}>
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-medium text-foreground">{r.stage}</span>
          <span className="text-muted-foreground">{r.value}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
            style={{ width: `${r.pct}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const EvidenceWorkflow = ({ steps }: { steps: string[] }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
    {steps.map((s, i) => (
      <div
        key={s}
        className="tf-rise flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 px-2 py-3"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
          Step {i + 1}
        </div>
        <div className="mt-1 text-[12px] font-medium text-foreground">{s}</div>
      </div>
    ))}
  </div>
);

const EvidenceAutomations = ({
  rows,
}: {
  rows: { name: string; status: string; runs: string }[];
}) => (
  <div className="divide-y divide-border rounded-lg border border-border bg-muted/30">
    {rows.map((r, i) => (
      <div
        key={r.name}
        className="tf-rise flex items-center justify-between px-3.5 py-3"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13px] font-medium text-foreground">{r.name}</span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {r.runs}
        </div>
      </div>
    ))}
  </div>
);

export default ProofTabs;
