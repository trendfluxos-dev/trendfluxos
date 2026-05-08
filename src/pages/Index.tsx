import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialIcons from "@/components/social/SocialIcons";
import {
  ArrowRight,
  ArrowUpRight,
  Workflow,
  Users,
  Sparkles,
  Target,
  Layers,
  Cpu,
  MoreHorizontal,
  CheckCircle2,
  Megaphone,
  Lock,
  Menu,
  X,
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
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { DigitalImpactMap } from "@/components/DigitalImpactMap";
import { Faq } from "@/components/Faq";
import { StrategySessionDialog } from "@/components/StrategySessionDialog";
import FilterBar, { EMPTY_FILTERS, type CaseFilters } from "@/components/FilterBar";
import { useCaseFilters, serializeFilters } from "@/hooks/useCaseFilters";
import type { CaseStudy } from "@/data/caseStudies";
import { track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

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
    desc: "AI-powered workflow automation that replaces repetitive ops, syncs your tools, and gives founders a single command layer to run the business.",
    bestFor: "Solo founders & lean ops teams running on Notion, Slack, Sheets and Zapier duct-tape.",
    outcome: "70% manual hours reclaimed within 30 days, 24/7 hands-off execution.",
  },
  {
    category: "Business Automation" as const,
    icon: Users,
    title: "CRM & Sales Orchestration",
    desc: "Pipeline-grade CRM architecture with lead scoring, lifecycle automation, and revenue dashboards built on HubSpot, GoHighLevel or custom Supabase stacks.",
    bestFor: "B2B & service brands losing 30%+ of inbound leads to slow follow-up.",
    outcome: "3.2x lead-to-deal conversion, sub-5-min response SLA.",
  },
  {
    category: "Meta Ads Management" as const,
    icon: Sparkles,
    title: "Performance Creative Labs",
    desc: "Iterative creative testing framework — UGC, static, and motion ads engineered for Meta's algorithm with weekly hook-rate and CTR scorecards.",
    bestFor: "DTC & e-commerce brands spending $10K+/month with creative fatigue.",
    outcome: "+45% ROAS lift, 3x winning creative output per month.",
  },
  {
    category: "Meta Ads Management" as const,
    icon: Target,
    title: "Full-Funnel Paid Strategy",
    desc: "End-to-end Meta funnel design — Advantage+ campaigns, retention retargeting, and AOV-focused bid strategy aligned to LTV economics.",
    bestFor: "In-house performance teams stuck on a CAC ceiling above $25.",
    outcome: "Sub-$8 CAC, 2.4x blended ROAS within 60 days.",
  },
  {
    category: "Ecosystem Design" as const,
    icon: Layers,
    title: "Brand Operating Systems",
    desc: "Multi-brand identity, messaging architecture, and content engine designed so every sub-brand reinforces the parent ecosystem and compounds equity.",
    bestFor: "Multi-brand founders, holdcos, and creator-led businesses scaling 2+ brands.",
    outcome: "12-month brand roadmap + unified content OS deployed across all properties.",
  },
  {
    category: "Ecosystem Design" as const,
    icon: Cpu,
    title: "Tech Stack Architecture",
    desc: "Vendor-neutral stack design — React, Supabase, Lovable Cloud, edge functions and AI gateways — picked for performance, cost, and exit-ready ownership.",
    bestFor: "Scaling teams replatforming off WordPress, Webflow or fragmented SaaS.",
    outcome: "Zero vendor lock-in, 40% lower infra cost, full data portability.",
  },
];

