import { BarChart3, Cpu, LineChart, PenTool } from "lucide-react";

const STACK = [
  {
    category: "Systems & automation",
    icon: Cpu,
    items: [
      "Custom workflow architectures",
      "API integrations and webhooks",
      "Zero-to-one scalable infrastructure",
      "Process automation pipelines",
    ],
  },
  {
    category: "Marketing & distribution",
    icon: LineChart,
    items: [
      "AI-assisted content engines",
      "Organic acquisition funnels",
      "SEO and high-intent search visibility",
      "Social ecosystem management",
    ],
  },
  {
    category: "Brand & identity",
    icon: PenTool,
    items: [
      "Core messaging and positioning",
      "Visual language systems",
      "High-fidelity prototyping",
      "Cross-platform consistency",
    ],
  },
  {
    category: "Data & performance",
    icon: BarChart3,
    items: [
      "Live metric dashboards",
      "Audience segmentation analytics",
      "Conversion rate optimisation",
      "ROI and impact reporting",
    ],
  },
];

/** Capability stack shown on the portfolio page. */
export function TechAndStrategyStack() {
  return (
    <section className="border-y border-border bg-background py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Technology & strategy stack
          </span>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight md:text-4xl">
            The operating system for measurable brand growth.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Strategic positioning, technical implementation and data-driven optimisation, delivered
            as one connected practice.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STACK.map(({ category, icon: Icon, items }) => (
            <article
              key={category}
              className="rounded-2xl border border-border bg-muted/50 p-6 transition-colors duration-300 hover:bg-muted"
            >
              <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-foreground">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mb-4 font-display text-lg font-bold tracking-tight">{category}</h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TechAndStrategyStack;
