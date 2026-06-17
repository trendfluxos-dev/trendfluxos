import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Megaphone,
  Database,
  GitBranch,
  Palette,
  Sparkles,
  GraduationCap,
  Lock,
  Workflow,
  Target,
  ShieldCheck,
  Quote,
  CheckCircle2,
  
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { QuoteDialog } from "@/components/QuoteDialog";
import emonPortrait from "@/assets/zahid-hasan-emon.webp";
import theStandCover from "@/assets/the-stand-cover.jpg";
import AudioStoryTeaser from "@/components/tf/AudioStoryTeaser";
import { TfSection, TfCard } from "@/components/tf/Section";
import { InlineEditProvider, InlineEditToggle, EditableText } from "@/components/InlineEditable";
import DashboardMock from "@/components/tf/DashboardMock";
import EcosystemMap from "@/components/tf/EcosystemMap";
import ProofTabs from "@/components/tf/ProofTabs";
import brandPabnaNagorik from "@/assets/brands/pabna-nagorik-committee.jpeg";
import brandHbEduverse from "@/assets/brands/hb-eduverse.jpeg";
import brandMarieElliot from "@/assets/brands/marie-j-elliot.jpeg";
import brandPabnaDebate from "@/assets/brands/pabna-debate-society.jpeg";
import brandStarpath from "@/assets/brands/starpath-tech.jpeg";

const OPERATED_BRANDS = [
  {
    name: "TrendFlux Digital",
    role: "Founder · AI-Native Growth OS",
    logo: "/trendflux-logo.webp",
    href: "https://trendflux.digital",
    fb: "https://www.facebook.com/trendfluxdigital/",
  },
  {
    name: "Starpath Technology & Consultancy",
    role: "Strategy, systems & content lead — in-house",
    logo: brandStarpath,
    href: "https://facebook.com/starpathtech",
    impact: "588 REHAB leads · 5–8M BDT pitches",
    tagline: "GHL + Wix CRM hybrid, McKinsey-grade proposals, 4-week AI content OS",
    paid: true,
  },
  {
    name: "Pabna Nagorik Committee",
    role: "Website, social & content — full stack solo",
    logo: brandPabnaNagorik,
    href: "https://www.facebook.com/PabnaNagorikCommittee",
    impact: "485K+ organic views",
    tagline: "নাগরিক ঐক্যেই বদলাবে পাবনা — strategy, creative, setup, ops",
    paid: true,
  },
  {
    name: "H&B EduVerse",
    role: "Growth systems · EdTech",
    logo: brandHbEduverse,
  },
  {
    name: "Marie J. Elliot",
    role: "Brand & funnel · Child Parenting",
    logo: brandMarieElliot,
  },
  {
    name: "Pabna Debate Society",
    role: "Community ops · Education",
    logo: brandPabnaDebate,
  },
];

const TRUST = [
  { icon: Bot, label: "AI Automation" },
  { icon: Database, label: "CRM Infrastructure" },
  { icon: Megaphone, label: "Meta Ad Systems" },
  { icon: GitBranch, label: "Workflow Orchestration" },
  { icon: Palette, label: "Creative Frameworks" },
  { icon: Sparkles, label: "Analytics Intelligence" },
];

const SERVICES = [
  { icon: Megaphone, title: "Meta Ads", desc: "Advantage+ funnels engineered for sub-$8 CAC and compounding ROAS." },
  { icon: Bot, title: "AI Automation", desc: "Agents and workflows that replace 20+ manual hours weekly." },
  { icon: Database, title: "CRM Systems", desc: "Lead scoring, lifecycle, and pipeline visibility — one source of truth." },
  { icon: Workflow, title: "Funnel Engineering", desc: "Acquisition, activation, retention — wired end to end." },
  { icon: Palette, title: "Creative Strategy", desc: "Hook-rate framework, weekly creative tests, motion + UGC at scale." },
  { icon: Target, title: "Founder Branding", desc: "Position founders as category operators, not commodity service providers." },
];

