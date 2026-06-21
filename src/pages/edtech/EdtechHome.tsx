import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Sparkles, CheckCircle2, Cpu, Workflow, Database, LineChart } from "lucide-react";
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

const EdtechHome = () => {
  useSeo({
    title: "KormoShikkha — TrendFlux Online EdTech Platform",
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

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border bg-background py-20 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-1/4 h-[480px] w-[480px] rounded-full bg-primary/8 blur-[160px]"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              <Sparkles className="h-3 w-3" aria-hidden />
              Live · Open enrolment
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl md:text-[56px] md:leading-[1.05]">
              KormoShikkha — Operator-grade learning, built by TrendFlux.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.75] text-muted-foreground">
              Cohort-based AI masterclasses, growth operator training and career
              skills. The same operating system we ship to founders — now open
              to learners.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={EDTECH.routes.courses}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Browse all courses <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={EDTECH.routes.pricing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                See pricing & cohorts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-b border-border bg-card/20 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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
                  className="flex gap-3 rounded-2xl border border-border/60 bg-background/60 p-4"
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
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
      <section className="border-y border-border bg-card/30 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              "Ship a real artifact per module",
              "Lifetime access to recordings",
              "Direct access to the operator",
            ].map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 p-5"
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