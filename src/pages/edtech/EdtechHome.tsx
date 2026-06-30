import { Link } from "react-router-dom";
import {
  ArrowRight, GraduationCap, Sparkles, CheckCircle2, Radio, ShieldCheck,
  Languages, Trophy, ShoppingBag, Video, MonitorPlay, CreditCard,
  LayoutDashboard, Bot, PlayCircle, Search, Tag, Star, ChevronDown,
  Presentation, Wallet, Mic, Volume2,
} from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import CourseCard from "@/components/edtech/CourseCard";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { LazySection } from "@/components/LazySection";
import { SectionSkeleton } from "@/components/home/SectionSkeleton";
import { useEdtechLang } from "@/lib/edtechLang";
import TripleBridge from "@/components/ecosystem/TripleBridge";

const EdtechHome = () => {
  useSeo({
    title: "TrendFlux EdTech — Live classes & on-demand learning",
    description:
      "TrendFlux EdTech — verified-teacher live classes and on-demand video courses in Bangla + English. Marketplace, live studio, payments and admin in one platform.",
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
        "TrendFlux EdTech — live classes, on-demand courses, marketplace, payments and admin tooling.",
    },
  ]);

  const { t, lang } = useEdtechLang();
  const featured = EDTECH_COURSES.filter((c) => c.featured);

  return (
    <EdtechShell>
      <EdtechHeader />

      {/* HERO — Institutional Premium: framed ink card with embedded trust strip */}
      <section lang={lang} className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:pt-16">
          <div
            className="relative overflow-hidden rounded-3xl border border-border"
            style={{ background: "hsl(var(--edtech-ink))", boxShadow: "var(--edtech-shadow-stage)" }}
          >
            {/* Decorative accents */}
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-full w-1/3 translate-x-20 skew-x-12 bg-primary/10" />
            <div aria-hidden className="absolute left-8 top-10 h-1 w-32 edtech-bg-gold sm:left-12" />

            <div className="relative z-10 grid items-center gap-10 p-7 sm:p-12 lg:grid-cols-2 lg:gap-12 lg:p-20">
              {/* Text column */}
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-3.5 py-1.5" style={{ background: "hsl(var(--edtech-ink))" }}>
                  <span className="h-2 w-2 animate-pulse rounded-full edtech-bg-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--edtech-gold))" }}>
                    <Sparkles className="mr-1 inline h-3 w-3" aria-hidden /> {t("hero.badge")}
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {t("hero.title.a")} <span style={{ color: "hsl(var(--edtech-gold))" }}>{t("hero.title.brand")}</span> {t("hero.title.b")}
                    <br />
                    {t("hero.title.c")}
                  </h1>
                  <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
                    {t("hero.subtitle")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/auth?role=student&redirect=/edtech/my-learning"
                    className="group inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-4 text-sm font-bold text-primary-foreground transition hover:opacity-90 sm:text-base"
                  >
                    <GraduationCap className="h-5 w-5" aria-hidden />
                    {t("hero.cta.student.title")}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/auth?role=teacher&redirect=/edtech/live"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:text-base"
                  >
                    <Presentation className="h-5 w-5" aria-hidden />
                    {t("hero.cta.teacher.title")}
                  </Link>
                </div>

                <p className="text-xs text-white/55">
                  {t("hero.signinHint.a")}{" "}
                  <Link to="/auth" className="font-medium text-white underline-offset-4 hover:underline">
                    {t("hero.signinHint.b")}
                  </Link>{" · "}{t("hero.signinHint.c")}
                </p>
              </div>

              {/* Visual column — live preview card with floating stat */}
              <div className="relative">
                <div className="aspect-square rotate-3 rounded-3xl border edtech-border-gold bg-primary/15 p-3 sm:p-4">
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10" style={{ background: "hsl(var(--edtech-ink))" }}>
                    <div aria-hidden lang="en" className="select-none text-[120px] font-black leading-none edtech-text-gold opacity-15 sm:text-[160px]" style={{ transform: "rotate(-12deg) scale(1.2)" }}>
                      FLUX
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                      <div className="rounded-xl border border-white/10 p-4 backdrop-blur-md sm:p-5" style={{ background: "hsl(var(--edtech-ink))" }}>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Radio className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-white">{t("hero.preview.title")}</div>
                            <div className="text-xs" style={{ color: "hsl(var(--edtech-gold))" }}>{t("hero.preview.watching")}</div>
                          </div>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-2/3 edtech-bg-gold" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating stat */}
                <div className="absolute -right-3 -top-3 rounded-2xl border edtech-border-gold bg-card p-5 edtech-shadow-panel sm:-right-6 sm:-top-6">
                  <div className="text-3xl font-black text-foreground">98%</div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter text-primary">{t("hero.stat.success")}</div>
                </div>
              </div>
            </div>

            {/* Trust strip embedded in the card */}
            <div className="relative z-10 border-t border-white/10 bg-background/95 px-6 py-8 sm:px-12 sm:py-10">
              <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  { Icon: ShieldCheck, label: t("hero.chip.verified") },
                  { Icon: Radio, label: t("hero.chip.studio") },
                  { Icon: Trophy, label: t("hero.chip.cert") },
                  { Icon: Languages, label: t("hero.chip.lang") },
                ].map(({ Icon, label }) => (
                  <div key={label} className="group flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 text-sm font-semibold text-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle gold section divider */}
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-12">
          <div className="h-px flex-1 bg-[hsl(var(--edtech-gold)/0.3)]" />
          <div className="px-6 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">{t("hero.divider")}</div>
          <div className="h-px flex-1 bg-[hsl(var(--edtech-gold)/0.3)]" />
        </div>
      </section>

      {/* TWO WAYS */}
      <LazySection label="ways" skeleton={<SectionSkeleton variant="cards" />} minHeight="60vh">
        <TwoWays />
      </LazySection>

      {/* ONBOARDING */}
      <LazySection label="onboarding" skeleton={<SectionSkeleton variant="cards" />} minHeight="60vh">
        <Onboarding />
      </LazySection>

      {/* FEATURED */}
      <LazySection label="featured" skeleton={<SectionSkeleton variant="masonry" />} minHeight="70vh">
        <FeaturedCourses featured={featured} />
      </LazySection>

      {/* PICK PATH */}
      <LazySection label="paths" skeleton={<SectionSkeleton variant="cards" />} minHeight="70vh">
        <PickPath />
      </LazySection>

      {/* HOW */}
      <LazySection label="how" skeleton={<SectionSkeleton variant="row" />} minHeight="55vh">
        <HowItWorks />
      </LazySection>

      {/* FEATURES */}
      <LazySection label="features" skeleton={<SectionSkeleton variant="cards" />} minHeight="80vh">
        <FeaturesGrid />
      </LazySection>

      {/* SUBJECTS */}
      <LazySection label="subjects" skeleton={<SectionSkeleton variant="band" />} minHeight="40vh">
        <Subjects />
      </LazySection>

      {/* TESTIMONIALS */}
      <LazySection label="testimonials" skeleton={<SectionSkeleton variant="cards" />} minHeight="50vh">
        <Testimonials />
      </LazySection>

      {/* FAQ */}
      <LazySection label="faq" skeleton={<SectionSkeleton variant="band" />} minHeight="55vh">
        <Faq />
      </LazySection>

      {/* FINAL CTA */}
      <LazySection label="cta" skeleton={<SectionSkeleton variant="band" />} minHeight="40vh">
        <TripleBridge active="edtech" />
        <FinalCta />
      </LazySection>
    </EdtechShell>
  );
};

