import { BrandShell } from "@/components/BrandShell";
import { Camera, Users, Sparkles, ArrowUpRight, Check, Copy } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { Testimonials } from "@/components/Testimonials";
import trendfluxTalentLogo from "@/assets/trendflux-talent-logo.webp";
import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

const FB_GROUP_URL = "https://www.facebook.com/groups/trendfluxtalent/";
const TALENT_WHATSAPP_NUMBER = "8801972813761";
const DEFAULT_PREFILL =
  "Hi TrendFlux Talent — I'd like to learn more about joining the creator network.";
const TALENT_WHATSAPP = `https://wa.me/${TALENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  DEFAULT_PREFILL,
)}`;

const ROLE_OPTIONS = [
  "Creator / Influencer",
  "Model",
  "Photographer / Videographer",
  "Brand / Business",
  "Agency",
  "Other",
] as const;

const joinSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Please enter your full name" })
    .max(80, { message: "Name must be under 80 characters" }),
  role: z.enum(ROLE_OPTIONS, {
    errorMap: () => ({ message: "Please select a role" }),
  }),
});

const JoinNetworkForm = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("");
  const [errors, setErrors] = useState<{ name?: string; role?: string }>({});
  const [submitted, setSubmitted] = useState<{
    name: string;
    role: string;
    message: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = joinSchema.safeParse({ name, role });
    if (!result.success) {
      const fieldErrors: { name?: string; role?: string } = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as "name" | "role";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const message = `Hi TrendFlux Talent! I'd like to join the network.\n\nName: ${result.data.name}\nRole: ${result.data.role}`;
    const url = `https://wa.me/${TALENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    trackEvent("lead_submit", {
      brand: "trendflux_talent",
      form: "join_network",
      role: result.data.role,
      destination: "whatsapp",
    });
    trackEvent("whatsapp_open", {
      brand: "trendflux_talent",
      source: "join_form_submit",
      number: TALENT_WHATSAPP_NUMBER,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Opening WhatsApp",
      description: `Thanks ${result.data.name} — continue the conversation in WhatsApp.`,
    });
    setSubmitted({ name: result.data.name, role: result.data.role, message, url });
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!submitted) return;
    try {
      await navigator.clipboard.writeText(submitted.message);
      setCopied(true);
      trackEvent("copy_message", {
        brand: "trendflux_talent",
        source: "join_success_screen",
        role: submitted.role,
      });
      toast({ title: "Message copied", description: "Paste it into WhatsApp to send." });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Couldn't copy",
        description: "Please select the message and copy it manually.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setName("");
    setRole("");
    setErrors({});
    setCopied(false);
  };

  if (submitted) {
    return (
      <div className="mx-auto mt-8 grid max-w-xl gap-5 text-left">
        <div className="flex items-center justify-center gap-2 text-gold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
            <Check className="h-5 w-5" />
          </span>
          <p className="text-xs uppercase tracking-[0.3em]">Submission ready</p>
        </div>
        <h3 className="text-center font-display text-xl text-[#111111]">
          Thanks, {submitted.name} — your WhatsApp message is prepared.
        </h3>
        <p className="text-center text-sm text-[#4B5563]">
          If WhatsApp didn't open, copy the message below and send it to us directly.
        </p>

        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#4B5563]">
              Your message
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Copy message to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy message
                </>
              )}
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-[#111111]">
            {submitted.message}
          </pre>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={submitted.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_open", {
                brand: "trendflux_talent",
                source: "join_success_screen",
                number: TALENT_WHATSAPP_NUMBER,
              })
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-[hsl(var(--primary-glow))]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.43Z" />
            </svg>
            Open WhatsApp again
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-primary/60 px-6 py-3 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 grid max-w-xl gap-4 text-left"
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="tt-name" className="text-xs uppercase tracking-[0.25em] text-[#4B5563]">
          Your Name
        </Label>
        <Input
          id="tt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mehzabin Akter"
          maxLength={80}
          autoComplete="name"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tt-role" className="text-xs uppercase tracking-[0.25em] text-[#4B5563]">
          Your Role
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="tt-role" aria-invalid={!!errors.role}>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-[hsl(var(--primary-glow))]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.43Z" />
          </svg>
          Continue on WhatsApp
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <a
          href={FB_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-primary/60 px-6 py-3 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          Join the Facebook Community
        </a>
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        We'll never share your details. WhatsApp opens in a new tab with your message ready to send.
      </p>
    </form>
  );
};

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
    <BrandShell tier="platform" hideFacebook whatsappOverride={TALENT_WHATSAPP}>
      <section className="pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-gold/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold">
          <Users className="w-3 h-3" /> Platform · Creator Network
        </div>

        {/* Brand logo */}
        <div className="mt-12 flex justify-center">
          <img
            src={trendfluxTalentLogo}
            alt="TrendFlux Talent — Brand Promoters & Creator Community BD"
            className="w-full max-w-2xl h-auto rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]"
            loading="eager"
          />
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
            href={FB_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
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
        <JoinNetworkForm />
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
