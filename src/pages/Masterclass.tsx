import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  LineChart,
  Workflow,
  PenTool,
  Image as ImageIcon,
  Database,
  Zap,
  Rocket,
  Check,
  MessageCircle,
} from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { openAccessRequest } from "@/lib/accessRequest";
import { track } from "@/lib/analytics";
import heroImage from "@/assets/masterclass-hero.jpg";

const WHATSAPP_URL =
  "https://wa.me/8801756004037?text=" +
  encodeURIComponent(
    "Hi 👋 I'm interested in the Advanced AI Masterclass.\n\n1) I am: Student / Job / Business\n2) My goal: Income growth / Skill upgrade / Business automation",
  );

const HOOKS = [
  "You're not behind in AI — you're using it wrong.",
  "AI isn't a tool anymore. It's a business operator.",
  "If AI isn't saving you time or making you money, you're playing with it.",
];

const MODULES = [
  { icon: Cpu,      n: "01", title: "AI Instruction Architecture",  blurb: "Prompt systems that compound — not one-off chats." },
  { icon: LineChart,n: "02", title: "Insight Extraction Engine",    blurb: "Mine signal from any document, site, or dataset." },
  { icon: Workflow, n: "03", title: "AI Decision Matrix",           blurb: "Pick the right model for the right job, every time." },
  { icon: PenTool,  n: "04", title: "Content Scaling Engine",       blurb: "Ship 10× output without losing brand voice." },
  { icon: ImageIcon,n: "05", title: "Brand Identity Engine",        blurb: "Visual systems built at AI speed, on-brand." },
  { icon: Database, n: "06", title: "Growth Intelligence Layer",    blurb: "Data → decisions, automated end-to-end." },
  { icon: Zap,      n: "07", title: "Workflow Automation Stack",    blurb: "Connect tools, kill busywork, scale ops." },
  { icon: Rocket,   n: "08", title: "AI Business Build Sprint",     blurb: "Capstone: ship a real revenue system." },
];

const OUTCOMES = [
  "Design AI workflows that run your business",
  "Automate content + marketing systems end-to-end",
  "Build scalable digital assets, not one-off posts",
  "Operate like a growth strategist — not a prompter",
];

const apply = (source: string) => {
  track("masterclass_cta_click", { source });
  openAccessRequest({
    source,
    title: "Apply for the Advanced AI Masterclass",
    description:
      "Limited batch · system-based training. Tell us where you're at and we'll reach out within 24 hours.",
    metadata: {
      audience: "masterclass",
      qualification_prompt: true,
      hint: "I am [student/job/business] · Goal: [income / skill / automation]",
    },
  });
};

