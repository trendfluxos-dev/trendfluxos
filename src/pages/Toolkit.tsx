import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Search,
  Layers,
  Cog,
  PaintBucket,
  LineChart,
  Workflow,
  Rocket,
  CheckCircle2,
  Radio,
  Wrench,
  Briefcase,
  Download,
  X,
  PlayCircle,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ClassRow = {
  n: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  tools: string[];
};

type CurriculumModule = {
  id: string;
  label: string;
  title: string;
  classes: ClassRow[];
};

const curriculum: CurriculumModule[] = [
  {
    id: "m1",
    label: "মডিউল ১",
    title: "Core Architecture & Data Mining",
    classes: [
      {
        n: "01",
        icon: Brain,
        title: "Prompt Architect System",
        subtitle: "From user → AI operator",
        tools: [
          "Role-Task-Context-Format framework",
          "Zero-shot vs Few-shot templates",
          "AI Persona builder worksheet",
        ],
      },
      {
        n: "02",
        icon: Search,
        title: "Information Mining System",
        subtitle: "From data → insight",
        tools: [
          "Source triangulation checklist",
          "Deep research prompt chain",
          "Signal extraction template",
        ],
      },
    ],
  },
  {
    id: "m2",
    label: "মডিউল ২",
    title: "AI Strategy & Branding",
    classes: [
      {
        n: "03",
        icon: Layers,
        title: "AI Strategy Selection Matrix",
        subtitle: "From tools → strategy",
        tools: [
          "Model selection decision tree",
          "Use-case mapping canvas",
          "Build vs buy scorecard",
        ],
      },
      {
        n: "04",
        icon: Cog,
        title: "Brand Automation System",
        subtitle: "From manual → autonomous brand ops",
        tools: [
          "Content engine SOP",
          "Response automation playbook",
          "Brand voice prompt pack",
        ],
      },
    ],
  },
  {
    id: "m3",
    label: "মডিউল ৩",
    title: "Visuals & Data-Driven Scaling",
    classes: [
      {
        n: "05",
        icon: PaintBucket,
        title: "Premium Visual Identity System",
        subtitle: "From generic → ownable visual world",
        tools: [
          "Identity audit framework",
          "Design system token sheet",
          "AI-assisted moodboard kit",
        ],
      },
      {
        n: "06",
        icon: LineChart,
        title: "Data-Driven Growth System",
        subtitle: "From guesswork → measured growth",
        tools: [
          "North-star metric canvas",
          "Attribution stack blueprint",
          "Weekly growth review template",
        ],
      },
    ],
  },
  {
    id: "m4",
    label: "মডিউল ৪",
    title: "Ultimate Automation & Execution",
    classes: [
      {
        n: "07",
        icon: Workflow,
        title: "Automation Blueprint System",
        subtitle: "From tasks → systems",
        tools: [
          "Workflow mapping template",
          "n8n / Make starter recipes",
          "ROI of automation calculator",
        ],
      },
      {
        n: "08",
        icon: Rocket,
        title: "Master Project & Portfolio System",
        subtitle: "From learner → high-ticket operator",
        tools: [
          "Case study story framework",
          "Pitch deck + proof asset kit",
          "High-ticket offer builder",
        ],
      },
    ],
  },
];

const highlights = [
  { icon: Radio, label: "লাইভ ক্লাস ও রেকর্ডিং", tone: "text-primary" },
  { icon: Wrench, label: "রিয়েল-টাইম প্রজেক্ট", tone: "text-gold" },
  { icon: Briefcase, label: "ক্যারিয়ার ও পোর্টফোলিও গাইডলাইন", tone: "text-primary" },
];

