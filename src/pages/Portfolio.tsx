import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import portraitOg from "@/assets/zahid-hasan-emon.webp";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Facebook,
  Globe,
  Sparkles,
  TrendingUp,
  Workflow,
  Users,
  BarChart3,
  Shield,
  GraduationCap,
  Award,
  Briefcase,
  Layers,
  Zap,
  ShieldCheck,
} from "lucide-react";
import portrait from "@/assets/zahid-hasan-emon.webp";
import { FilteredSystemsBentoSection } from "@/components/systems/FilteredSystemsBentoSection";
import proofEducation from "@/assets/proof/educational-background.webp";
import proofUniversity from "@/assets/proof/university-certificates.webp";
import proofHsc from "@/assets/proof/hsc-credentials.webp";
import proofSsc from "@/assets/proof/ssc-credentials.webp";
import proofLeadershipOverview from "@/assets/proof/leadership-overview.webp";
import proofPzswa from "@/assets/proof/pzswa-presidential.webp";
import proofNdfBd from "@/assets/proof/ndf-bd-appointment.webp";
import proofPds from "@/assets/proof/pds-leadership.webp";
import proofCovid from "@/assets/proof/covid-volunteer.webp";
import proofTrainingOverview from "@/assets/proof/training-overview.webp";
import proofTrainingCerts from "@/assets/proof/training-certificates.webp";
import proofParticipation from "@/assets/proof/participation-achievement.webp";
import proofIdentification from "@/assets/proof/official-identification.webp";
import proofUndpSpeaking from "@/assets/proof/undp-speaking.png";

const NAV = [
  { label: "About", href: "#about" },
  { label: "Systems", href: "#systems" },
  { label: "Deliverables", href: "#deliverables" },
  { label: "Pages", href: "#pages" },
  { label: "Packages", href: "#packages" },
  { label: "Proof Vault", href: "#proof" },
  { label: "Contact", href: "#contact" },
];

type PageItem = {
  name: string;
  role: string;
  desc: string;
  href: string;
  badge?: string;
  website?: { label: string; href: string };
};

const PAGE_GROUPS: { key: string; label: string; caption: string; items: PageItem[] }[] = [
  {
    key: "civic",
    label: "Civic Work",
    caption: "Voluntary social & cultural activism — not client work.",
    items: [
      {
        name: "Pabna Nagorik Committee",
        role: "Brand & Campaign Strategist",
        desc: "নাগরিক ঐক্যেই বদলাবে পাবনা — civic campaign systems, 485K+ organic views.",
        href: "https://facebook.com/pncpabna",
        badge: "Website by me",
        website: { label: "pncpabna.live", href: "https://pncpabna.live" },
      },
      {
        name: "Pabna Debate Society (PDS)",
        role: "Founder · Life Member & Advisor",
        desc: "মুক্তির আলোয় মুক্তি — debate, leadership & cultural movement in Pabna.",
        href: "https://facebook.com/debate.pabna",
      },
    ],
  },
  {
    key: "employer",
    label: "Employer Work",
    caption: "Pages operated as part of full-time / company role.",
    items: [
      {
        name: "HnB EduVerse",
        role: "Assistant Manager — Digital & Social",
        desc: "Education brand — content systems, reels strategy, campaign execution.",
        href: "https://facebook.com/HnBEduVerse",
      },
      {
        name: "Marie J. Elliot — Child Parenting",
        role: "Social Media Manager",
        desc: "International parenting brand — content, scheduling & engagement systems.",
        href: "#",
      },
    ],
  },
  {
    key: "client",
    label: "Client Work",
    caption: "Independent client engagements.",
    items: [
      {
        name: "My Little Outlier",
        role: "Social Media Manager",
        desc: "Brand voice, content planning & growth execution for a parenting community.",
        href: "https://facebook.com/MyLittleOutlier",
      },
    ],
  },
];


const TRUST = [
  { v: "485K+", l: "Organic Views" },
  { v: "82%", l: "Organic Reach" },
  { v: "Multi-Sector", l: "Experience" },
  { v: "AI-Driven", l: "Systems" },
];

const METRICS = [
  { v: "485K+", l: "Organic Views", c: "#DC2626" },
  { v: "154K+", l: "Audience Reach", c: "#DC2626" },
  { v: "82%", l: "Organic Reach", c: "#16A34A" },
  { v: "45%+", l: "Engagement Growth", c: "#16A34A" },
  { v: "166+", l: "Design Assets", c: "#F97316" },
  { v: "22+", l: "Reels Produced", c: "#F97316" },
];

