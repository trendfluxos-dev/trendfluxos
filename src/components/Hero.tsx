import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useT, useLang } from "@/i18n";

const Hero = () => {
  const t = useT();
  const lang = useLang();
  return (
    <section className="relative pt-40 pb-28 px-6 lg:px-10 overflow-hidden" lang={lang}>
      <div className="absolute inset-0 hero-glow" aria-hidden />
      <div className="absolute inset-0 grid-dots opacity-40" aria-hidden />

      {/* floating orbs */}
      <div className="absolute top-32 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" aria-hidden />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/10 blur-3xl animate-float [animation-delay:2s]" aria-hidden />

      <div className="relative max-w-6xl mx-auto text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          {t.hero.badge}
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-5xl mx-auto">
          {t.hero.headline1}{" "}
          <span className="text-gradient">{t.hero.headline2}</span>{" "}
          {t.hero.headline3}
        </h1>

        <p className="mt-7 text-foreground/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {t.hero.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="hero" size="lg">
            {t.hero.ctaPrimary}
            <ArrowRight />
          </Button>
          <Button variant="outline" size="lg">
            {t.hero.ctaSecondary}
          </Button>
        </div>

        {/* trust strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-foreground/40">
          {t.hero.tags.map((tag, i) => (
            <span key={tag} className="contents">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-foreground/20" />}
              <span>{tag}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
