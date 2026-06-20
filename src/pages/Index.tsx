import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { QuoteDialog } from "@/components/QuoteDialog";
import AudioStoryTeaser from "@/components/tf/AudioStoryTeaser";
import AiExpertStoryTeaser from "@/components/home/AiExpertStoryTeaser";
import {
  HomeHeroSection,
  TrustBar,
  QuickAccess,
  EcosystemSection,
  ServicesSection,
  SystemsHeBuiltSection,
  FounderSection,
  TheStandCoverSection,
  QuietPositionsSection,
  JusticeAppealSection,
  AcademySection,
  KormoShikkhaShowcase,
  OperatedBrandsSection,
  LuxeVeilSection,
  ProofSection,
  TestimonialsSection,
  FitSection,
  FinalCtaSection,
} from "@/components/home";

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
    <main className="min-h-dvh bg-background text-foreground font-sans antialiased">
      <Navbar />

      <HomeHeroSection onOpenQuote={openQuote} />
      <TrustBar />
      <QuickAccess />
      <EcosystemSection />
      <ServicesSection />
      <SystemsHeBuiltSection />
      <FounderSection />
      <TheStandCoverSection />
      <AudioStoryTeaser />
      <AiExpertStoryTeaser />
      <QuietPositionsSection />
      <JusticeAppealSection />
      <AcademySection />
      <KormoShikkhaShowcase />
      <OperatedBrandsSection />
      <LuxeVeilSection />
      <ProofSection />
      <TestimonialsSection />
      <FitSection onOpenQuote={openQuote} />
      <FinalCtaSection onOpenQuote={openQuote} />

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