const EXPERIENCE = [
  {
    role: "Assistant Manager — Digital Marketing & Social Media",
    org: "H&B EduVerse",
    bullets: [
      "Led end-to-end social ecosystem",
      "Content systems & reels strategy",
      "Campaign execution & analytics optimization",
    ],
  },
  {
    role: "Founder",
    org: "TrendFlux Digital",
    bullets: [
      "AI-powered digital growth ecosystem",
      "Branding · content systems · creator-led growth",
      "Automation & digital campaigns",
    ],
  },
  {
    role: "Social Media Manager",
    org: "Originate Marketing",
    bullets: [
      "Campaign execution",
      "Organic growth optimization",
      "Reporting systems & engagement",
    ],
  },
  {
    role: "Brand & Campaign Strategist",
    org: "Pabna Nagorik Committee",
    bullets: [
      "485K+ organic views",
      "154K+ audience reach",
      "Civic campaign execution",
    ],
  },
  {
    role: "Founder / Project Lead",
    org: "EmonIT",
    bullets: [
      "Digital services & automation",
      "Content execution",
      "Business support systems",
    ],
  },
];

const SYSTEMS = [
  {
    n: "01",
    icon: GraduationCap,
    title: "Education Growth Automation System",
    built: ["AI content workflows", "Publishing systems", "Engagement optimization", "Analytics loops"],
    results: [
      { v: "+45%", l: "Engagement" },
      { v: "4.85L+", l: "Views" },
      { v: "82%", l: "Organic Reach" },
    ],
  },
  {
    n: "02",
    icon: Users,
    title: "Community Influence Automation System",
    built: ["Mass content workflows", "Reels systems", "Engagement optimization"],
    results: [
      { v: "4.85L+", l: "Views" },
      { v: "1.54L+", l: "Reach" },
      { v: "100%", l: "Organic" },
    ],
  },
  {
    n: "03",
    icon: Layers,
    title: "Multi-Brand Content Automation Engine",
    built: ["Multi-brand operations", "Scheduling systems", "ROI tracking systems"],
    results: [
      { v: "5+", l: "Brand Operations" },
      { v: "↑", l: "Delivery Consistency" },
    ],
  },
  {
    n: "04",
    icon: TrendingUp,
    title: "Education Lead Engagement System",
    built: ["Lead-focused content systems", "Reels frameworks", "Visibility funnels"],
    results: [
      { v: "↑", l: "Higher Engagement" },
      { v: "↑", l: "Brand Visibility" },
    ],
  },
];

const DELIVERABLES = [
  {
    icon: Sparkles,
    title: "Content Systems",
    items: ["Monthly content planning", "Reels scripting", "Visual design direction", "Caption systems"],
  },
  {
    icon: Workflow,
    title: "Automation",
    items: ["AI workflows", "Publishing systems", "CRM support", "Scheduling systems"],
  },
  {
    icon: Zap,
    title: "Campaign Operations",
    items: ["Organic campaigns", "Creator campaigns", "Launch execution", "Visibility systems"],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    items: ["KPI dashboards", "ROI tracking", "Monthly reporting", "Optimization plans"],
  },
];

const PACKAGES = [
  {
    name: "Strategic Starter",
    summary: "Foundational growth systems for early-stage brands.",
    perks: ["Content infrastructure", "Reels & visual direction", "Monthly KPI report", "1 campaign / month"],
  },
  {
    name: "Growth Partner",
    summary: "Hands-on execution partner for scaling brands.",
    perks: ["Full content + automation", "Campaign operations", "Creator coordination", "Bi-weekly strategy"],
    featured: true,
  },
  {
    name: "Performance Alliance",
    summary: "Long-term, performance-aligned partnership structure.",
    perks: ["Custom growth infrastructure", "Multi-brand operations", "Performance share model", "Executive partner access"],
  },
];

const SKILLS = [
  "AI Workflow Automation",
  "Growth Strategy",
  "Brand Architecture",
  "Content Systems",
  "Reels & Short-form Video",
  "Campaign Operations",
  "Analytics & Reporting",
  "Lead Generation",
  "Creator Ecosystems",
  "Digital Branding",
];

const LEADERSHIP = [
  "Life Member & Advisor — Pabna Debate Society (PDS)",
  "Organizing Secretary (Event) — National Debate Federation Bangladesh",
  "Founder — Pabna Debate Society",
  "President — Pabna Zilla Chhatra Kallyan Samiti, JU",
];

