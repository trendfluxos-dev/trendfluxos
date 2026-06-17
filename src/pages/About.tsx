import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TfSection, TfCard } from "@/components/tf/Section";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import emonPortrait from "@/assets/zahid-hasan-emon.webp";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, GitBranch, Layers, Eye } from "lucide-react";

const PRINCIPLES = [
  { icon: ShieldCheck, title: "Ethical Growth", desc: "No dark patterns. No vanity. No manipulation." },
  { icon: GitBranch, title: "Systems-First", desc: "Build infrastructure that compounds, not tasks that exhaust." },
  { icon: Layers, title: "Composable", desc: "Every module slots into the next — or stands on its own." },
  { icon: Eye, title: "Transparency", desc: "Audit-ready dashboards. No black boxes. No mystery retainers." },
];

const About = () => {
  useSeo({
    title: "About — TrendFlux & Zahid Hasan Emon",
    description: "The strategic operator and ethical growth architect behind TrendFlux — building AI-native growth infrastructure for modern brands.",
  });
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Zahid Hasan Emon",
      jobTitle: "Founder & Growth Architect",
      image: `${BRAND.url}${emonPortrait}`,
      url: `${BRAND.url}/about`,
      worksFor: {
        "@type": "Organization",
        name: "TrendFlux",
        url: BRAND.url,
      },
      description:
        "Strategic operator and ethical growth architect behind TrendFlux — building AI-native growth infrastructure for modern brands.",
    },
    "ld-person",
  );

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />

      <TfSection
        className="pt-40"
        eyebrow="About"
        title="Built by an operator. For operators."
        titleAs="h1"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-12 lg:grid-cols-[340px_1fr]">
          <div className="relative mx-auto">
            <div className="absolute -inset-3 rounded-2xl bg-primary/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <img
                src={emonPortrait}
                alt="Zahid Hasan Emon"
                className="h-[440px] w-[340px] object-cover"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              Founder · Architect
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Zahid Hasan Emon
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                TrendFlux started as a refusal — a refusal to keep watching founders
                drown in disconnected tools, vanity dashboards, and retainers that
                couldn't justify their own existence.
              </p>
              <p>
                The thesis was simple: growth is infrastructure. Treat it like
                engineers treat systems — composable, auditable, instrumented — and
                it compounds. Treat it like marketing, and you rent attention until
                the budget runs out.
              </p>
              <p>
                Today TrendFlux operates as an AI-native Growth OS — six integrated
                modules, four layers, one source of truth — deployed across founders
                and brands who want leverage, not lock-in.
              </p>
            </div>
          </div>
        </div>
      </TfSection>

      <TfSection
        tone="muted"
        eyebrow="Operating Principles"
        title="Four non-negotiables."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <TfCard key={p.title}>
              <p.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                {p.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {p.desc}
              </p>
            </TfCard>
          ))}
        </div>
      </TfSection>

      <TfSection>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Want to work with the architect?
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

export default About;
