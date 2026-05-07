import React, { useEffect, useRef, useState } from "react";
import luxeVeilSpa from "@/assets/luxe-veil-spa.jpg";
import luxeVeilLogo from "@/assets/luxe-veil-logo.png";
import luxeVeilOg from "@/assets/luxe-veil-og.jpg";
import { BrandShell } from "@/components/BrandShell";
import { Lock, Mail, KeyRound, Loader2, ShieldCheck, BadgeCheck, Sparkles, Leaf } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { Testimonials } from "@/components/Testimonials";
import { SocialShare } from "@/components/SocialShare";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "luxe_veil_token";

function isTokenValid(raw: string | null): boolean {
  if (!raw) return false;
  const [b64] = raw.split(".");
  if (!b64) return false;
  try {
    const decoded = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const m = decoded.match(/^luxe-veil:(\d+)$/);
    if (!m) return false;
    return Number(m[1]) > Date.now();
  } catch {
    return false;
  }
}

const requestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(160),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(800),
});

const LuxeVeil = () => {
  const pageUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "https://trendfluxdigital.lovable.app/luxe-veil";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://trendfluxdigital.lovable.app";
  const ogImageAbs = `${origin}${luxeVeilOg}`;
  const logoAbs = `${origin}${luxeVeilLogo}`;

  useSeo({
    title: "Luxe Veil — Luxury Spa & Wellness Experience by TrendFlux",
    description:
      "Luxe Veil — a private, invite-only luxury spa & wellness sanctuary by TrendFlux. Discreet, refined, and curated for discerning clients.",
    image: luxeVeilOg,
    imageWidth: 1200,
    imageHeight: 630,
    imageType: "image/jpeg",
    imageAlt: "Luxe Veil — Luxury Spa & Wellness by TrendFlux",
    siteName: "Luxe Veil",
    type: "website",
  });

  useJsonLd(
    [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Luxe Veil",
        legalName: "Luxe Veil by TrendFlux",
        url: pageUrl,
        logo: logoAbs,
        image: ogImageAbs,
        parentOrganization: { "@type": "Organization", name: "TrendFlux" },
        sameAs: ["https://www.facebook.com/luxeveil/"],
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${pageUrl}#localbusiness`,
        name: "Luxe Veil",
        description: "Private, invite-only luxury spa & wellness sanctuary by TrendFlux.",
        url: pageUrl,
        image: ogImageAbs,
        logo: logoAbs,
        telephone: "+8801972813761",
        priceRange: "$$$$",
        address: { "@type": "PostalAddress", addressCountry: "BD" },
        sameAs: ["https://www.facebook.com/luxeveil/"],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Luxe Veil",
        url: pageUrl,
        publisher: { "@type": "Organization", name: "TrendFlux" },
      },
    ],
    "ld-json-luxe-veil",
  );


  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tok = localStorage.getItem(STORAGE_KEY);
    if (isTokenValid(tok)) {
      setUnlocked(true);
    } else if (tok) {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }, []);

  const tryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    setVerifying(true);
    setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke<{
        ok: boolean;
        token?: string;
        error?: string;
      }>("verify-invite", { body: { code: code.trim() } });
      if (fnErr || !data?.ok || !data.token) {
        setError(data?.error || "Invalid invitation code. Please check with your host.");
      } else {
        try { localStorage.setItem(STORAGE_KEY, data.token); } catch { /* ignore */ }
        setUnlocked(true);
      }
    } catch {
      setError("Could not verify invitation. Please try again.");
    } finally {
      setVerifying(false);
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
              <img
                src={luxeVeilLogo}
                alt="Luxe Veil — A Private Experience by TrendFlux"
                className="w-44 h-44 object-contain rounded-full"
                loading="eager"
              />
            </div>
            <div className="absolute -inset-4 rounded-full bg-gold/15 blur-3xl -z-10" />
          </div>
        </div>

        <h1 className="relative mt-10 font-display text-5xl md:text-6xl font-bold tracking-[0.25em] text-gold">
          LUXE VEIL
        </h1>
        <a
          href="https://www.facebook.com/luxeveil/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="A Private Experience by TrendFlux — Visit Luxe Veil on Facebook"
          className="relative mt-4 inline-block text-sm uppercase tracking-[0.4em] text-white/70 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          — A Private Experience by TrendFlux
        </a>
        <p className="relative mx-auto mt-10 max-w-xl text-base md:text-lg text-white/70 italic leading-relaxed">
          "Beyond visibility lies discretion. A quiet space, curated for those who already know."
        </p>
      </section>

      {!unlocked ? (
        <section className="relative mx-auto max-w-md rounded-3xl border border-gold/40 bg-[#0c2218]/70 backdrop-blur p-8 text-center">
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
              className="w-full bg-gold text-[#0c2218] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition"
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
        className="w-full bg-gold text-[#0c2218] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
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

type ChatTarget = { key: string; label: string };

const sendToTelegram = async (
  data: { name: string; whatsapp: string; message?: string; target?: string },
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

const useChatTargets = () => {
  const [targets, setTargets] = useState<ChatTarget[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("telegram-submit", {
          body: null,
          method: "GET" as never,
        }).catch(() => ({ data: null as never }));
        // Fallback: call via fetch with ?action=targets
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-submit?action=targets`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const j = await res.json();
        if (!cancelled && j?.ok && Array.isArray(j.targets)) setTargets(j.targets);
        else if (!cancelled && data && (data as any).ok && Array.isArray((data as any).targets)) {
          setTargets((data as any).targets);
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);
  return targets;
};

const TargetSelect = ({
  targets, value, onChange,
}: { targets: ChatTarget[]; value: string; onChange: (v: string) => void }) => {
  if (targets.length <= 1) return null;
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-1.5">
        Route to
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0c2218] border border-gold/30 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-white outline-none"
      >
        {targets.map((t) => (
          <option key={t.key} value={t.key}>{t.label}</option>
        ))}
        <option value="all">All groups</option>
      </select>
    </div>
  );
};


const ErrorBanner = React.forwardRef<HTMLDivElement, {
  error: string;
  onRetry: () => void;
  retrying: boolean;
  id?: string;
}>(({ error, onRetry, retrying, id }, ref) => {
  const waText = encodeURIComponent("Hi Luxe Veil — I'd like to inquire.");
  const retryRef = useRef<HTMLButtonElement>(null);

  // Move keyboard focus to the Retry button as soon as the banner mounts,
  // so keyboard users land on the recovery action immediately.
  // On unmount (error cleared), return focus to whatever was focused before
  // the banner appeared, so keyboard users aren't dropped into nowhere.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    retryRef.current?.focus();
    return () => {
      if (
        previouslyFocused &&
        previouslyFocused !== document.body &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={-1}
      className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-left focus:outline-none focus:ring-2 focus:ring-red-300/60"
    >
      <p className="text-[11px] uppercase tracking-[0.25em] text-red-200 font-semibold">
        <span aria-hidden="true">⚠ </span>
        <span className="sr-only">Error: </span>
        Couldn't send
      </p>
      <p className="mt-1 text-[11px] text-red-100/90 break-words">{error}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          ref={retryRef}
          type="button"
          onClick={onRetry}
          disabled={retrying}
          aria-label={retrying ? "Retrying to send your message" : "Retry sending your message"}
          aria-busy={retrying}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold text-[#0c2218] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c2218]"
        >
          {retrying && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
          {retrying ? "Retrying…" : "Retry"}
        </button>
        <a
          href={`https://wa.me/${PHONE.replace(/\D/g, "")}?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Contact us on WhatsApp instead (opens in a new tab)"
          className="inline-flex items-center rounded-full border border-gold/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c2218]"
        >
          WhatsApp instead
        </a>
      </div>
    </div>
  );
});
ErrorBanner.displayName = "ErrorBanner";

// Visually hidden live region for inline validation errors so screen readers
// announce them without relying on a visible banner.
const SrLive = ({ message }: { message: string }) => (
  <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
    {message}
  </div>
);


const EntryPopup = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "" });
  const [err, setErr] = useState("");
  const [sendErr, setSendErr] = useState("");
  const [errorNonce, setErrorNonce] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [target, setTarget] = useState("");
  const targets = useChatTargets();
  useEffect(() => { if (!target && targets[0]) setTarget(targets[0].key); }, [targets, target]);

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

  const doSend = async (name: string, wa: string) => {
    setSendErr("");
    setSending(true);
    const res = await sendToTelegram({ name, whatsapp: wa, target });
    setSending(false);
    if (!res.ok) {
      setSendErr(res.error || "Could not send. Please try again.");
      setErrorNonce((n) => n + 1);
      return;
    }
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const wa = form.whatsapp.trim();
    if (name.length < 2) return setErr("Please enter your name");
    if (!/^[+\d][\d\s-]{6,}$/.test(wa)) return setErr("Please enter a valid WhatsApp number");
    setErr("");
    await doSend(name, wa);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-[#0c2218] p-7 text-center shadow-2xl">
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
          <div
            className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            ✓ Sent — your details are with our team.
          </div>
        ) : (
          <form onSubmit={submit} aria-busy={sending} className="mt-5 space-y-3 text-left">
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
            <TargetSelect targets={targets} value={target} onChange={setTarget} />
            {err && (
              <p
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="text-[11px] text-red-300"
              >
                {err}
              </p>
            )}
            {sendErr && (
              <ErrorBanner
                id="entry-send-error"
                error={sendErr}
                retrying={sending}
                onRetry={() => doSend(form.name.trim(), form.whatsapp.trim())}
              />
            )}
            <SrLive key={`entry-${errorNonce}`} message={sendErr} />
            <button
              type="submit"
              disabled={sending}
              aria-invalid={!!sendErr}
              aria-describedby={sendErr ? "entry-send-error" : undefined}
              className="w-full bg-gold text-[#0c2218] py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
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
  const [form, setForm] = useState({ name: "", whatsapp: "", message: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [sendErr, setSendErr] = useState("");
  const [errorNonce, setErrorNonce] = useState(0);
  const [sending, setSending] = useState(false);
  const [target, setTarget] = useState("");
  const targets = useChatTargets();
  const sendAnotherRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!target && targets[0]) setTarget(targets[0].key); }, [targets, target]);
  useEffect(() => { if (done) sendAnotherRef.current?.focus(); }, [done]);

  const doSend = async (name: string, wa: string, msg: string) => {
    setSendErr("");
    setSending(true);
    const res = await sendToTelegram({ name, whatsapp: wa, message: msg, target });
    setSending(false);
    if (!res.ok) {
      setSendErr(res.error || "Could not send. Please try again.");
      setErrorNonce((n) => n + 1);
      return;
    }
    try {
      const lead = { name, whatsapp: wa, message: msg, ts: new Date().toISOString() };
      const list = JSON.parse(localStorage.getItem("luxe_veil_contacts") || "[]");
      list.push(lead);
      localStorage.setItem("luxe_veil_contacts", JSON.stringify(list));
    } catch {}
    setDone(true);
    setForm({ name: "", whatsapp: "", message: "" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const wa = form.whatsapp.trim();
    const msg = form.message.trim();
    if (name.length < 2) return setErr("Please enter your name");
    if (!/^[+\d][\d\s-]{6,}$/.test(wa)) return setErr("Please enter a valid WhatsApp number");
    if (msg.length < 5) return setErr("Please add a short message");
    setErr("");
    await doSend(name, wa, msg);
  };

  if (done) {
    return (
      <div
        className="mt-6 rounded-2xl border border-[hsl(var(--lv-hairline))] bg-[hsl(var(--lv-cream))] p-6 text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-[hsl(var(--lv-gold))] uppercase tracking-[0.25em] font-semibold">✓ Message Sent</p>
        <p className="mt-2 text-xs text-[hsl(var(--lv-ink-soft))]">Your inquiry has been delivered to our concierge. We'll be in touch shortly.</p>
        <button
          ref={sendAnotherRef}
          onClick={() => setDone(false)}
          className="mt-4 text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--lv-ink))] hover:text-[hsl(var(--lv-gold))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lv-gold))] rounded"
        >
          Send another
        </button>
      </div>
    );
  }

  const field = "w-full bg-white border border-[hsl(var(--lv-hairline))] focus:border-[hsl(var(--lv-gold))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--lv-ink))] outline-none placeholder:text-[hsl(var(--lv-ink)/0.4)]";

  return (
    <form onSubmit={submit} aria-busy={sending} className="mt-6 mx-auto max-w-md text-left space-y-3">
      <input className={field} placeholder="Your name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={field} placeholder="WhatsApp number" inputMode="tel" value={form.whatsapp}
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
      <textarea rows={3} className={field} placeholder="How can we help?" value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })} />
      <TargetSelect targets={targets} value={target} onChange={setTarget} />
      {err && (
        <p
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="text-[11px] text-red-600"
        >
          {err}
        </p>
      )}
      {sendErr && (
        <ErrorBanner
          id="contact-send-error"
          error={sendErr}
          retrying={sending}
          onRetry={() => doSend(form.name.trim(), form.whatsapp.trim(), form.message.trim())}
        />
      )}
      <SrLive key={`contact-${errorNonce}`} message={sendErr} />
      <button
        type="submit"
        disabled={sending}
        aria-invalid={!!sendErr}
        aria-describedby={sendErr ? "contact-send-error" : undefined}
        className="w-full bg-[hsl(var(--lv-ink))] text-white py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-[hsl(var(--lv-ink)/0.9)] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {sending && <Loader2 className="w-3 h-3 animate-spin" />}
        {sending ? "Sending…" : "Send Message"}
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
      <div
        key={s.name}
        className="relative rounded-2xl border border-[hsl(var(--lv-hairline))] bg-white/70 p-5 shadow-sm hover:shadow-md hover:border-[hsl(var(--lv-gold)/0.6)] transition"
      >
        <h4 className="font-display text-lg text-[hsl(var(--lv-ink))]">{s.name}</h4>
        <p className="mt-1 text-xs text-[hsl(var(--lv-ink-soft))] leading-relaxed">{s.desc}</p>
        <ul className="mt-3 space-y-1 text-sm">
          {s.tiers.map((t) => (
            <li key={t.dur} className="flex items-center justify-between border-t border-[hsl(var(--lv-hairline))] pt-1.5">
              <span className="text-[hsl(var(--lv-ink-soft))]">⏱ {t.dur}</span>
              <span className="font-semibold text-[hsl(var(--lv-gold))]">{t.price}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const SectionHeader = ({ eyebrow, title, accent }: { eyebrow: string; title: string; accent?: string }) => {
  // If accent provided, render as italic gold serif word inside the title where {accent} appears
  const renderTitle = () => {
    if (!accent || !title.includes(accent)) return <>{title}</>;
    const [before, after] = title.split(accent);
    return (
      <>
        {before}
        <em className="lv-italic-gold">{accent}</em>
        {after}
      </>
    );
  };
  return (
    <div className="text-center mb-8">
      <p className="lv-eyebrow">{eyebrow}</p>
      <h3 className="mt-2 font-display text-3xl md:text-4xl text-[hsl(var(--lv-ink))] leading-tight">
        {renderTitle()}
      </h3>
      <span className="mt-3 lv-divider" />
    </div>
  );
};

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
      className="border border-[hsl(var(--lv-ink)/0.3)] text-[hsl(var(--lv-ink))] px-6 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-[hsl(var(--lv-ink)/0.05)] transition"
    >
      {copied ? "✓ Copied" : "📋 Copy Phone"}
    </button>
  );
};

const WhatsAppPill = () => {
  const tg = "https://t.me/luxeveil";
  return (
    <a
      href={tg}
      target="_blank"
      rel="noreferrer"
      aria-label="Connect with Luxe Veil on Telegram (opens in a new tab)"
      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--lv-ink))] text-white px-5 py-2.5 text-xs font-semibold tracking-wide hover:bg-[hsl(var(--lv-ink)/0.9)] transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
        <path d="M9.78 15.27 9.6 19a.62.62 0 0 0 1.05.46l2.18-2.09 4.52 3.31c.83.46 1.42.22 1.63-.77l2.96-13.86c.28-1.27-.46-1.77-1.27-1.47L2.4 10.2c-1.24.49-1.22 1.18-.22 1.5l4.6 1.43L17.5 6.7c.5-.32.96-.14.58.21l-8.3 7.36Z"/>
      </svg>
      Connect on Telegram
    </a>
  );
};

