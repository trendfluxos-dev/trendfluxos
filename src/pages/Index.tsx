import { lazy, useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { QuoteDialog } from "@/components/QuoteDialog";
import ArchitecturalHero from "@/components/home/ArchitecturalHero";
import LayerBand from "@/components/layer/LayerBand";
import { LazySection } from "@/components/LazySection";
import { SectionSkeleton } from "@/components/home/SectionSkeleton";

// Restructured homepage (Architectural portfolio direction). The dense
// hero + brand grid replaces the multi-section top stack. Everything
// below stays lazy-loaded for fast LCP on low-RAM/slow-network devices.
const SystemsHeBuiltSection = lazy(() => import("@/components/home/SystemsHeBuiltSection").then(m => ({ default: m.SystemsHeBuiltSection })));
const TheStandCoverSection  = lazy(() => import("@/components/home/TheStandCoverSection").then(m => ({ default: m.TheStandCoverSection })));
const AudioStoryTeaser      = lazy(() => import("@/components/tf/AudioStoryTeaser"));
const AiExpertStoryTeaser   = lazy(() => import("@/components/home/AiExpertStoryTeaser"));
const JusticeAppealSection  = lazy(() => import("@/components/home/JusticeAppealSection").then(m => ({ default: m.JusticeAppealSection })));
const ProofSection          = lazy(() => import("@/components/home/ProofSection").then(m => ({ default: m.ProofSection })));
const TestimonialsSection   = lazy(() => import("@/components/home/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FinalCtaSection       = lazy(() => import("@/components/home/FinalCtaSection").then(m => ({ default: m.FinalCtaSection })));

/**
 * Home page (TrendFlux Growth OS). Composition-only: each section is a
 * self-contained, single-responsibility component under `src/components/home/`,
 * and all static copy lives in `src/data/home.ts`. The only state retained
 * here is the shared "Book Strategy Call" dialog.
 */
const HOMEPAGE_HERO_CONTEXT = { source: "homepage_hero" as const };

const Index = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  // Stable identity so memoised sections don't re-render when the dialog toggles.
  const openQuote = useCallback(() => setQuoteOpen(true), []);

  useSeo();
  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND.name,
      legalName: BRAND.legalName,
      url: BRAND.url,
      logo: `${BRAND.url}/favicon.ico`,
      slogan: BRAND.tagline,
      description: BRAND.description,
      sameAs: [
        "https://www.facebook.com/trendfluxdigital",
        "https://www.linkedin.com/company/trendflux",
      ],
    },
    {
      // WebSite schema enables the SiteLinks Search Box and helps search
      // engines identify the canonical site identity alongside Organization.
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND.name,
      url: BRAND.url,
      description: BRAND.description,
      inLanguage: ["en", "bn"],
      publisher: { "@type": "Organization", name: BRAND.name, url: BRAND.url },
      potentialAction: {
        "@type": "SearchAction",
        target: `${BRAND.url}/explore?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ]);

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground font-sans antialiased">
      <Navbar />

      <ArchitecturalHero onOpenQuote={openQuote} />

      {/* Flagship pair — The Stand (manifesto) + Algorithm Architecture (systems).
          Two columns on lg+, stacked on small screens. */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <LazySection label="stand-cover" skeleton={<SectionSkeleton variant="media" />}>
          <TheStandCoverSection />
        </LazySection>
        <LazySection label="algorithm-arch" skeleton={<SectionSkeleton variant="cards" />}>
          <SystemsHeBuiltSection />
        </LazySection>
      </div>

      {/* Latest signal */}
      <LazySection label="audio-story" skeleton={<SectionSkeleton variant="media" />}><AudioStoryTeaser /></LazySection>
      <LazySection label="ai-expert" skeleton={<SectionSkeleton variant="media" />}><AiExpertStoryTeaser /></LazySection>

      {/* Ethical stance + brand band for ecosystem discovery */}
      <LazySection label="justice" skeleton={<SectionSkeleton variant="split" />}><JusticeAppealSection /></LazySection>
      <LazySection label="brand-band" minHeight="20vh" skeleton={<SectionSkeleton variant="band" />}>
        <LayerBand layer="brand" />
      </LazySection>

      {/* Credibility */}
      <LazySection label="proof" skeleton={<SectionSkeleton variant="cards" />}><ProofSection /></LazySection>
      <LazySection label="testimonials" skeleton={<SectionSkeleton variant="cards" />}><TestimonialsSection /></LazySection>

      {/* Engage */}
      <LazySection label="final-cta" skeleton={<SectionSkeleton variant="band" />}><FinalCtaSection onOpenQuote={openQuote} /></LazySection>

      <Footer />

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        context={HOMEPAGE_HERO_CONTEXT}
      />
    </main>
  );
};

export default Index;
