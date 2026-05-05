import { useEffect, useState } from "react";
import { BrandShell } from "@/components/BrandShell";
import { Lock, Mail, KeyRound } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Testimonials } from "@/components/Testimonials";

const VALID_CODES = ["LUXE2026", "VEIL-INVITE", "TRENDFLUX-PRIVATE"];
const STORAGE_KEY = "luxe_veil_unlocked";

const LuxeVeil = () => {
  useSeo({
    title: "Luxe Veil — A Private Experience by TrendFlux",
    description:
      "An invite-only sanctuary for discerning clients. Luxe Veil is the private tier of the TrendFlux ecosystem — discretion, emotion, and craftsmanship.",
  });

  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_CODES.includes(code.trim().toUpperCase())) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Invalid invitation code. Please check with your host.");
    }
  };

  return (
    <BrandShell tier="private">
      <section className="pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-gold">
          <Lock className="w-3 h-3" /> Private · Invite Only
        </div>

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
                <text x="50%" y="58%" textAnchor="middle" fontFamily="serif" fontWeight="700" fontSize="110" fill="hsl(43 53% 55% / 0.18)">TF</text>
                <path d="M100 30 C 70 60, 60 90, 75 120 C 85 145, 80 165, 100 175 C 120 165, 115 145, 125 120 C 140 90, 130 60, 100 30 Z" fill="url(#veil)" opacity="0.85" />
                <path d="M100 35 C 85 70, 80 110, 100 170" stroke="hsl(43 70% 75%)" strokeWidth="0.6" fill="none" opacity="0.7" />
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
      </section>

      {!unlocked ? (
        <section className="mx-auto max-w-md rounded-3xl border border-gold/40 bg-[#07182e]/70 backdrop-blur p-8 text-center">
          <KeyRound className="w-6 h-6 text-gold mx-auto" />
          <h2 className="mt-3 font-display text-xl text-white">Enter your invitation</h2>
          <p className="mt-2 text-xs text-white/55">
            Access to Luxe Veil is granted by code. Don't have one? Request below.
          </p>
          <form onSubmit={tryUnlock} className="mt-5 space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="INVITE CODE"
              aria-label="Invitation code"
              className="w-full bg-transparent border border-gold/40 focus:border-gold rounded-full px-5 py-3 text-center tracking-[0.3em] uppercase text-sm text-white outline-none"
            />
            {error && <p className="text-xs text-red-300">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gold text-[#07182e] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition"
            >
              Unlock Experience
            </button>
          </form>
          <a
            href="mailto:zhemongrowth@gmail.com?subject=Luxe%20Veil%20Invitation%20Request"
            className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold/80 hover:text-gold"
          >
            <Mail className="w-3 h-3" /> Request Invitation
          </a>
        </section>
      ) : (
        <>
          <section className="mt-2 mx-auto max-w-3xl rounded-3xl border border-gold/30 bg-gradient-to-br from-[#0b1f3a]/80 via-[#07182e]/90 to-[#0b1f3a]/80 backdrop-blur p-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gold/70">
              Welcome · Selectively Curated
            </p>
            <p className="mt-4 text-white/75 leading-relaxed">
              Luxe Veil is reserved for a small circle of clients seeking discretion,
              emotion, and craftsmanship at the highest level. Your access has been recognised.
            </p>
          </section>

          <Testimonials
            title="Whispers from Inside the Veil"
            items={[
              {
                quote: "Discretion was non-negotiable. Luxe Veil delivered an experience that felt entirely ours.",
                name: "Private Client · Gulshan",
                role: "Family Office, Dhaka",
                outcome: "Bespoke 6-month engagement",
              },
              {
                quote: "Every touchpoint was considered — from first call to final reveal. This is craftsmanship.",
                name: "Private Client · Banani",
                role: "Luxury Hospitality Founder",
                outcome: "Brand reborn under NDA",
              },
              {
                quote: "Most agencies sell loud. Luxe Veil sold us silence — and it was exactly what we needed.",
                name: "Private Client · Baridhara",
                role: "Heritage Family Brand",
                outcome: "Legacy positioning rebuilt",
              },
            ]}
          />
        </>
      )}
    </BrandShell>
  );
};

export default LuxeVeil;
