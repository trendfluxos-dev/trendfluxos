import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import trendfluxLogo from "@/assets/trendflux-logo.png";
import emonPortrait from "@/assets/zahid-hasan-emon.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { QuoteDialog } from "@/components/QuoteDialog";

type PressItem = {
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

const cases = [
  {
    metric: "+45% ROAS",
    sub: "in 90 days",
    title: "Lumen Apparel — DTC Scale Sprint",
    stack: ["Meta Ads", "Klaviyo", "Shopify", "GA4"],
  },
  {
    metric: "−62% Manual Hours",
    sub: "across 4 departments",
    title: "Northbeam Logistics — Ops Overhaul",
    stack: ["Make", "HubSpot", "Airtable", "Slack API"],
  },
  {
    metric: "3.4x Pipeline",
    sub: "qualified MQL → SQL",
    title: "Vault Finance — Funnel Rebuild",
    stack: ["Webflow", "Salesforce", "Segment"],
  },
  {
    metric: "$1.2M Revenue",
    sub: "single-quarter Meta",
    title: "Aurora Skincare — Creative Engine",
    stack: ["Meta Ads", "Triple Whale", "Figma"],
  },
  {
    metric: "8 → 1 Stack",
    sub: "consolidation playbook",
    title: "Forge Industries — Ecosystem Reset",
    stack: ["Notion", "Zapier", "Linear", "Stripe"],
  },
  {
    metric: "+128% Sign-ups",
    sub: "at flat ad spend",
    title: "Helio Health — Conversion Lab",
    stack: ["Meta Ads", "Webflow", "Mixpanel"],
  },
];

const stats = [
  { value: "$8.4M", label: "Ad spend managed" },
  { value: "+312%", label: "Avg. growth lift" },
  { value: "47", label: "Operations launched" },
];

const Index = () => {
  const [filter, setFilter] = useState<Category>("All");
  const [activePress, setActivePress] = useState<PressItem | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <img src={trendfluxLogo} alt="TrendFlux Digital logo" className="h-8 w-8 object-contain" />
            TrendFlux <span className="text-gradient">Digital</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-foreground/70">
            <a href="#services" className="hover:text-gold transition-colors">Services</a>
            <a href="#founder" className="hover:text-gold transition-colors">Founder</a>
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
          <div className="mb-6 inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Now accepting Q3 partnerships
          </div>

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

      {/* Founder */}
      <section id="founder" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          {/* Portrait */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-cyan opacity-20 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] glass-strong p-2">
              <img
                src={emonPortrait}
                alt="Zahid Hasan Emon, Founder of TrendFlux Digital"
                className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
              />
              <div className="absolute bottom-6 left-6 rounded-full glass-strong px-4 py-2 text-xs">
                <span className="text-gold font-semibold">Founder & CEO</span>
                <span className="mx-2 text-foreground/30">·</span>
                <span className="text-foreground/80">Zahid Hasan Emon</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              — Meet the Project Lead
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Meet the Project Lead:{" "}
              <span className="text-gradient">Zahid Hasan Emon</span>
            </h2>
            <blockquote className="mt-8 border-l-2 border-gold/60 pl-6 text-base leading-relaxed text-foreground/75 md:text-lg space-y-4">
              <p>
                "My journey to founding TrendFlux Digital wasn't just built on IT
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
                TrendFlux Digital.
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
              <span>Founder, TrendFlux Digital</span>
            </div>
            <Link
              to="/project-lead"
              className="mt-8 inline-flex items-center gap-2 text-primary hover:text-gold transition-colors"
            >
              Read full profile <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              — The Journey
            </p>
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              From <span className="text-gradient">whistleblower</span> to growth operator
            </h3>
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
                press: [
                  {
                    outlet: "Desh Rupantor",
                    headline: "'মায়ের নিষেধ আছে' তাই কোনো চাঁদার ভাগ নিতেন না ছাত্রলীগ নেতা",
                    href: "https://www.deshrupantor.com/456582/",
                    context:
                      "Profile of the student leader who refused to accept any share of campus extortion money, citing his mother's lifelong instruction never to take what isn't his.",
                  },
                  {
                    outlet: "Desh Rupantor",
                    headline: "জাহাঙ্গীরনগরের হলে সাবেক ছাত্রলীগ সভাপতির ভাইয়ের 'অপকর্মের সাম্রাজ্য'!",
                    href: "https://www.deshrupantor.com/456399/",
                    context:
                      "Investigative report on the network of misconduct allegedly run inside a Jahangirnagar University residential hall by the brother of a former student-wing president.",
                  },
                  {
                    outlet: "Prothom Alo",
                    headline: "সংবাদ সম্মেলনে নির্যাতনের বর্ণনা দিলেন জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের ছাত্রলীগ নেতা",
                    href: "https://www.prothomalo.com/bangladesh/district/4foz5xmv9u",
                    context:
                      "Coverage of the press conference where the Jahangirnagar University student leader publicly described the torture and intimidation he faced for refusing to participate in extortion.",
                  },
                  {
                    outlet: "Dhaka Tribune",
                    headline: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়: বারবার পার পেয়ে বেপরোয়া ছাত্রলীগ",
                    href: "https://bangla.dhakatribune.com/bangladesh/76832/",
                    context:
                      "Analysis of how repeated impunity emboldened the campus student-wing faction at Jahangirnagar University, with the whistleblower's stand cited as a turning point.",
                  },
                  {
                    outlet: "Samakal",
                    headline: "জাবির হলে ছাত্রলীগ নেতাকে নির্যাতনের অভিযোগ",
                    href: "https://samakal.com",
                    context:
                      "Report documenting the formal allegation of torture against a student leader inside a Jahangirnagar University residential hall.",
                  },
                  {
                    outlet: "Kalbela",
                    headline: "জাবি ছাত্রলীগের নেতাকে মারধরের অভিযোগ",
                    href: "https://www.kalbela.com/ajkerpatrika/khobor/26832",
                    context:
                      "Coverage of the physical assault complaint filed by the JU student leader after refusing to take part in the extortion network.",
                  },
                  {
                    outlet: "Kalbela",
                    headline: "জাবির হলে মাদকের থাবা, নিয়ন্ত্রণে ছাত্রলীগ",
                    href: "https://www.kalbela.com/ajkerpatrika/lastpage/65756",
                    context:
                      "Investigation into drug activity inside JU halls and the student-wing faction controlling it — the same network the whistleblower stood against.",
                  },
                  {
                    outlet: "Dhaka Post",
                    headline: "জাবিতে ছাত্রলীগ নেতাকে আটকে রেখে নির্যাতন",
                    href: "https://www.dhakapost.com",
                    context:
                      "Report on the confinement and torture of the JU student leader inside a campus hall as retaliation for his refusal to comply.",
                  },
                  {
                    outlet: "Channel 24",
                    headline: "জাবি ছাত্রলীগের অপরাধনামা: ক্যাম্পাস যেনো ধর্ষণ আর চাঁদাবাজির আস্তানা!",
                    href: "https://www.channel24bd.tv",
                    context:
                      "Television report cataloguing the pattern of violence and extortion attributed to the JU student-wing faction, contextualising the whistleblower's stand.",
                  },
                  {
                    outlet: "BanglaNews24",
                    headline: "জয়ের ভাইয়ের বিরুদ্ধে নির্যাতনের অভিযোগ, নিরাপত্তা চাইলেন জাবি ছাত্রলীগ নেতা",
                    href: "https://www.banglanews24.com/education/news/bd/1197220.details",
                    context:
                      "Report on the formal torture allegation against the brother of a former national student-wing president, with the JU leader publicly seeking protection.",
                  },
                  {
                    outlet: "Dhaka Mail",
                    headline: "ছাত্রলীগের সাবেক সভাপতি জয়ের ছোট ভাইয়ের বিরুদ্ধে নির্যাতনের অভিযোগ",
                    href: "https://dailyinqilab.com/bangladesh/news/605977",
                    context:
                      "Coverage of the torture allegation filed against the younger brother of a former national student-wing president, naming the campus hall where it occurred.",
                  },
                  {
                    outlet: "Dhaka Mail",
                    headline: "জাবির আবাসিক হলে শিক্ষার্থীদের ওপর নির্যাতন, ছাত্র ইউনিয়নের উদ্বেগ",
                    href: "https://dhakamail.com/country/122306",
                    context:
                      "Report on the wider concern raised by the Students' Union over violence against students in JU residential halls, referencing this case.",
                  },
                  {
                    outlet: "Janakantha",
                    headline: "জাবিতে ছাত্রলীগ নেতাকে নির্যাতন, তদন্ত কমিটি",
                    href: "https://www.banglanews24.com/education/news/bd/1197220.details",
                    context:
                      "Report announcing the formation of an inquiry committee following the documented torture of the JU student leader.",
                  },
                  {
                    outlet: "Dainik Shiksha",
                    headline: "ভিসির কাছে জীবনের নিরাপত্তা চাইলেন জাবি ছাত্রলীগ নেতা",
                    href: "https://www.ittefaq.com.bd/661213/",
                    context:
                      "Report on the JU student leader formally requesting protection of his life from the Vice-Chancellor after sustained threats.",
                  },
                ] as PressItem[],
              },
              {
                phase: "Phase 04",
                year: "Today",
                title: "TrendFlux Digital",
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

                  {item.press && (
                    <div className="mt-6">
                      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-foreground/40">
                          Press Coverage · {item.press.length} headlines
                        </p>
                        <p className="text-xs text-foreground/40">
                          Click any headline for context, then read the original report.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {item.press.map((p, idx) => (
                          <button
                            type="button"
                            key={`${p.outlet}-${idx}`}
                            onClick={() => setActivePress(p)}
                            className="group/card flex flex-col rounded-xl border border-border bg-foreground/[0.03] p-4 text-left hover:border-gold/40 hover:bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                                {p.outlet}
                              </span>
                              <MoreHorizontal className="h-4 w-4 text-foreground/40 transition-colors group-hover/card:text-gold" />
                            </div>
                            <p className="mt-2 text-sm leading-snug text-foreground/80 group-hover/card:text-foreground">
                              {p.headline}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40 group-hover/card:text-gold transition-colors">
                              More details
                              <ArrowUpRight className="h-3 w-3 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
                            </span>
                          </button>
                        ))}
                      </div>
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
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
                — Selected Narratives
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
                Operations that{" "}
                <span className="text-gradient">moved the needle.</span>
              </h2>
            </div>
            <a
              href="#cases"
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-gold transition-colors"
            >
              All Case Studies <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((c, i) => (
              <article
                key={c.title}
                className="group flex min-h-[340px] flex-col rounded-3xl glass glass-hover p-7"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-foreground/40">
                  <span className="text-primary">CASE / {String(i + 1).padStart(2, "0")}</span>
                  <span>2024 — 2026</span>
                </div>

                <div className="mt-8">
                  <p className="font-display text-3xl font-bold text-gradient leading-none">
                    {c.metric}
                  </p>
                  <p className="mt-2 text-sm text-foreground/60">{c.sub}</p>
                </div>

                <h3 className="font-display mt-6 text-xl font-bold leading-snug">
                  {c.title}
                </h3>

                <div className="mt-5 flex flex-wrap gap-2">
                  {c.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-70 group-hover:opacity-100 transition">
                    View Narrative <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA + Footer */}
      <footer id="contact" className="relative px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] glass-strong p-10 text-center md:p-16">
          <h2 className="font-display mx-auto max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Ready to operate at{" "}
            <span className="text-gradient">full velocity?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-foreground/60">
            Limited partnerships open each quarter. Let's architect yours.
          </p>
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
              <img src={trendfluxLogo} alt="TrendFlux Digital logo" className="h-7 w-7 object-contain" />
              <p className="font-semibold text-foreground">TrendFlux Digital</p>
            </div>
            <p>© 2026 — Built on integrity</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
