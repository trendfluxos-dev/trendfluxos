import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const cases = [
  {
    title: "Education Brand Growth System",
    metric: "+45% Engagement Growth",
    stack: ["Meta Ads", "Canva", "CRM", "Content Calendar"],
    outcome:
      "Built a structured content and campaign system for scalable visibility.",
    buttons: ["View Narrative", "Consult Operator"],
  },
  {
    title: "Retail Lead Generation Funnel",
    metric: "High-Intent Lead Capture System",
    stack: ["GoHighLevel", "WhatsApp Automation", "Landing Page", "CRM Pipeline"],
    outcome:
      "Created a conversion-focused funnel for retail consultancy leads.",
    buttons: ["View Funnel", "Build Similar System"],
  },
  {
    title: "Personal Brand Authority Engine",
    metric: "Organic Visibility Growth",
    stack: ["Reels", "LinkedIn Content", "AI Copywriting", "Analytics"],
    outcome:
      "Turned expertise into consistent authority-building content.",
    buttons: ["View Strategy", "Start Brand Audit"],
  },
];

const ImpactMap = () => (
  <div className="relative rounded-3xl glass overflow-hidden h-full min-h-[640px]">
    <div className="absolute inset-0 grid-dots opacity-60" aria-hidden />
    <div className="absolute inset-0 bg-gradient-hero" aria-hidden />

    {/* orbits */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-[420px] h-[420px] max-w-[90%] max-h-[90%]">
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-orbit" />
        <div className="absolute inset-10 rounded-full border border-gold/25 animate-orbit-reverse" />
        <div className="absolute inset-20 rounded-full border border-primary/15 animate-pulse-glow" />

        {/* nodes */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-cyan animate-pulse-glow" />
        <span className="absolute bottom-4 right-8 w-3.5 h-3.5 rounded-full bg-gold shadow-gold animate-pulse-glow [animation-delay:1s]" />
        <span className="absolute top-1/2 -left-1 w-2.5 h-2.5 rounded-full bg-primary-glow shadow-cyan" />
        <span className="absolute bottom-10 left-12 w-2 h-2 rounded-full bg-foreground shadow-[0_0_20px_hsl(var(--foreground))]" />
        <span className="absolute top-16 right-2 w-2.5 h-2.5 rounded-full bg-primary shadow-cyan animate-pulse-glow [animation-delay:0.5s]" />

        {/* connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 420" fill="none">
          <line x1="210" y1="6" x2="210" y2="210" stroke="hsl(var(--primary) / 0.3)" strokeDasharray="4 4" />
          <line x1="0" y1="210" x2="210" y2="210" stroke="hsl(var(--primary) / 0.25)" strokeDasharray="4 4" />
          <line x1="380" y1="380" x2="210" y2="210" stroke="hsl(var(--gold) / 0.3)" strokeDasharray="4 4" />
          <line x1="60" y1="370" x2="210" y2="210" stroke="hsl(var(--foreground) / 0.2)" strokeDasharray="4 4" />
        </svg>

        {/* center */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold">
              Digital Impact Map
            </h3>
            <p className="text-foreground/60 text-sm mt-2 max-w-[260px] mx-auto">
              Strategy, automation, content, paid media, and analytics —
              connected into one growth operating system.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CaseStudies = () => {
  return (
    <section id="cases" className="px-6 lg:px-10 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Operator Casebook
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl">
              Real systems. <span className="text-gradient">Measurable outcomes.</span>
            </h2>
          </div>
          <p className="text-foreground/60 max-w-md text-sm">
            Each engagement is engineered as a system — content, paid, automation,
            and analytics designed to compound over time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5 lg:max-h-[640px] lg:overflow-y-auto pr-1 scroll-smooth">
            {cases.map((c, i) => (
              <article
                key={c.title}
                className="glass glass-hover rounded-3xl p-7 group"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                    Case Study · 0{i + 1}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-foreground/40 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-display text-2xl font-bold mt-4">{c.title}</h3>
                <p className="text-gold font-semibold mt-2">{c.metric}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {c.stack.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-foreground/70 mt-5 leading-relaxed">
                  {c.outcome}
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <Button variant="glass" size="sm">
                    {c.buttons[0]}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    {c.buttons[1]} →
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <ImpactMap />
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