/* ────────── Section components (kept in-file for fewer files; each is light) ────────── */

function TwoWays() {
  const { t } = useEdtechLang();
  return (
    <section className="border-b border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">{t("ways.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("ways.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("ways.body")}</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border-2 edtech-border-gold edtech-bg-gold-soft p-6 sm:p-8 edtech-shadow-panel">
            <div className="inline-flex items-center gap-2 rounded-full edtech-bg-gold edtech-text-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <Radio className="h-3.5 w-3.5" aria-hidden /> {t("ways.live.tag")}
            </div>
            <h3 className="mt-4 text-2xl font-bold text-foreground">{t("ways.live.title")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("ways.live.body")}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
              {[t("ways.live.b1"), t("ways.live.b2"), t("ways.live.b3")].map((li) => (
                <li key={li} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 edtech-text-gold mt-0.5" aria-hidden /> {li}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to={EDTECH.routes.live} className="inline-flex items-center gap-1.5 rounded-full edtech-bg-gold edtech-text-gold px-4 py-2 text-sm font-semibold hover:opacity-90">{t("ways.live.cta1")} <ArrowRight className="h-4 w-4" /></Link>
              <Link to={EDTECH.routes.live} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-card/80">{t("ways.live.cta2")}</Link>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-primary/40 bg-primary/5 p-6 sm:p-8 edtech-shadow-panel">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <Video className="h-3.5 w-3.5" aria-hidden /> {t("ways.vod.tag")}
            </div>
            <h3 className="mt-4 text-2xl font-bold text-foreground">{t("ways.vod.title")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("ways.vod.body")}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
              {[t("ways.vod.b1"), t("ways.vod.b2"), t("ways.vod.b3")].map((li) => (
                <li key={li} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden /> {li}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to={EDTECH.routes.courses} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">{t("ways.vod.cta1")} <ArrowRight className="h-4 w-4" /></Link>
              <Link to={EDTECH.routes.myLearning} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-card/80">{t("ways.vod.cta2")}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Onboarding() {
  const { t } = useEdtechLang();
  const steps = [
    { n: "01", kicker: t("ob.s1.kicker"), title: t("ob.s1.title"), body: t("ob.s1.body"), cta: { label: t("ob.s1.cta"), to: EDTECH.routes.courses }, icon: PlayCircle },
    { n: "02", kicker: t("ob.s2.kicker"), title: t("ob.s2.title"), body: t("ob.s2.body"), cta: { label: t("ob.s2.cta"), to: EDTECH.routes.live }, icon: MonitorPlay },
    { n: "03", kicker: t("ob.s3.kicker"), title: t("ob.s3.title"), body: t("ob.s3.body"), cta: { label: t("ob.s3.cta"), to: "/auth?role=teacher" }, icon: Wallet },
  ];
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">{t("ob.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("ob.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("ob.body")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ n, kicker, title, body, cta, icon: Icon }) => (
            <div key={n} className="relative rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <Icon className="h-3.5 w-3.5" aria-hidden /> {kicker}
                </span>
                <span className="text-2xl font-black text-muted-foreground/30">{n}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <Link to={cta.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">{t("ob.footnote")}</p>
      </div>
    </section>
  );
}

function FeaturedCourses({ featured }: { featured: typeof EDTECH_COURSES }) {
  const { t } = useEdtechLang();
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">{t("feat.eyebrow")}</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("feat.title")}</h2>
          </div>
          <Link to={EDTECH.routes.courses} className="hidden text-sm font-semibold text-primary hover:underline sm:inline">
            {t("feat.seeAll")}
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </div>
    </section>
  );
}

function PickPath() {
  const { t } = useEdtechLang();
  const paths = [
    { tag: t("path.learners.tag"), title: t("path.learners.title"), body: t("path.learners.body"), cta: { label: t("path.learners.cta"), to: EDTECH.routes.courses }, icon: GraduationCap },
    { tag: t("path.teachers.tag"), title: t("path.teachers.title"), body: t("path.teachers.body"), cta: { label: t("path.teachers.cta"), to: EDTECH.routes.live }, icon: Presentation },
    { tag: t("path.admin.tag"), title: t("path.admin.title"), body: t("path.admin.body"), cta: { label: t("path.admin.cta"), to: "/auth?role=teacher" }, icon: Wallet },
  ];
  return (
    <section className="border-b border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">{t("path.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("path.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("path.body")}</p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-4xl gap-3 grid-cols-2 sm:grid-cols-4">
          {[
            { k: "9+", v: t("path.stat1") },
            { k: "2", v: t("path.stat2") },
            { k: "0৳", v: t("path.stat3") },
            { k: "24/7", v: t("path.stat4") },
          ].map(({ k, v }) => (
            <li key={v} className="rounded-2xl border border-border bg-card p-4 text-center edtech-shadow-panel">
              <div className="text-2xl font-black edtech-text-gradient">{k}</div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{v}</div>
            </li>
          ))}
        </ul>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {paths.map(({ tag, title, body, cta, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-primary">{tag}</p>
              <h3 className="mt-1 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <Link to={cta.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useEdtechLang();
  const steps = [
    { step: t("how.s1"), title: t("how.s1.t"), body: t("how.s1.b") },
    { step: t("how.s2"), title: t("how.s2.t"), body: t("how.s2.b") },
    { step: t("how.s3"), title: t("how.s3.t"), body: t("how.s3.b") },
    { step: t("how.s4"), title: t("how.s4.t"), body: t("how.s4.b") },
  ];
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("how.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("how.body")}</p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ step, title, body }, i) => (
            <li key={step + i} className="relative rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] edtech-text-gold">{step}</div>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">{i + 1}</span>
                <h3 className="text-base font-bold text-foreground">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  const { t } = useEdtechLang();
  const FEATURES = [
    { icon: ShoppingBag, title: t("feats.mp.t"), body: t("feats.mp.b"), cta: { label: t("feats.mp.cta"), to: "/auth?role=student" } },
    { icon: Video, title: t("feats.vod.t"), body: t("feats.vod.b"), cta: { label: t("feats.vod.cta"), to: EDTECH.routes.courses } },
    { icon: MonitorPlay, title: t("feats.studio.t"), body: t("feats.studio.b"), cta: { label: t("feats.studio.cta"), to: EDTECH.routes.live } },
    { icon: Mic, title: "Voice Notes → Study Sheet", body: "Record any lecture or note. Get an AI transcript, summary, flashcards and quiz — private to your account.", cta: { label: "Open Voice Notes", to: EDTECH.routes.voiceNotes } },
    { icon: Volume2, title: "Voice Studio (Teachers)", body: "Save reference voice profiles with tone controls so future AI lessons keep your sound.", cta: { label: "Open Voice Studio", to: EDTECH.routes.voiceStudio } },
    { icon: CreditCard, title: t("feats.pay.t"), body: t("feats.pay.b"), cta: { label: t("feats.pay.cta"), to: EDTECH.routes.pricing } },
    { icon: LayoutDashboard, title: t("feats.admin.t"), body: t("feats.admin.b"), cta: { label: t("feats.admin.cta"), to: EDTECH.routes.adminLive } },
    { icon: Bot, title: t("feats.ai.t"), body: t("feats.ai.b"), cta: { label: t("feats.ai.cta"), to: EDTECH.routes.live } },
  ];
  return (
    <section className="border-b border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("feats.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("feats.body")}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, cta }) => (
            <div key={title} className="flex flex-col rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <Link to={cta.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SUBJECTS = [
  "AI & Data", "Hospitality", "Tourism", "Hotel Management",
  "Business English", "Culinary Arts", "Front Office", "Spoken Bangla",
  "Customer Service", "Web Development", "Public Speaking", "Excel",
];

function Subjects() {
  const { t } = useEdtechLang();
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">{t("subj.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("subj.title")}</h2>
        </div>
        <ul className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-2.5">
          {SUBJECTS.map((s) => (
            <li key={s} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition">
              <Tag className="h-3.5 w-3.5 text-primary" aria-hidden /> {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useEdtechLang();
  const items = [
    { quote: t("tst.q1"), who: "Rashed H.", role: t("tst.r1") },
    { quote: t("tst.q2"), who: "Nusrat A.", role: t("tst.r2") },
    { quote: t("tst.q3"), who: "Tanvir I.", role: t("tst.r3") },
  ];
  return (
    <section className="border-b border-border bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("tst.title")}</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map(({ quote, who, role }) => (
            <figure key={who} className="rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
              <div className="flex gap-0.5 edtech-text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" aria-hidden />)}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">"{quote}"</blockquote>
              <figcaption className="mt-4 text-xs">
                <span className="font-bold text-foreground">{who}</span>
                <span className="text-muted-foreground"> · {role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useEdtechLang();
  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-10">
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">{t("faq.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("faq.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("faq.body")}</p>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-border bg-card p-5 edtech-shadow-panel">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                {q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useEdtechLang();
  return (
    <section className="bg-card/40 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border edtech-border-gold edtech-bg-gold-soft px-3.5 py-1.5 text-[11px] font-medium edtech-text-gold">
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("cta.badge")}
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">{t("cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{t("cta.body")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/auth?role=student" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
            {t("cta.primary")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={EDTECH.routes.courses} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-card/80">
            <Search className="h-4 w-4" /> {t("cta.secondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EdtechHome;