const METRICS = [
  { value: "$8.4M", label: "Ad spend orchestrated", delta: "+312% avg lift" },
  { value: "4.82x", label: "Blended ROAS", delta: "across 47 ops" },
  { value: "20+", label: "Hours reclaimed weekly", delta: "per founder" },
  { value: "99%", label: "Lead routing latency cut", delta: "sub-5s SLA" },
];

const TESTIMONIALS = [
  {
    quote:
      "TrendFlux replaced three agencies and two internal hires. Our pipeline is now an audited system, not a guessing game.",
    name: "Director of Growth",
    role: "Series-A SaaS · $14M ARR",
  },
  {
    quote:
      "Within 60 days we cut CAC by 38% and reclaimed 22 founder hours a week. The OS framing is real — not marketing copy.",
    name: "Founder & CEO",
    role: "DTC portfolio · 7-figure scale",
  },
  {
    quote:
      "The only operator I've worked with who treats growth like infrastructure. Every workflow is observable and ownable.",
    name: "Head of Operations",
    role: "B2B services · $6M ARR",
  },
];

const FIT = [
  "Founder-led brand doing $1M–$50M annual revenue",
  "Ready to consolidate scattered tools into one OS",
  "Committed to a 90-day systems engagement",
  "Values operating leverage over vanity reporting",
];

