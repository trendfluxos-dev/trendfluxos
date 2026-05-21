import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { FilmGrain } from "@/components/the-stand/FilmGrain";
import { SilentOpener } from "@/components/the-stand/SilentOpener";
import { RefusalCards } from "@/components/the-stand/RefusalCards";
import { Listening } from "@/components/the-stand/Listening";
import { ReconstructionTimeline } from "@/components/the-stand/ReconstructionTimeline";
import { EthicalIndex } from "@/components/the-stand/EthicalIndex";
import { InfrastructurePivot } from "@/components/the-stand/InfrastructurePivot";
import { HumanityRestored } from "@/components/the-stand/HumanityRestored";
import { MediaWall } from "@/components/the-stand/MediaWall";
import { QuoteEngineCta } from "@/components/the-stand/QuoteEngineCta";
import { DocumentaryEmbed } from "@/components/the-stand/DocumentaryEmbed";
import { ClosingStatement } from "@/components/the-stand/ClosingStatement";

/**
 * /the-stand — a museum-grade cinematic experience for the
 * Zahid Hasan Emon narrative inside the TrendFlux ecosystem.
 *
 * Tone: Apple minimalism + Netflix documentary + A24 atmosphere.
 * Visual language tokens live under the scoped `.the-stand` class
 * in `src/index.css` (--stand-bone / --stand-silver / --stand-charcoal
 * / --stand-red). All sections fade in via IntersectionObserver and
 * respect `prefers-reduced-motion`.
 */
export default function TheStand() {
  useSeo({
    title: "The Stand — Zahid Hasan Emon · TrendFlux Ecosystem",
    description:
      "মায়ের নিষেধ আছে। A preserved moment of conscience — Zahid Hasan Emon's stand against extortion and a torture-cell night at Jahangirnagar University, reimagined as a cinematic archive inside the TrendFlux Ecosystem.",
    type: "article",
    image: "/og-the-stand.jpg",
    imageWidth: 1216,
    imageHeight: 640,
    imageType: "image/jpeg",
    imageAlt: "The Stand — মায়ের নিষেধ আছে · Zahid Hasan Emon",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Zahid Hasan Emon",
        alternateName: "জাহিদ হাসান ইমন",
        jobTitle: "Brand Architect · AI-era Ethical Technologist",
        description:
          "AI-era ethical youth leader and brand architect; whistleblower against extortion and torture-cell culture at Jahangirnagar University.",
        affiliation: {
          "@type": "EducationalOrganization",
          name: "Jahangirnagar University",
        },
        worksFor: { "@type": "Organization", name: "TrendFlux Ecosystem" },
        nationality: "Bangladeshi",
      },
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "The Stand",
        headline: "The Stand — a preserved moment of conscience",
        about: "Integrity under pressure; ethics versus institutional darkness.",
        inLanguage: ["bn", "en"],
        author: { "@type": "Organization", name: "TrendFlux Ecosystem" },
      },
    ],
  });

  return (
    <main className="the-stand relative min-h-screen">
      <FilmGrain />

      {/* Quiet back link — desaturated, easy to miss on purpose */}
      <Link
        to="/#story"
        lang="en"
        className="fixed left-6 top-6 z-50 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))]/70 transition-colors hover:text-[hsl(var(--stand-red))]"
      >
        <ArrowLeft className="h-3 w-3" />
        Home
      </Link>

      <SilentOpener />
      <RefusalCards />
      <Listening />
      <ReconstructionTimeline />
      <EthicalIndex />
      <HumanityRestored />
      <InfrastructurePivot />
      <MediaWall />
      <QuoteEngineCta />
      <DocumentaryEmbed />
      <ClosingStatement />
    </main>
  );
}
