import { BrandShell } from "@/components/BrandShell";
import { Camera, Users, Sparkles, ArrowUpRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { Testimonials } from "@/components/Testimonials";

const TrendfluxTalent = () => {
  useSeo({
    title: "TrendFlux Talent — Brand Promoters & Creator Community BD",
    description:
      "AI-powered creator-led growth for Bangladeshi brands. A curated network of promoters, models and digital storytellers in Dhaka.",
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TrendFlux Talent",
    alternateName: "Brand Promoters & Creator Community BD",
    url: typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined,
    description: "AI-powered creator-led growth platform connecting Bangladeshi brands with curated promoters, models, and digital storytellers.",
    areaServed: "Bangladesh",
    parentOrganization: { "@type": "Organization", name: "TrendFlux" },
  });
  return (
    <BrandShell tier="platform">
      <section className="pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold">
          <Users className="w-3 h-3" /> Platform · Creator Network
        </div>

        {/* Monogram lens mark */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-44 h-44">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, hsl(var(--gold) / 0.0), hsl(var(--gold) / 0.35), hsl(var(--gold) / 0.0) 60%)",
                filter: "blur(18px)",
              }}
            />
            <div className="absolute inset-0 rounded-full border border-[#E5E7EB]" />
            <div className="absolute inset-2 rounded-full border border-[#E5E7EB]" />
            {/* Outer ticked ring */}
            <svg
              viewBox="0 0 100 100"
              className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] brand-spin-slower text-gold/50"
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" />
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="2"
                  x2="50"
                  y2={i % 6 === 0 ? "6" : "4"}
                  stroke="currentColor"
                  strokeWidth="0.4"
                  transform={`rotate(${i * 15} 50 50)`}
                />
              ))}
            </svg>
            {/* Orbit dot */}
            <div aria-hidden className="absolute inset-0 flex items-center justify-center">
              <span className="block w-2 h-2 rounded-full bg-gold shadow-[0_0_12px_hsl(var(--gold)/0.8)] brand-orbit-dot" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-gold tracking-tighter">
                TF
              </span>
            </div>
            <div className="absolute -inset-2 rounded-full bg-gold/10 blur-2xl -z-10" />
          </div>
        </div>

        <h1 className="mt-8 font-display text-4xl md:text-5xl font-bold tracking-[0.2em] text-[#111111]">
          TRENDFLUX <span className="text-gold">TALENT</span>
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.35em] text-gold/80">
          Brand Promoters &amp; Creator Community BD
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#4B5563]">
          AI-Powered Creator-Led Growth
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="#join"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:bg-[hsl(var(--primary-glow))] transition"
          >
            Join the Network <ArrowUpRight className="w-4 h-4" />
          </a>
          <a
            href="#brands"
            className="inline-flex items-center gap-2 border border-primary/60 text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-primary-foreground transition"
          >
            For Brands
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: Users, t: "Curated Creators", d: "Hand-picked voices across niches and verticals." },
          { icon: Camera, t: "Studio-Grade Output", d: "Cinematic content built for performance." },
          { icon: Sparkles, t: "AI-Powered Matching", d: "Smart pairing of brands with the right talent." },
        ].map(({ icon: I, t, d }) => (
          <div
            key={t}
            className="brand-card-gradient-border rounded-2xl p-6 hover:-translate-y-0.5 transition-transform"
          >
            <I className="w-5 h-5 text-gold" />
            <h3 className="mt-3 font-semibold text-[#111111]">{t}</h3>
            <p className="mt-1 text-sm text-[#4B5563]">{d}</p>
          </div>
        ))}
      </section>

      <section id="join" className="relative mt-12 rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center">
        {/* Corner brackets */}
        <span aria-hidden className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#E5E7EB]" />
        <span aria-hidden className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#E5E7EB]" />
        <span aria-hidden className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#E5E7EB]" />
        <span aria-hidden className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#E5E7EB]" />
        <h2 className="font-display text-2xl md:text-3xl text-[#111111]">
          Become part of the next wave of <span className="text-gold">creator-led</span> brands.
        </h2>
        <p className="mt-3 text-[#4B5563] max-w-2xl mx-auto">
          A platform built for serious creators and serious brands — luxury, system, authority.
        </p>
      </section>
      <Testimonials
        title="Creators & Brands Already Inside"
        items={[
          {
            quote: "Onboarding to TrendFlux Talent connected us with three creators who actually understood our brand voice.",
            name: "Nazia Rahman",
            role: "Co-founder, Banani Skincare Studio",
            outcome: "12 UGC pieces in 3 weeks",
          },
          {
            quote: "The AI matching saved us months of manual scouting. We launched in Dhaka and ranked top 5 in our niche.",
            name: "Imran Chowdhury",
            role: "Growth Lead, Uttara D2C Brand",
            outcome: "5× ROAS on first campaign",
          },
          {
            quote: "As a creator, this is the first platform that treated me like a partner, not a freelancer.",
            name: "Mehzabin Akter",
            role: "Lifestyle Creator, 180k followers · Dhaka",
            outcome: "4 long-term brand deals signed",
          },
        ]}
      />
    </BrandShell>
  );
};

export default TrendfluxTalent;
