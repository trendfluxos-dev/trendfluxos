import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import {
  Bot,
  Target,
  Layout,
  MessageSquare,
  PenTool,
  Globe,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  bestFor: string;
  outcome: string;
}

const services: Service[] = [
  {
    icon: Bot,
    title: "AI Business Automation",
    description: "Automate repetitive operations with AI workflows that free your team to focus on strategy.",
    bestFor: "Founders drowning in manual ops",
    outcome: "20+ hrs/week reclaimed",
  },
  {
    icon: Target,
    title: "Meta Ads & Lead Generation",
    description: "Performance ad systems engineered for high-intent lead capture and ROI accountability.",
    bestFor: "Brands ready to scale acquisition",
    outcome: "Lower CPL, higher LTV",
  },
  {
    icon: Layout,
    title: "Funnel & Landing Page Design",
    description: "Conversion-optimized funnels that turn cold traffic into qualified booked calls.",
    bestFor: "Service businesses & consultants",
    outcome: "2–4× conversion lift",
  },
  {
    icon: MessageSquare,
    title: "CRM & WhatsApp Automation",
    description: "End-to-end nurture sequences across CRM, email, and WhatsApp — fully automated.",
    bestFor: "Teams losing leads in the gap",
    outcome: "Zero leads slipping through",
  },
  {
    icon: PenTool,
    title: "Content Strategy & Brand Storytelling",
    description: "Editorial systems that build authority and compound organic reach over time.",
    bestFor: "Founders building personal brands",
    outcome: "Consistent authority + trust",
  },
  {
    icon: Globe,
    title: "Website & Digital Ecosystem Design",
    description: "Premium web presence engineered as a sales asset — not a digital brochure.",
    bestFor: "Brands ready to look the part",
    outcome: "Higher perceived value",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics & Reporting",
    description: "Dashboards and reports that turn marketing noise into clear strategic decisions.",
    bestFor: "Leaders demanding visibility",
    outcome: "Data-driven decisions weekly",
  },
];

const Services = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="services" className="px-6 lg:px-10 py-24 relative">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" aria-hidden />
      <div ref={ref} className="relative max-w-7xl mx-auto">
        <div className="text-center mb-14 reveal">
          <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
            Service Modules
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
            Modular building blocks for your{" "}
            <span className="text-gradient">growth operating system</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <article
                key={s.title}
                className="glass glass-hover rounded-3xl p-7 group flex flex-col reveal"
                style={{ transitionDelay: `${Math.min(i, 5) * 70}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-cyan/20 border border-primary/30 flex items-center justify-center mb-5 group-hover:shadow-cyan transition-all">
                  <Icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="text-foreground/60 mt-3 text-sm leading-relaxed">
                  {s.description}
                </p>

                <dl className="mt-5 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <dt className="text-foreground/40 uppercase tracking-wider min-w-[68px]">Best for</dt>
                    <dd className="text-foreground/80">{s.bestFor}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-foreground/40 uppercase tracking-wider min-w-[68px]">Outcome</dt>
                    <dd className="text-gold">{s.outcome}</dd>
                  </div>
                </dl>

                <Button variant="glass" size="sm" className="mt-6 self-start">
                  Explore Module →
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