type ProofItem = {
  cat: string;
  title: string;
  desc: string;
  images?: string[];
  meta?: { issuer: string; date: string; type: string };
};

const PROOF: ProofItem[] = [
  { cat: "Education", title: "Educational Background", desc: "B.Sc. IT — Jahangirnagar University · HSC & SSC GPA 5.00", images: [proofEducation], meta: { issuer: "Institute of Information Technology, Jahangirnagar University", date: "2016 – 2022", type: "Academic Summary" } },
  { cat: "Education", title: "University Certificates", desc: "Appeared & character certificates from IIT, JU", images: [proofUniversity], meta: { issuer: "Institute of Information Technology, Jahangirnagar University", date: "Apr 2022 & May 2024", type: "Official University Certificate" } },
  { cat: "Education", title: "HSC Credentials", desc: "HSC 2016 — GPA 5.00, Shaheed Bulbul Govt. College", images: [proofHsc], meta: { issuer: "Board of Intermediate & Secondary Education, Rajshahi", date: "August 2016", type: "HSC Certificate & Transcript" } },
  { cat: "Education", title: "SSC Credentials", desc: "SSC 2014 — GPA 5.00, Pabna Zilla School", images: [proofSsc], meta: { issuer: "Board of Intermediate & Secondary Education, Rajshahi", date: "May 2014", type: "SSC Certificate & Transcript" } },
  { cat: "Leadership", title: "Presidential Leadership — PZSWA", desc: "President, Pabna Zilla Chhatra Kallyan Samiti, JU (2021)", images: [proofPzswa, proofLeadershipOverview], meta: { issuer: "Pabna Zilla Chhatra Kallyan Samiti, Jahangirnagar University", date: "19 October 2021", type: "Presidential Appointment Letter" } },
  { cat: "Leadership", title: "NDF-BD Appointment", desc: "Organizing Secretary (Event), National Debate Federation BD", images: [proofNdfBd], meta: { issuer: "National Debate Federation Bangladesh (NDF-BD)", date: "2021", type: "Official Appointment Notice" } },
  { cat: "Leadership", title: "PDS — Life Member & Advisor", desc: "Pabna Debate Society — Advisory Board (2021–22)", images: [proofPds], meta: { issuer: "Pabna Debate Society (PDS)", date: "10 July 2021", type: "Advisory Board Appointment" } },
  { cat: "Volunteer", title: "COVID-19 Volunteer ID", desc: "Frontline volunteer — Pabna Police Super Office", images: [proofCovid], meta: { issuer: "Office of the Superintendent of Police, Pabna", date: "2020", type: "Volunteer Identity Card" } },
  { cat: "Training", title: "Professional Training Programs", desc: "10 Minute School, Sochetan Foundation, NDBC", images: [proofTrainingCerts, proofTrainingOverview], meta: { issuer: "10 Minute School · Sochetan Foundation · NDBC", date: "2018 – 2024", type: "Course Completion Certificates" } },
  { cat: "Training", title: "Participation & Achievement", desc: "Debate, leadership & academic certificates", images: [proofParticipation], meta: { issuer: "BDF, Debate Bangladesh, Bangladesh Shishu Academy & others", date: "2010 – 2021", type: "Participation & Achievement Certificates" } },
  { cat: "Identity", title: "Official Identification", desc: "University ID · National ID · Birth Certificate", images: [proofIdentification], meta: { issuer: "Government of Bangladesh & Jahangirnagar University", date: "1999 – 2023", type: "Government & Institutional ID" } },
  { cat: "Speaking", title: "UNDP Podium Address", desc: "Public address at a United Nations Development Programme event", images: [proofUndpSpeaking], meta: { issuer: "United Nations Development Programme (UNDP)", date: "2025", type: "Speaking Engagement — Reference Photo" } },
];
const PROOF_CATS = ["All", "Education", "Leadership", "Speaking", "Volunteer", "Training", "Identity"] as const;

const PRESETS = {
  "Strategic Starter": { base: 60, perf: 10, avg: 35, scope: 4 },
  "Growth Partner": { base: 90, perf: 20, avg: 60, scope: 6 },
  "Performance Alliance": { base: 120, perf: 35, avg: 90, scope: 8 },
} as const;

