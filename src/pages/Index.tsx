import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Workflow,
  Users,
  Sparkles,
  Target,
  Layers,
  Cpu,
  Linkedin,
  Facebook,
  Youtube,
  MessageCircle,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  Megaphone,
  Lock,
} from "lucide-react";
import trendfluxLogo from "@/assets/trendflux-logo.png";
import emonPortrait from "@/assets/zahid-hasan-emon.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { QuoteDialog } from "@/components/QuoteDialog";
import { ResumeButton } from "@/components/ResumeButton";
import { usePressItems } from "@/hooks/usePressItems";

type PressItem = {
  id?: string;
  outlet: string;
  headline: string;
  href: string;
  context: string;
};

type Category =
  | "All"
  | "Business Automation"
  | "Meta Ads Management"
  | "Ecosystem Design";

const services = [
  {
    category: "Business Automation" as const,
    icon: Workflow,
    title: "Workflow Intelligence Systems",
    desc: "End-to-end automation pipelines that eliminate manual overhead and unlock operational velocity.",
    outcome: "Avg. 70% time reclaimed",
  },
  {
    category: "Business Automation" as const,
    icon: Users,
    title: "CRM & Sales Orchestration",
    desc: "Custom-engineered CRM stacks that turn cold pipelines into predictable revenue engines.",
    outcome: "3.2x lead conversion",
  },
  {
    category: "Meta Ads Management" as const,
    icon: Sparkles,
    title: "Performance Creative Labs",
    desc: "Data-driven creative testing frameworks designed to scale ROAS without sacrificing brand integrity.",
    outcome: "Avg. +45% ROAS lift",
  },
  {
    category: "Meta Ads Management" as const,
    icon: Target,
    title: "Full-Funnel Paid Strategy",
    desc: "Surgical audience architecture and bid strategy across Meta's full ecosystem.",
    outcome: "Sub-$8 CAC achieved",
  },
  {
    category: "Ecosystem Design" as const,
    icon: Layers,
    title: "Brand Operating Systems",
    desc: "Holistic brand-to-product ecosystems engineered for compounding growth.",
    outcome: "12-month roadmaps",
  },
  {
    category: "Ecosystem Design" as const,
    icon: Cpu,
    title: "Tech Stack Architecture",
    desc: "Future-proof infrastructure decisions that align tooling with strategic intent.",
    outcome: "Zero-vendor-lock builds",
  },
];

import {
  OrganicGrowthIcon,
  ContentEngineIcon,
  GlobalStrategyIcon,
  AutomationFunnelIcon,
  SmeGrowthIcon,
  PersonalBrandIcon,
} from "@/components/CaseIcons";

type CaseIcon = (props: React.SVGProps<SVGSVGElement>) => JSX.Element;

type CaseStudy = {
  category: string;
  title: string;
  description: string;
  results: string[];
  Icon: CaseIcon;
  situation: string;
  problem: string;
  solution: string;
  insight: string;
};

