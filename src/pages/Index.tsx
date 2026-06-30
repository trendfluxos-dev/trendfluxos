import { Suspense, lazy, useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { QuoteDialog } from "@/components/QuoteDialog";
import {
  HomeHeroSection,
  TrustBar,
  QuickAccess,
} from "@/components/home";
import LayerBand from "@/components/layer/LayerBand";
import { LazySection } from "@/components/LazySection";
import { SectionSkeleton } from "@/components/home/SectionSkeleton";

// Below-the-fold sections are code-split so the initial home payload only
// ships the hero + trust bar + quick-access strip. The rest streams in as
// the user scrolls, dramatically cutting LCP and TBT.
const EcosystemSection = lazy(() => import("@/components/home/EcosystemSection").then(m => ({ default: m.EcosystemSection })));
const ServicesSection = lazy(() => import("@/components/home/ServicesSection").then(m => ({ default: m.ServicesSection })));
const SystemsHeBuiltSection = lazy(() => import("@/components/home/SystemsHeBuiltSection").then(m => ({ default: m.SystemsHeBuiltSection })));
const FounderSection = lazy(() => import("@/components/home/FounderSection").then(m => ({ default: m.FounderSection })));
const TheStandCoverSection = lazy(() => import("@/components/home/TheStandCoverSection").then(m => ({ default: m.TheStandCoverSection })));
const AudioStoryTeaser = lazy(() => import("@/components/tf/AudioStoryTeaser"));
const AiExpertStoryTeaser = lazy(() => import("@/components/home/AiExpertStoryTeaser"));
const QuietPositionsSection = lazy(() => import("@/components/home/QuietPositionsSection").then(m => ({ default: m.QuietPositionsSection })));
const JusticeAppealSection = lazy(() => import("@/components/home/JusticeAppealSection").then(m => ({ default: m.JusticeAppealSection })));
const AcademySection = lazy(() => import("@/components/home/AcademySection").then(m => ({ default: m.AcademySection })));
const KormoShikkhaShowcase = lazy(() => import("@/components/home/KormoShikkhaShowcase").then(m => ({ default: m.KormoShikkhaShowcase })));
const LiveClassStudioSection = lazy(() => import("@/components/home/LiveClassStudioSection").then(m => ({ default: m.LiveClassStudioSection })));
const OperatedBrandsSection = lazy(() => import("@/components/home/OperatedBrandsSection").then(m => ({ default: m.OperatedBrandsSection })));
const LuxeVeilSection = lazy(() => import("@/components/home/LuxeVeilSection").then(m => ({ default: m.LuxeVeilSection })));
const ProofSection = lazy(() => import("@/components/home/ProofSection").then(m => ({ default: m.ProofSection })));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FitSection = lazy(() => import("@/components/home/FitSection").then(m => ({ default: m.FitSection })));
const FinalCtaSection = lazy(() => import("@/components/home/FinalCtaSection").then(m => ({ default: m.FinalCtaSection })));

const SectionFallback = () => <div aria-hidden className="min-h-[40vh]" />;

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

      <HomeHeroSection onOpenQuote={openQuote} />
      <TrustBar />
      <QuickAccess />

      {/* Near-fold: mount eagerly with a shared Suspense so it streams in fast. */}
      <Suspense fallback={<SectionFallback />}>
        <LayerBand layer="company" />
        <EcosystemSection />
        <ServicesSection />
      </Suspense>

      {/* Below-the-fold: each section gets its own IO-gated Suspense, so a
          slow chunk never blocks the others and unseen chunks never download. */}
      <LazySection label="founder-band" minHeight="20vh" skeleton={<SectionSkeleton variant="band" />}>
        <LayerBand layer="founder" />
      </LazySection>
      <LazySection label="kormoshikkha" skeleton={<SectionSkeleton variant="split" />}><KormoShikkhaShowcase /></LazySection>
      <LazySection label="live-studio" skeleton={<SectionSkeleton variant="split" />}><LiveClassStudioSection /></LazySection>
      <LazySection label="founder" skeleton={<SectionSkeleton variant="split" />}><FounderSection /></LazySection>
      {/* Paired: The Stand + Algorithm Architecture share a two-up strip
          on lg+ to keep the homepage compact. They stack on small screens. */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <LazySection label="stand-cover" skeleton={<SectionSkeleton variant="media" />}>
          <TheStandCoverSection />
        </LazySection>
        <LazySection label="algorithm-arch" skeleton={<SectionSkeleton variant="cards" />}>
          <SystemsHeBuiltSection />
        </LazySection>
      </div>
      <LazySection label="audio-story" skeleton={<SectionSkeleton variant="media" />}><AudioStoryTeaser /></LazySection>
      <LazySection label="ai-expert" skeleton={<SectionSkeleton variant="media" />}><AiExpertStoryTeaser /></LazySection>
      <LazySection label="quiet-positions" skeleton={<SectionSkeleton variant="cards" />}><QuietPositionsSection /></LazySection>
      <LazySection label="justice" skeleton={<SectionSkeleton variant="split" />}><JusticeAppealSection /></LazySection>
      <LazySection label="brand-band" minHeight="20vh" skeleton={<SectionSkeleton variant="band" />}>
        <LayerBand layer="brand" />
      </LazySection>
      <LazySection label="academy" skeleton={<SectionSkeleton variant="cards" />}><AcademySection /></LazySection>
      <LazySection label="operated" skeleton={<SectionSkeleton variant="row" />}><OperatedBrandsSection /></LazySection>
      <LazySection label="luxe" skeleton={<SectionSkeleton variant="split" />}><LuxeVeilSection /></LazySection>
      <LazySection label="proof" skeleton={<SectionSkeleton variant="cards" />}><ProofSection /></LazySection>
      <LazySection label="testimonials" skeleton={<SectionSkeleton variant="cards" />}><TestimonialsSection /></LazySection>
      <LazySection label="fit" skeleton={<SectionSkeleton variant="cards" />}><FitSection onOpenQuote={openQuote} /></LazySection>
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
