import { BrandShell } from "@/components/BrandShell";
import { Camera, Users, Sparkles, ArrowUpRight } from "lucide-react";

const TrendfluxTalent = () => {
  return (
    <BrandShell tier="platform">
      <section className="pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold">
          <Users className="w-3 h-3" /> Platform · Creator Network
        </div>

        {/* Monogram lens mark */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-44 h-44">
            <div className="absolute inset-0 rounded-full border border-gold/70" />
            <div className="absolute inset-2 rounded-full border border-gold/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-gold tracking-tighter">
                TF
              </span>
            </div>
            <div className="absolute -inset-2 rounded-full bg-gold/10 blur-2xl -z-10" />
          </div>
        </div>

        <h1 className="mt-8 font-display text-4xl md:text-5xl font-bold tracking-[0.2em] text-white">
          TRENDFLUX <span className="text-gold">TALENT</span>
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.35em] text-gold/80">
          Brand Promoters &amp; Creator Community BD
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/55">
          AI-Powered Creator-Led Growth
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="#join"
            className="inline-flex items-center gap-2 bg-gold text-[#07182e] px-6 py-3 rounded-full font-bold hover:opacity-90 transition"
          >
            Join the Network <ArrowUpRight className="w-4 h-4" />
          </a>
          <a
            href="#brands"
            className="inline-flex items-center gap-2 border border-gold/60 text-gold px-6 py-3 rounded-full font-bold hover:bg-gold hover:text-[#07182e] transition"
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
            className="rounded-2xl border border-gold/25 bg-gradient-to-b from-white/[0.05] to-transparent p-6 hover:border-gold/60 transition"
          >
            <I className="w-5 h-5 text-gold" />
            <h3 className="mt-3 font-semibold text-white">{t}</h3>
            <p className="mt-1 text-sm text-white/60">{d}</p>
          </div>
        ))}
      </section>

      <section id="join" className="mt-12 rounded-3xl border border-gold/30 bg-white/[0.04] p-8 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-white">
          Become part of the next wave of <span className="text-gold">creator-led</span> brands.
        </h2>
        <p className="mt-3 text-white/60 max-w-2xl mx-auto">
          A platform built for serious creators and serious brands — luxury, system, authority.
        </p>
      </section>
    </BrandShell>
  );
};

export default TrendfluxTalent;