const faqs = [
  {
    q: "ক্লাসগুলো কীভাবে হবে?",
    a: "প্রতিটা ক্লাস লাইভ হবে এবং সাথে সাথে রেকর্ডিং দেওয়া হবে। মিস করলে যেকোনো সময় দেখে নিতে পারবেন, এবং লাইভ Q&A সেশনে সরাসরি প্রশ্ন করতে পারবেন।",
  },
  {
    q: "কোর্সটি কাদের জন্য?",
    a: "মার্কেটার, ডিজাইনার, কনটেন্ট ক্রিয়েটর, ফাউন্ডার এবং AI/Automation এনথুজিয়াস্ট — যারা AI কে শুধু ব্যবহার নয়, সিস্টেম হিসেবে গড়ে তুলতে চান তাদের জন্য।",
  },
  {
    q: "সাপোর্ট কীভাবে পাবো?",
    a: "একটি ডেডিকেটেড প্রাইভেট কমিউনিটি গ্রুপে যুক্ত হবেন যেখানে মেন্টর ও সহপাঠীদের কাছ থেকে রিয়েল-টাইম সাপোর্ট পাবেন।",
  },
  {
    q: "কোর্স শেষে পোর্টফোলিও তৈরি হবে?",
    a: "হ্যাঁ। Master Project & Portfolio System ক্লাসে একটি সম্পূর্ণ অটোমেটেড ব্র্যান্ড/সিস্টেম দাঁড় করাবেন যা সরাসরি আপনার CV বা ক্লায়েন্ট পিচে ব্যবহার করতে পারবেন।",
  },
];

