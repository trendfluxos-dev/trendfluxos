import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SocialIcons from "@/components/social/SocialIcons";
import { track } from "@/lib/analytics";

type CaseItem = {
  title: string;
  metric: string;
  stack: string[];
  outcome: string;
  buttons: [string, string];
  narrative: string;
  outcomes: string[];
  consultPitch: string;
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
    outcomes: [
      "+45% engagement lift in 90 days",
      "Predictable monthly lead flow",
      "Editorial system handed off to in-house team",
    ],
    consultPitch:
      "Talk to the operator behind this growth system. We'll map your current funnel, identify the highest-leverage automation, and outline a 30-60-90 plan tailored to your brand.",
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
    outcomes: [
      "Pre-qualified inbound conversations",
      "Auto-tagged CRM pipeline by intent",
      "WhatsApp-first nurture, 24/7 capture",
    ],
    consultPitch:
      "We'll architect the same funnel for your business — landing page, WhatsApp automation, CRM tags, and the qualifying questions that filter cold traffic into booked calls.",
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
    outcomes: [
      "Weekly compounding content cadence",
      "AI-assisted copy stack for the founder",
      "Analytics loop that surfaces winners",
    ],
    consultPitch:
      "Get a free brand audit: we review your positioning, content cadence, and inbound funnel, then return a one-page authority roadmap.",
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
  const [consultIndex, setConsultIndex] = useState<number | null>(null);
  const active = openIndex !== null ? cases[openIndex] : null;
  const consult = consultIndex !== null ? cases[consultIndex] : null;

  const metrics = [
    { value: "485K+", label: "Organic Views Generated", tone: "green" as const },
    { value: "+45%", label: "Avg. Engagement Growth", tone: "green" as const },
    { value: "24/7", label: "AI Automation Layer", tone: "orange" as const },
    { value: "3", label: "Multi-Brand Ecosystems Live", tone: "red" as const },
  ];

  const toneDot: Record<"green" | "orange" | "red", string> = {
    green: "bg-brand-green",
    orange: "bg-brand-orange",
    red: "bg-primary",
  };

  return (
    <section
      id="cases"
      className="px-6 lg:px-10 py-24"
      aria-labelledby="cases-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <p className="text-primary uppercase tracking-[0.28em] text-[11px] font-semibold mb-3">
              Operator Casebook
            </p>
            <h2
              id="cases-heading"
              className="font-display text-[26px] leading-[1.15] sm:text-4xl md:text-5xl font-bold max-w-2xl tracking-tight text-foreground"
            >
              Real systems. <span className="text-primary">Measurable outcomes.</span>
            </h2>
          </div>
          <p className="text-foreground/65 max-w-md text-sm leading-relaxed">
            Each engagement is engineered as a system — content, paid, automation,
            and analytics designed to compound over time.
          </p>
        </div>

        {/* Metrics strip */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-10"
          aria-label="Ecosystem performance metrics"
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl bg-card border border-border p-3.5 sm:p-5 text-center shadow-[0_1px_2px_hsl(0_0%_0%/0.04)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_28px_-16px_hsl(var(--primary)/0.35)]"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${toneDot[m.tone]}`} aria-hidden />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-semibold">Live</span>
              </div>
              <div className="mt-1.5 font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {m.value}
              </div>
              <div className="mt-1.5 text-[9.5px] sm:text-xs uppercase tracking-[0.18em] text-foreground/60 leading-tight">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
          <ul
            className="space-y-4 sm:space-y-5 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1 scroll-smooth lg:snap-y lg:snap-mandatory list-none [scrollbar-gutter:stable]"
            role="list"
          >
            {cases.map((c, i) => {
              const titleId = `case-${i}-title`;
              const metricId = `case-${i}-metric`;
              return (
                <li key={c.title} className="lg:snap-start lg:scroll-mt-2">
                  <article
                    aria-labelledby={titleId}
                    aria-describedby={metricId}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border p-5 sm:p-7 group shadow-[0_1px_2px_hsl(0_0%_0%/0.04)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_44px_-20px_hsl(var(--primary)/0.28)]"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-primary via-primary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                    <header className="flex items-center justify-between gap-3">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-semibold">
                        <span className="sr-only">Case study number </span>
                        Case Study · 0{i + 1}
                      </p>
                      <ArrowUpRight
                        aria-hidden
                        className="w-5 h-5 text-foreground/35 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </header>

                    <h3
                      id={titleId}
                      className="font-display text-xl sm:text-2xl font-bold mt-3 sm:mt-4 text-foreground tracking-tight leading-snug"
                    >
                      {c.title}
                    </h3>
                    <div className="mt-2.5">
                      <span
                        id={metricId}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(0_86%_97%)] border border-primary/20 px-2.5 py-1 text-xs sm:text-[13px] font-semibold text-primary"
                      >
                        <span className="sr-only">Outcome metric: </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        {c.metric}
                      </span>
                    </div>

                    <h4 className="sr-only">Stack used</h4>
                    <ul className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 list-none" aria-label={`${c.title} stack`}>
                      {c.stack.map((t) => (
                        <li
                          key={t}
                          className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full bg-secondary border border-border text-foreground/75"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>

                    <h4 className="sr-only">Outcome summary</h4>
                    <p className="text-foreground/75 mt-4 sm:mt-5 leading-relaxed text-sm sm:text-[15px]">
                      {c.outcome}
                    </p>

                    <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => {
                          track("case_narrative_open", {
                            case_title: c.title,
                            cta: c.buttons[0],
                            source: "case_studies_component",
                          });
                          setOpenIndex(i);
                        }}
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
                        className="text-primary hover:text-primary hover:bg-primary/5"
                        aria-label={`${c.buttons[1]} about ${c.title}`}
                        aria-haspopup="dialog"
                        aria-expanded={consultIndex === i}
                        aria-controls="case-consult-dialog"
                        onClick={() => {
                          track("case_consult_open", {
                            case_title: c.title,
                            cta: c.buttons[1],
                            source: "case_studies_component",
                          });
                          setConsultIndex(i);
                        }}
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
          className="max-w-2xl glass-strong max-h-[90vh] overflow-y-auto"
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
                <p className="text-primary font-semibold">{active.metric}</p>
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

              <section aria-label="Outcomes" className="rounded-2xl border border-primary/20 bg-[hsl(0_86%_98%)] p-4">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-primary mb-2 font-semibold">
                  Outcomes
                </h4>
                <ul className="grid gap-1.5 sm:grid-cols-2 list-none">
                  {active.outcomes.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <DialogFooter className="gap-2 sm:gap-3 pt-2">
                <Button variant="ghost" onClick={() => setOpenIndex(null)}>
                  Close
                </Button>
                <Button
                  variant="gold"
                  onClick={() => {
                    const idx = openIndex;
                    setOpenIndex(null);
                    if (idx !== null) setConsultIndex(idx);
                  }}
                >
                  {active.buttons[1]} <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Consult / Build Similar System dialog */}
      <Dialog
        open={consultIndex !== null}
        onOpenChange={(o) => !o && setConsultIndex(null)}
      >
        <DialogContent
          id="case-consult-dialog"
          className="max-w-xl glass-strong max-h-[90vh] overflow-y-auto"
          aria-labelledby="case-consult-title"
        >
          {consult && (
            <>
              <DialogHeader>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">
                  {consult.buttons[1]}
                </p>
                <DialogTitle
                  id="case-consult-title"
                  className="font-display text-2xl md:text-3xl font-bold"
                >
                  Build a system like {consult.title}
                </DialogTitle>
                <p className="text-primary font-semibold text-sm">{consult.metric}</p>
              </DialogHeader>

              <DialogDescription className="text-foreground/75 leading-relaxed">
                {consult.consultPitch}
              </DialogDescription>

              <div className="rounded-2xl border border-border bg-secondary p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary mb-2">
                  Reach the operator directly
                </p>
                <SocialIcons brand="trendflux" variant="inline" size="md" />
                <p className="mt-3 text-xs text-foreground/55">
                  Avg. response time under 4 hours on WhatsApp.
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-3">
                <Button variant="ghost" onClick={() => setConsultIndex(null)}>
                  Close
                </Button>
                <Button
                  variant="gold"
                  asChild
                >
                  <a
                    href="https://wa.me/message/X6JBEVJ65NA3K1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("case_consult_whatsapp", {
                        case_title: consult.title,
                        cta: consult.buttons[1],
                      })
                    }
                  >
                    Start the conversation <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CaseStudies;
