import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TfSection, TfCard } from "@/components/tf/Section";
import EcosystemMap from "@/components/tf/EcosystemMap";
import { useSeo } from "@/hooks/useSeo";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const LAYERS = [
  {
    name: "Infrastructure",
    desc: "Tech stack, data pipelines, integrations. The bedrock everything else runs on.",
    items: ["Supabase + edge functions", "Webhooks + event bus", "Unified data model"],
  },
  {
    name: "Growth Engine",
    desc: "Acquisition, activation, retention. The compounding loops that move revenue.",
    items: ["Meta Advantage+ funnels", "Lifecycle automation", "Retention sequences"],
  },
  {
    name: "Intelligence",
    desc: "AI agents, scoring, attribution. The brain that closes the loop.",
    items: ["Lead scoring models", "Attribution dashboards", "AI ops agents"],
  },
  {
    name: "Authority",
    desc: "Founder positioning, content infrastructure, ecosystem network effects.",
    items: ["Founder narrative", "Content OS", "Luxe Veil access"],
  },
];

const Ecosystem = () => {
  useSeo({
    title: "Ecosystem — TrendFlux OS Architecture",
    description: "Inside the TrendFlux Growth Operating System: four integrated layers — Infrastructure, Growth Engine, Intelligence, Authority.",
  });

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground font-sans antialiased">
      <Navbar />

      <TfSection
        className="pt-40"
        eyebrow="The Architecture"
        title="The TrendFlux Growth Operating System."
        titleAs="h1"
        intro="Four layers. Six modules. One connected system designed for founders who want operational leverage — not another agency relationship."
      >
        <EcosystemMap />
      </TfSection>

      <TfSection
        tone="muted"
        eyebrow="Four Layers"
        title="From bedrock to brand authority."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {LAYERS.map((l, i) => (
            <TfCard key={l.name}>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-semibold text-primary/70">
                  0{i + 1}
                </span>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {l.name}
                </h3>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {l.desc}
              </p>
              <ul className="mt-5 space-y-2">
                {l.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-[13px] text-foreground/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {it}
                  </li>
                ))}
              </ul>
            </TfCard>
          ))}
        </div>
      </TfSection>

      <TfSection>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Ready to architect your OS?
          </h2>
          <Link
            to="/contact"
            className="mt-9 tf-btn-primary inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90"
          >
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </TfSection>

      <Footer />
    </main>
  );
};

export default Ecosystem;
