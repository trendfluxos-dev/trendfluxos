import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TfSection, TfCard } from "@/components/tf/Section";
import { useSeo } from "@/hooks/useSeo";
import { QuoteDialog } from "@/components/QuoteDialog";
import {
  Megaphone,
  Bot,
  Database,
  Workflow,
  Palette,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const SERVICES = [
  {
    icon: Megaphone,
    title: "Meta Ads",
    desc: "Advantage+ campaigns engineered for compounding ROAS and sub-$8 CAC.",
    outcomes: ["Hook-rate creative testing", "Full-funnel architecture", "LTV-aligned bidding"],
  },
  {
    icon: Bot,
    title: "AI Automation",
    desc: "Agents and workflows that replace 20+ manual hours of ops every week.",
    outcomes: ["Custom AI ops bots", "Multi-tool sync layer", "Prompt + workflow library"],
  },
  {
    icon: Database,
    title: "CRM Systems",
    desc: "Unified pipeline, lifecycle, and revenue visibility in one source of truth.",
    outcomes: ["Lead scoring engine", "Lifecycle automation", "Pipeline reporting"],
  },
  {
    icon: Workflow,
    title: "Funnel Engineering",
    desc: "Acquisition → activation → retention wired into a single compounding loop.",
    outcomes: ["Conversion architecture", "Activation sequences", "Retention systems"],
  },
  {
    icon: Palette,
    title: "Creative Strategy",
    desc: "A creative factory built for Meta's algorithm — UGC, static, motion.",
    outcomes: ["Weekly creative tests", "Hook-rate scorecards", "Asset production pipeline"],
  },
  {
    icon: Target,
    title: "Founder Branding",
    desc: "Position founders as category operators — not interchangeable service providers.",
    outcomes: ["Narrative architecture", "Content OS", "Authority placement"],
  },
];

const Services = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  useSeo({
    title: "Services — TrendFlux Growth OS",
    description: "Six integrated growth disciplines — Meta Ads, AI Automation, CRM, Funnels, Creative, Founder Branding. Deployed standalone or as a full OS.",
  });

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />

      <TfSection
        className="pt-40"
        eyebrow="Services"
        title="Six disciplines. One operating layer."
        intro="Each module is deployable standalone — or composed into a full Growth OS engagement. Built for founders who want infrastructure, not retainers."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SERVICES.map((s) => (
            <TfCard key={s.title}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {s.outcomes.map((o) => (
                      <li key={o} className="flex items-center gap-2 text-[13px] text-foreground/80">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TfCard>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="tf-btn-primary inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90"
          >
            Request Engagement <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </TfSection>

      <Footer />

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        context={{ source: "services_page" }}
      />
    </main>
  );
};

export default Services;
