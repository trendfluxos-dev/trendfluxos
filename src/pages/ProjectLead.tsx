import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MarriageInquiryDialog from "@/components/MarriageInquiryDialog";
import {
  ArrowRight,
  Linkedin,
  Award,
  Sparkles,
  Facebook,
  Youtube,
  Mail,
  MessageCircle,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  ExternalLink,
  FileText,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import emonPortrait from "@/assets/zahid-hasan-emon.webp";
import { useSeo } from "@/hooks/useSeo";
import ShowcaseMasonry from "@/components/showcase/ShowcaseMasonry";
import { SHOWCASE_ITEMS } from "@/data/showcase";
import { SystemsHeBuiltSection } from "@/components/home/SystemsHeBuiltSection";
import ProjectLeadBookingDialog from "@/components/project-lead/ProjectLeadBookingDialog";
import PortfolioHighlightsSection from "@/components/project-lead/PortfolioHighlightsSection";
import { TrendingUp } from "lucide-react";

const metrics = [
  { value: "4.85L+", label: "Organic Views" },
  { value: "82%", label: "Organic Reach" },
  { value: "45%+", label: "Engagement Growth" },
];

const educationRecords = [
  {
    degree: "BSc (Honours) in Information Technology",
    institution: "Institute of Information Technology (IIT), Jahangirnagar University",
    period: "2018 — 2024 · Batch 2018-19",
    status: "Completed · CGPA 2.63",
    focus:
      "Software Engineering · Data Systems · Digital Product Strategy · Hall: Shaheed Rafiq-Jabbar",
  },
  {
    degree: "Higher Secondary Certificate (HSC) — Science",
    institution: "Motijheel Model College, Dhaka",
    period: "2017 — 2019",
    status: "Passed",
    focus: "Physics · Mathematics · ICT",
  },
  {
    degree: "Secondary School Certificate (SSC) — Science",
    institution: "Motijheel Government Boys' High School, Dhaka",
    period: "2015 — 2017",
    status: "Passed",
    focus: "Science group · ICT foundation",
  },
];

const certifications = [
  {
    id: "ju-bsc",
    title: "Official University Certificate — BSc (Honours) in IT",
    issuer: "IIT, Jahangirnagar University · Controller of Examinations",
    date: "22 May 2024",
    note:
      "Class Roll 2484 · Exam Roll 172491 · Result published in JU notice (juniv.edu/discussion/18018).",
    details: {
      credential: "BSc (Honours) in Information Technology",
      awardedTo: "ZAHID HASAN EMON",
      classRoll: "2484",
      examRoll: "172491",
      session: "2018 — 2019",
      resultPublished: "22 May 2024",
      verification: "QR verification code on official letterhead",
      notice: {
        title: "JU Notice — Result Publication (BSc Hons. in IT, 2018-19 Session)",
        reference: "juniv.edu/discussion/18018",
        summary:
          "Jahangirnagar University's official notice board published the final result for BSc (Honours) in Information Technology, Session 2018-19. The notice was signed by the Controller of Examinations and released via IIT, JU.",
        url: "https://juniv.edu/discussion/18018",
      },
      documents: [
        "Assured Certificate (dated 22 May 2024) — signed by Professor & Chairman, IIT",
        "To Whom It May Concern letter (dated 17 April 2022) — on IIT letterhead",
      ],
    },
  },
  {
    id: "digital-growth",
    title: "Digital Marketing & Growth Systems",
    issuer: "Industry programs · self-attested portfolio",
    date: "2022 — 2025",
    note: "Applied on live D2C, EdTech and creator brands (see Case Files).",
    details: {
      credential: "Applied Growth Systems (self-attested portfolio)",
      awardedTo: "ZAHID HASAN EMON",
      session: "2022 — 2025",
      verification: "Case files & live client outcomes available on request",
      notice: {
        title: "Portfolio Notice",
        reference: "Case Files section",
        summary:
          "Skills validated through live campaigns for D2C, EdTech and creator brands — including funnel builds, Meta Ads management, and GHL/Make automation. Verifiable case files are available in the Case Files section.",
      },
      documents: [
        "Client outcome briefs (LuxeVeil, Kormoshikkha, BrandToki)",
        "Automation blueprints — GoHighLevel + Make.com",
      ],
    },
  },
];

type Certification = (typeof certifications)[number];

const transformations = [
  {
    client: "Kormoshikkha (EdTech)",
    stage: "0 → 1 launch",
    outcome: "Live-cohort model went from concept to 300+ enrolled students in the first 90 days.",
    lift: "+300 enrolled",
  },
  {
    client: "LuxeVeil (D2C · Bridal)",
    stage: "Positioning + funnel",
    outcome: "Rebuilt inquiry funnel + attribution — qualified inquiries 4×, sales-call rate up 68%.",
    lift: "4× inquiries",
  },
  {
    client: "BrandToki (Creative studio)",
    stage: "Ops + retention",
    outcome: "Systematized delivery pipeline, cut turnaround 40% while retainer retention held above 90%.",
    lift: "−40% turnaround",
  },
];

const expertise = [
  {
    title: "AI & Business Automation",
    description:
      "GoHighLevel (GHL) workflows, Make.com and webhook integrations, automated sales and lead pipelines built with ChatGPT and Lovable.",
  },
  {
    title: "Business Consultancy",
    description:
      "7-phase, data-driven cash-flow systems and business operating systems optimized for retail and superstore environments.",
  },
  {
    title: "Digital Growth",
    description:
      "Data-driven marketing campaigns, Meta Ads management, and narrative-driven content branding for compounding reach.",
  },
  {
    title: "Leadership & Storytelling",
    description:
      "Narrative leadership, community orchestration, and human-centered corporate communication that builds brand authority.",
  },
];

// Portfolio highlights data + markup live in PortfolioHighlightsSection so
// the layout can be snapshot-tested for visual regressions.

const leadership = [
  { role: "Organizing Secretary", org: "National Debate Federation Bangladesh (NDF-BD)" },
  { role: "Founder & Life Member", org: "Pabna Debate Society (PDS)" },
  { role: "Member & Organizer", org: "Pabna Nagorik Committee (Full Permanent Committee)" },
  { role: "Program Director", org: "Citizen Unity Gathering — Dhaka, March 2026" },
];

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/zhemongrowth" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/zhemongrowth/" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@zhemongrowth" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/message/5GSNUYK6CSDCN1" },
  { icon: Mail, label: "Email", href: "mailto:zhemongrowth@gmail.com" },
];

