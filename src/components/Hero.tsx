import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, BookOpenText, Share2 } from "lucide-react";
import { ENTERPRISE } from "@/config/enterprise";
import { track } from "@/lib/analytics";

const Hero = () => {
  return (
    <section aria-labelledby="hero-title" className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-6 lg:px-10 overflow-hidden">
      <div className="absolute inset-0 hero-glow" aria-hidden />
      <div className="absolute inset-0 grid-dots opacity-40" aria-hidden />

      {/* static ambient orbs (animation removed — decorative, constant repaint on large blurred surface) */}
      <div className="absolute top-32 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/10 blur-3xl" aria-hidden />


      <div className="relative max-w-6xl mx-auto text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary mb-8 hover:scale-[1.02] transition-transform duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Digital Growth Systems
        </div>

        <h1 id="hero-title" className="font-display text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight max-w-5xl mx-auto text-balance">
          Architecting{" "}
          <span className="text-shimmer">Digital Growth Systems</span>{" "}
          for Modern Businesses
        </h1>

        <p className="mt-6 sm:mt-7 text-foreground/70 text-[15px] sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-pretty">
          TrendFlux Ecosystem combines AI automation, paid media, content strategy,
          CRM workflows, and brand architecture to build scalable business growth ecosystems.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Button variant="hero" size="lg" className="w-full sm:w-auto">
            Explore Growth Systems
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Book Strategic Consultation
          </Button>
          <a
            href={ENTERPRISE.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("enterprise_portal_open", { location: "home_hero" })}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 text-primary hover:bg-accent hover:text-accent-foreground"
            aria-label="Open Enterprise Portal (opens in new tab)"
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Open Enterprise Portal
          </a>
        </div>

        {/* trust strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-foreground/40">
          <span>AI Automation</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Performance Media</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Brand Architecture</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Growth Analytics</span>
        </div>

        {/* Idol anchor — link to the dedicated story hub + share-card shortcut */}
        <div className="mt-12 mx-auto max-w-2xl">
          <Link
            to="/the-stand"
            onClick={() => track("the_stand_open", { location: "home_hero" })}
            className="group relative flex items-center gap-4 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/[0.08] via-gold/[0.04] to-transparent px-5 py-4 text-left transition-all hover:border-gold/70 hover:shadow-gold/40 hover:shadow-xl animate-pulse-soft"
          >
            <span aria-hidden className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-background">
              ★ Featured
            </span>
            <BookOpenText className="h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                একজন মানুষের অবস্থান, একটি জাতির বিবেক
              </p>
              <p lang="bn" className="mt-1 text-sm md:text-base font-medium text-foreground/85">
                Zahid Hasan Emon — &ldquo;মায়ের নিষেধ আছে&rdquo; থেকে জাতীয় দলিল পর্যন্ত
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/the-stand/share"
            onClick={() => track("the_stand_share_open", { location: "home_hero" })}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15 hover:border-gold/70"
            lang="bn"
          >
            <Share2 className="h-3.5 w-3.5" />
            শেয়ার কার্ড বানান · Quote Card Generator
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