const Index = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useSeo();
  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND.name,
      legalName: BRAND.legalName,
      url: BRAND.url,
      logo: `${BRAND.url}/favicon.ico`,
      slogan: BRAND.tagline,
      description: BRAND.description,
      sameAs: [
        "https://www.facebook.com/trendfluxdigital",
        "https://www.linkedin.com/company/trendflux",
      ],
    },
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />

      {/* ============= 1. HERO ============= */}
      <section className="relative isolate overflow-hidden bg-background pt-32 pb-24 sm:pt-44 sm:pb-32">
        {/* animated grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg" />
        {/* primary glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/8 blur-[180px] tf-glow-pulse"
        />
        {/* secondary corner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-[140px]"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-10">
          <div className="tf-rise text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                TrendFlux OS · v2.0 · Live
              </span>
            </div>

            <h1 className="mt-8 font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-[56px] lg:text-[68px] lg:leading-[1.0]">
              Your AI-Powered
              <br />
              <span className="tf-text-electric">Growth Operating System</span>
              <span className="text-primary">.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px] lg:mx-0">
              Replace scattered tools, disconnected workflows, and manual scaling
              with one unified AI-driven ecosystem — built for founders who
              operate beyond marketing.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3.5 lg:justify-start">
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="tf-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90 sm:w-auto"
              >
                Book Strategy Call <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#ecosystem"
                className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-px hover:border-foreground/20 hover:bg-muted sm:w-auto"
              >
                Explore the OS
              </a>
            </div>

            {/* inline trust micro-row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-primary" /> NDA-ready</span>
              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
              <span>$8.4M ad spend</span>
              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
              <span>47 ops deployed</span>
              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" />
              <span>4.82x avg ROAS</span>
            </div>
          </div>

          <div className="relative">
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* ============= 2. TRUST BAR ============= */}
      <section className="relative border-y border-border bg-muted py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-7 text-center text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
            One ecosystem · Six integrated layers
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="group flex items-center justify-center gap-2 text-[12px] font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                <t.icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                <span className="whitespace-nowrap">{t.label}</span>
              </div>

            ))}
          </div>
        </div>
      </section>

      {/* ============= 3. ECOSYSTEM OVERVIEW ============= */}
      <TfSection
        id="ecosystem"
        eyebrow="The Architecture"
        title={<>One connected system. <span className="text-muted-foreground">Zero glue work.</span></>}
        intro="Every module of the TrendFlux OS is engineered to plug into the next — automation feeds CRM, CRM informs creative, creative powers ads, ads feed analytics. Compounding by design."
      >
        <EcosystemMap />
        <div className="mt-12 text-center">
          <Link
            to="/ecosystem"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View full architecture <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </TfSection>

      {/* ============= 4. SERVICES ============= */}
      <TfSection
        id="services"
        eyebrow="Services"
        title="Six disciplines. One operating layer."
        intro="Each service is a module of the OS — deployed standalone or composed into a full Growth OS engagement."
        tone="muted"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <TfCard key={s.title}>
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </TfCard>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </TfSection>

      {/* ============= 4b. SYSTEMS HE BUILT ============= */}
      <TfSection
        id="systems-he-built"
        eyebrow="Systems He Built"
        title="The growth systems TrendFlux delivers, step by step."
        intro="Every engagement compounds into infrastructure. Here is the exact build order — five systems, deployed sequentially, owned by you on day 91."
      >
        <ol className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              icon: Target,
              step: "Step 01",
              title: "Signal & Positioning System",
              window: "Days 1–14",
              desc: "Audit the funnel, isolate the highest-leverage offer, and rewrite category positioning so every downstream asset compounds.",
              outputs: ["Positioning brief", "ICP scorecard", "Offer architecture"],
            },
            {
              icon: Megaphone,
              step: "Step 02",
              title: "Paid Acquisition System",
              window: "Days 15–35",
              desc: "Stand up Meta Advantage+ funnels with creative testing cadence, hook-rate tracking, and CAC ceilings wired to spend controls.",
              outputs: ["Ads account build", "Creative testing matrix", "CAC dashboard"],
            },
            {
              icon: Database,
              step: "Step 03",
              title: "CRM & Lifecycle System",
              window: "Days 30–55",
              desc: "One source of truth for every lead. Scoring, routing, and lifecycle automations replace spreadsheets and Slack handoffs.",
              outputs: ["CRM schema", "Lead-scoring model", "Lifecycle automations"],
            },
            {
              icon: Bot,
              step: "Step 04",
              title: "AI Automation System",
              window: "Days 45–75",
              desc: "Agents and workflows that replace 20+ manual hours weekly — qualification, follow-up, reporting, and content ops.",
              outputs: ["Agent stack", "Workflow library", "SOP playbooks"],
            },
            {
              icon: Sparkles,
              step: "Step 05",
              title: "Analytics & Ownership System",
              window: "Days 70–90",
              desc: "Observable dashboards, governance, and handover. You exit the engagement owning the OS — not renting it.",
              outputs: ["Exec dashboard", "Governance doc", "Team training"],
            },
            {
              icon: ShieldCheck,
              step: "Outcome",
              title: "Your Growth OS",
              window: "Day 91+",
              desc: "Five systems, one operating layer. Audited, documented, and built to run without an agency on retainer.",
              outputs: ["Audit-ready OS", "Founder ownership", "Compounding leverage"],
            },
          ].map((s) => (
            <li key={s.title} className="list-none">
              <TfCard>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    <s.icon className="h-3.5 w-3.5 text-primary" />
                    {s.step}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80">
                    {s.window}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.outputs.map((o) => (
                    <li
                      key={o}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-foreground/80"
                    >
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {o}
                    </li>
                  ))}
                </ul>
              </TfCard>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            See how the OS composes <ArrowUpRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground">
            90-day engagement · Founder-led · You own the stack
          </p>
        </div>
      </TfSection>

      {/* ============= 5. FOUNDER ============= */}
      <TfSection eyebrow="Founder" title="Built by an operator, not an agency.">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div className="relative mx-auto">
            <div className="absolute -inset-3 rounded-2xl bg-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={emonPortrait}
                alt="Zahid Hasan Emon — Founder of TrendFlux"
                className="h-[380px] w-[320px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              Zahid Hasan Emon
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Strategic operator. Systems-first builder. Transparency by default.
            </h3>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
              TrendFlux exists because the modern brand is drowning in disconnected
              tools. Zahid architects growth as infrastructure — the same way
              engineers think about systems. No black boxes. No vanity dashboards.
              Just compounding leverage you can audit.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Ethical Growth", "Systems Thinking", "Founder-Led", "Audit-Ready"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground/80"
                >
                  {t}
                </span>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              The full story <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </TfSection>

      {/* ============= 5b. THE STAND — Cinematic National Cover =============
          NOTE: All headings/subtitle/quote/CTA copy below is editable HTML
          text rendered as an overlay on top of the cover image. To change
          wording, edit the strings in this section — no image regeneration
          needed. The underlying JPG acts as a cinematic backdrop only. */}
      <section
        aria-labelledby="the-stand-cover-heading"
        className="relative isolate overflow-hidden bg-black py-16 sm:py-24"
      >
        <InlineEditProvider scope="the-stand-cover">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.10), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.85), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          {/* eyebrow rail + inline edit toggle */}
          <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="font-serif text-[10px] uppercase tracking-[0.38em] text-amber-400/90 sm:text-[11px] sm:tracking-[0.42em]">
              <EditableText id="eyebrow" defaultText="Featured · The Stand · জাতীয় দলিল" />
            </span>
            <span className="h-px flex-1 bg-white/[0.08]" />
            <span className="hidden font-serif text-[10px] uppercase tracking-[0.32em] text-white/40 sm:inline">
              <EditableText id="volume-eyebrow" defaultText="Volume I · 2023–2024" />
            </span>
            <InlineEditToggle className="ml-2" />
          </div>

          {/* CINEMATIC PLATE — image as backdrop, editable text overlaid */}
          <figure className="group relative overflow-hidden rounded-sm border border-amber-400/[0.14] bg-black shadow-[0_60px_160px_-40px_rgba(0,0,0,0.95)]">
            <img
              src={theStandCover}
              alt=""
              aria-hidden="true"
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.012]"
            />

            {/* readability scrims */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.80) 100%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.0) 60%)",
              }}
            />

            {/* corner index marks */}
            <span aria-hidden className="absolute left-3 top-3 h-3.5 w-3.5 border-l border-t border-amber-400/70 sm:left-5 sm:top-5 sm:h-4 sm:w-4" />
            <span aria-hidden className="absolute right-3 top-3 h-3.5 w-3.5 border-r border-t border-amber-400/70 sm:right-5 sm:top-5 sm:h-4 sm:w-4" />
            <span aria-hidden className="absolute bottom-3 left-3 h-3.5 w-3.5 border-b border-l border-amber-400/70 sm:bottom-5 sm:left-5 sm:h-4 sm:w-4" />
            <span aria-hidden className="absolute bottom-3 right-3 h-3.5 w-3.5 border-b border-r border-amber-400/70 sm:bottom-5 sm:right-5 sm:h-4 sm:w-4" />

            {/* EDITABLE OVERLAY ─ flip the toggle above to edit copy inline */}
            <figcaption className="absolute inset-0 flex flex-col justify-between p-5 sm:p-10 lg:p-16">
              {/* top: volume marker */}
              <div className="flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.4em] text-amber-300/80 sm:text-[10px]">
                <EditableText id="top-volume" defaultText="Volume I" />
                <EditableText
                  id="top-meta-lg"
                  defaultText="জাতীয় দলিল · ২০২৩–২০২৪"
                  lang="bn"
                  className="hidden sm:inline"
                />
                <EditableText
                  id="top-meta-sm"
                  defaultText="২০২৩–২০২৪"
                  lang="bn"
                  className="sm:hidden"
                />
              </div>

              {/* center: title + subtitle */}
              <div className="max-w-2xl">
                <EditableText
                  as="h2"
                  id="title"
                  defaultText="THE STAND"
                  className="font-serif text-4xl font-bold leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl"
                />
                {/* Hidden anchor for aria-labelledby */}
                <span id="the-stand-cover-heading" className="sr-only">The Stand</span>
                <EditableText
                  as="p"
                  id="subtitle"
                  lang="bn"
                  defaultText="একজন তরুণ একা দাঁড়িয়ে — নৈতিক অবস্থানের সিনেমাটিক রূপায়ণ"
                  className="mt-3 font-serif text-base font-medium text-amber-200/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:mt-4 sm:text-xl lg:text-2xl"
                />
                <EditableText
                  as="p"
                  id="standfirst"
                  multiline
                  defaultText="Zahid Hasan Emon · Jahangirnagar University · a preserved moment of conscience against extortion and torture-cell culture."
                  className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:mt-5 sm:text-sm lg:text-base"
                />
              </div>

              {/* bottom: pull-quote attribution */}
              <div className="flex items-end justify-between gap-4">
                <blockquote className="max-w-xs">
                  <EditableText
                    as="p"
                    id="quote"
                    lang="bn"
                    defaultText="“মায়ের নিষেধ আছে।”"
                    className="font-serif text-lg italic leading-snug text-amber-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:text-2xl lg:text-3xl"
                  />
                  <footer className="mt-2 font-serif text-[10px] uppercase tracking-[0.3em] text-white/60 sm:text-[11px]">
                    <EditableText id="attribution" defaultText="— জাহিদ হাসান ইমন · 2023" lang="bn" />
                  </footer>
                </blockquote>
                <EditableText
                  id="chapter"
                  defaultText="Chapter I"
                  className="hidden font-serif text-[10px] uppercase tracking-[0.32em] text-amber-300/70 sm:inline"
                />
              </div>
            </figcaption>
          </figure>


          {/* CTA + META STRIP */}
          <div className="mt-10 grid grid-cols-1 items-center gap-8 sm:mt-12 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
            {/* CTA cluster */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/the-stand"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-sm bg-amber-400 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.55)] transition-all hover:bg-amber-300 hover:shadow-[0_14px_40px_-10px_rgba(251,191,36,0.7)]"
              >
                Enter The Stand
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/the-stand/share"
                className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-6 py-3.5 text-sm font-medium tracking-wide text-white/90 transition-colors hover:border-amber-400/50 hover:bg-white/[0.03] hover:text-amber-200"
              >
                <span lang="bn">শেয়ার কার্ড</span>
                <span className="text-white/40">·</span>
                <span>Share Kit</span>
              </Link>
            </div>

            {/* divider */}
            <span aria-hidden className="hidden h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

            {/* meta cards */}
            <dl className="grid grid-cols-3 gap-4 sm:gap-10">
              <div>
                <dt className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-400/70">Chapter</dt>
                <dd className="mt-1.5 font-serif text-[13px] text-white/90 sm:text-sm">I — The Stand</dd>
              </div>
              <div>
                <dt className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-400/70">Year</dt>
                <dd className="mt-1.5 font-serif text-[13px] text-white/90 sm:text-sm">2023–2024</dd>
              </div>
              <div>
                <dt className="font-serif text-[10px] uppercase tracking-[0.28em] text-amber-400/70">Status</dt>
                <dd className="mt-1.5 inline-flex items-center gap-1.5 font-serif text-[13px] text-white/90 sm:text-sm">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                  Verified
                </dd>
              </div>
            </dl>
          </div>
        </div>
        </InlineEditProvider>
      </section>


      {/* ============= 5b-ii. QUIET POSITIONS — Parallel Emotional Archive ============= */}
      <section
        aria-labelledby="quiet-positions-heading"
        className="relative isolate overflow-hidden bg-[#0a0a0a] py-20 sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-10 bg-white/20" />
            <span className="font-serif text-[10px] uppercase tracking-[0.42em] text-white/55">
              Parallel Chapter · An Emotional Archive
            </span>
            <span aria-hidden className="h-px w-10 bg-white/20" />
          </div>
          <h2
            id="quiet-positions-heading"
            lang="bn"
            className="font-serif text-[34px] leading-[1.15] text-white/92 sm:text-[48px] md:text-[60px]"
          >
            নীরব অবস্থান
          </h2>
          <p lang="en" className="mt-3 font-serif text-[18px] italic text-white/55 sm:text-[22px]">
            Quiet Positions
          </p>
          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.8] text-white/65">
            Not every position is spoken aloud. A restrained, civic reflection on
            how a society remembers the people who chose to stay near without
            making a claim.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/quiet-positions"
              className="group inline-flex items-center gap-2 rounded-sm border border-white/25 px-6 py-3 text-sm font-medium text-white/90 transition-colors hover:border-white/60 hover:text-white"
            >
              Enter Quiet Positions
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>






      {/* ============= 5c. JUSTICE APPEAL — Public Interest Notice ============= */}
      <section className="relative bg-[hsl(220,45%,8%)] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="overflow-hidden rounded-2xl border border-[hsl(220,30%,20%)] bg-[hsl(220,40%,11%)]">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.2fr_1fr]">
              <div className="p-8 sm:p-10">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-[hsl(0,65%,55%)]" />
                  <span className="font-serif text-[11px] tracking-[0.22em] text-white/80">
                    PABNA ACCOUNTABILITY PROJECT
                  </span>
                </div>
                <h2 className="mt-6 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl">
                  When fear replaces justice,{" "}
                  <span className="italic text-slate-300">documentation becomes necessary.</span>
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-slate-300">
                  Public Interest Documentation — একটি লিখিত অভিযোগ ও সংশ্লিষ্ট সংবাদ
                  রেফারেন্সের ভিত্তিতে নির্মিত আর্কাইভ। নিরপেক্ষ তদন্ত, আইনগত সুরক্ষা ও
                  প্রাতিষ্ঠানিক জবাবদিহিতার আবেদন। This is a dossier, not a campaign of attack.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to="/justice-appeal"
                    className="inline-flex items-center gap-2 rounded-md bg-[hsl(0,65%,55%)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Read Timeline <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/justice-appeal#complaint"
                    className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.06]"
                  >
                    View Documents
                  </Link>
                </div>
              </div>

              <div className="hidden border-l border-white/10 p-10 lg:flex lg:flex-col lg:justify-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">দাখিল</div>
                <div className="mt-2 font-serif text-2xl text-white">২৯ আগস্ট ২০২৪</div>
                <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-slate-500">অবস্থা</div>
                <div className="mt-2 text-sm text-slate-300">চলমান নিরাপত্তা শঙ্কা · নিরপেক্ষ তদন্তের আবেদন</div>
                <div className="mt-8 border-t border-white/10 pt-5 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                  ন্যায়বিচার · নিরাপত্তা · আইনি তদন্ত
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>



      {/* ============= 6. ACADEMY ============= */}
      <TfSection
        eyebrow="TrendFlux Academy"
        title="Train the operator behind the system."
        intro="Modular education for founders, ops leads, and growth engineers learning to build with AI-native systems."
        tone="muted"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Systems Thinking", desc: "Architect leverage, not tasks." },
            { title: "AI Marketing", desc: "Agents, prompts, automated funnels." },
            { title: "Operational Scaling", desc: "From 1 brand to a portfolio." },
            { title: "Founder Education", desc: "Position, price, and lead." },
          ].map((m) => (
            <TfCard key={m.title}>
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                {m.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {m.desc}
              </p>
            </TfCard>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/course/trendflux"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Enter the Academy <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </TfSection>

      {/* ============= 6b. OPERATED BRANDS ============= */}
      <TfSection
        eyebrow="Ecosystem"
        title="Communities, brands & pages I operate."
        intro="A portfolio of platforms, civic initiatives, and education brands built and operated under the TrendFlux ecosystem — designed and engineered by Zahid Hasan Emon."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {OPERATED_BRANDS.map((b) => {
            const card = (
              <TfCard className="flex h-full flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background ring-1 ring-border">
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    loading="lazy"
                    className="h-full w-full object-contain p-1.5"
                  />
                </div>
                <h3 className="mt-3 font-display text-[13.5px] font-semibold leading-tight text-foreground">
                  {b.name}
                </h3>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                  {b.role}
                </p>
                {b.impact && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                    <Target className="h-3 w-3" />
                    {b.impact}
                  </div>
                )}
                {b.tagline && (
                  <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">
                    {b.tagline}
                  </p>
                )}
                {b.paid && (
                  <span className="mt-2 text-[10px] font-medium text-primary/80">
                    Client project
                  </span>
                )}
              </TfCard>
            );
            return b.href ? (
              <a
                key={b.name}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block transition hover:-translate-y-0.5"
                aria-label={`Visit ${b.name}`}
              >
                {card}
              </a>
            ) : (
              <div key={b.name}>{card}</div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Designed & engineered by <span className="text-foreground">Zahid Hasan Emon</span> · <a href="https://trendflux.digital" className="text-primary hover:underline">trendflux.digital</a> · <a href="https://www.facebook.com/trendfluxdigital/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fb/trendflux.digital</a>
        </p>
      </TfSection>


      {/* ============= 7. LUXE VEIL ============= */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-muted to-background py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(212,175,55,0.5), transparent 50%), radial-gradient(circle at 70% 70%, rgba(220,38,38,0.3), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-50 px-3 py-1">
            <Lock className="h-3 w-3 text-amber-600/80" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-700">
              Invite Only
            </span>
          </div>
          <h2 className="mt-7 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent">
              Luxe Veil
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            A private network for high-level operators. Closed-door briefings,
            unpublished playbooks, and direct introductions across the TrendFlux
            ecosystem. Membership is not advertised.
          </p>
          <Link
            to="/luxe-veil"
            className="mt-9 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-50 px-7 py-3.5 text-sm font-semibold text-amber-800 transition-all hover:border-amber-400/60 hover:bg-amber-100"
          >
            Request Consideration <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============= 8. CASE STUDIES (METRICS) ============= */}
      <TfSection
        id="proof"
        eyebrow="Proof"
        title="Operating metrics, not vanity numbers."
        intro="Representative outcomes across deployed TrendFlux OS engagements. Audit trail available on request."
      >
        <ProofTabs />
        <div className="mt-12 text-center">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View case studies <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </TfSection>

      {/* ============= 8b. TESTIMONIALS ============= */}
      <TfSection
        eyebrow="Operator Signal"
        title="Trusted by founders running real P&Ls."
        intro="Selected feedback from operators inside live TrendFlux OS engagements. Names withheld under standard NDA."
        tone="muted"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TfCard key={t.name} className="flex h-full flex-col">
              <Quote className="h-5 w-5 text-primary/70" />
              <p className="mt-5 flex-1 text-[14.5px] leading-relaxed text-foreground/90">
                “{t.quote}”
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <div className="text-[13px] font-semibold text-foreground">{t.name}</div>
                <div className="mt-0.5 text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t.role}
                </div>
              </div>
            </TfCard>
          ))}
        </div>
      </TfSection>

      {/* ============= 8c. FIT QUALIFIER ============= */}
      <TfSection
        eyebrow="Engagement Fit"
        title={<>Built for operators. <span className="text-muted-foreground">Not for everyone.</span></>}
        intro="TrendFlux OS is a 90-day systems engagement, not a retainer. We work with a small number of founders per quarter."
      >
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
          {FIT.map((f) => (
            <div
              key={f}
              className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-[14px] leading-relaxed text-foreground/90">{f}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="tf-btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90"
          >
            Request a Fit Assessment <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground">
            45-min call · No pitch · Operator to operator
          </p>
        </div>
      </TfSection>



      {/* ============= 9. FINAL CTA ============= */}
      <section className="relative isolate overflow-hidden bg-background py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[180px] tf-glow-pulse"
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Next chapter
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.025em] text-foreground sm:text-5xl md:text-[60px] md:leading-[1.02]">
            Scale Beyond <span className="tf-text-electric">Marketing</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px]">
            Stop renting agency hours. Own a growth system that compounds — wired for your P&L, auditable on day one.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => setQuoteOpen(true)}
              className="tf-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90 sm:w-auto"
            >
              Book Private Strategy Call <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/ecosystem"
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted/50 px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-muted sm:w-auto"
            >
              See the Architecture
            </Link>
          </div>
          <p className="mt-6 text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground">
            Limited engagements per quarter · Founder-to-founder
          </p>
        </div>
      </section>

      <Footer />

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        context={{ source: "homepage_hero" }}
      />
    </main>
  );
};

export default Index;