const ProjectLead = () => {
  const [marriageOpen, setMarriageOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<Certification | null>(null);
  useSeo({
    title: "Project Lead — Zahid Hasan Emon | Founder, TrendFlux Ecosystem",
    description:
      "Zahid Hasan Emon — Founder of TrendFlux Ecosystem. AI automation, growth operations, content systems and brand architecture for ambitious businesses.",
    type: "profile",
    imageAlt: "Zahid Hasan Emon — Founder, TrendFlux Ecosystem",
  });
  return (
    <main className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      <MarriageInquiryDialog open={marriageOpen} onOpenChange={setMarriageOpen} />
      <ProjectLeadBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
      <Navbar />

      {/* HERO / ABOUT */}
      <section className="relative pt-36 pb-20 px-6 lg:px-10">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 grid-dots opacity-30" aria-hidden />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* IMAGE */}
          <div className="relative animate-fade-up">
            <div className="absolute -inset-4 bg-gradient-cyan/20 rounded-[2rem] blur-2xl" aria-hidden />
            <div className="relative rounded-[2rem] overflow-hidden glass-strong p-2">
              <img
                src={emonPortrait}
                alt="Zahid Hasan Emon — Digital Transformation & Growth Operator"
                width={1024}
                height={1024}
                className="w-full h-full object-cover rounded-[1.6rem] aspect-square"
              />
            </div>

            <div className="absolute -bottom-4 -right-4 bg-gradient-gold text-gold-foreground px-5 py-3 rounded-2xl font-semibold shadow-gold flex items-center gap-2">
              <Award className="w-4 h-4" />
              Project Lead
            </div>

            <div className="absolute -top-4 -left-4 glass-strong px-4 py-2 rounded-full text-xs uppercase tracking-[0.25em] text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Available for new systems
            </div>
          </div>

          {/* CONTENT */}
          <div className="animate-fade-up [animation-delay:0.1s]">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              About Our Project Lead
            </p>

            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Zahid Hasan <span className="text-gradient">Emon</span>
            </h1>

            <p className="text-gold mt-3 text-lg font-semibold">
              Digital Transformation & Growth Operator
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-foreground/60">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                Founder & CEO — TrendFlux Ecosystem
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Dhaka, Bangladesh
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                BSc IT — Jahangirnagar University
              </span>
            </div>

            <p className="text-foreground/75 mt-6 leading-relaxed">
              Zahid Hasan Emon is a data-driven Digital Transformation & Growth
              Operator dedicated to replacing manual workflows with structured,
              AI-powered business operating systems. He blends technical
              expertise with actionable business strategy to deliver high-value,
              automated solutions across retail, corporate and digital sectors.
            </p>

            <p className="text-foreground/55 mt-4 leading-relaxed">
              Complementing his academic background in Information Technology,
              his extensive experience in debate and civic organization has
              cultivated a unique strength in narrative leadership and
              human-centered communication — driving sustainable growth through
              global AI automation consultancy and productized digital services.
            </p>

            {/* METRICS */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="glass rounded-2xl p-5 text-center glass-hover"
                >
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-gradient">
                    {m.value}
                  </h3>
                  <p className="text-foreground/55 text-xs mt-1 uppercase tracking-wider">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex gap-4 flex-wrap">
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/message/5GSNUYK6CSDCN1" target="_blank" rel="noreferrer">
                  Book Direct on WhatsApp
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://www.linkedin.com/in/zhemongrowth"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin />
                  Connect on LinkedIn
                </a>
              </Button>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; plausible?: (...a: unknown[]) => void };
                          w.dataLayer?.push({ event: "marriage_button_clicked", location: "project_lead_cta" });
                          w.gtag?.("event", "marriage_button_clicked", { location: "project_lead_cta" });
                          w.plausible?.("marriage_button_clicked", { props: { location: "project_lead_cta" } });
                        } catch { /* no-op */ }
                        setMarriageOpen(true);
                      }}
                      aria-label="Open a sincere marriage introduction form"
                      className="marriage-glow-btn relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-gold-foreground"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Heart className="h-4 w-4 fill-current" aria-hidden />
                        A Sincere Introduction
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Share a quick intro — then the private marriage profile opens for your respectful consideration.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* SOCIALS */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE EXPERTISE */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Core Expertise & Skills
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Where AI, automation & <span className="text-gradient">business strategy</span> converge
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {expertise.map((e, i) => (
              <div key={e.title} className="glass glass-hover rounded-3xl p-7">
                <div className="font-display text-4xl text-gradient font-bold opacity-80">
                  0{i + 1}
                </div>
                <h3 className="font-display text-xl font-bold mt-3">{e.title}</h3>
                <p className="text-foreground/65 mt-3 leading-relaxed text-sm">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO HIGHLIGHTS */}
      <PortfolioHighlightsSection />

      {/* SYSTEMS HE BUILT — 90-day build order timeline */}
      <section className="px-6 lg:px-10 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Systems He Built · 90-day Build
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              The operating systems <span className="text-gradient">behind the portfolio</span>
            </h2>
          </div>
          <SystemsHeBuiltSection />
        </div>
      </section>

      {/* LEADERSHIP & COMMUNITY */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Leadership & Community Engagement
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Civic leadership behind the <span className="text-gradient">growth operator</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {leadership.map((l) => (
              <div
                key={l.org}
                className="glass glass-hover rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-cyan/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-gold font-semibold text-sm">{l.role}</p>
                  <p className="text-foreground/75 mt-1">{l.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE PREVIEW */}
      <section className="px-6 lg:px-10 py-24 relative">
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
                Showcase
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl">
                Everything built, <span className="text-gradient">in one place</span>
              </h2>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link to="/showcase">
                Open Full Showcase
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <ShowcaseMasonry items={SHOWCASE_ITEMS.slice(0, 6)} />
        </div>
      </section>

      {/* CLIENT TRANSFORMATION STORIES */}
      <section className="px-6 lg:px-10 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Client Transformation Stories
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Real founders, <span className="text-gradient">measurable lifts</span>
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto mt-4 text-sm">
              Short before-and-after snapshots from engagements where the Project
              Lead ran strategy, systems and delivery end-to-end.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {transformations.map((t) => (
              <article
                key={t.client}
                className="glass glass-hover rounded-3xl p-7 flex flex-col"
              >
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.3em]">
                    {t.stage}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold mt-3">{t.client}</h3>
                <p className="text-gold font-semibold mt-2">{t.lift}</p>
                <p className="text-foreground/70 mt-4 leading-relaxed text-sm">
                  {t.outcome}
                </p>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => setBookingOpen(true)}>
              Start your transformation
              <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      {/* DIRECT CTA */}
      <section id="education" className="px-6 lg:px-10 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-14">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4">
              Education & Certifications
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Verified academic record
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Formal degrees, university transcripts and program certificates —
              on file and available on request for hiring, matrimonial or
              collaboration verification.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {educationRecords.map((e) => (
              <div
                key={e.degree}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 text-primary">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.25em]">
                    {e.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug">
                  {e.degree}
                </h3>
                <p className="text-sm text-foreground/80">{e.institution}</p>
                <p className="text-xs text-muted-foreground">{e.period}</p>
                <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-auto">
                  {e.focus}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setActiveCert(c)}
                aria-label={`View details for ${c.title}`}
                className="group text-left rounded-2xl border border-border bg-card/60 p-6 flex gap-4 transition hover:border-primary/60 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="font-display text-base font-semibold leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {c.issuer} · {c.date}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {c.note}
                  </p>
                  <span className="text-xs text-primary mt-2 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    View notice details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATION DRILLDOWN MODAL */}
      <Dialog open={!!activeCert} onOpenChange={(o) => !o && setActiveCert(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {activeCert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                    Certification
                  </span>
                </div>
                <DialogTitle className="font-display text-xl md:text-2xl leading-snug">
                  {activeCert.title}
                </DialogTitle>
                <DialogDescription>
                  {activeCert.issuer} · {activeCert.date}
                </DialogDescription>
              </DialogHeader>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                    Awarded to
                  </p>
                  <p className="text-sm font-semibold">
                    {activeCert.details.awardedTo}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                    Credential
                  </p>
                  <p className="text-sm">{activeCert.details.credential}</p>
                </div>
                {"classRoll" in activeCert.details && activeCert.details.classRoll && (
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                      Class / Exam Roll
                    </p>
                    <p className="text-sm">
                      {activeCert.details.classRoll} · {activeCert.details.examRoll}
                    </p>
                  </div>
                )}
                {activeCert.details.session && (
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Session
                    </p>
                    <p className="text-sm">{activeCert.details.session}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Notice details
                </p>
                <p className="font-display text-sm font-semibold leading-snug mb-2">
                  {activeCert.details.notice.title}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  {activeCert.details.notice.summary}
                </p>
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                  <span className="uppercase tracking-[0.2em]">Reference:</span>
                  <span>{activeCert.details.notice.reference}</span>
                  {"url" in activeCert.details.notice && activeCert.details.notice.url && (
                    <a
                      href={activeCert.details.notice.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Open notice <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                  Documents on file
                </p>
                <ul className="space-y-2">
                  {activeCert.details.documents.map((d) => (
                    <li
                      key={d}
                      className="text-sm text-foreground/85 flex gap-2 rounded-lg border border-border/60 p-3"
                    >
                      <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-xl border border-border p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {activeCert.details.verification}
                </p>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setActiveCert(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DIRECT CTA */}
      <section id="book" className="px-6 lg:px-10 py-24 scroll-mt-24">
        <div className="max-w-5xl mx-auto relative rounded-[2rem] glass-strong overflow-hidden p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4">
                Work Direct
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                Book directly with the{" "}
                <span className="text-gradient">Project Lead</span>
              </h2>
              <p className="text-foreground/65 mt-4 max-w-xl">
                Skip the gatekeepers. Get a 30-minute strategy session with Zahid
                Hasan Emon to map your growth system blueprint.
              </p>
              <p className="text-foreground/50 mt-3 text-sm">
                zhemongrowth@gmail.com · WhatsApp +880 1756 004037
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="hero"
                size="lg"
                onClick={() => setBookingOpen(true)}
              >
                Book Direct
                <ArrowRight />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://wa.me/message/5GSNUYK6CSDCN1"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp instead
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/">Back to TrendFlux</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ProjectLead;
