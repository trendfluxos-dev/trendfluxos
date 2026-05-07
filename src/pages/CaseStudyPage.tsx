import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { caseStudies } from "@/data/caseStudies";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { QuoteDialog } from "@/components/QuoteDialog";
import trendfluxLogo from "@/assets/trendflux-logo.png";

const Section = ({ label, body }: { label: string; body: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/80">
      {label}
    </p>
    <p className="mt-2 text-foreground/75 leading-relaxed">{body}</p>
  </div>
);

const CaseStudyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const study = caseStudies.find((c) => c.slug === slug);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useSeo({
    title: study
      ? `${study.title} — ${BRAND.name}`
      : `Case Study Not Found — ${BRAND.name}`,
    description: study?.description,
  });

  useJsonLd(
    study
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: study.title,
            description: study.description,
            author: { "@type": "Organization", name: BRAND.legalName },
            publisher: { "@type": "Organization", name: BRAND.legalName },
            articleSection: study.category,
          },
        ]
      : []
  );

  if (!study) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold mb-4">404</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold">
          Case study not found
        </h1>
        <p className="mt-4 max-w-md text-foreground/60">
          The case study you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="gold" className="mt-8" onClick={() => navigate("/#cases")}>
          <ArrowLeft className="h-4 w-4" /> Back to all case studies
        </Button>
      </main>
    );
  }

  const Icon = study.Icon;

  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary/20 blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-primary-glow/15 blur-[160px]" />
      </div>

      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-7xl rounded-full glass-strong">
        <div className="flex items-center justify-between px-5 md:px-8 py-3.5">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <img src={trendfluxLogo} alt={`${BRAND.name} logo`} className="h-8 w-8 object-contain" />
            {BRAND.nameLead} <span className="text-gradient">{BRAND.nameTrail}</span>
          </Link>
          <Link
            to="/#cases"
            className="hidden md:inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All case studies
          </Link>
        </div>
      </nav>

      <article className="relative px-6 pt-32 pb-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/#cases"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-foreground/55 hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            {study.category}
          </p>
          <h1 className="font-display mt-4 text-4xl md:text-6xl font-black leading-[1.05] tracking-tight">
            {study.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/70 leading-relaxed">
            {study.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em]">
            {[study.service, study.industry, study.stage, ...study.stack].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-foreground/60"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl glass border-gold/30 p-8 order-2 lg:order-1 space-y-6">
              <Section label="Situation" body={study.situation} />
              <Section label="Problem" body={study.problem} />
              <Section label="Solution" body={study.solution} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/80">
                  Results
                </p>
                <ul className="mt-3 space-y-2">
                  {study.results.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-foreground/85">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                  Key Insight
                </p>
                <p className="mt-2 text-foreground/85">{study.insight}</p>
              </div>
            </div>

            <aside className="order-1 lg:order-2 space-y-6">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-[#0B1F3A] relative">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(hsl(var(--gold) / 0.18) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                  aria-hidden
                />
                <Icon className="relative h-full w-full p-10" />
              </div>
              <div className="rounded-3xl glass-strong p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80">
                  Operating Region
                </p>
                <p className="font-display mt-1 text-xl font-bold">{study.map.city}</p>
                <p className="text-sm text-foreground/55">{study.map.region}</p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-foreground/40">
                  Headline outcome
                </p>
                <p className="mt-1 font-semibold text-gold">{study.map.outcome}</p>
              </div>
              <Button
                variant="gold"
                className="w-full"
                onClick={() => setQuoteOpen(true)}
              >
                Build something similar <ArrowRight className="h-4 w-4" />
              </Button>
            </aside>
          </div>
        </div>
      </article>

      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} />
    </main>
  );
};

export default CaseStudyPage;
