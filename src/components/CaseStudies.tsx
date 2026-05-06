import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CaseItem = {
  title: string;
  metric: string;
  stack: string[];
  outcome: string;
  buttons: [string, string];
  narrative: string;
};

const cases: CaseItem[] = [
  {
    title: "Education Brand Growth System",
    metric: "+45% Engagement Growth",
    stack: ["Meta Ads", "Canva", "CRM", "Content Calendar"],
    outcome:
      "Built a structured content and campaign system for scalable visibility.",
    buttons: ["View Narrative", "Consult Operator"],
    narrative:
      "Designed an end-to-end content engine combining a quarterly editorial calendar, Meta Ads funnels, and CRM-tracked nurture sequences. The result was a 45% lift in engagement, predictable lead flow, and a brand voice that compounded month over month.",
  },
  {
    title: "Retail Lead Generation Funnel",
    metric: "High-Intent Lead Capture System",
    stack: ["GoHighLevel", "WhatsApp Automation", "Landing Page", "CRM Pipeline"],
    outcome:
      "Created a conversion-focused funnel for retail consultancy leads.",
    buttons: ["View Funnel", "Build Similar System"],
    narrative:
      "Engineered a GoHighLevel funnel with WhatsApp automation, qualifying landing pages, and a tagged CRM pipeline. Sales conversations now arrive pre-qualified with budget, timeline, and intent captured automatically.",
  },
  {
    title: "Personal Brand Authority Engine",
    metric: "Organic Visibility Growth",
    stack: ["Reels", "LinkedIn Content", "AI Copywriting", "Analytics"],
    outcome:
      "Turned expertise into consistent authority-building content.",
    buttons: ["View Strategy", "Start Brand Audit"],
    narrative:
      "Productized the founder's expertise into weekly reels, LinkedIn long-form, and AI-assisted copy systems. Analytics dashboards close the loop so every post compounds reach, authority, and inbound opportunities.",
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
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 420" fill="none" aria-hidden>
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex !== null ? cases[openIndex] : null;

  return (
    <section
      id="cases"
      className="px-6 lg:px-10 py-24"
      aria-labelledby="cases-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Operator Casebook
            </p>
            <h2
              id="cases-heading"
              className="font-display text-3xl md:text-5xl font-bold max-w-2xl"
            >
              Real systems. <span className="text-gradient">Measurable outcomes.</span>
            </h2>
          </div>
          <p className="text-foreground/60 max-w-md text-sm">
            Each engagement is engineered as a system — content, paid, automation,
            and analytics designed to compound over time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ul
            className="space-y-5 lg:max-h-[640px] lg:overflow-y-auto pr-1 scroll-smooth list-none"
            role="list"
          >
            {cases.map((c, i) => {
              const titleId = `case-${i}-title`;
              const metricId = `case-${i}-metric`;
              return (
                <li key={c.title}>
                  <article
                    aria-labelledby={titleId}
                    aria-describedby={metricId}
                    className="glass glass-hover rounded-3xl p-7 group"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <header className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                        <span className="sr-only">Case study number </span>
                        Case Study · 0{i + 1}
                      </p>
                      <ArrowUpRight
                        aria-hidden
                        className="w-5 h-5 text-foreground/40 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                      />
                    </header>

                    <h3
                      id={titleId}
                      className="font-display text-2xl font-bold mt-4"
                    >
                      {c.title}
                    </h3>
                    <p
                      id={metricId}
                      className="text-gold font-semibold mt-2"
                    >
                      <span className="sr-only">Outcome metric: </span>
                      {c.metric}
                    </p>

                    <h4 className="sr-only">Stack used</h4>
                    <ul className="flex flex-wrap gap-2 mt-4 list-none" aria-label={`${c.title} stack`}>
                      {c.stack.map((t) => (
                        <li
                          key={t}
                          className="text-xs px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground/70"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>

                    <h4 className="sr-only">Outcome summary</h4>
                    <p className="text-foreground/70 mt-5 leading-relaxed">
                      {c.outcome}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => setOpenIndex(i)}
                        aria-label={`${c.buttons[0]} for ${c.title}`}
                        aria-haspopup="dialog"
                        aria-expanded={openIndex === i}
                        aria-controls="case-narrative-dialog"
                      >
                        {c.buttons[0]}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        aria-label={`${c.buttons[1]} about ${c.title}`}
                      >
                        {c.buttons[1]} <span aria-hidden>→</span>
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <ImpactMap />
        </div>
      </div>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(o) => !o && setOpenIndex(null)}
      >
        <DialogContent
          id="case-narrative-dialog"
          className="max-w-2xl glass-strong"
          aria-labelledby="case-narrative-title"
          aria-describedby="case-narrative-desc"
        >
          {active && (
            <>
              <DialogHeader>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
                  Case Narrative
                </p>
                <DialogTitle
                  id="case-narrative-title"
                  className="font-display text-2xl md:text-3xl font-bold"
                >
                  {active.title}
                </DialogTitle>
                <p className="text-gold font-semibold">{active.metric}</p>
              </DialogHeader>

              <DialogDescription
                id="case-narrative-desc"
                className="text-foreground/75 leading-relaxed text-base"
              >
                {active.narrative}
              </DialogDescription>

              <section aria-label="Stack used in this engagement">
                <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/60 mb-2">
                  Stack
                </h4>
                <ul className="flex flex-wrap gap-2 list-none">
                  {active.stack.map((t) => (
                    <li
                      key={t}
                      className="text-xs px-3 py-1 rounded-full bg-foreground/5 border border-border text-foreground/70"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-label="Outcome">
                <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/60 mb-2">
                  Outcome
                </h4>
                <p className="text-foreground/75 leading-relaxed">
                  {active.outcome}
                </p>
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CaseStudies;