const Toolkit = () => {
  useSeo({
    title: "TrendFlux Masterclass: AI & Automation System — Enroll Now",
    description:
      "TrendFlux Masterclass — AI ও Automation এর উপর ৮টি প্র্যাকটিক্যাল ক্লাস। Prompt Engineering থেকে Data-Driven Growth ও Brand Automation পর্যন্ত হাতে-কলমে শিখুন এবং একটি প্রফেশনাল পোর্টফোলিও তৈরি করুন।",
    canonical: `${BRAND.url}/toolkit`,
  });

  const [bannerOpen, setBannerOpen] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onEnroll = (source: string) =>
    track("toolkit_cta_click", { source, cta: "enroll" });

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 h-[520px] w-[520px] bg-primary/10 blur-[160px]" />
        <div className="absolute bottom-0 left-0 h-[520px] w-[520px] bg-gold/10 blur-[160px]" />
      </div>

      {/* Announcement banner */}
      {bannerOpen && (
        <div className="relative z-30 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] sm:text-sm md:px-12 lg:px-20">
            <p className="flex flex-1 items-center justify-center gap-2 text-center font-medium">
              <span aria-hidden>🎉</span>
              <span>
                <span className="font-bold">TrendFlux Course</span> is live —
              </span>
              <a
                href="#enroll"
                onClick={() => onEnroll("announcement_banner")}
                className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-3 py-0.5 font-semibold underline-offset-4 hover:underline"
              >
                Enroll Now <ArrowRight className="h-3 w-3" />
              </a>
            </p>
            <button
              type="button"
              onClick={() => setBannerOpen(false)}
              aria-label="Close announcement"
              className="rounded-full p-1 text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <Link to="/" className="font-display text-base font-bold tracking-tight">
          <span>{BRAND.nameLead}</span>{" "}
          <span className="text-gradient">{BRAND.nameTrail}</span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#curriculum"
            className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex"
          >
            Curriculum
          </a>
          <a
            href="#faq"
            className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex"
          >
            FAQ
          </a>
          <a
            href="#enroll"
            onClick={() => onEnroll("top_nav")}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            Enroll
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="enroll" className="relative px-6 pb-16 pt-8 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              🚀 New Batch Admission Open
            </div>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
              TrendFlux Masterclass:{" "}
              <span className="text-gradient">AI &amp; Automation System</span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-foreground/70 md:text-[17px]" lang="bn">
              Prompt Engineering থেকে শুরু করে Data-Driven Growth এবং Brand
              Automation — সবকিছু হাতে-কলমে শিখুন এবং একটি প্রফেশনাল পোর্টফোলিও
              তৈরি করুন।
            </p>

            <ul className="mt-6 space-y-2.5">
              {highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <li
                    key={h.label}
                    className="flex items-center gap-3 text-sm text-foreground/85"
                    lang="bn"
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 ${h.tone}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{h.label}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#curriculum"
                onClick={() => onEnroll("hero_primary")}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-gold-foreground shadow-gold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_hsl(var(--gold)/0.55)]"
              >
                🚀 <span lang="bn">এনরোল করুন</span>
              </a>
              <a
                href="#curriculum"
                onClick={() => track("toolkit_cta_click", { source: "hero_secondary", cta: "study_plan" })}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3.5 text-sm font-semibold text-foreground/85 transition-colors hover:border-gold/40 hover:text-gold"
              >
                <Download className="h-4 w-4" />
                <span lang="bn">স্টাডি প্ল্যান</span>
              </a>
            </div>

            <p className="mt-5 text-xs text-foreground/55">
              ৮টি ক্লাস · ৪টি মডিউল · লাইফটাইম রেকর্ডিং অ্যাক্সেস
            </p>
          </div>

          {/* Right: promo mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-gold/15 to-transparent blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 glass-strong">
              <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary/15 via-background to-gold/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => track("toolkit_promo_video_click", {})}
                    className="group flex h-20 w-20 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-gold transition-transform hover:scale-110"
                    aria-label="Play course preview"
                  >
                    <PlayCircle className="h-10 w-10" />
                  </button>
                </div>
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/70 backdrop-blur">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Course Preview
                </div>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-background/85 p-4 backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                    Masterclass · Batch 01
                  </p>
                  <p className="mt-1 font-display text-base font-bold">
                    8 Systems · 4 Modules · 1 Portfolio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="relative px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">
              — Course Curriculum
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl" lang="bn">
              স্টাডি প্ল্যান
            </h2>
            <p className="mt-4 text-sm text-foreground/65 md:text-base">
              ৪টি মডিউলে সাজানো ৮টি সিস্টেম ক্লাস। প্রতিটা মডিউলে ক্লিক করে বিস্তারিত দেখুন।
            </p>
          </div>

          <Accordion
            type="multiple"
            defaultValue={["m1"]}
            className="space-y-3"
          >
            {curriculum.map((m) => (
              <AccordionItem
                key={m.id}
                value={m.id}
                className="overflow-hidden rounded-2xl border border-foreground/10 bg-card/40 px-5 backdrop-blur transition-colors hover:border-gold/40 data-[state=open]:border-gold/50 data-[state=open]:bg-card/70"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex flex-1 items-center gap-4 text-left">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-[11px] font-bold uppercase tracking-wider text-gold ring-1 ring-gold/20" lang="bn">
                      {m.label.split(" ")[1]}
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/50" lang="bn">
                        {m.label}
                      </p>
                      <p className="mt-0.5 font-display text-base font-bold tracking-tight md:text-lg">
                        {m.title}
                      </p>
                    </div>
                  </div>
                  <span className="ml-3 hidden text-[11px] font-medium text-foreground/50 sm:inline">
                    {m.classes.length} classes
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="space-y-3 pl-0 sm:pl-14">
                    {m.classes.map((c) => {
                      const Icon = c.icon;
                      return (
                        <div
                          key={c.n}
                          className="group rounded-xl border border-foreground/10 bg-background/60 p-4 transition-colors hover:border-primary/40"
                        >
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                                Class {c.n}
                              </p>
                              <h4 className="mt-0.5 font-display text-[15px] font-bold leading-snug">
                                {c.title}
                              </h4>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gold">
                                {c.subtitle}
                              </p>
                              <ul className="mt-3 space-y-1.5 text-[13px] text-foreground/75">
                                {c.tools.map((t) => (
                                  <li key={t} className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