const PORTFOLIO_META = {
  title: "Zahid Hasan Emon — AI-Powered Growth Operator & Brand Architect",
  description:
    "Zahid Hasan Emon — AI-Powered Digital Growth Operator, Brand Architect & Growth Execution Partner. Building scalable growth systems, content infrastructure and automation for brands, startups and creator ecosystems.",
  url: "https://trendflux.digital/portfolio",
  image: "https://trendflux.digital/og/portfolio-zahid-hasan-emon.jpg",
};

export default function Portfolio() {
  // Per-page SEO routed through the central SeoHead/Helmet pipeline so the
  // tags don't fight with default ones set by the homepage on hydration.
  useSeo({
    title: PORTFOLIO_META.title,
    description: PORTFOLIO_META.description,
    canonical: PORTFOLIO_META.url,
    image: PORTFOLIO_META.image,
    imageWidth: 1200,
    imageHeight: 630,
    type: "profile",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: "Zahid Hasan Emon",
        givenName: "Zahid Hasan",
        familyName: "Emon",
        jobTitle: "AI-Powered Growth Operator & Brand Architect",
        url: PORTFOLIO_META.url,
        image: PORTFOLIO_META.image,
        sameAs: [
          "https://www.linkedin.com/company/trendflux",
          "https://www.facebook.com/trendflux",
        ],
        worksFor: {
          "@type": "Organization",
          name: BRAND.name,
          url: BRAND.url,
        },
      },
    },
  });

  const [preset, setPreset] = useState<keyof typeof PRESETS>("Growth Partner");
  const [base, setBase] = useState<number>(PRESETS["Growth Partner"].base);
  const [perf, setPerf] = useState<number>(PRESETS["Growth Partner"].perf);
  const [avg, setAvg] = useState<number>(PRESETS["Growth Partner"].avg);
  const [scope, setScope] = useState<number>(PRESETS["Growth Partner"].scope);

  const applyPreset = (p: keyof typeof PRESETS) => {
    const v = PRESETS[p];
    setPreset(p);
    setBase(v.base);
    setPerf(v.perf);
    setAvg(v.avg);
    setScope(v.scope);
  };

  const baseValue = base * 1000;
  const perfOutcome = (avg * 1000 * scope * perf) / 100;
  const projected = baseValue + perfOutcome;
  const growth = baseValue ? Math.round((perfOutcome / baseValue) * 100) : 0;
  const fmt = (n: number) => `৳${n.toLocaleString()}`;

  const [filter, setFilter] = useState<(typeof PROOF_CATS)[number]>("All");
  const filteredProof = filter === "All" ? PROOF : PROOF.filter((p) => p.cat === filter);
  const [lightbox, setLightbox] = useState<{
    title: string;
    cat: string;
    images: string[];
    index: number;
    meta?: { issuer: string; date: string; type: string };
  } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((l) => (l ? { ...l, index: (l.index + 1) % l.images.length } : l));
      if (e.key === "ArrowLeft") setLightbox((l) => (l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : l));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  return (
    <div className="min-h-dvh bg-background text-foreground font-[Inter,system-ui,sans-serif] antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-xl bg-foreground text-background grid place-items-center text-sm font-bold tracking-tight">ZE</span>
            <span className="font-semibold tracking-tight text-[15px] font-[Space_Grotesk,Inter,sans-serif]">Zahid Hasan Emon</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-foreground transition">{n.label}</a>
            ))}
          </nav>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 transition shadow-[0_8px_20px_-8px_rgba(220,38,38,0.55)]"
          >
            Start Strategic Discussion <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <main id="main-content">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(220,38,38,0.06),transparent_70%),linear-gradient(180deg,#FFFFFF,#F8FAFC)]" />
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-[#FFE4E6] via-white to-[#FFF5F5] blur-2xl opacity-70" />
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-border shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)] bg-muted">
                  <img src={portrait} alt="Zahid Hasan Emon — Brand Architect & Growth Operator" className="h-full w-full object-cover" />
                  <div className="absolute left-4 bottom-4 right-4 flex items-center justify-between rounded-xl bg-background/95 backdrop-blur px-3 py-2 ring-1 ring-border">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">Brand Architect</div>
                      <div className="text-sm font-semibold">Zahid Hasan Emon</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-green"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                  </div>
                </div>
                {/* floating metric */}
                <div className="hidden md:flex absolute -right-8 top-10 items-center gap-2 rounded-xl bg-background px-3 py-2 ring-1 ring-border shadow-md">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs font-semibold">485K+ Views</div>
                    <div className="text-[10px] text-muted-foreground">Organic campaigns</div>
                  </div>
                </div>
                <div className="hidden md:flex absolute -left-6 bottom-16 items-center gap-2 rounded-xl bg-background px-3 py-2 ring-1 ring-border shadow-md">
                  <Sparkles className="h-4 w-4 text-brand-green" />
                  <div>
                    <div className="text-xs font-semibold">82% Organic</div>
                    <div className="text-[10px] text-muted-foreground">Reach quality</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 text-primary text-xs font-semibold px-3 py-1 ring-1 ring-primary/30">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                Strategic Growth Operator · Available for partnerships
              </span>
              <h1 className="mt-5 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight font-[Space_Grotesk,Inter,sans-serif]">
                AI-Powered Growth Systems
                <br className="hidden md:block" /> Built for <span className="text-primary">Real Business Outcomes</span>.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] md:text-base text-muted-foreground leading-relaxed">
                I help brands, startups, consultants and organizations scale through AI-powered content systems, digital strategy, automation, creator ecosystems and measurable growth execution.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#systems" className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 text-sm font-medium transition shadow-[0_12px_28px_-10px_rgba(220,38,38,0.5)]">
                  View Systems <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-border hover:border-foreground px-5 py-3 text-sm font-medium text-foreground transition">
                  Start Discussion
                </a>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TRUST.map((t) => (
                  <div key={t.l} className="rounded-xl border border-border bg-background px-4 py-3">
                    <div className="text-lg font-bold tracking-tight">{t.v}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{t.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILE */}
      <section id="about" className="py-20 md:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Profile</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Strategic Growth Operator</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              AI-powered Digital Growth Operator combining automation systems, creator-led growth, content infrastructure and digital strategy to deliver measurable outcomes for brands, organizations and growth-focused partners.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Focused on scalable execution — not task-based freelancing.</p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
            {[
              "AI-powered marketing systems",
              "Creator ecosystems",
              "Campaign execution",
              "Automation workflows",
              "Digital branding",
              "Growth operations",
              "Content infrastructure",
              "Performance analytics",
            ].map((s) => (
              <div key={s} className="flex items-start gap-2.5 rounded-xl border border-border bg-background px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="py-20 md:py-24 bg-muted border-y border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Experience</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Operator-grade execution across sectors</h2>
            </div>
            <span className="text-sm text-muted-foreground">EdTech · Civic · Agency · Founder</span>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {EXPERIENCE.map((e) => (
              <article key={e.role} className="rounded-2xl border border-border bg-background p-6 hover:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)] transition">
                <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider"><Briefcase className="h-3.5 w-3.5" /> {e.org}</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{e.role}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {e.bullets.map((b) => (
                    <li key={b} className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEMS */}
      <div id="systems-he-built" className="border-t border-border bg-background">
        <FilteredSystemsBentoSection
          eyebrow="Systems He Built · Portfolio"
          title="Eight production systems, one operating stack."
          intro="Six sub-brands plus two internal ops layers — each shipped, in production, and instrumented."
        />
      </div>

      <section id="systems" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Casebook</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif] max-w-2xl">Growth Systems & Execution Infrastructure</h2>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {SYSTEMS.map((s) => {
              const Icon = s.icon;
              return (
                <article key={s.n} className="group rounded-2xl border border-border bg-background p-7 hover:border-foreground transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground">SYSTEM {s.n}</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary"><Icon className="h-4.5 w-4.5" /></span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">{s.title}</h3>
                  <div className="mt-5 grid sm:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Built</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                        {s.built.map((b) => <li key={b} className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-brand-green mt-0.5 shrink-0" />{b}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Results</p>
                      <ul className="mt-2 space-y-1.5">
                        {s.results.map((r) => (
                          <li key={r.l} className="flex items-baseline justify-between rounded-lg bg-muted px-3 py-1.5">
                            <span className="text-sm font-bold text-foreground">{r.v}</span>
                            <span className="text-xs text-muted-foreground">{r.l}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-20 md:py-24 bg-muted border-y border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Performance</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Verified outcomes across systems</h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {METRICS.map((m) => (
              <div key={m.l} className="rounded-2xl border border-border bg-background p-5">
                <div className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: m.c }}>{m.v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERSHIP CALCULATOR */}
      <section id="packages" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Partnership</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Partnership Value Projection</h2>
            <p className="mt-4 text-muted-foreground">Flexible growth partnership models designed around measurable execution, scalable collaboration and long-term business value.</p>
          </div>

          <div className="mt-10 grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-border bg-background p-6 md:p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)]">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${preset === p ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="mt-7 space-y-6">
                {[
                  { l: "Base Partnership (k৳ / month)", v: base, set: setBase, min: 30, max: 200, step: 5 },
                  { l: "Performance Share (%)", v: perf, set: setPerf, min: 0, max: 50, step: 1 },
                  { l: "Avg Project Value (k৳)", v: avg, set: setAvg, min: 10, max: 200, step: 5 },
                  { l: "Monthly Execution Scope (projects)", v: scope, set: setScope, min: 1, max: 12, step: 1 },
                ].map((f) => (
                  <div key={f.l}>
                    <div className="flex items-baseline justify-between">
                      <label className="text-sm font-medium text-foreground">{f.l}</label>
                      <span className="text-sm font-semibold tabular-nums">{f.v}</span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={f.v}
                      onChange={(e) => f.set(Number(e.target.value))}
                      className="mt-2 w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-5 rounded-2xl bg-foreground text-background p-7 md:p-8 flex flex-col justify-between shadow-[0_30px_70px_-40px_rgba(0,0,0,0.6)]">
              <div className="space-y-4">
                <Stat label="Base Partnership Value" value={fmt(baseValue)} />
                <Stat label="Performance-Aligned Outcome" value={fmt(perfOutcome)} accent="#F97316" />
                <div className="h-px bg-background/10" />
                <Stat label="Projected Partnership Value" value={fmt(projected)} accent="#DC2626" big />
                <div className="flex items-center justify-between text-xs text-background/60">
                  <span>Growth Potential</span>
                  <span className="text-brand-green font-semibold">+{growth}%</span>
                </div>
              </div>
              <div className="mt-7 space-y-3">
                <a href="#contact" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 text-sm font-medium transition">
                  Discuss Partnership Structure <ArrowRight className="h-4 w-4" />
                </a>
                <p className="text-[11px] text-background/55 leading-relaxed">
                  Every collaboration structure is customized based on execution scope, project scale and measurable business objectives.
                </p>
                <p className="text-[11px] text-background/40">Open to retainer, performance-based and hybrid growth partnership structures.</p>
              </div>
            </aside>
          </div>

          {/* PACKAGES */}
          <div className="mt-16 grid md:grid-cols-3 gap-5">
            {PACKAGES.map((p) => (
              <div key={p.name} className={`rounded-2xl border p-6 transition hover:-translate-y-0.5 ${p.featured ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>
                <h3 className={`text-lg font-semibold tracking-tight ${p.featured ? "text-background" : "text-foreground"}`}>{p.name}</h3>
                <p className={`mt-2 text-sm ${p.featured ? "text-background/70" : "text-muted-foreground"}`}>{p.summary}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex gap-2">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-brand-green" : "text-brand-green"}`} />
                      <span className={p.featured ? "text-background/85" : "text-foreground"}>{perk}</span>
                    </li>
                  ))}
                </ul>
                <a href="#contact" className={`mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${p.featured ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
                  Discuss this package <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section id="deliverables" className="py-20 md:py-24 bg-muted border-y border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Deliverables</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">What ships every month</h2>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERABLES.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.title} className="rounded-2xl border border-border bg-background p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-semibold tracking-tight">{d.title}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {d.items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />{i}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAGES & BRANDS */}
      <section id="pages" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Pages & Brands</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">
              Communities, brands & pages operated by Zahid Hasan Emon
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
              Grouped by context — civic activism, full-time employer work, and independent client engagements.
            </p>
          </div>

          <div className="mt-12 space-y-14">
            {PAGE_GROUPS.map((g) => (
              <div key={g.key}>
                <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">{g.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{g.caption}</p>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{g.items.length} {g.items.length === 1 ? "page" : "pages"}</span>
                </div>
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {g.items.map((p) => (
                    <div key={p.name} className="group rounded-2xl border border-border bg-background p-6 hover:border-foreground transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-10 w-10 rounded-xl bg-foreground text-background grid place-items-center text-[13px] font-bold tracking-tight shrink-0">
                            {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold tracking-tight truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{p.role}</div>
                          </div>
                        </div>
                        {p.badge && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 text-primary text-[10px] font-semibold px-2 py-1 ring-1 ring-primary/30 whitespace-nowrap">
                            <Globe className="h-3 w-3" />{p.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        {p.href && p.href !== "#" && (
                          <a
                            href={p.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition"
                          >
                            <Facebook className="h-3.5 w-3.5" /> Visit page <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {p.website && (
                          <a
                            href={p.website.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                          >
                            <Globe className="h-3.5 w-3.5" /> {p.website.label} <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* SKILLS + LEADERSHIP + EDU */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Skills</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Operating capabilities</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />{s}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Leadership</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Public trust roles</h2>
            <ul className="mt-6 space-y-3">
              {LEADERSHIP.map((l) => (
                <li key={l} className="flex gap-2.5 text-sm text-foreground">
                  <Award className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Education</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Academic</h2>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <div className="font-semibold">B.Sc. in Information Technology</div>
                <div className="text-muted-foreground">Jahangirnagar University</div>
              </li>
              <li>
                <div className="font-semibold">HSC — GPA 5.00</div>
                <div className="text-muted-foreground">Shaheed Bulbul Govt. College</div>
              </li>
              <li>
                <div className="font-semibold">SSC — GPA 5.00</div>
                <div className="text-muted-foreground">Pabna Zilla School</div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROOF VAULT */}
      <section id="proof" className="py-20 md:py-24 bg-muted border-y border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {/* Easy-move rail → The Stand & Quiet Positions */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              to="/the-stand"
              className="group flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background px-5 py-4 transition-all hover:border-foreground/40 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.4)]"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
                  Featured · জাতীয় দলিল
                </p>
                <p className="mt-1.5 truncate font-[Space_Grotesk,Inter,sans-serif] text-[15px] font-semibold text-foreground">
                  The Stand — মায়ের নিষেধ আছে
                </p>
                <p className="mt-1 text-xs text-muted-foreground">A preserved moment of conscience.</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/quiet-positions"
              className="group flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background px-5 py-4 transition-all hover:border-foreground/40 hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.4)]"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                  Parallel Chapter · নীরব অবস্থান
                </p>
                <p className="mt-1.5 truncate font-[Space_Grotesk,Inter,sans-serif] text-[15px] font-semibold text-foreground">
                  Quiet Positions
                </p>
                <p className="mt-1 text-xs text-muted-foreground">An emotional archive — restrained, civic.</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">Proof Vault</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Verified Proof Vault</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">Original documents & legal proof. Tap any card to view the original document — credentials, leadership and identity verified.</p>
            </div>
            <div
              role="tablist"
              aria-label="Filter proof documents by category"
              className="-mx-5 px-5 lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {PROOF_CATS.map((c) => {
                const count = c === "All" ? PROOF.length : PROOF.filter((p) => p.cat === c).length;
                const active = filter === c;
                return (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={`shrink-0 snap-start inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted ${
                      active
                        ? "bg-foreground text-background shadow-[0_8px_20px_-10px_rgba(0,0,0,0.4)]"
                        : "border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    {c}
                    <span
                      className={`inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                        active ? "bg-background/15 text-background" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            key={filter}
            className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 motion-safe:animate-[fadeIn_.25s_ease-out]"
          >
            {filteredProof.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
                <ShieldCheck className="mx-auto h-6 w-6 text-muted-foreground" />
                <h3 className="mt-3 font-semibold text-foreground">No documents in this category yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try another category — every credential here is independently verified.</p>
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
                >
                  Show all documents
                </button>
              </div>
            ) : (
              filteredProof.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => p.images && p.images.length > 0 && setLightbox({ title: p.title, cat: p.cat, images: p.images, index: 0, meta: p.meta })}
                  disabled={!p.images || p.images.length === 0}
                  aria-label={p.images && p.images.length > 0 ? `View original document: ${p.title}` : `${p.title} — original coming soon`}
                  className="text-left group rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 text-brand-green text-[11px] font-semibold px-2.5 py-1 ring-1 ring-brand-green/40">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{p.cat}</span>
                  </div>
                  <h3 className="mt-3 font-semibold tracking-tight text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                    {p.images && p.images.length > 0 ? "Tap to view original" : "Original coming soon"} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))
            )}
          </div>

          {/* TRUST BLOCK */}
          <div className="mt-14 rounded-3xl border border-border bg-background p-7 md:p-9">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold tracking-tight">BASIS-Level Partnership Trust</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Why partners choose working with me.</p>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { t: "B.Sc. IT — Jahangirnagar University", d: "Verified academic credentials" },
                { t: "11+ Original Documents", d: "Education, leadership, identity" },
                { t: "485K+ Views · 82% Organic Reach", d: "Proven campaign performance" },
                { t: "5+ Brands · Multi-sector Experience", d: "EdTech, civic, agency, US/UK" },
                { t: "7+ Professional Trainings", d: "10MS, Sochetan, NDBC, NDF-BD" },
                { t: "Leadership at PZSWA, NDF-BD, PDS", d: "Public trust & accountability" },
              ].map((b) => (
                <div key={b.t} className="rounded-xl border border-border p-4">
                  <div className="text-sm font-semibold text-foreground">{b.t}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="rounded-3xl bg-foreground text-background p-8 md:p-12 relative overflow-hidden">
            <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-orange">Contact</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight font-[Space_Grotesk,Inter,sans-serif]">Start a strategic discussion</h2>
            <p className="mt-3 max-w-xl text-background/70">Open to retainer, performance-based and hybrid growth partnership structures across brands, organizations and creator ecosystems.</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
              <a href="mailto:zhemongrowth@gmail.com" className="flex items-center gap-3 rounded-xl bg-background/[0.06] hover:bg-background/[0.1] px-4 py-3 transition">
                <Mail className="h-4 w-4 text-primary" /> zhemongrowth@gmail.com
              </a>
              <a href="tel:+8801756004037" className="flex items-center gap-3 rounded-xl bg-background/[0.06] hover:bg-background/[0.1] px-4 py-3 transition">
                <Phone className="h-4 w-4 text-primary" /> +880 1756-004037
              </a>
              <div className="flex items-center gap-3 rounded-xl bg-background/[0.06] px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" /> Dhaka, Bangladesh
              </div>
              <a href="https://trendflux.digital" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-background/[0.06] hover:bg-background/[0.1] px-4 py-3 transition">
                <Globe className="h-4 w-4 text-primary" /> trendflux.digital
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="mailto:zhemongrowth@gmail.com" className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 text-sm font-medium transition">
                Start Strategic Discussion <ArrowRight className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/zhemongrowth" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-background/20 hover:border-background text-background px-4 py-2.5 text-sm transition">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a href="https://www.facebook.com/zhemongrowth" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-background/20 hover:border-background text-background px-4 py-2.5 text-sm transition">
                <Facebook className="h-4 w-4" /> Facebook
              </a>
            </div>
          </div>
        </div>
      </section>

      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Zahid Hasan Emon · AI-Powered Growth Operator</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Powered by TrendFlux Ecosystem</span>
        </div>
      </footer>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 motion-safe:animate-[fadeIn_.2s_ease-out]"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ×
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => { e.stopPropagation(); setLightbox((l) => l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : l); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => { e.stopPropagation(); setLightbox((l) => l ? { ...l, index: (l.index + 1) % l.images.length } : l); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                ›
              </button>
            </>
          )}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-5 max-w-[96vw] max-h-[92vh] w-full lg:w-auto"
          >
            <img
              src={lightbox.images[lightbox.index]}
              alt={`${lightbox.title} — original document`}
              className="min-h-0 max-h-[60vh] lg:max-h-[88vh] max-w-full lg:max-w-[70vw] rounded-lg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] bg-background object-contain mx-auto"
            />
            <aside
              aria-label="Verification metadata"
              className="w-full lg:w-[320px] shrink-0 rounded-2xl bg-background p-5 md:p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-y-auto"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 text-brand-green text-[11px] font-semibold px-2.5 py-1 ring-1 ring-brand-green/40">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{lightbox.cat}</span>
              </div>
              <h3 className="mt-3 font-semibold tracking-tight text-foreground text-base leading-snug">{lightbox.title}</h3>
              {lightbox.images.length > 1 && (
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Page {lightbox.index + 1} of {lightbox.images.length}
                </p>
              )}

              {lightbox.meta && (
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Issuer</dt>
                    <dd className="mt-1 text-foreground leading-snug">{lightbox.meta.issuer}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date</dt>
                    <dd className="mt-1 text-foreground">{lightbox.meta.date}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Document type</dt>
                    <dd className="mt-1 text-foreground">{lightbox.meta.type}</dd>
                  </div>
                </dl>
              )}

              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Original document — independently verifiable</span>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent, big }: { label: string; value: string; accent?: string; big?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-background/55 font-semibold">{label}</div>
      <div className={`mt-1 font-bold tracking-tight tabular-nums ${big ? "text-3xl md:text-4xl" : "text-xl"}`} style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}
