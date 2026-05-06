import { useEffect, useState } from "react";
import { BrandShell } from "@/components/BrandShell";
import { Lock, Mail, KeyRound, Loader2 } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { Testimonials } from "@/components/Testimonials";
import { z } from "zod";

const VALID_CODES = ["LUXE2026", "VEIL-INVITE", "TRENDFLUX-PRIVATE"];
const STORAGE_KEY = "luxe_veil_unlocked";

const requestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(160),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(800),
});

const LuxeVeil = () => {
  useSeo({
    title: "Luxe Veil — A Private Experience by TrendFlux",
    description:
      "An invite-only sanctuary for discerning clients. Luxe Veil is the private tier of the TrendFlux ecosystem — discretion, emotion, and craftsmanship.",
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Luxe Veil",
    provider: { "@type": "Organization", name: "TrendFlux" },
    serviceType: "Private, invite-only brand experience",
    areaServed: "Worldwide",
    description: "Invitation-only premium brand experience by TrendFlux for discerning clients.",
    url: typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined,
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
      <section className="relative pt-16 pb-12 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] brand-silk rounded-[2rem]" />
        {/* Floating particles */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { l: "12%", t: "30%", dx: "20px", dy: "-80px", dur: "14s", d: "0s" },
            { l: "82%", t: "22%", dx: "-25px", dy: "-90px", dur: "16s", d: "2s" },
            { l: "30%", t: "70%", dx: "30px", dy: "-110px", dur: "18s", d: "4s" },
            { l: "70%", t: "65%", dx: "-15px", dy: "-100px", dur: "15s", d: "1s" },
            { l: "50%", t: "40%", dx: "10px", dy: "-120px", dur: "20s", d: "3s" },
            { l: "20%", t: "55%", dx: "-20px", dy: "-90px", dur: "17s", d: "5s" },
          ].map((p, i) => (
            <span
              key={i}
              className="brand-particle absolute block w-1 h-1 rounded-full bg-gold/70"
              style={{ left: p.l, top: p.t, ["--dx" as never]: p.dx, ["--dy" as never]: p.dy, ["--dur" as never]: p.dur, ["--delay" as never]: p.d }}
            />
          ))}
        </div>

        <div className="relative inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-gold">
          <Lock className="w-3 h-3" /> Private · Invite Only
        </div>

        <div className="relative mt-14 flex justify-center">
          <div className="relative w-56 h-56 brand-pulse-soft">
            <div className="absolute inset-0 rounded-full border border-gold/60" />
            <div className="absolute inset-3 rounded-full border border-gold/25" />
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

        <h1 className="relative mt-10 font-display text-5xl md:text-6xl font-bold tracking-[0.25em] text-gold">
          LUXE VEIL
        </h1>
        <p className="relative mt-4 text-sm uppercase tracking-[0.4em] text-white/70">
          — A Private Experience by TrendFlux
        </p>
        <p className="relative mx-auto mt-10 max-w-xl text-base md:text-lg text-white/70 italic leading-relaxed">
          "Beyond visibility lies discretion. A quiet space, curated for those who already know."
        </p>
      </section>

      {!unlocked ? (
        <section className="relative mx-auto max-w-md rounded-3xl border border-gold/40 bg-[#07182e]/70 backdrop-blur p-8 text-center">
          {/* Inner hairline + corner crests */}
          <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.4rem] border border-gold/15" />
          <span aria-hidden className="absolute -top-2 left-1/2 -translate-x-1/2 text-gold/70 text-xs">◆</span>
          <span aria-hidden className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-gold/70 text-xs">◆</span>

          <KeyRound className="relative w-6 h-6 text-gold mx-auto" />
          <h2 className="relative mt-3 font-display text-xl text-white">Enter your invitation</h2>
          <p className="relative mt-2 text-xs text-white/55">
            Access to Luxe Veil is granted by code. Don't have one? Request below.
          </p>
          <form onSubmit={tryUnlock} className="relative mt-5 space-y-3">
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

          {/* Ornamental separator */}
          <div className="relative mt-7 flex items-center gap-3 text-gold/60">
            <span className="text-xs">◆</span>
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <span className="text-xs">◆</span>
          </div>

          <RequestInviteForm />
        </section>
      ) : (
        <>
          <LuxeVeilExperience />

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

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RequestInviteForm = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", reference: "", message: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});

  if (done) {
    return (
      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold">
        ✓ Request received — we'll be in touch privately.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold/80 hover:text-gold"
      >
        <Mail className="w-3 h-3" /> Request Invitation
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = requestSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrs(fe);
      return;
    }
    setErrs({});
    setSubmitting(true);
    try {
      const { error } = await supabase.from("luxe_veil_requests").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        reference: parsed.data.reference || null,
        message: parsed.data.message,
      });
      if (error) throw error;
      // Best-effort email notification (no-op if function not deployed yet)
      supabase.functions
        .invoke("send-luxe-veil-request", { body: parsed.data })
        .catch(() => undefined);
      setDone(true);
    } catch {
      toast({ title: "Could not submit", description: "Please try again or email zhemongrowth@gmail.com.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const field = "w-full bg-transparent border border-gold/30 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30";

  return (
    <form onSubmit={submit} className="mt-6 text-left space-y-3">
      <div>
        <input className={field} placeholder="Your name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errs.name && <p className="mt-1 text-[11px] text-red-300">{errs.name}</p>}
      </div>
      <div>
        <input type="email" className={field} placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errs.email && <p className="mt-1 text-[11px] text-red-300">{errs.email}</p>}
      </div>
      <input className={field} placeholder="Referred by (optional)" value={form.reference}
        onChange={(e) => setForm({ ...form, reference: e.target.value })} />
      <div>
        <textarea rows={4} className={field} placeholder="Briefly, why Luxe Veil?" value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {errs.message && <p className="mt-1 text-[11px] text-red-300">{errs.message}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold text-[#07182e] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
        Submit Request
      </button>
    </form>
  );
};

export default LuxeVeil;
