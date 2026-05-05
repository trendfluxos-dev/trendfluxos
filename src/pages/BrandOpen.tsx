import { BrandShell } from "@/components/BrandShell";
import { Megaphone, Sparkles, Zap } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { Testimonials } from "@/components/Testimonials";

const BrandOpen = () => {
  useSeo({
    title: "Brand Tok — Helping Brands Tell Their Stories | TrendFlux",
    description:
      "Bold, communication-first storytelling for Bangladeshi brands. Modern geometry, flat gold, built for ads, social and mass reach.",
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Brand Tok",
    provider: { "@type": "Organization", name: "TrendFlux", url: "https://trendfluxdigital.lovable.app" },
    serviceType: "Brand storytelling & mass-reach campaigns",
    areaServed: "Bangladesh",
    description: "Bold, communication-first brand storytelling for ads, social, and mass awareness.",
    url: typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined,
  });
  return (
    <BrandShell tier="open">
      <section className="pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold">
          <Megaphone className="w-3 h-3" /> Open · Mass Awareness
        </div>

        {/* Logo mark */}
        <div className="mt-10 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full" />
            <div className="relative flex items-end justify-center">
              <span className="font-display text-6xl md:text-7xl font-bold text-white tracking-tight">
                Brand
              </span>
            </div>
            <div className="relative mt-2 inline-flex items-center justify-center bg-gold text-[#07182e] px-6 py-3 rounded-md shadow-[0_8px_30px_rgba(200,169,81,0.35)]">
              <span className="font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
                ব্র্যান্ড
              </span>
              <Megaphone className="w-7 h-7 ml-3" strokeWidth={2.4} />
            </div>
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-gold/80">
            Helping Brands Tell Their Stories
          </p>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-base md:text-lg text-white/75 leading-relaxed">
          Bold, communication-first storytelling for brands ready to be seen.
          Modern geometry, flat gold, and zero noise — built for ads, social, and mass reach.
        </p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { icon: Megaphone, t: "Mass Reach", d: "Campaigns engineered for scroll-stopping clarity." },
          { icon: Zap, t: "Bold Geometry", d: "Refined edges, balanced weight, instantly readable." },
          { icon: Sparkles, t: "Story First", d: "Every asset carries a story, not just a message." },
        ].map(({ icon: I, t, d }) => (
          <div
            key={t}
            className="rounded-2xl border border-gold/20 bg-white/[0.04] p-5 hover:border-gold/50 transition"
          >
            <I className="w-5 h-5 text-gold" />
            <h3 className="mt-3 font-semibold text-white">{t}</h3>
            <p className="mt-1 text-sm text-white/60">{d}</p>
          </div>
        ))}
      </section>
      <Testimonials
        items={[
          {
            quote: "Brand Tok turned our Eid campaign into a city-wide conversation. Reach tripled in 10 days.",
            name: "Tanvir Ahmed",
            role: "Founder, Dhanmondi Apparel · Dhaka",
            outcome: "3.2× organic reach in 10 days",
          },
          {
            quote: "The visual system finally made our brand feel premium without losing mass appeal.",
            name: "Rumana Karim",
            role: "Marketing Lead, Gulshan F&B Co.",
            outcome: "+47% engagement on launch reel",
          },
          {
            quote: "From scroll-stopping reels to OOH — every asset spoke the same language.",
            name: "Sakib Hossain",
            role: "Brand Manager, Bashundhara Retail",
            outcome: "2.1× CTR on paid social",
          },
        ]}
      />
    </BrandShell>
  );
};

export default BrandOpen;
