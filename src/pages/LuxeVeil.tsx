import { useEffect, useState } from "react";
import luxeVeilSpa from "@/assets/luxe-veil-spa.jpg";
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

const PHONE = "+8801972813761";
const TELEGRAM = "https://t.me/luxe_veil";
const TELEGRAM_GROUP = "https://t.me/+GAMSK09w_6Q3MGQ1";

const buildTelegramMessage = (d: { name: string; whatsapp: string; message?: string }) => {
  const lines = [
    "🌸 New Luxe Veil Inquiry",
    `👤 Name: ${d.name}`,
    `📱 WhatsApp: ${d.whatsapp}`,
  ];
  if (d.message) lines.push(`💬 Message: ${d.message}`);
  return lines.join("\n");
};

const telegramShareUrl = (text: string) =>
  `https://t.me/share/url?url=${encodeURIComponent(TELEGRAM_GROUP)}&text=${encodeURIComponent(text)}`;

const sendToTelegram = async (
  data: { name: string; whatsapp: string; message?: string },
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { data: res, error } = await supabase.functions.invoke("telegram-submit", {
      body: data,
    });
    if (error) return { ok: false, error: error.message };
    if (res && res.ok) return { ok: true };
    return { ok: false, error: (res && res.error) || "Failed to send" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
};

const EntryPopup = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("luxe_veil_entry_seen") === "1") return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const close = () => {
    sessionStorage.setItem("luxe_veil_entry_seen", "1");
    setOpen(false);
  };

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const wa = form.whatsapp.trim();
    if (name.length < 2) return setErr("Please enter your name");
    if (!/^[+\d][\d\s-]{6,}$/.test(wa)) return setErr("Please enter a valid WhatsApp number");
    setErr("");
    setSending(true);
    const res = await sendToTelegram({ name, whatsapp: wa });
    setSending(false);
    if (!res.ok) return setErr(res.error || "Could not send. Please try again.");
    try {
      const lead = { name, whatsapp: wa, ts: new Date().toISOString() };
      const list = JSON.parse(localStorage.getItem("luxe_veil_leads") || "[]");
      list.push(lead);
      localStorage.setItem("luxe_veil_leads", JSON.stringify(list));
    } catch {}
    sessionStorage.setItem("luxe_veil_entry_seen", "1");
    setSent(true);
    setTimeout(() => setOpen(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-[#07182e] p-7 text-center shadow-2xl">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-4 text-gold/60 hover:text-gold text-xl leading-none"
        >
          ×
        </button>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/80">🌸 Welcome to Luxe Veil</p>
        <h3 className="mt-3 font-display text-xl text-white">Connect with us privately</h3>
        <p className="mt-2 text-xs text-white/60">
          Share your details — our concierge will reach out shortly.
        </p>
        {sent ? (
          <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
            ✓ Sent — your details are with our team.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3 text-left">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full bg-transparent border border-gold/30 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
            />
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="WhatsApp number"
              inputMode="tel"
              className="w-full bg-transparent border border-gold/30 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
            />
            {err && <p className="text-[11px] text-red-300">{err}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-gold text-[#07182e] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="w-3 h-3 animate-spin" />}
              {sending ? "Sending…" : "Send to Concierge"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const ContactForm = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", whatsapp: "", message: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const wa = form.whatsapp.trim();
    const msg = form.message.trim();
    if (name.length < 2) return setErr("Please enter your name");
    if (!/^[+\d][\d\s-]{6,}$/.test(wa)) return setErr("Please enter a valid WhatsApp number");
    if (msg.length < 5) return setErr("Please add a short message");
    setErr("");
    try {
      const lead = { name, whatsapp: wa, message: msg, ts: new Date().toISOString() };
      const list = JSON.parse(localStorage.getItem("luxe_veil_contacts") || "[]");
      list.push(lead);
      localStorage.setItem("luxe_veil_contacts", JSON.stringify(list));
    } catch {}
    sendToTelegram({ name, whatsapp: wa, message: msg });
    toast({ title: "Opening Telegram", description: "Your message is copied — redirecting to the group." });
    setDone(true);
    setForm({ name: "", whatsapp: "", message: "" });
    setTimeout(() => {
      window.location.href = TELEGRAM_GROUP;
    }, 1200);
  };

  if (done) {
    return (
      <div className="mt-6 rounded-2xl border border-gold/40 bg-[#07182e]/70 p-6 text-center">
        <p className="text-sm text-gold uppercase tracking-[0.25em]">✓ Thank you</p>
        <p className="mt-2 text-xs text-white/70">Your request has been received. We'll reach out shortly.</p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 text-[11px] uppercase tracking-[0.3em] text-gold/80 hover:text-gold"
        >
          Send another
        </button>
      </div>
    );
  }

  const field = "w-full bg-transparent border border-gold/30 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30";

  return (
    <form onSubmit={submit} className="mt-6 mx-auto max-w-md text-left space-y-3">
      <input className={field} placeholder="Your name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={field} placeholder="WhatsApp number" inputMode="tel" value={form.whatsapp}
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
      <textarea rows={3} className={field} placeholder="How can we help?" value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {err && <p className="text-[11px] text-red-300">{err}</p>}
      <button
        type="submit"
        className="w-full bg-gold text-[#07182e] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition"
      >
        Send Message
      </button>
    </form>
  );
};

type Service = { name: string; desc: string; tiers: { dur: string; price: string }[] };

const MASSAGES: Service[] = [
  { name: "Swedish Massage", desc: "Full-body relaxation to ease stress", tiers: [{ dur: "30 min", price: "4,000৳" }, { dur: "60 min", price: "7,000৳" }] },
  { name: "Aromatherapy Massage", desc: "Essential oils for deep calm & balance", tiers: [{ dur: "60 min", price: "7,500৳" }] },
  { name: "Deep Tissue Massage", desc: "Targets muscle stiffness & pain relief", tiers: [{ dur: "30 min", price: "5,000৳" }, { dur: "60 min", price: "9,000৳" }] },
  { name: "Thai Massage", desc: "Stretching & pressure for flexibility and energy", tiers: [{ dur: "30 min", price: "4,500৳" }, { dur: "60 min", price: "9,000৳" }] },
  { name: "Hot Stone Massage", desc: "Warm therapy to melt away stress", tiers: [{ dur: "30 min", price: "4,500৳" }, { dur: "60 min", price: "8,500৳" }] },
  { name: "Couple Massage", desc: "Shared relaxation in a calming environment", tiers: [{ dur: "30 min", price: "5,000৳" }, { dur: "60 min", price: "9,500৳" }] },
];

const SPECIALTY: Service[] = [
  { name: "Body Scrub & Spa", desc: "Skin renewal for a smooth, radiant glow", tiers: [{ dur: "60 min", price: "8,000৳" }, { dur: "90 min", price: "12,000৳" }] },
  { name: "Shiatsu Massage", desc: "Precision Japanese pressure-point therapy", tiers: [{ dur: "60 min", price: "7,500৳" }] },
  { name: "Ayurvedic Massage", desc: "Herbal oil detox and relaxation", tiers: [{ dur: "90 min", price: "10,500৳" }] },
  { name: "Lomi Lomi Massage", desc: "Flowing Hawaiian therapy for deep relaxation", tiers: [{ dur: "90 min", price: "11,500৳" }] },
  { name: "Sports Massage", desc: "Recovery-focused muscle therapy", tiers: [{ dur: "60 min", price: "7,500৳" }] },
  { name: "Bamboo Massage", desc: "Heated bamboo technique for circulation", tiers: [{ dur: "90 min", price: "10,000৳" }] },
];

const SIGNATURE: Service[] = [
  { name: "Dry / Thai Massage", desc: "Signature dry & Thai technique", tiers: [{ dur: "30 min", price: "4,000৳" }, { dur: "60 min", price: "7,500৳" }, { dur: "90 min", price: "11,000৳" }] },
  { name: "Thai Oil & Aroma Massage", desc: "Aromatic oils with Thai pressure", tiers: [{ dur: "30 min", price: "4,500৳" }, { dur: "60 min", price: "8,500৳" }, { dur: "90 min", price: "12,000৳" }] },
  { name: "Body to Body (B2B) Massage", desc: "Premium signature body therapy", tiers: [{ dur: "30 min", price: "5,000৳" }, { dur: "60 min", price: "9,500৳" }, { dur: "90 min", price: "13,000৳" }] },
];

const ServiceGrid = ({ items }: { items: Service[] }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((s) => (
      <div key={s.name} className="relative rounded-2xl border border-gold/25 bg-[#07182e]/60 p-5 hover:border-gold/60 transition">
        <h4 className="font-display text-lg text-gold">{s.name}</h4>
        <p className="mt-1 text-xs text-white/60 leading-relaxed">{s.desc}</p>
        <ul className="mt-3 space-y-1 text-sm text-white/85">
          {s.tiers.map((t) => (
            <li key={t.dur} className="flex items-center justify-between border-t border-gold/10 pt-1.5">
              <span className="text-white/60">⏱ {t.dur}</span>
              <span className="font-semibold text-gold">{t.price}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const SectionHeader = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="text-center mb-8">
    <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70">{eyebrow}</p>
    <h3 className="mt-2 font-display text-2xl md:text-3xl text-white">{title}</h3>
    <span className="mt-3 inline-block w-16 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
  </div>
);

const CopyPhoneButton = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PHONE);
      setCopied(true);
      toast({ title: "Phone copied", description: PHONE });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", description: PHONE, variant: "destructive" });
    }
  };
  return (
    <button
      onClick={copy}
      className="border border-gold/60 text-gold px-6 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold/10 transition"
    >
      {copied ? "✓ Copied" : "📋 Copy Phone"}
    </button>
  );
};

const LuxeVeilExperience = () => (
  <div className="space-y-16">
    <EntryPopup />
    {/* Welcome / Hero */}
    <section className="relative mx-auto max-w-4xl rounded-3xl border border-gold/30 overflow-hidden">
      <img src={luxeVeilSpa} alt="Luxe Veil spa interior" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a]/85 via-[#07182e]/80 to-[#0b1f3a]/90" />
      <div className="relative p-8 md:p-12 text-center">
      <span aria-hidden className="absolute top-3 left-3 w-5 h-5 border-t border-l border-gold/60" />
      <span aria-hidden className="absolute top-3 right-3 w-5 h-5 border-t border-r border-gold/60" />
      <span aria-hidden className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-gold/60" />
      <span aria-hidden className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold/60" />
      <p className="text-[11px] uppercase tracking-[0.4em] text-gold/80">Relax · Refresh · Rejuvenate 🌸</p>
      <h2 className="mt-4 font-display text-3xl md:text-4xl text-white leading-tight">
        Your Private Sanctuary of <span className="text-gold">Relaxation & Wellness</span> 🌿
      </h2>
      <p className="mt-5 text-white/70 leading-relaxed max-w-xl mx-auto">
        Step away from the noise of everyday life and enter a refined space of calm,
        comfort, and care at LUXE VEIL. Every experience is crafted to restore balance,
        ease tension, and elevate your well-being.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
        <span>💆‍♀️ Feel the calm.</span>
        <span>💆‍♂️ Feel the care.</span>
        <span>✨ Feel renewed.</span>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href={TELEGRAM} target="_blank" rel="noreferrer" className="bg-gold text-[#07182e] px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition">
          📞 Contact
        </a>
        <CopyPhoneButton />
      </div>
      </div>
    </section>

    {/* About */}
    <section className="mx-auto max-w-3xl text-center">
      <SectionHeader eyebrow="About Us" title="Wellness is essential — not optional" />
      <p className="text-white/70 leading-relaxed">
        At LUXE VEIL, we focus on delivering a discreet, premium experience designed to
        reduce stress, release deep muscle tension, improve circulation, and restore
        energy & mental clarity.
      </p>
      <ul className="mt-5 grid sm:grid-cols-2 gap-3 text-sm text-white/80 text-left max-w-md mx-auto">
        <li className="flex gap-2"><span className="text-gold">✦</span> Reduce stress</li>
        <li className="flex gap-2"><span className="text-gold">✦</span> Release deep muscle tension</li>
        <li className="flex gap-2"><span className="text-gold">✦</span> Improve circulation</li>
        <li className="flex gap-2"><span className="text-gold">✦</span> Restore energy & clarity</li>
      </ul>
      
    </section>

    {/* Massage Therapies */}
    <section>
      <SectionHeader eyebrow="🌿 Massage Therapies" title="Our Services" />
      <ServiceGrid items={MASSAGES} />
    </section>

    {/* Specialty */}
    <section>
      <SectionHeader eyebrow="🌺 Specialty & Premium" title="Premium Treatments" />
      <ServiceGrid items={SPECIALTY} />
    </section>

    {/* Signature */}
    <section>
      <SectionHeader eyebrow="💆 Signature" title="Signature Packages" />
      <ServiceGrid items={SIGNATURE} />
    </section>

    {/* Why Choose */}
    <section className="mx-auto max-w-3xl">
      <SectionHeader eyebrow="Why Choose" title="Why LUXE VEIL" />
      <ul className="grid sm:grid-cols-2 gap-3 text-sm text-white/85">
        {[
          "Skilled & professional therapists",
          "Clean, discreet & শান্ত পরিবেশ",
          "Premium experience with fair pricing",
          "সহজ বুকিং (Call / WhatsApp)",
          "Privacy-focused service",
        ].map((w) => (
          <li key={w} className="flex gap-2 items-start rounded-xl border border-gold/20 bg-[#07182e]/50 p-4">
            <span className="text-gold">✔</span>
            <span lang={/[\u0980-\u09FF]/.test(w) ? "bn" : undefined}>{w}</span>
          </li>
        ))}
      </ul>
    </section>

    {/* CTA */}
    <section id="contact" className="relative mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-gradient-to-br from-[#0b1f3a]/80 to-[#07182e]/90 p-8 text-center scroll-mt-24">
      <p className="text-[11px] uppercase tracking-[0.4em] text-gold/80">💌 Book Your Experience</p>
      <h3 className="mt-3 font-display text-2xl text-white">Reserve Your Sanctuary</h3>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={TELEGRAM} target="_blank" rel="noreferrer" className="bg-gold text-[#07182e] px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition">
          ✈️ Contact on Telegram
        </a>
        <CopyPhoneButton />
      </div>
      <ContactForm />
    </section>

    {/* Bangla */}
    <section lang="bn" className="mx-auto max-w-2xl text-center rounded-3xl border border-gold/25 bg-[#07182e]/50 p-8">
      <p className="text-[11px] uppercase tracking-[0.35em] text-gold/70">বাংলায়</p>
      <h3 className="mt-3 font-display text-2xl text-white">আরাম, প্রশান্তি আর নতুন উদ্যম ✨</h3>
      <p className="mt-4 text-white/75 leading-relaxed">
        সারা দিনের ক্লান্তি দূর করতে চলে আসুন LUXE VEIL-এ।
        আপনার শরীর ও মনকে নতুন করে অনুভব করুন আমাদের প্রিমিয়াম সার্ভিসের মাধ্যমে।
      </p>
      <p className="mt-4 text-sm text-gold/90">
        🌿 রিল্যাক্স করুন • রিফ্রেশ হোন • নিজেকে নতুনভাবে আবিষ্কার করুন
      </p>
    </section>

    {/* Footer */}
    <footer className="text-center pt-6 pb-2 border-t border-gold/15">
      <p className="font-display text-lg text-gold tracking-[0.3em]">LUXE VEIL</p>
      <p className="mt-1 text-xs text-white/60">Luxury Spa & Wellness Experience 🌺</p>
      <p className="mt-2 text-xs text-white/70">📞 {PHONE}</p>
    </footer>
  </div>
);

export default LuxeVeil;