const caseStudies: CaseStudy[] = [
  {
    category: "Organic Growth System",
    title: "Scaling Organic Reach to 485K+",
    description:
      "Built a structured content system that generated massive organic reach without paid ads.",
    results: ["485K+ video views", "80%+ organic reach", "45%+ engagement growth"],
    Icon: OrganicGrowthIcon,
    situation: "The brand lacked visibility and had no structured content approach.",
    problem: "Inconsistent posting, low engagement, and no audience targeting.",
    solution:
      "Developed a reels-first content system using hooks, storytelling, and structured scheduling.",
    insight: "Content success is driven by structure and psychology — not volume.",
  },
  {
    category: "Content Engine",
    title: "200+ Digital Asset Production System",
    description:
      "Created a scalable content production engine using templates and AI-assisted workflows.",
    results: ["200+ assets delivered", "Faster content execution", "Consistent brand identity"],
    Icon: ContentEngineIcon,
    situation: "Manual asset production was slow and inconsistent across campaigns.",
    problem: "Bottlenecked design output, off-brand variations, missed launch windows.",
    solution:
      "Built a templated production engine combining Figma systems, Canva libraries, and AI copy workflows.",
    insight: "Systems out-produce talent when speed and consistency both matter.",
  },
  {
    category: "Global Strategy",
    title: "Multi-Market Digital Strategy (US/UK)",
    description:
      "Optimized content and marketing strategy for international audience targeting.",
    results: ["Improved engagement", "Market-aligned content", "Better audience targeting"],
    Icon: GlobalStrategyIcon,
    situation: "A single-market playbook was being copy-pasted across geographies.",
    problem: "Tone, references, and offers didn't resonate with US/UK audiences.",
    solution:
      "Rebuilt positioning, creative, and channel mix per market with localized creative variants.",
    insight: "Global growth is local execution — not translated copy.",
  },
  {
    category: "Automation Funnel",
    title: "WhatsApp Lead Conversion System",
    description: "Built an automated funnel to convert inquiries into booked strategy calls.",
    results: ["Faster response time", "Higher lead engagement", "Increased booking rate"],
    Icon: AutomationFunnelIcon,
    situation: "Inbound leads were dropping off before reaching a human.",
    problem: "Slow replies, no qualification, no follow-up sequence.",
    solution:
      "Wired a WhatsApp + CRM automation that qualified, nurtured, and booked calls 24/7.",
    insight: "Speed-to-lead is the cheapest conversion lever most brands ignore.",
  },
  {
    category: "SME Growth",
    title: "SME Growth System Architecture",
    description: "Designed structured growth systems for SMEs targeting scalable operations.",
    results: ["Clear funnel structure", "CRM integration", "Scalable business model"],
    Icon: SmeGrowthIcon,
    situation: "Owner-led SME with strong service but no repeatable acquisition model.",
    problem: "Revenue depended entirely on referrals and founder hustle.",
    solution:
      "Architected a top-to-bottom funnel with CRM, content, and outbound playbooks.",
    insight: "SMEs scale when founders escape every step of the customer journey.",
  },
  {
    category: "Personal Brand",
    title: "Authority-Based Personal Brand System",
    description: "Built positioning and content strategy for strong authority and engagement.",
    results: ["Clear niche positioning", "Strong audience connection", "Consistent brand identity"],
    Icon: PersonalBrandIcon,
    situation: "Talented operator with no recognizable public voice or positioning.",
    problem: "Generic content, no clear ICP, no compounding inbound.",
    solution:
      "Defined a sharp niche thesis and built a content engine around proof-driven storytelling.",
    insight: "Authority compounds when every post reinforces one undeniable thesis.",
  },
];

const stats = [
  { value: "$8.4M", label: "Ad spend managed" },
  { value: "+312%", label: "Avg. growth lift" },
  { value: "47", label: "Operations launched" },
];

type HeadlineVariant = {
  id: string;
  label: string;
  timeline: React.ReactNode;
  pressTagline: string;
};

const HEADLINE_VARIANTS: HeadlineVariant[] = [
  {
    id: "stand-spotlight",
    label: "From Stand to Spotlight",
    timeline: (
      <>
        From <span className="text-gradient">Stand</span> to Spotlight
      </>
    ),
    pressTagline: "A stand turned into a documented public record.",
  },
  {
    id: "integrity-fire",
    label: "Integrity Under Fire",
    timeline: (
      <>
        <span className="text-gradient">Integrity</span> Under Fire
      </>
    ),
    pressTagline: "Tested under pressure, verified by national outlets.",
  },
  {
    id: "whistleblower-focus",
    label: "Whistleblower in Focus",
    timeline: (
      <>
        <span className="text-gradient">Whistleblower</span> in Focus
      </>
    ),
    pressTagline: "An unyielding voice, captured on the public record.",
  },
  {
    id: "truth-headlines",
    label: "Truth That Made Headlines",
    timeline: (
      <>
        <span className="text-gradient">Truth</span> That Made Headlines
      </>
    ),
    pressTagline: "When silence broke, the headlines followed.",
  },
  {
    id: "stand-echoed",
    label: "A Stand That Echoed",
    timeline: (
      <>
        A <span className="text-gradient">Stand</span> That Echoed
      </>
    ),
    pressTagline: "One stand, echoed across Bangladesh's leading outlets.",
  },
  {
    id: "satyer-pakshe",
    label: "সত্যের পক্ষে দাঁড়ানো",
    timeline: (
      <>
        <span className="text-gradient">সত্যের পক্ষে</span> দাঁড়ানো — National Spotlight
      </>
    ),
    pressTagline: "একটা অবস্থান, সারা দেশের আলোচনায়।",
  },
  {
    id: "stand-speak-spotlight",
    label: "Stand. Speak. Spotlight.",
    timeline: (
      <>
        <span className="text-gradient">Stand.</span> Speak. Spotlight.
      </>
    ),
    pressTagline: "Stand taken. Voice raised. Spotlight earned.",
  },
  {
    id: "unyielding-truth",
    label: "Unyielding Truth",
    timeline: (
      <>
        <span className="text-gradient">Unyielding</span> Truth
      </>
    ),
    pressTagline: "Documented courage — outlet by outlet.",
  },
];