const TrustStrip = () => {
  const items = [
    {
      Icon: ShieldCheck,
      label: "Discreet",
      sub: "Private & confidential",
      sr: "Discreet service: every visit is fully private and confidential.",
    },
    {
      Icon: BadgeCheck,
      label: "Certified",
      sub: "Trained therapists",
      sr: "Certified, professionally trained therapists.",
    },
    {
      Icon: Sparkles,
      label: "Premium",
      sub: "Hygiene-first rooms",
      sr: "Premium experience with hygiene-first treatment rooms.",
    },
    {
      Icon: Leaf,
      label: "Natural",
      sub: "Pure oils & herbs",
      sr: "Natural treatments using pure oils and herbs.",
    },
  ];
  return (
    <section
      aria-labelledby="lv-trust-heading"
      className="border-y border-[hsl(var(--lv-hairline))] bg-gradient-to-b from-[hsl(var(--lv-ivory))] to-[hsl(var(--lv-cream)/0.6)]"
    >
      <h2 id="lv-trust-heading" className="sr-only">
        Why guests choose Luxe Veil
      </h2>
      <ul
        role="list"
        className="mx-auto max-w-5xl px-4 py-7 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {items.map(({ Icon, label, sub, sr }) => (
          <li
            key={label}
            className="group relative flex flex-col items-center text-center gap-2 rounded-2xl border border-[hsl(var(--lv-hairline))] bg-white/60 backdrop-blur-md px-4 py-5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_24px_-12px_rgba(12,34,24,0.15)] transition hover:bg-white/80 hover:-translate-y-0.5"
          >
            <span className="sr-only">{sr}</span>
            <span
              aria-hidden="true"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[hsl(var(--lv-gold)/0.4)] bg-[hsl(var(--lv-gold)/0.08)] text-[hsl(var(--lv-gold))]"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <p aria-hidden="true" className="font-display text-sm md:text-base text-[hsl(var(--lv-ink))] tracking-wide">
              {label}
            </p>
            <p aria-hidden="true" className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--lv-ink-soft))]">
              {sub}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

