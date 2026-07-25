import { Activity, ArrowUpRight, Play, TrendingUp, Users } from "lucide-react";

type Metric = { label: string; value: string; note: string; icon: typeof Play };

const HEADLINE: Metric[] = [
  {
    label: "Total organic views",
    value: "485K+",
    note: "28-day window, no paid distribution",
    icon: Play,
  },
  {
    label: "Unique audience reach",
    value: "154K+",
    note: "82% organic reach rate",
    icon: Users,
  },
];

const FUNNEL = [
  { stage: "Top of funnel", value: "485,000+", desc: "Content impressions and views", width: "w-full" },
  { stage: "Middle of funnel", value: "154,000+", desc: "Unique audience reached", width: "w-[90%]" },
  { stage: "Bottom of funnel", value: "42,000+", desc: "Active engagements", width: "w-[80%]" },
];

/**
 * Campaign results panel for the civic campaign case (Pabna Nagorik Committee).
 * Figures are reported campaign totals for a 28-day window.
 */
export function CampaignPerformanceDashboard() {
  return (
    <section className="border-y border-border bg-background py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Organic acquisition funnel
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Campaign performance
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Civic campaign execution for Pabna Nagorik Committee — rapid scale, deep engagement
              and organic growth with no ad spend.
            </p>
          </div>
          <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reported 28-day totals
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="rounded-3xl border border-border bg-muted p-6 md:p-8 lg:col-span-7">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Aggregate performance
            </h3>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              {HEADLINE.map(({ label, value, note, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-border bg-background p-5">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                    {value}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>

            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Engagement breakdown
            </h3>
            <dl className="space-y-4">
              {[
                { icon: Activity, label: "Active engagements (likes, comments, shares)", value: "42,000+" },
                { icon: TrendingUp, label: "Engagement rate", value: "8.6%" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
                >
                  <dt className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    {label}
                  </dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 lg:col-span-5">
            <h3 className="mb-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              The acquisition funnel
            </h3>
            <ol className="space-y-4">
              {FUNNEL.map((step, i) => (
                <li key={step.stage}>
                  <div
                    className={`${step.width} mx-auto rounded-xl border border-border bg-muted/60 p-4`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">
                        {step.stage}
                      </span>
                      <span className="font-display text-xl font-bold tracking-tight">
                        {step.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                  </div>
                  {i < FUNNEL.length - 1 && (
                    <div className="mx-auto h-4 w-px bg-border" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Civic campaign output
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                8.6% engagement rate <ArrowUpRight className="h-3 w-3" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CampaignPerformanceDashboard;
