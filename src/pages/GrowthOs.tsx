import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  GitBranch,
  Loader2,
  Megaphone,
  Network,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TfSection, TfCard } from "@/components/tf/Section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";
import { supabase } from "@/integrations/supabase/client";

const PILLARS = [
  {
    icon: Megaphone,
    title: "Meta Ads Engine",
    body: "Advantage+ funnels, creative iteration loops, and CAPI-grade attribution wired into your CRM.",
  },
  {
    icon: Bot,
    title: "AI Workflows",
    body: "Prospecting agents, lifecycle copywriters and ops bots running on Lovable AI + n8n.",
  },
  {
    icon: Network,
    title: "CRM Orchestration",
    body: "Unified pipeline that auto-routes leads, enriches them, and triggers outreach in minutes.",
  },
  {
    icon: BarChart3,
    title: "Live Growth Console",
    body: "One dashboard for spend, pipeline, MRR and creator-studio output — no spreadsheets.",
  },
  {
    icon: GitBranch,
    title: "n8n Backend",
    body: "Every webhook, every retry, every escalation versioned in workflows you can audit.",
  },
  {
    icon: Shield,
    title: "Premium SLA",
    body: "White-glove implementation, RLS-secured data, signed URLs, and a direct line to the founder.",
  },
] as const;

const FLOW = [
  { step: "01", title: "Prospect", body: "AI agents source ICP leads from public signals + paid databases." },
  { step: "02", title: "Outreach", body: "Personalised first-touch across email, WhatsApp & Meta DMs." },
  { step: "03", title: "Qualify", body: "n8n routes replies, books calls, syncs to CRM with scoring." },
  { step: "04", title: "Convert", body: "Meta retargeting + lifecycle sequences close the loop." },
  { step: "05", title: "Expand", body: "Creator Studio ships weekly content keeping CAC compounding down." },
] as const;

const SERVICE_OPTIONS = [
  "Meta Ads management",
  "AI lead prospecting",
  "CRM + lifecycle automation",
  "Creator Studio content ops",
  "Custom n8n workflows",
  "Live Class / event production",
] as const;

const initialForm = {
  name: "",
  email: "",
  company: "",
  website: "",
  monthly_revenue: "",
  current_ad_spend: "",
  message: "",
};

const GrowthOs = () => {
  useSeo({
    title: "Growth OS — TrendFlux Digital & Flux Beam",
    description:
      "A unified Growth Operating System: Meta Ads, AI workflows, CRM orchestration and Creator Studio for premium-tier brands.",
  });

  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("growth-os-lead", {
        body: { ...form, services, source: "growth-os-landing" },
      });
      if (error || !data?.ok) {
        throw new Error(error?.message ?? "Submission failed");
      }
      setSent(true);
      setForm(initialForm);
      setServices([]);
      toast.success("Request received — the team will reach out within 24 hours.");
    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-dvh bg-background text-foreground font-sans antialiased">
      <Navbar />

      <TfSection
        className="pt-40"
        eyebrow="Premium Tier · Invite first"
        title="The Growth OS for founders who want leverage, not another agency."
        titleAs="h1"
        intro="TrendFlux Digital × Flux Beam deploy a unified system — Meta Ads, AI workflows, CRM orchestration and a Creator Studio — engineered end-to-end so high-value pipeline becomes a monthly habit, not a quarterly hope."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#apply"
            className="tf-btn-primary inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90"
          >
            Apply for a slot <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/ecosystem"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground hover:border-primary/40"
          >
            See the architecture
          </Link>
          <span className="ml-1 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Limited to 6 active clients
          </span>
        </div>
      </TfSection>

      <TfSection
        tone="muted"
        eyebrow="Six pillars"
        title="One stack. Six compounding systems."
        intro="Each pillar ships wired to the next — no duct tape, no Zapier maze, no one-off dashboards."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <TfCard key={p.title}>
              <div className="flex items-start gap-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </div>
            </TfCard>
          ))}
        </div>
      </TfSection>

      <TfSection
        eyebrow="The Flow"
        title="From cold signal to closed revenue, on rails."
      >
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {FLOW.map((f) => (
            <li key={f.step}>
              <TfCard className="h-full">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  <Workflow className="h-3.5 w-3.5" /> Step {f.step}
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
              </TfCard>
            </li>
          ))}
        </ol>
      </TfSection>

      <TfSection
        id="apply"
        tone="muted"
        eyebrow="Apply"
        title="Tell us where you want compounding pipeline."
        intro="If we're a fit, we reply within 24 hours with a scoped first 30 days."
      >
        <div className="mx-auto max-w-2xl">
          <TfCard>
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Application received
                </h3>
                <p className="max-w-md text-[14px] text-muted-foreground">
                  We'll review your details and reach out within 24 hours. If urgent, message us via the
                  floating contact on this page.
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>Submit another</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-foreground/80">Full name *</span>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-foreground/80">Work email *</span>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-foreground/80">Company</span>
                    <Input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-foreground/80">Website</span>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-foreground/80">Monthly revenue</span>
                    <Input
                      value={form.monthly_revenue}
                      onChange={(e) => setForm({ ...form, monthly_revenue: e.target.value })}
                      placeholder="e.g. $50k MRR"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-foreground/80">Current ad spend</span>
                    <Input
                      value={form.current_ad_spend}
                      onChange={(e) => setForm({ ...form, current_ad_spend: e.target.value })}
                      placeholder="e.g. $20k / month"
                    />
                  </label>
                </div>

                <div>
                  <span className="mb-2 block text-sm text-foreground/80">Where do you need leverage?</span>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map((s) => {
                      const on = services.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleService(s)}
                          aria-pressed={on}
                          className={[
                            "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                            on
                              ? "border-primary/50 bg-primary/15 text-foreground"
                              : "border-border bg-card/40 text-foreground/75 hover:border-primary/30",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block text-sm">
                  <span className="mb-1.5 block text-foreground/80">Anything else we should know?</span>
                  <Textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Goals, timelines, current bottlenecks…"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-muted-foreground">
                    By submitting you agree to our{" "}
                    <Link to="/privacy" className="underline hover:text-foreground">privacy policy</Link>.
                  </p>
                  <Button type="submit" disabled={loading} className="min-w-[160px]">
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      <>Apply for Growth OS <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </TfCard>
        </div>
      </TfSection>

      <Footer />
    </main>
  );
};

export default GrowthOs;