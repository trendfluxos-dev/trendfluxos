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
import SectionOrnament from "@/components/home/SectionOrnament";

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
const TripleBridge          = lazy(() => import("@/components/ecosystem/TripleBridge"));
const EcosystemNavigator    = lazy(() => import("@/components/home/EcosystemNavigator"));

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

  useSeo({
    title: "Trendflux Digital — Operator portfolio of Zahid Hasan Emon",
    description:
      "Trendflux Digital is the operator portfolio of Zahid Hasan Emon — eight brands across EdTech (Kormoshikkha), Creative (BrandToki), LuxeVeil, TrendFlux Space and more, with The Stand manifesto and Algorithm Architecture case studies.",
    canonical: "/",
    type: "website",
    imageAlt: "Trendflux Digital — operator portfolio of Zahid Hasan Emon",
    siteName: BRAND.name,
  });
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

      <SectionOrnament chapter="Navigator" label="Explore the Ecosystem" />
      {/* Sticky ecosystem navigator — 11 large jump cards to public routes. */}
      <LazySection label="ecosystem-navigator" skeleton={<SectionSkeleton variant="cards" />}>
        <EcosystemNavigator />
      </LazySection>

      <div id="systems-he-built" data-nav-section="growth-os" className="scroll-mt-[var(--nav-offset)]">
        <SectionOrnament chapter="Chapter I" label="Systems He Built · 90-day Build" />
        <LazySection label="algorithm-arch" skeleton={<SectionSkeleton variant="cards" />}>
          <SystemsHeBuiltSection />
        </LazySection>
      </div>

      <div data-nav-section="the-stand">
        <SectionOrnament chapter="Chapter II" label="The Stand · জাতীয় দলিল" accent="amber" />
        <LazySection label="stand-cover" skeleton={<SectionSkeleton variant="media" />}>
          <TheStandCoverSection />
        </LazySection>
      </div>

      <SectionOrnament chapter="Chapter III" label="Pabna Accountability Project" accent="amber" />
      {/* Documentation & Accountability (spec §5). */}
      <LazySection label="justice" skeleton={<SectionSkeleton variant="split" />}>
        <JusticeAppealSection />
      </LazySection>

      <SectionOrnament chapter="Chapter IV" label="Signal · Latest Story" />
      {/* Latest signal */}
      <LazySection label="audio-story" skeleton={<SectionSkeleton variant="media" />}><AudioStoryTeaser /></LazySection>
      <LazySection label="ai-expert" skeleton={<SectionSkeleton variant="media" />}><AiExpertStoryTeaser /></LazySection>

      <LazySection label="brand-band" minHeight="20vh" skeleton={<SectionSkeleton variant="band" />}>
        <LayerBand layer="brand" />
      </LazySection>

      <div data-nav-section="case-studies">
        <SectionOrnament chapter="Chapter V" label="Proof · Operating Metrics" />
        <LazySection label="proof" skeleton={<SectionSkeleton variant="cards" />}><ProofSection /></LazySection>
        <LazySection label="testimonials" skeleton={<SectionSkeleton variant="cards" />}><TestimonialsSection /></LazySection>
      </div>

      <div data-nav-section="edtech">
        <SectionOrnament chapter="Chapter VI" label="Learn → Operate → Measure" accent="amber" />
        <LazySection label="ecosystem-bridge" skeleton={<SectionSkeleton variant="cards" />}>
          <TripleBridge />
        </LazySection>
      </div>

      <div data-nav-section="contact">
        <SectionOrnament chapter="Chapter VII" label="Scale Beyond Marketing" />
        <LazySection label="final-cta" skeleton={<SectionSkeleton variant="band" />}><FinalCtaSection onOpenQuote={openQuote} /></LazySection>
      </div>

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