const LuxeVeilExperience = () => (
  <div className="space-y-0">
    <EntryPopup />

    {/* Light-themed navbar pill row */}
    <div className="lv-light border-b border-[hsl(var(--lv-hairline))]">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <p className="font-display text-sm md:text-base tracking-[0.3em] text-[hsl(var(--lv-ink))]">
          LUXE <em className="lv-italic-gold not-italic md:italic">VEIL</em>
        </p>
        <WhatsAppPill />
      </div>
    </div>

    {/* Welcome / Hero (kept dark) */}
    <section className="relative mx-auto max-w-5xl mt-8 rounded-3xl border border-gold/30 overflow-hidden">
      <img src={luxeVeilSpa} alt="Luxe Veil spa interior" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#11331f]/90 via-[#0c2218]/85 to-[#11331f]/95" />
      <div className="relative p-8 md:p-14 text-center">
        <span aria-hidden className="absolute top-3 left-3 w-5 h-5 border-t border-l border-gold/60" />
        <span aria-hidden className="absolute top-3 right-3 w-5 h-5 border-t border-r border-gold/60" />
        <span aria-hidden className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-gold/60" />
        <span aria-hidden className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold/60" />
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold/80">Relax · Refresh · Rejuvenate</p>
        <h2 className="mt-5 font-display text-4xl md:text-5xl text-white leading-[1.1] max-w-3xl mx-auto">
          Your private sanctuary of{" "}
          <em className="lv-italic-gold text-[1.05em]">relaxation</em>
          <span> &amp; wellness.</span>
        </h2>
        <p className="mt-6 text-white/75 leading-relaxed max-w-xl mx-auto">
          Step away from the noise of everyday life and enter a refined space of calm,
          comfort, and care at LUXE VEIL.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={TELEGRAM} target="_blank" rel="noreferrer" className="bg-gold text-[#0c2218] px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-90 transition">
            Contact Concierge
          </a>
          <a href="#contact" className="border border-gold/60 text-gold px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold/10 transition">
            View Services
          </a>
        </div>
      </div>
    </section>

    {/* Light body wrapper */}
    <div className="lv-light mt-10 rounded-3xl">
      <TrustStrip />

      <div className="mx-auto max-w-5xl px-4 py-16 space-y-20">
        {/* About */}
        <section className="mx-auto max-w-3xl text-center">
          <SectionHeader eyebrow="About Us" accent="essential" title="Wellness is essential — not optional" />
          <p className="text-[hsl(var(--lv-ink-soft))] leading-relaxed">
            At LUXE VEIL, we focus on delivering a discreet, premium experience designed to
            reduce stress, release deep muscle tension, improve circulation, and restore
            energy &amp; mental clarity.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-[hsl(var(--lv-ink))] text-left max-w-md mx-auto">
            <li className="flex gap-2"><span className="text-[hsl(var(--lv-gold))]">✦</span> Reduce stress</li>
            <li className="flex gap-2"><span className="text-[hsl(var(--lv-gold))]">✦</span> Release deep muscle tension</li>
            <li className="flex gap-2"><span className="text-[hsl(var(--lv-gold))]">✦</span> Improve circulation</li>
            <li className="flex gap-2"><span className="text-[hsl(var(--lv-gold))]">✦</span> Restore energy &amp; clarity</li>
          </ul>
        </section>

        {/* Massage Therapies */}
        <section>
          <SectionHeader eyebrow="Signature treatments" accent="body" title="Indulge body & mind." />
          <ServiceGrid items={MASSAGES} />
        </section>

        {/* Specialty */}
        <section className="lv-band rounded-3xl px-4 md:px-8 py-12 -mx-4 md:-mx-8">
          <SectionHeader eyebrow="Specialty & Premium" accent="premium" title="Refined premium treatments" />
          <ServiceGrid items={SPECIALTY} />
        </section>

        {/* Signature */}
        <section>
          <SectionHeader eyebrow="Signature" accent="rituals" title="Curated signature rituals" />
          <ServiceGrid items={SIGNATURE} />
        </section>

        {/* Why Choose */}
        <section className="mx-auto max-w-3xl">
          <SectionHeader eyebrow="Why Choose" accent="LUXE" title="Why choose LUXE VEIL" />
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[hsl(var(--lv-ink))]">
            {[
              "Skilled & professional therapists",
              "Clean, discreet & শান্ত পরিবেশ",
              "Premium experience with fair pricing",
              "সহজ বুকিং (Call / WhatsApp)",
              "Privacy-focused service",
            ].map((w) => (
              <li key={w} className="flex gap-2 items-start rounded-xl border border-[hsl(var(--lv-hairline))] bg-white/70 p-4">
                <span className="text-[hsl(var(--lv-gold))]">✔</span>
                <span lang={/[\u0980-\u09FF]/.test(w) ? "bn" : undefined}>{w}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA / Contact */}
        <section
          id="contact"
          className="relative mx-auto max-w-2xl rounded-3xl border border-[hsl(var(--lv-hairline))] bg-white/80 p-8 text-center scroll-mt-24 shadow-sm"
        >
          <p className="lv-eyebrow">Book your experience</p>
          <h3 className="mt-2 font-display text-3xl text-[hsl(var(--lv-ink))]">
            Reserve your <em className="lv-italic-gold">sanctuary</em>
          </h3>
          <span className="mt-3 lv-divider" />
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
            <a href={TELEGRAM} target="_blank" rel="noreferrer" className="bg-[hsl(var(--lv-ink))] text-white px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-[hsl(var(--lv-ink)/0.9)] transition">
              Contact on Telegram
            </a>
            <a
              href={`tel:${PHONE}`}
              className="text-[hsl(var(--lv-ink))] font-semibold tracking-wide text-sm hover:text-[hsl(var(--lv-gold))] transition"
              aria-label={`Call Luxe Veil at ${PHONE}`}
            >
              📞 {PHONE}
            </a>
          </div>
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--lv-ink-soft))] mb-3">Share Luxe Veil</p>
            <SocialShare title="Luxe Veil — Luxury Spa & Wellness by TrendFlux" source="luxe_veil_booking" />
          </div>
          <ContactForm />
        </section>

        {/* Bangla */}
        <section lang="bn" className="mx-auto max-w-2xl text-center rounded-3xl border border-[hsl(var(--lv-hairline))] bg-[hsl(var(--lv-cream))] p-8">
          <p className="lv-eyebrow">বাংলায়</p>
          <h3 className="mt-3 font-display text-2xl text-[hsl(var(--lv-ink))]">আরাম, প্রশান্তি আর নতুন উদ্যম ✨</h3>
          <p className="mt-4 text-[hsl(var(--lv-ink-soft))] leading-relaxed">
            সারা দিনের ক্লান্তি দূর করতে চলে আসুন LUXE VEIL-এ।
            আপনার শরীর ও মনকে নতুন করে অনুভব করুন আমাদের প্রিমিয়াম সার্ভিসের মাধ্যমে।
          </p>
          <p className="mt-4 text-sm text-[hsl(var(--lv-gold))]">
            🌿 রিল্যাক্স করুন • রিফ্রেশ হোন • নিজেকে নতুনভাবে আবিষ্কার করুন
          </p>
        </section>
      </div>
    </div>

    {/* Footer (kept dark to bookend) */}
    <footer className="text-center pt-10 pb-4 mt-8 border-t border-gold/15">
      <p className="font-display text-lg text-gold tracking-[0.3em]">LUXE VEIL</p>
      <p className="mt-1 text-xs text-white/60">Luxury Spa & Wellness Experience</p>
      <p className="mt-2 text-xs text-white/70">📞 {PHONE}</p>
    </footer>
  </div>
);

export default LuxeVeil;
