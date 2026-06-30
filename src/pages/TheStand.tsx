import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useSeo } from "@/hooks/useSeo";
import { StandLanguageProvider } from "@/context/StandLanguageContext";
import { FilmGrain } from "@/components/the-stand/FilmGrain";
import { LangToggle } from "@/components/the-stand/LangToggle";
import { SilentOpener } from "@/components/the-stand/SilentOpener";
import { Listening } from "@/components/the-stand/Listening";
import { RefusalStanzas } from "@/components/the-stand/RefusalStanzas";
import { ReconstructionTimeline } from "@/components/the-stand/ReconstructionTimeline";
import { PrinciplesList } from "@/components/the-stand/PrinciplesList";
import { MemoryLayer24 } from "@/components/the-stand/MemoryLayer24";
import { HumanityRestored } from "@/components/the-stand/HumanityRestored";
import { AudioStory } from "@/components/the-stand/AudioStory";
import { MediaWall } from "@/components/the-stand/MediaWall";
import { DocumentaryEmbed } from "@/components/the-stand/DocumentaryEmbed";
import { SharedFilms } from "@/components/the-stand/SharedFilms";
import { InfrastructurePivot } from "@/components/the-stand/InfrastructurePivot";
import { ArchiveUtilities } from "@/components/the-stand/ArchiveUtilities";
import { ClosingStatement } from "@/components/the-stand/ClosingStatement";

/**
 * /the-stand — a Bangla-first digital civic memory experience.
 * Narrative-first ordering: statement → why it matters → refusals →
 * reconstruction → principles → human element → archive → bridge →
 * (quiet utilities) → closing. Tools are demoted; emotion leads.
 */
export default function TheStand() {
  const { search, hash } = useLocation();

  // Deep-link preload: ?chapter=<slug> or #<slug> scrolls into the
  // matching chapter and adds a brief highlight ring.
  useEffect(() => {
    const params = new URLSearchParams(search);
    const target = params.get("chapter") || hash.replace(/^#/, "");
    if (!target) return;
    const tryScroll = () => {
      const el = document.getElementById(target);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.setAttribute("data-chapter-active", "true");
      window.setTimeout(() => el.removeAttribute("data-chapter-active"), 2400);
      return true;
    };
    // Defer until sections mount
    const id = window.setTimeout(tryScroll, 250);
    return () => window.clearTimeout(id);
  }, [search, hash]);

  useSeo({
    title: "The Stand — Zahid Hasan Emon · TrendFlux Ecosystem",
    description:
      "মায়ের নিষেধ আছে। A preserved moment of conscience — Zahid Hasan Emon's stand against extortion and a torture-cell night at Jahangirnagar University, reimagined as a Bangla-first civic memory experience inside the TrendFlux Ecosystem.",
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
    <StandLanguageProvider>
      <main className="the-stand relative min-h-dvh">
        <FilmGrain />

        {/* Quiet back link — desaturated, easy to miss on purpose */}
        <Link
          to="/#story"
          lang="en"
          className="fixed left-6 top-6 z-50 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))] transition-colors hover:text-[hsl(var(--stand-red))]"
        >
          <ArrowLeft className="h-3 w-3" />
          Home
        </Link>

        <LangToggle />

        <SilentOpener />
        <Listening />
        <RefusalStanzas />
        <ReconstructionTimeline />
        <PrinciplesList />
        <MemoryLayer24 />
        <div id="humanity-restored" className="chapter-anchor scroll-mt-24">
          <HumanityRestored />
        </div>
        <div id="audio-story" className="chapter-anchor scroll-mt-24">
          <AudioStory />
        </div>
        <div id="press" className="chapter-anchor scroll-mt-24">
          <MediaWall />
        </div>
        <DocumentaryEmbed />
        <div id="shared-files" className="chapter-anchor scroll-mt-24">
          <SharedFilms />
        </div>
        <InfrastructurePivot />
        <ArchiveUtilities />
        <ClosingStatement />

        {/* Hairline bridge to the parallel emotional archive — easy to miss on purpose */}
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 pb-20 pt-8 text-center">
          <span aria-hidden className="h-px w-10 bg-[hsl(var(--stand-hairline))]" />
          <Link
            to="/quiet-positions"
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))] transition-colors hover:text-[hsl(var(--stand-red))]"
          >
            <span lang="bn">নীরব অবস্থান</span>
            <span aria-hidden> · </span>
            <span lang="en">Quiet Positions →</span>
          </Link>
        </div>
      </main>
    </StandLanguageProvider>
  );
}
