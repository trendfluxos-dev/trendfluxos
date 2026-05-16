import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { ENTERPRISE } from "@/config/enterprise";
import { track } from "@/lib/analytics";

const Hero = () => {
  return (
    <section className="relative pt-40 pb-28 px-6 lg:px-10 overflow-hidden">
      <div className="absolute inset-0 hero-glow" aria-hidden />
      <div className="absolute inset-0 grid-dots opacity-40" aria-hidden />

      {/* floating orbs */}
      <div className="absolute top-32 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" aria-hidden />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/10 blur-3xl animate-float [animation-delay:2s]" aria-hidden />

      <div className="relative max-w-6xl mx-auto text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary mb-8 hover:scale-[1.02] transition-transform duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Digital Growth Systems
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-5xl mx-auto">
          Architecting{" "}
          <span className="text-shimmer">Digital Growth Systems</span>{" "}
          for Modern Businesses
        </h1>

        <p className="mt-7 text-foreground/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          TrendFlux Ecosystem combines AI automation, paid media, content strategy,
          CRM workflows, and brand architecture to build scalable business growth ecosystems.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="hero" size="lg">
            Explore Growth Systems
            <ArrowRight />
          </Button>
          <Button variant="outline" size="lg">
            Book Strategic Consultation
          </Button>
          <a
            href={ENTERPRISE.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("enterprise_portal_open", { location: "home_hero" })}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 text-primary hover:bg-accent hover:text-accent-foreground"
          >
            <ShieldCheck className="w-4 h-4" />
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
      </div>
    </section>
  );
};

export default Hero;