const Masterclass = () => {
  const [hookIdx, setHookIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHookIdx((i) => (i + 1) % HOOKS.length), 3800);
    return () => clearInterval(id);
  }, []);

  useSeo({
    title: "Advanced AI Masterclass — Become an AI Growth Operator | TrendFlux",
    description:
      "Stop using AI like everyone else. Build automation, content and growth systems. Operator-grade training — limited batch.",
    canonical: `${BRAND.url}/masterclass`,
  });
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Advanced AI Masterclass — Digital Growth & Transformation",
    description:
      "Operator-grade AI training: AI Instruction Architecture, Insight Extraction, Decision Matrix, Content Scaling, Brand Identity, Growth Intelligence, Workflow Automation, and a capstone AI Business Build Sprint.",
    provider: {
      "@type": "Organization",
      name: BRAND.legalName,
      url: BRAND.url,
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -top-32 right-0 h-[560px] w-[560px] rounded-full bg-primary/10 blur-[180px]" />
        <div className="absolute bottom-0 -left-32 h-[560px] w-[560px] rounded-full bg-gold/10 blur-[180px]" />
      </div>

      {/* HERO */}
      <section className="relative px-6 pt-20 pb-20 lg:px-10 lg:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground/50 hover:text-foreground/80"
            >
              ← {BRAND.nameLead}
            </Link>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold backdrop-blur">
              <Sparkles className="h-3 w-3" />
              AI Growth Operator Program · Limited Batch
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Turn AI into a{" "}
              <span className="text-gradient">Revenue System</span> —
              <br className="hidden md:block" /> not a productivity tool.
            </h1>

            <p className="mt-6 max-w-xl text-base text-foreground/70 md:text-lg">
              Users prompt AI. Operators build systems. Leaders automate growth.
              The Advanced AI Masterclass teaches the stack — workflow design,
              execution structure, and the business systems that scale.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => apply("masterclass_hero")}
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-gold-foreground shadow-gold transition hover:scale-[1.02]"
              >
                Apply for Limited Batch
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("masterclass_whatsapp_click", { source: "hero" })}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
              >
                <MessageCircle className="h-4 w-4 text-gold" />
                Message on WhatsApp
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.25em] text-foreground/40">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" /> System-based, not theory
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-foreground/20 md:inline-block" />
              <span>8 operator modules</span>
              <span className="hidden h-1 w-1 rounded-full bg-foreground/20 md:inline-block" />
              <span>Capstone build sprint</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-gold/20 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border shadow-elegant">
              <img
                src={heroImage}
                alt="Advanced AI Masterclass — digital growth and transformation"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PATTERN-INTERRUPT HOOK STRIP */}
      <section aria-label="Hook" className="relative border-y border-border/60 bg-card/40 px-6 py-7 lg:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-center text-center">
          <p
            key={hookIdx}
            className="font-display text-lg italic text-foreground/80 md:text-2xl animate-fade-up"
          >
            “{HOOKS[hookIdx]}”
          </p>
        </div>
      </section>

      {/* TRUST SHIFT */}
      <section className="relative px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-gold">
            Why most people fail with AI
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-3xl font-bold leading-tight md:text-4xl">
            It's not the prompts. It's the absence of a{" "}
            <span className="text-gradient">system</span>.
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { t: "No system thinking", d: "Random tools, random outputs, no compounding value." },
              { t: "No workflow design",  d: "Manual hand-offs everywhere; nothing actually scales." },
              { t: "No execution structure", d: "Ideas pile up, ships nothing, ROI stays invisible." },
            ].map((c) => (
              <div
                key={c.t}
                className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:border-gold/60"
              >
                <div className="font-display text-lg font-semibold text-foreground">{c.t}</div>
                <p className="mt-2 text-sm text-foreground/65">{c.d}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center font-display text-xl text-foreground/80 md:text-2xl">
            This program <span className="text-gold">fixes that.</span>
          </p>
        </div>
      </section>

      {/* MODULE GRID */}
      <section className="relative px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">The Operating Stack</p>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
                8 modules. One growth system.
              </h2>
            </div>
            <p className="max-w-md text-sm text-foreground/65">
              Each module is a layer of the stack — not a topic. By module 8, you
              don't have notes. You have a working AI business system.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map(({ icon: Icon, n, title, blurb }) => (
              <div
                key={n}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-gold/70 hover:shadow-gold"
              >
                <div className="absolute right-4 top-4 font-display text-xs tracking-[0.3em] text-gold/60">
                  {n}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/30">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold leading-snug text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-foreground/65">{blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSFORMATION */}
      <section className="relative px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card/60 p-10 backdrop-blur md:p-14">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">After this program</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            You won't "use AI". You'll{" "}
            <span className="text-gradient">operate with it.</span>
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {OUTCOMES.map((o) => (
              <li key={o} className="flex items-start gap-3 text-foreground/80">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm md:text-base">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA BAND */}
      <section className="relative px-6 py-24 lg:px-10">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-gradient-hero p-10 text-center md:p-16">
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Limited Batch</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              System-based training.{" "}
              <span className="text-gradient">Not theory.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm text-foreground/70 md:text-base">
              Reserve your seat. We'll ask 2 quick questions —
              <em> Student / Job / Business?</em> and{" "}
              <em>Goal: income · skill · automation?</em> — then route you to
              the right track within 24 hours.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => apply("masterclass_final")}
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-bold text-gold-foreground shadow-gold transition hover:scale-[1.02]"
              >
                Reserve Your Seat
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("masterclass_whatsapp_click", { source: "final" })}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
              >
                <MessageCircle className="h-4 w-4 text-gold" />
                Talk to an Operator
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Masterclass;