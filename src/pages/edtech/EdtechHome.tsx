import { Link } from "react-router-dom";
import {
  ArrowRight, GraduationCap, Sparkles, CheckCircle2, Cpu, Workflow, Database,
  LineChart, Radio, Video, ShoppingBag, ShieldCheck, Languages, Trophy,
} from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import CourseCard from "@/components/edtech/CourseCard";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";

const FEATURE_BULLETS = [
  { icon: Cpu, label: "Cohort-based AI masterclasses with live sessions" },
  { icon: Workflow, label: "Modular curriculum, lifetime recordings, capstone build" },
  { icon: Database, label: "Runs on the same growth OS we ship to clients" },
  { icon: LineChart, label: "Outcomes-first — every module ends in a real artifact" },
];

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: "Verified teachers" },
  { icon: Languages, label: "বাংলা + English" },
  { icon: Radio, label: "Native live studio" },
  { icon: Trophy, label: "Certificates on completion" },
];

const EdtechHome = () => {
  useSeo({
    title: "কর্মশিক্ষা TED Plus — TrendFlux Online EdTech Platform",
    description:
      "Cohort-based AI masterclasses, growth operator training and career skills. Built and operated end-to-end by TrendFlux.",
    canonical: `${BRAND.url}/edtech`,
  });
  useJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: EDTECH.name,
      url: `${BRAND.url}/edtech`,
      parentOrganization: { "@type": "Organization", name: BRAND.name, url: BRAND.url },
      description:
        "TrendFlux's online edtech platform — cohort AI masterclasses, growth operator training and career skills.",
    },
  ]);

  const featured = EDTECH_COURSES.filter((c) => c.featured);

  return (
    <EdtechShell>
      <EdtechHeader />

      {/* Hero — EISH-style */}
      <section className="relative isolate overflow-hidden border-b border-border edtech-stage-grid">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border edtech-border-gold edtech-bg-gold-soft px-3.5 py-1.5 text-[11px] font-medium text-foreground sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 edtech-text-gold" aria-hidden />
              IKT international standard · AI-powered শেখা
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              The <span className="edtech-text-gradient">EdTech</span> of Learning.
              <br />Live classes, on demand.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              Two ways to learn, one platform. Join a <span className="font-semibold text-foreground">live class</span> with a verified expert,
              অথবা যেকোনো সময় <span className="font-semibold text-foreground">on-demand video course</span> দেখে শিখুন — বাংলা + English-এ।
            </p>

            {/* Dual primary CTAs */}
            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:mt-10 sm:grid-cols-2">
              <Link to={EDTECH.routes.courses} className="group">
                <div className="flex h-full items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 text-left edtech-shadow-panel transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:edtech-shadow-stage sm:p-5">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <GraduationCap className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">For learners</div>
                    <div className="text-base font-bold text-foreground sm:text-lg">Browse on-demand courses</div>
                    <div className="text-xs text-muted-foreground">Cohort masterclasses · lifetime recordings</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                </div>
              </Link>
              <Link to={EDTECH.routes.live} className="group">
                <div className="flex h-full items-center gap-3 rounded-2xl border-2 edtech-border-gold edtech-bg-gold-soft p-4 text-left edtech-shadow-panel transition hover:-translate-y-0.5 hover:edtech-shadow-stage sm:p-5">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl edtech-bg-gold edtech-text-gold shadow-md">
                    <Radio className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider edtech-text-gold">Live now</div>
                    <div className="text-base font-bold text-foreground sm:text-lg">Join a live class</div>
                    <div className="text-xs text-muted-foreground">Native studio · RSVP · in-app watch</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 edtech-text-gold transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free to start ·{" "}
              <Link to={EDTECH.routes.pricing} className="font-medium text-foreground underline-offset-4 hover:underline">
                See pricing & cohorts
              </Link>
            </p>

            {/* Trust chips */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {TRUST_CHIPS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:text-xs"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden /> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-b border-border bg-card/40 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Built by an operator. For operators.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
                Every module is shaped by real client work — not theory. You'll
                ship artifacts you can show, not just slides you forgot.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {FEATURE_BULLETS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-4 edtech-shadow-panel"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                  <span className="text-sm leading-relaxed text-foreground/85">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
                Featured cohorts
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Start with what's live now
              </h2>
            </div>
            <Link
              to={EDTECH.routes.courses}
              className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
            >
              See all courses →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes strip */}
      <section className="border-y border-border bg-card/40 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              "Ship a real artifact per module",
              "Lifetime access to recordings",
              "Direct access to the operator",
            ].map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 edtech-shadow-panel"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
                <span className="text-sm font-medium text-foreground/85">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechHome;