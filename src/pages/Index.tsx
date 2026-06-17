import { useState } from "react";
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
  EcosystemSection,
  ServicesSection,
  SystemsHeBuiltSection,
  FounderSection,
  TheStandCoverSection,
  QuietPositionsSection,
  JusticeAppealSection,
  AcademySection,
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
const Index = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const openQuote = () => setQuoteOpen(true);

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
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />

      <HomeHeroSection onOpenQuote={openQuote} />
      <TrustBar />
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
        context={{ source: "homepage_hero" }}
      />
    </main>
  );
};

export default Index;
