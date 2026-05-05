import { BrandShell } from "@/components/BrandShell";
import { Lock, Mail } from "lucide-react";

const LuxeVeil = () => {
  return (
    <BrandShell tier="private">
      <section className="pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-gold">
          <Lock className="w-3 h-3" /> Private · Invite Only
        </div>

        {/* Abstract veil mark */}
        <div className="mt-14 flex justify-center">
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 rounded-full border border-gold/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-44 h-44">
                <defs>
                  <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43 70% 70%)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="hsl(43 53% 45%)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* TF behind */}
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  fontFamily="serif"
                  fontWeight="700"
                  fontSize="110"
                  fill="hsl(43 53% 55% / 0.18)"
                >
                  TF
                </text>
                {/* Flowing veil silhouette */}
                <path
                  d="M100 30 C 70 60, 60 90, 75 120 C 85 145, 80 165, 100 175 C 120 165, 115 145, 125 120 C 140 90, 130 60, 100 30 Z"
                  fill="url(#veil)"
                  opacity="0.85"
                />
                <path
                  d="M100 35 C 85 70, 80 110, 100 170"
                  stroke="hsl(43 70% 75%)"
                  strokeWidth="0.6"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
            </div>
            <div className="absolute -inset-4 rounded-full bg-gold/15 blur-3xl -z-10" />
          </div>
        </div>

        <h1 className="mt-10 font-display text-5xl md:text-6xl font-bold tracking-[0.25em] text-gold">
          LUXE VEIL
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.4em] text-white/70">
          — A Private Experience by TrendFlux
        </p>

        <p className="mx-auto mt-10 max-w-xl text-base md:text-lg text-white/70 italic leading-relaxed">
          “Beyond visibility lies discretion. A quiet space, curated for those who already know.”
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href="mailto:zhemongrowth@gmail.com?subject=Luxe%20Veil%20Invitation%20Request"
            className="inline-flex items-center gap-2 border border-gold text-gold px-7 py-3 rounded-full font-semibold tracking-wider uppercase text-xs hover:bg-gold hover:text-[#07182e] transition"
          >
            <Mail className="w-4 h-4" /> Request Invitation
          </a>
        </div>
      </section>

      <section className="mt-14 mx-auto max-w-3xl rounded-3xl border border-gold/30 bg-gradient-to-br from-[#0b1f3a]/80 via-[#07182e]/90 to-[#0b1f3a]/80 backdrop-blur p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold/70">
          Selectively Curated · Strictly Private
        </p>
        <p className="mt-4 text-white/70 leading-relaxed">
          Luxe Veil is reserved for a small circle of clients seeking discretion,
          emotion, and craftsmanship at the highest level. Access is by invitation only.
        </p>
      </section>
    </BrandShell>
  );
};

export default LuxeVeil;