import { caseStudies } from "@/data/caseStudies";

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
  const [quoteContext, setQuoteContext] = useState<{
    source: string;
    module?: string;
    category?: string;
  } | null>(null);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategySource, setStrategySource] = useState<{ slug: string | null; source: string } | null>(null);
  const openStrategy = (source: string, slug: string | null = null) => {
    setStrategySource({ slug, source });
    setStrategyOpen(true);
  };
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [caseFilters, setCaseFilters] = useCaseFilters();
  const [pressOpenFor, setPressOpenFor] = useState<string | null>(null);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const [narrativeCase, setNarrativeCase] = useState<CaseStudy | null>(null);
  const narrativeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const narrativeInitialFocusRef = useRef<HTMLButtonElement | null>(null);

  const openNarrative = (
    c: CaseStudy,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    narrativeTriggerRef.current = e.currentTarget;
    track("view_narrative_open", {
      case_slug: c.slug,
      case_title: c.title,
      case_category: c.category,
      source: "case_card",
    });
    setNarrativeCase(c);
  };

  const closeNarrative = () => {
    setNarrativeCase(null);
  };
  const [veilOpen, setVeilOpen] = useState(false);
  const [veilCode, setVeilCode] = useState("");
  const [veilError, setVeilError] = useState("");
  const [veilVerifying, setVeilVerifying] = useState(false);
  const navigate = useNavigate();
  const submitVeilCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (veilVerifying) return;
    setVeilVerifying(true);
    setVeilError("");
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean; token?: string; error?: string;
      }>("verify-invite", { body: { code: veilCode.trim() } });
      if (error || !data?.ok || !data.token) {
        setVeilError(data?.error || "Invalid invitation code. Please check with your host.");
      } else {
        try { localStorage.setItem("luxe_veil_token", data.token); } catch { /* ignore */ }
        setVeilOpen(false);
        setVeilCode("");
        navigate("/luxe-veil");
      }
    } catch {
      setVeilError("Could not verify invitation. Please try again.");
    } finally {
      setVeilVerifying(false);
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

  // Compute filtered case studies once so we can share with the map and the grid.
  const caseFiltersActive = !!(
    caseFilters.service ||
    caseFilters.industry ||
    caseFilters.stack ||
    caseFilters.stage ||
    caseFilters.query.trim()
  );
  const filteredCases = useMemo(() => {
    const q = caseFilters.query.trim().toLowerCase();
    return caseStudies.filter((c) => {
      if (caseFilters.service && c.service !== caseFilters.service) return false;
      if (caseFilters.industry && c.industry !== caseFilters.industry) return false;
      if (caseFilters.stack && !c.stack.includes(caseFilters.stack as typeof c.stack[number])) return false;
      if (caseFilters.stage && c.stage !== caseFilters.stage) return false;
      if (q) {
        const hay = `${c.title} ${c.description} ${c.category} ${c.service} ${c.industry} ${c.stack.join(" ")} ${c.stage}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [caseFilters]);
  const matchingSlugs = caseFiltersActive ? filteredCases.map((c) => c.slug) : undefined;

  const handleNodeSelect = (slug: string) => {
    track("map_node_click", { case_slug: slug });
    setHighlightedSlug(slug);
    // Scroll the cases section into view and clear highlight after a short window.
    requestAnimationFrame(() => {
      const el = document.getElementById(`case-card-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        document.getElementById("cases")?.scrollIntoView({ behavior: "smooth" });
      }
    });
    window.setTimeout(() => setHighlightedSlug((s) => (s === slug ? null : s)), 4000);
  };

  useSeo();
  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND.name,
      legalName: BRAND.legalName,
      alternateName: BRAND.nameLead,
      url: BRAND.url,
      logo: `${BRAND.url}/favicon.ico`,
      slogan: BRAND.tagline,
      description: BRAND.description,
      sameAs: [
        "https://www.facebook.com/trendfluxdigital",
        "https://www.linkedin.com/company/trendflux",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND.name,
      url: BRAND.url,
      description: BRAND.description,
      publisher: { "@type": "Organization", name: BRAND.legalName },
    },
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary/20 blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-primary-glow/15 blur-[160px]" />
        <div className="absolute top-1/3 left-1/2 w-[420px] h-[420px] bg-gold/10 blur-[180px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[94%] max-w-7xl rounded-full glass-strong border border-foreground/10 shadow-elegant">
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-3.5 gap-3">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 font-display text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
          >
            <img src={trendfluxLogo} alt={`${BRAND.name} logo`} className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
            <span>{BRAND.nameLead}</span> <span className="text-gradient">{BRAND.nameTrail}</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-7 xl:gap-8 text-sm text-foreground/70">
            {[
              { href: "#services", label: "Services" },
              { href: "#founder", label: "Brand Architect" },
              { href: "#cases", label: "Case Studies" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative whitespace-nowrap py-1 transition-colors duration-300 hover:text-gold focus-visible:text-gold focus-visible:outline-none after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:mx-auto after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/project-lead"
              className="relative whitespace-nowrap py-1 transition-colors duration-300 hover:text-gold after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:mx-auto after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              Project Lead
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="hidden sm:inline-flex md:hidden lg:inline-flex whitespace-nowrap rounded-full bg-gold px-3.5 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-semibold text-gold-foreground shadow-gold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_hsl(var(--gold)/0.55)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <span className="hidden lg:inline">Launch Growth System</span>
              <span className="lg:hidden">Launch System</span>
            </button>
            <button
              type="button"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((o) => !o)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 text-foreground/80 hover:text-gold hover:border-gold/40 transition-colors"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            mobileNavOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-5 pb-4 pt-1 flex flex-col gap-1 text-sm">
            {[
              { href: "#services", label: "Services" },
              { href: "#founder", label: "Brand Architect" },
              { href: "#cases", label: "Case Studies" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl px-3 py-2.5 text-foreground/80 hover:bg-foreground/5 hover:text-gold transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/project-lead"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-xl px-3 py-2.5 text-foreground/80 hover:bg-foreground/5 hover:text-gold transition-colors"
            >
              Project Lead
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                setQuoteOpen(true);
              }}
              className="mt-2 sm:hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold transition active:scale-95"
            >
              Launch Growth System
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center px-5 pt-28 pb-16 sm:px-6 sm:pt-32 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl text-center animate-fade-up">

          <h1 className="font-display mx-auto max-w-5xl text-4xl sm:text-5xl font-black leading-[1.05] sm:leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            <span className="block break-words">{BRAND.hero.headlineLead}</span>
            <span className="text-gradient block break-words">{BRAND.hero.headlineTrail}</span>
          </h1>

          <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-sm sm:text-base leading-relaxed text-foreground/60 md:text-lg">
            {BRAND.hero.subheadline}
          </p>

          {/* Trust bar */}
          <div className="mx-auto mt-7 sm:mt-9 max-w-3xl">
            <div className="glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-foreground/55">
              <span>AI Systems</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold/60" aria-hidden />
              <span>Automation</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold/60" aria-hidden />
              <span>Brand Infrastructure</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold/60" aria-hidden />
              <span>Growth Operations</span>
            </div>
            <p className="mt-3 text-[11px] sm:text-xs uppercase tracking-[0.3em] text-foreground/45">
              Built for Founders, Brands &amp; High-Growth Businesses
            </p>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col items-stretch sm:items-center justify-center gap-3 sm:gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gold px-7 sm:px-8 py-3.5 sm:py-4 font-semibold text-gold-foreground shadow-gold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_36px_hsl(var(--gold)/0.55)] active:scale-95"
            >
              {BRAND.hero.primaryCta} <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#cases"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-foreground/15 px-7 sm:px-8 py-3.5 sm:py-4 font-semibold text-foreground transition-all duration-300 hover:scale-[1.04] hover:border-gold/60 hover:bg-foreground/5"
            >
              {BRAND.hero.secondaryCta}
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

      {/* Digital Impact Map */}
      <DigitalImpactMap
        matchingSlugs={matchingSlugs}
        onResetFilters={() => setCaseFilters(EMPTY_FILTERS)}
        returnTo={`/${serializeFilters(caseFilters)}#cases`}
        onNodeSelect={handleNodeSelect}
        highlightedSlug={highlightedSlug}
      />

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

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((s, i) => {
              const Icon = s.icon;
              const idx = services.indexOf(s) + 1;
              return (
                <article
                  key={s.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-white p-5 sm:p-7 flex flex-col shadow-[0_1px_2px_hsl(0_0%_0%/0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_44px_-18px_hsl(var(--primary)/0.22)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b from-primary to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="flex items-start justify-between">
                    <span className="font-display text-sm text-foreground/40">
                      {String(idx).padStart(2, "0")}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-5 sm:mt-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-primary break-words">
                    {s.category}
                  </p>
                  <h3 className="font-display mt-2 text-xl sm:text-2xl font-bold leading-tight tracking-tight break-words [text-wrap:balance]">
                    {s.title}
                  </h3>
                  <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm leading-relaxed text-foreground/60">
                    {s.desc}
                  </p>

                  <dl className="mt-4 sm:mt-5 space-y-3 text-[11px] sm:text-xs">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                      <dt className="sm:min-w-[72px] uppercase tracking-wider text-foreground/40">Best for</dt>
                      <dd className="text-foreground/80 leading-relaxed break-words">{s.bestFor}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                      <dt className="sm:min-w-[72px] uppercase tracking-wider text-foreground/40">Outcome</dt>
                      <dd className="font-semibold text-gold leading-relaxed break-words">{s.outcome}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        track("service_module_cta", {
                          module: s.title,
                          category: s.category,
                          source: "services_grid",
                        });
                        setQuoteContext({
                          source: "services_grid",
                          module: s.title,
                          category: s.category,
                        });
                        setQuoteOpen(true);
                      }}
                      className="group/cta inline-flex w-full items-center justify-between gap-2 rounded-full border border-gold/30 bg-gold/5 px-3.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`Activate ${s.title}`}
                    >
                      <span>Activate Module</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                    </button>
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

                  {item.press !== undefined && item.press.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-gold/30 bg-foreground/[0.02] px-6 py-8 text-center">
                      <p className="text-xs uppercase tracking-[0.3em] text-gold/70">
                        Press Coverage
                      </p>
                      <p className="mt-3 font-display text-base font-semibold text-foreground/80 md:text-lg">
                        Verified national headlines coming soon.
                      </p>
                      <p className="mt-2 text-xs text-foreground/50">
                        We're curating the public record. Check back shortly for documented outlet reports.
                      </p>
                    </div>
                  )}
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
      <QuoteDialog
        open={quoteOpen}
        onOpenChange={(o) => {
          setQuoteOpen(o);
          if (!o) setTimeout(() => setQuoteContext(null), 250);
        }}
        context={quoteContext}
      />

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
      <section id="cases" className="relative bg-muted px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
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

          {/* Ecosystem metrics strip */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10"
            aria-label="Ecosystem performance metrics"
          >
            {[
              { value: "485K+", label: "Organic Views Generated", tone: "green" as const },
              { value: "+45%", label: "Avg. Engagement Growth", tone: "green" as const },
              { value: "24/7", label: "AI Automation Layer", tone: "orange" as const },
              { value: "3", label: "Multi-Brand Ecosystems Live", tone: "red" as const },
            ].map((m) => {
              const dot =
                m.tone === "green"
                  ? "bg-brand-green"
                  : m.tone === "orange"
                    ? "bg-brand-orange"
                    : "bg-primary";
              const tag =
                m.tone === "green"
                  ? "text-brand-green border-brand-green/30 bg-brand-green/10"
                  : m.tone === "orange"
                    ? "text-brand-orange border-brand-orange/30 bg-brand-orange/10"
                    : "text-primary border-primary/30 bg-primary/10";
              return (
                <div
                  key={m.label}
                  className="rounded-2xl border border-border bg-white p-5 text-center shadow-[0_1px_2px_hsl(0_0%_0%/0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_hsl(0_0%_0%/0.10)]"
                >
                  <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {m.value}
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-foreground/55">
                    {m.label}
                  </div>
                  <span
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${tag}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    Live
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <FilterBar
          value={caseFilters}
          onChange={setCaseFilters}
          resultCount={caseFiltersActive ? filteredCases.length : undefined}
        />
        <div className="mx-auto max-w-7xl mt-8">
          {caseFiltersActive && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.25em] text-foreground/55">
              <span aria-live="polite">
                <span className="font-semibold text-foreground">{filteredCases.length}</span> of{" "}
                {caseStudies.length} case studies match
              </span>
              <button
                type="button"
                onClick={() => setCaseFilters(EMPTY_FILTERS)}
                className="text-gold hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {filteredCases.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl glass border border-gold/30">
              <p className="font-display text-2xl font-bold">No matching case studies</p>
              <p className="mt-3 text-sm text-foreground/60 max-w-md mx-auto">
                Try removing one of your filters or clearing the search to see all{" "}
                {caseStudies.length} live growth systems.
              </p>
              <button
                type="button"
                onClick={() => setCaseFilters(EMPTY_FILTERS)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-foreground hover:scale-105 transition"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ul
              role="list"
              aria-label="Case studies"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 list-none p-0"
            >
              {filteredCases.map((c, i) => (
                <li key={c.title}>
                  <article
                    id={`case-card-${c.slug}`}
                    aria-labelledby={`case-${i}-title`}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.18)] hover:border-[hsl(0_84%_82%)] animate-fade-up ${
                      caseFiltersActive ? "ring-1 ring-primary/30" : ""
                    } ${
                      highlightedSlug === c.slug
                        ? "ring-2 ring-primary shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25)] -translate-y-1.5"
                        : ""
                    }`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* premium top sheen */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    {/* gradient halo on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(600px circle at 50% -20%, hsl(var(--primary) / 0.10), transparent 40%)",
                      }}
                    />
                    <div
                      className="relative aspect-[16/10] overflow-hidden border-b border-border"
                      style={{
                        background:
                          "linear-gradient(180deg, #FFF5F5 0%, #FFE4E6 45%, #FFFFFF 100%)",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage:
                            "radial-gradient(hsl(var(--primary) / 0.18) 1px, transparent 1px)",
                          backgroundSize: "14px 14px",
                        }}
                        aria-hidden
                      />
                      <c.Icon
                        aria-label={`${c.category} category illustration`}
                        className="relative h-full w-full p-6 text-primary transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
                    </div>

                    <div className="relative flex flex-1 flex-col p-7">
                      <span className="inline-flex w-fit items-center rounded-full border border-[hsl(0_84%_82%)] bg-[hsl(0_86%_97%)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
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
                            <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => openNarrative(c, e)}
                          aria-label={`View narrative for ${c.title}`}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-foreground shadow-gold/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_28px_hsl(var(--gold)/0.5)] active:scale-95"
                        >
                          View Narrative <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            track("consult_operator_click", {
                              case_slug: c.slug,
                              case_title: c.title,
                              source: "case_card",
                            });
                            openStrategy("case_card", c.slug);
                          }}
                          aria-label={`Consult an operator about ${c.title}`}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-foreground/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/85 transition-all duration-300 hover:border-gold/60 hover:text-gold hover:bg-gold/5"
                        >
                          Consult Operator
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>


      {/* FAQ */}
      <Faq />

      {/* Final CTA + Footer */}
      <footer id="contact" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] glass-strong p-10 text-center md:p-16">
          <h2 className="font-display mx-auto max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Ready to operate at{" "}
            <span className="text-gradient">full velocity</span> of{" "}
            <span className="text-gradient">{BRAND.name}</span>?
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
              <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground">Studio BrandToki</h3>
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
              className="tier-card tier-card-3 relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
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

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-9 py-4 font-bold text-gold-foreground shadow-gold transition hover:scale-105"
            >
              Launch Growth System <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => openStrategy("footer_cta")}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-4 font-semibold text-foreground transition hover:border-primary/60 hover:bg-foreground/5"
            >
              Book a Growth Strategy Session
            </button>
          </div>
        </div>

        {/* Contact icons */}
        <div className="mx-auto mt-12 max-w-7xl border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SocialIcons brand="trendflux" variant="footer" size="lg" />
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
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-primary">
              <Lock className="h-4 w-4" /> Enter your invitation
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-center text-sm uppercase tracking-[0.3em] text-foreground outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            {veilError && (
              <p role="alert" aria-live="assertive" className="text-xs text-primary">{veilError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-[hsl(var(--primary-glow))]"
            >
              Unlock Experience
            </button>
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Access by referral only. No public registration.
            </p>
          </form>
        </DialogContent>
      </Dialog>
      <StrategySessionDialog
        open={strategyOpen}
        onOpenChange={(o) => {
          setStrategyOpen(o);
          if (!o) setStrategySource(null);
        }}
        sourceCaseSlug={strategySource?.slug ?? null}
        source={strategySource?.source}
      />

      {/* Case study narrative modal */}
      <Dialog open={!!narrativeCase} onOpenChange={(o) => !o && closeNarrative()}>
        <DialogContent
          className="glass-strong border-gold/30 shadow-[0_30px_80px_-20px_hsl(var(--gold)/0.45)] sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // Take over Radix's default initial focus and place it on a meaningful control
            // inside the modal (the primary action), so screen-reader users land somewhere useful.
            if (narrativeInitialFocusRef.current) {
              e.preventDefault();
              narrativeInitialFocusRef.current.focus();
            }
          }}
          onCloseAutoFocus={(e) => {
            // Explicitly return focus to the card button that opened the modal,
            // overriding Radix's default (which can lose the trigger after re-renders).
            if (narrativeTriggerRef.current) {
              e.preventDefault();
              narrativeTriggerRef.current.focus();
              narrativeTriggerRef.current = null;
            }
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          {narrativeCase && (
            <>
              <DialogHeader className="space-y-3 pt-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                    {narrativeCase.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                    {narrativeCase.map.city} · {narrativeCase.map.region}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl leading-snug md:text-3xl">
                  {narrativeCase.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-foreground/70">
                  {narrativeCase.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Situation", value: narrativeCase.situation },
                  { label: "Problem", value: narrativeCase.problem },
                  { label: "Solution", value: narrativeCase.solution },
                  { label: "Insight", value: narrativeCase.insight },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                      {b.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">{b.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                  Outcomes
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {narrativeCase.results.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <DialogFooter className="gap-2 sm:gap-3 pt-2">
                <Button variant="ghost" onClick={closeNarrative}>
                  Close
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const slug = narrativeCase?.slug ?? null;
                    if (narrativeCase) {
                      track("consult_operator_click", {
                        case_slug: narrativeCase.slug,
                        case_title: narrativeCase.title,
                        source: "narrative_modal",
                      });
                    }
                    closeNarrative();
                    openStrategy("narrative_modal", slug);
                  }}
                >
                  Consult Operator
                </Button>
                <Button variant="gold" asChild>
                  <Link
                    ref={(el) => {
                      // The asChild Button passes its ref through to this anchor.
                      narrativeInitialFocusRef.current = (el as unknown as HTMLButtonElement) ?? null;
                    }}
                    to={`/case-studies/${narrativeCase.slug}`}
                    state={{ from: `/${serializeFilters(caseFilters)}#cases` }}
                    onClick={closeNarrative}
                  >
                    Open Full Case Study <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};


export default Index;