const Index = () => {
  const [filter, setFilter] = useState<Category>("All");
  const [activePress, setActivePress] = useState<PressItem | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [pressOpenFor, setPressOpenFor] = useState<string | null>(null);
  const [activeCase, setActiveCase] = useState<CaseStudy | null>(null);
  const [veilOpen, setVeilOpen] = useState(false);
  const [veilCode, setVeilCode] = useState("");
  const [veilError, setVeilError] = useState("");
  const navigate = useNavigate();
  const VALID_VEIL_CODES = ["LUXE2026", "VEIL-INVITE", "TRENDFLUX-PRIVATE"];
  const submitVeilCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_VEIL_CODES.includes(veilCode.trim().toUpperCase())) {
      try { localStorage.setItem("luxe_veil_unlocked", "1"); } catch { /* ignore */ }
      setVeilOpen(false);
      setVeilCode("");
      setVeilError("");
      navigate("/luxe-veil");
    } else {
      setVeilError("Invalid invitation code. Please check with your host.");
    }
  };
  const { items: dbPress } = usePressItems();
  const [headlineId, setHeadlineId] = useState<string>(() => {
    if (typeof window === "undefined") return HEADLINE_VARIANTS[0].id;
    return localStorage.getItem("headline_variant") || HEADLINE_VARIANTS[0].id;
  });
  const headline =
    HEADLINE_VARIANTS.find((v) => v.id === headlineId) ?? HEADLINE_VARIANTS[0];
  const selectHeadline = (id: string) => {
    setHeadlineId(id);
    try {
      localStorage.setItem("headline_variant", id);
    } catch {
      /* ignore */
    }
  };

  const filterTabs: Category[] = [
    "All",
    "Business Automation",
    "Meta Ads Management",
    "Ecosystem Design",
  ];

  const counts = useMemo(
    () => ({
      All: services.length,
      "Business Automation": services.filter((s) => s.category === "Business Automation").length,
      "Meta Ads Management": services.filter((s) => s.category === "Meta Ads Management").length,
      "Ecosystem Design": services.filter((s) => s.category === "Ecosystem Design").length,
    }),
    []
  );

  const visibleServices =
    filter === "All" ? services : services.filter((s) => s.category === filter);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary/20 blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-primary-glow/15 blur-[160px]" />
        <div className="absolute top-1/3 left-1/2 w-[420px] h-[420px] bg-gold/10 blur-[180px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-7xl rounded-full glass-strong">
        <div className="flex items-center justify-between px-5 md:px-8 py-3.5">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            <img src={trendfluxLogo} alt="TrendFlux Ecosystem logo" className="h-8 w-8 object-contain" />
            TrendFlux <span className="text-gradient">Ecosystem</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-foreground/70">
            <a href="#services" className="hover:text-gold transition-colors">Services</a>
            <a href="#founder" className="hover:text-gold transition-colors">Brand Architect</a>
            <a href="#cases" className="hover:text-gold transition-colors">Case Studies</a>
            <Link to="/project-lead" className="hover:text-gold transition-colors">Project Lead</Link>
          </div>

          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold transition hover:scale-105"
          >
            Start Operations
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center px-6 pt-32 pb-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl text-center animate-fade-up">

          <h1 className="font-display mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Digital Transformation
            <br />
            & <span className="text-gradient">Growth Operations</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-foreground/60 md:text-lg">
            We engineer resilient growth engines for ambitious brands — pairing
            performance media, automation, and ecosystem design into one
            cinematic operating system.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 font-semibold text-gold-foreground shadow-gold transition hover:scale-105"
            >
              Start Operations <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#cases"
              className="rounded-full border border-foreground/15 px-8 py-4 font-semibold text-foreground transition hover:scale-105 hover:border-primary/60 hover:bg-foreground/5"
            >
              View Case Studies
            </a>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl glass p-6 text-center">
                <div className="font-display text-3xl font-bold text-gradient md:text-4xl">
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.25em] text-foreground/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Directory */}
      <section id="services" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              — Services Directory
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Built like an operating system.{" "}
              <span className="text-gradient">Filed for clarity.</span>
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="mb-10 flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const active = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${
                    active
                      ? "bg-gold text-gold-foreground shadow-gold"
                      : "glass text-foreground/70 hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {tab}
                  <span className={`ml-2 text-xs ${active ? "text-gold-foreground/70" : "text-foreground/40"}`}>
                    {counts[tab]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((s, i) => {
              const Icon = s.icon;
              const idx = services.indexOf(s) + 1;
              return (
                <article
                  key={s.title}
                  className="group rounded-3xl glass glass-hover p-7 flex flex-col"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-sm text-foreground/40">
                      {String(idx).padStart(2, "0")}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-[0.25em] text-primary">
                    {s.category}
                  </p>
                  <h3 className="font-display mt-2 text-2xl font-bold leading-tight">
                    {s.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/60">
                    {s.desc}
                  </p>
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="font-semibold text-gold text-sm">{s.outcome}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand Architect */}
      <section id="founder" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          {/* Portrait */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-cyan opacity-20 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] glass-strong p-2">
              <img
                src={emonPortrait}
                alt="Zahid Hasan Emon, Brand Architect of TrendFlux Ecosystem"
                className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
              />
              <div className="absolute bottom-6 left-6 rounded-full glass-strong px-4 py-2 text-xs">
                <span className="text-gold font-semibold">Brand Architect</span>
                <span className="mx-2 text-foreground/30">·</span>
                <span className="text-foreground/80">Zahid Hasan Emon</span>
              </div>
              <ResumeButton />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              — Meet the Brand Architect
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Brand Architect:{" "}
              <span className="text-gradient">Zahid Hasan Emon</span>
            </h2>
            <blockquote className="mt-8 border-l-2 border-gold/60 pl-6 text-base leading-relaxed text-foreground/75 md:text-lg space-y-4">
              <p>
                "My journey to founding TrendFlux Ecosystem wasn't just built on IT
                engineering and data analytics—it was forged in the crucible of
                extreme adversity. Rooted in a deep maternal legacy of absolute
                honesty, I made a historic stand against systemic corruption
                during my university years.
              </p>
              <p>
                Recognized by national media like{" "}
                <span className="text-gold font-semibold">Desh Rupantor</span>{" "}
                as an unyielding whistleblower, I chose to face insurmountable
                pressure rather than compromise my ethical values. Today, that
                same battle-tested resilience forms the absolute core of
                TrendFlux Ecosystem.
              </p>
              <p>
                When you partner with us, you are gaining a strategic partner
                who values{" "}
                <span className="text-foreground font-semibold">
                  radical transparency, ethical execution, and the courage to
                  stand firm
                </span>{" "}
                for your success."
              </p>
            </blockquote>
            <div className="mt-8 flex items-center gap-3 text-sm text-foreground/60">
              <span className="font-display font-semibold text-foreground">Zahid Hasan Emon</span>
              <span className="text-foreground/30">·</span>
              <span>Brand Architect, TrendFlux Ecosystem</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                to="/project-lead"
                className="inline-flex items-center gap-2 text-primary hover:text-gold transition-colors"
              >
                Read full profile <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              — The Journey
            </p>
            <h3
              key={`title-${headline.id}`}
              lang={headline.id === "satyer-pakshe" ? "bn" : undefined}
              className="font-display text-3xl font-bold tracking-tight md:text-4xl animate-fade-in"
            >
              {headline.timeline}
            </h3>
            <p
              key={`tag-${headline.id}`}
              lang={/[\u0980-\u09FF]/.test(headline.pressTagline) ? "bn" : undefined}
              className="mt-3 text-sm text-foreground/55 md:text-base animate-fade-in"
            >
              {headline.pressTagline}
            </p>

            {/* Headline variants selector */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 mr-1">
                Headline:
              </span>
              {HEADLINE_VARIANTS.map((v) => {
                const active = v.id === headline.id;
                const isBn = /[\u0980-\u09FF]/.test(v.label);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => selectHeadline(v.id)}
                    aria-pressed={active}
                    lang={isBn ? "bn" : undefined}
                    className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                      active
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-foreground/15 text-foreground/55 hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative pl-10 md:pl-14">
            {/* Vertical line */}
            <div
              className="absolute left-3 md:left-5 top-2 bottom-2 w-px bg-gradient-to-b from-gold/60 via-primary/40 to-transparent"
              aria-hidden
            />

            {[
              {
                phase: "Phase 01",
                year: "Foundation",
                title: "A Maternal Legacy of Honesty",
                desc: "Raised under an uncompromising principle: never take what isn't yours, never trade integrity for convenience. The ethical compass that would later define every business decision.",
              },
              {
                phase: "Phase 02",
                year: "University Years",
                title: "The Stand Against Corruption",
                desc: "At Jahangirnagar University, refused to participate in extortion networks operating inside campus halls. Faced direct threats and physical pressure rather than compromise core values.",
              },
              {
                phase: "Phase 03",
                year: "Public Record",
                title: "Recognized by National Media",
                desc: "Featured across Bangladesh's leading outlets as an unyielding whistleblower — turning a personal stand into a documented public record of integrity.",
                press: (dbPress.length > 0 ? dbPress : []) as PressItem[],
              },
              {
                phase: "Phase 04",
                year: "Today",
                title: "TrendFlux Ecosystem",
                desc: "That same battle-tested resilience now powers a growth operations studio built on radical transparency, ethical execution, and the courage to stand firm for every client we partner with.",
              },
            ].map((item, i, arr) => (
              <div
                key={item.phase}
                className={`relative ${i !== arr.length - 1 ? "pb-10" : ""} animate-fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Marker */}
                <div className="absolute -left-10 md:-left-14 top-1 flex h-7 w-7 items-center justify-center">
                  <span className="absolute h-7 w-7 rounded-full bg-gold/25 blur-md animate-pulse" aria-hidden />
                  <span className="absolute h-5 w-5 rounded-full bg-gold/20" aria-hidden />
                  <span className="relative h-3 w-3 rounded-full bg-gold shadow-gold ring-4 ring-background" />
                </div>

                <div className="rounded-2xl glass glass-hover p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em]">
                    <span className="font-semibold text-gold">{item.phase}</span>
                    <span className="text-foreground/30">·</span>
                    <span className="text-foreground/50">{item.year}</span>
                  </div>
                  <h4 className="font-display mt-3 text-xl font-bold md:text-2xl">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/65 md:text-base">
                    {item.desc}
                  </p>

                  {item.press && item.press.length > 0 && (
                    <div className="mt-6">
                      {pressOpenFor !== item.phase ? (
                        <button
                          type="button"
                          onClick={() => setPressOpenFor(item.phase)}
                          className="group relative inline-flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent px-6 py-5 text-left shadow-gold/20 hover:border-gold/70 hover:shadow-gold focus:outline-none focus:ring-2 focus:ring-gold/60 transition-all md:w-auto md:px-8"
                          aria-expanded={false}
                        >
                          <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold via-gold/60 to-transparent" aria-hidden />
                          <span className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40 group-hover:bg-gold/25 transition-colors">
                              <MoreHorizontal className="h-5 w-5 text-gold" />
                            </span>
                            <span className="flex flex-col">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/80">
                                Press Coverage
                              </span>
                              <span className="font-display text-lg font-bold text-foreground md:text-xl">
                                View {item.press.length} National Headlines
                              </span>
                              <span className="mt-0.5 text-xs text-foreground/55">
                                Click to reveal verified outlet reports
                              </span>
                            </span>
                          </span>
                          <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </button>
                      ) : (
                        <div className="animate-fade-up">
                          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-xs uppercase tracking-[0.25em] text-foreground/40">
                              Press Coverage · {item.press.length} headlines
                            </p>
                            <button
                              type="button"
                              onClick={() => setPressOpenFor(null)}
                              className="text-xs uppercase tracking-wider text-foreground/40 hover:text-gold transition-colors"
                            >
                              Hide
                            </button>
                          </div>
                          <p
                            key={`press-tag-${headline.id}`}
                            lang={/[\u0980-\u09FF]/.test(headline.pressTagline) ? "bn" : undefined}
                            className="mb-3 text-xs text-foreground/40 animate-fade-in"
                          >
                            {headline.pressTagline}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {item.press.map((p, idx) => (
                              <Link
                                key={`${p.outlet}-${idx}`}
                                to={p.id ? `/press/${p.id}` : "#"}
                                onClick={(e) => {
                                  if (!p.id) {
                                    e.preventDefault();
                                    setActivePress(p);
                                  }
                                }}
                                className="group/card flex flex-col rounded-xl border border-border bg-foreground/[0.03] p-4 text-left hover:border-gold/40 hover:bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                                    {p.outlet}
                                  </span>
                                  <MoreHorizontal className="h-4 w-4 text-foreground/40 transition-colors group-hover/card:text-gold" />
                                </div>
                                <p
                                  lang="bn"
                                  className="mt-2 text-sm leading-snug text-foreground/80 group-hover/card:text-foreground"
                                >
                                  {p.headline}
                                </p>
                                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40 group-hover/card:text-gold transition-colors">
                                  Explore details
                                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote request modal */}
      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} />

      {/* Press coverage details modal */}
      <Dialog open={!!activePress} onOpenChange={(o) => !o && setActivePress(null)}>
        <DialogContent className="glass border-gold/30 shadow-gold sm:max-w-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <DialogHeader className="space-y-3 pt-2 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {activePress?.outlet}
            </p>
            <DialogTitle className="font-display text-2xl leading-snug md:text-3xl">
              {activePress?.headline}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm leading-relaxed text-foreground/70">
            {activePress?.context}
          </p>

          <div className="flex flex-wrap gap-2">
            {["Bangladesh", "National Press", "2023–2024 coverage"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] uppercase tracking-wider text-foreground/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-foreground/40">
            Link opens the outlet's homepage. Article-level deep links can be added later.
          </p>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => setActivePress(null)}
            >
              Close
            </Button>
            {activePress && (
              <Button variant="gold" asChild>
                <a href={activePress.href} target="_blank" rel="noreferrer noopener">
                  Read on {activePress.outlet} <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Case Studies */}
      <section id="cases" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              — Proven Growth Systems & Results
            </p>
            <h2 className="font-display mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Real systems. <span className="text-gradient">Real outcomes.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-foreground/65">
              Real execution. Here's how I turn strategy into measurable growth.
            </p>
          </div>

          <ul
            role="list"
            aria-label="Case studies"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 list-none p-0"
          >
            {caseStudies.map((c, i) => (
              <li key={c.title}>
              <article
                aria-labelledby={`case-${i}-title`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl glass glass-hover transition-all hover:-translate-y-1 hover:shadow-gold animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-[#0B1F3A]">
                  {/* Subtle dotted grid */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(hsl(var(--gold) / 0.18) 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                    aria-hidden
                  />
                  <c.Icon
                    aria-label={`${c.category} category illustration`}
                    className="relative h-full w-full p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <span className="inline-flex w-fit items-center rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                    {c.category}
                  </span>

                  <h3 id={`case-${i}-title`} className="font-display mt-4 text-xl font-bold leading-snug md:text-2xl">
                    {c.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                    {c.description}
                  </p>

                  <ul aria-label={`Key results for ${c.title}`} className="mt-5 space-y-2">
                    {c.results.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <button
                      type="button"
                      onClick={() => setActiveCase(c)}
                      aria-label={`View full case study: ${c.title}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-gold opacity-80 transition group-hover:opacity-100 hover:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
                    >
                      View Case Study <ArrowRight aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case study detail modal */}
      <Dialog open={!!activeCase} onOpenChange={(o) => !o && setActiveCase(null)}>
        <DialogContent
          className="glass border-gold/30 shadow-gold sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-labelledby="case-modal-title"
          aria-describedby="case-modal-desc"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <DialogHeader className="space-y-3 pt-2 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              <span className="sr-only">Category: </span>
              {activeCase?.category}
            </p>
            <DialogTitle id="case-modal-title" className="font-display text-2xl leading-snug md:text-3xl">
              {activeCase?.title}
            </DialogTitle>
            <DialogDescription id="case-modal-desc" className="text-sm text-foreground/70">
              {activeCase?.description}
            </DialogDescription>
          </DialogHeader>

          {activeCase && (
            <div className="space-y-5 text-sm leading-relaxed text-foreground/75">
              {/* Compact KPI summary */}
              <section
                aria-labelledby="kpi-heading"
                className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-5"
              >
                <h3 id="kpi-heading" className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/80">
                  Headline Outcome
                </h3>
                <p className="font-display mt-1.5 text-xl font-bold leading-tight text-gradient md:text-2xl">
                  {activeCase.results[0]}
                </p>
                <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {activeCase.results.map((r, idx) => (
                    <div
                      key={r}
                      className="rounded-lg border border-border bg-background/40 p-3"
                    >
                      <dt className="text-[9px] font-semibold uppercase tracking-[0.25em] text-foreground/40">
                        KPI {String(idx + 1).padStart(2, "0")}
                      </dt>
                      <dd className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-foreground/90">
                        <CheckCircle2 aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span>{r}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <Section label="Situation" body={activeCase.situation} />
              <Section label="Problem" body={activeCase.problem} />
              <Section label="Solution" body={activeCase.solution} />
              <section aria-labelledby="results-heading">
                <h3 id="results-heading" className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/80">
                  Results
                </h3>
                <ul className="mt-2 space-y-2">
                  {activeCase.results.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="insight-heading" className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                <h3 id="insight-heading" className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                  Key Insight
                </h3>
                <p className="mt-2 text-foreground/85">{activeCase.insight}</p>
              </section>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="ghost" onClick={() => setActiveCase(null)}>
              Close
            </Button>
            <Button variant="gold" onClick={() => { setActiveCase(null); setQuoteOpen(true); }}>
              Build Something Similar <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final CTA + Footer */}
      <footer id="contact" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] glass-strong p-10 text-center md:p-16">
          {/* Brand monogram */}
          <div className="mx-auto mb-7 flex flex-col items-center">
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 rounded-full bg-gold/20 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground shadow-gold">
                <span className="font-display text-2xl font-extrabold tracking-tight">TF</span>
              </div>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-gold/80">
              TrendFlux Ecosystem
            </p>
          </div>

          <h2 className="font-display mx-auto max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Ready to operate at{" "}
            <span className="text-gradient">full velocity?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-foreground/60">
            Limited partnerships open each quarter. Let's architect yours.
          </p>

          <p className="mx-auto mt-10 text-[10px] uppercase tracking-[0.4em] text-foreground/40">
            ◆ Choose your tier ◆
          </p>

          <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
            <Link
              to="/brand-open"
              className="tier-card tier-card-1 relative overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.03] p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/5"
            >
              <span className="tier-sheen" aria-hidden />
              <div className="relative flex items-center justify-between">
                <Megaphone className="h-5 w-5 text-gold" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold/70">01 · Open</span>
              </div>
              <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground">Brand Tok</h3>
              <p className="relative mt-1 text-xs text-foreground/55">Mass storytelling for everyone.</p>
            </Link>

            <Link
              to="/trendflux-talent"
              className="tier-card tier-card-2 relative overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.03] p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/5"
            >
              <span className="tier-sheen" aria-hidden />
              <div className="relative flex items-center justify-between">
                <Users className="h-5 w-5 text-gold" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold/70">02 · Platform</span>
              </div>
              <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground">TrendFlux Talent</h3>
              <p className="relative mt-1 text-xs text-foreground/55">Creator network for serious brands.</p>
            </Link>

            <button
              type="button"
              onClick={() => { setVeilError(""); setVeilOpen(true); }}
              title="Luxe Veil is invite-only"
              className="tier-card tier-card-3 relative overflow-hidden rounded-2xl border border-gold/30 bg-[#07182e]/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/70 hover:bg-gold/5"
            >
              <span className="tier-sheen" aria-hidden />
              <div className="relative flex items-center justify-between">
                <Lock className="h-5 w-5 text-gold tier-lock-icon" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold/70">03 · Secret</span>
              </div>
              <h3 className="relative mt-3 font-display text-lg font-semibold text-gold">Luxe Veil</h3>
              <p className="relative mt-1 text-xs text-foreground/55">Invitation only. By referral.</p>
              <span className="absolute right-3 bottom-3 text-[9px] uppercase tracking-[0.3em] text-gold/60">
                Locked
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold px-9 py-4 font-bold text-gold-foreground shadow-gold transition hover:scale-105"
          >
            Start Operations <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Contact icons */}
        <div className="mx-auto mt-12 max-w-7xl border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { Icon: Linkedin, href: "https://www.linkedin.com/in/zhemongrowth", label: "LinkedIn" },
              { Icon: Facebook, href: "https://www.facebook.com/zhemongrowth/", label: "Facebook" },
              { Icon: Youtube, href: "https://www.youtube.com/@zhemongrowth", label: "YouTube" },
              { Icon: MessageCircle, href: "https://wa.me/message/5GSNUYK6CSDCN1", label: "WhatsApp" },
              { Icon: Mail, href: "mailto:zhemongrowth@gmail.com", label: "Email" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-11 h-11 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-gold hover:border-gold/40 hover:scale-110 transition-all"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 text-sm text-foreground/50 md:flex-row">
            <div className="flex items-center gap-2">
              <img src={trendfluxLogo} alt="TrendFlux Ecosystem logo" className="h-7 w-7 object-contain" />
              <p className="font-semibold text-foreground">TrendFlux Ecosystem</p>
            </div>
            <p>© 2026 — Built on integrity</p>
          </div>
        </div>
      </footer>

      {/* Luxe Veil invitation code dialog */}
      <Dialog open={veilOpen} onOpenChange={setVeilOpen}>
        <DialogContent className="border-gold/40 bg-[#0c2218] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-gold">
              <Lock className="h-4 w-4" /> Enter your invitation
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Luxe Veil is invite-only. Enter your code to access the private experience.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitVeilCode} className="mt-2 space-y-3">
            <input
              autoFocus
              value={veilCode}
              onChange={(e) => setVeilCode(e.target.value)}
              placeholder="INVITE CODE"
              aria-label="Invitation code"
              className="w-full rounded-full border border-gold/40 bg-transparent px-5 py-3 text-center text-sm uppercase tracking-[0.3em] text-white outline-none focus:border-gold"
            />
            {veilError && (
              <p role="alert" aria-live="assertive" className="text-xs text-red-300">{veilError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-gold py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0c2218] transition hover:opacity-90"
            >
              Unlock Experience
            </button>
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/40">
              Don't have a code?{" "}
              <Link to="/luxe-veil" className="text-gold/80 hover:text-gold" onClick={() => setVeilOpen(false)}>
                Request invitation
              </Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

const Section = ({ label, body }: { label: string; body: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/80">
      {label}
    </p>
    <p className="mt-2 text-foreground/75">{body}</p>
  </div>
);

export default Index;
