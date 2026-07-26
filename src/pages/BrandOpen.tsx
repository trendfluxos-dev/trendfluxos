import { BrandShell } from "@/components/BrandShell";
import { Megaphone, Sparkles, Zap } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { Testimonials } from "@/components/Testimonials";
import brandTokiLogo from "@/assets/brandtoki-logo.webp";

const BrandOpen = () => {
  useSeo({
    title: "Studio BrandToki — Helping Brands Tell Their Stories | TrendFlux",
    description:
      "Bold, communication-first storytelling for Bangladeshi brands. Modern geometry, flat gold, built for ads, social and mass reach.",
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Studio BrandToki",
    provider: { "@type": "Organization", name: "TrendFlux", url: "https://trendflux.digital" },
    serviceType: "Brand storytelling & mass-reach campaigns",
    areaServed: "Bangladesh",
    description: "Bold, communication-first brand storytelling for ads, social, and mass awareness.",
    url: typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined,
  });
  return (
    <BrandShell tier="open">
      <section className="relative pt-14 pb-10 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-10 h-72 brand-halftone opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          <svg className="absolute left-2 top-24 w-40 h-40 text-gold/40" viewBox="0 0 100 100" fill="none">
            <path d="M0 80 L80 0" stroke="currentColor" strokeWidth="0.6" />
            <path d="M10 90 L90 10" stroke="currentColor" strokeWidth="0.6" />
            <path d="M20 100 L100 20" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <svg className="absolute right-2 top-24 w-40 h-40 text-gold/40 -scale-x-100" viewBox="0 0 100 100" fill="none">
            <path d="M0 80 L80 0" stroke="currentColor" strokeWidth="0.6" />
            <path d="M10 90 L90 10" stroke="currentColor" strokeWidth="0.6" />
            <path d="M20 100 L100 20" stroke="currentColor" strokeWidth="0.6" />
          </svg>
        </div>

        <div className="relative inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold">
          <Megaphone className="w-3 h-3" /> Open · Mass Awareness
        </div>

        {/* Logo mark */}
        <div className="relative mt-10 flex flex-col items-center">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 blur-2xl bg-primary/15 rounded-full" />
            <img
              src={brandTokiLogo}
              alt="Studio BrandToki logo"
              className="relative w-28 h-28 md:w-32 md:h-32 object-contain mx-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
              loading="eager"
            />
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-6xl font-bold tracking-tight text-[#111111]">
            Studio <span className="text-primary">BrandToki</span>
          </h1>
          <p className="mt-4 text-sm md:text-base uppercase tracking-[0.3em] text-primary">
            Helping Brands Tell Their Stories
          </p>
        </div>

        <p className="relative mx-auto mt-10 max-w-xl text-base md:text-lg text-[#4B5563] leading-relaxed">
          Bold, communication-first storytelling for brands ready to be seen.
          Modern geometry, flat gold, and zero noise — built for ads, social, and mass reach.
        </p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { icon: Megaphone, t: "Mass Reach", d: "Campaigns engineered for scroll-stopping clarity." },
          { icon: Zap, t: "Bold Geometry", d: "Refined edges, balanced weight, instantly readable." },
          { icon: Sparkles, t: "Story First", d: "Every asset carries a story, not just a message." },
        ].map(({ icon: I, t, d }, i) => (
          <div
            key={t}
            className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 hover:border-[#111111] hover:-translate-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] transition-all"
          >
            <div aria-hidden className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
            <div className="flex items-center justify-between">
              <I className="w-5 h-5 text-gold" />
              <span className="font-display text-xs tracking-[0.3em] text-gold/60">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-[#111111]">{t}</h3>
            <p className="mt-1 text-sm text-[#4B5563]">{d}</p>
          </div>
        ))}
      </section>

      {/* Marquee strip */}
      <div className="brand-marquee mt-12 overflow-hidden border-y border-[#E5E7EB] py-3">
        <div className="brand-marquee-track flex gap-10 whitespace-nowrap text-[11px] uppercase tracking-[0.45em] text-gold/70">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-10 shrink-0">
              {["BOLD", "CLEAR", "LOUD", "SEEN", "FELT", "SCROLL-STOPPING", "BANGLA · ENGLISH", "BUILT TO BE SHARED"].map((w) => (
                <span key={w} className="flex items-center gap-10">
                  {w} <span className="text-gold/40">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Testimonials
        items={[
          {
            quote: "Studio BrandToki turned our Eid campaign into a city-wide conversation. Reach tripled in 10 days.",
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
