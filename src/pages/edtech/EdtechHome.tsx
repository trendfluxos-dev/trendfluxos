import { Link } from "react-router-dom";
import {
  ArrowRight, GraduationCap, Sparkles, CheckCircle2, Radio, ShieldCheck,
  Languages, Trophy, ShoppingBag, Video, MonitorPlay, CreditCard,
  LayoutDashboard, Bot, PlayCircle, Users, Search, Tag, Star, ChevronDown,
  Presentation, Wallet,
} from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import CourseCard from "@/components/edtech/CourseCard";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: "Verified teachers" },
  { icon: Languages, label: "বাংলা + English" },
  { icon: Radio, label: "Native live studio" },
  { icon: Trophy, label: "Certificates on completion" },
];

const ONBOARDING_STEPS = [
  {
    n: "01",
    kicker: "Watch · দেখুন",
    title: "VOD course দেখুন",
    body:
      "Curated video course browse করুন, প্রথম lessons free preview দেখুন, তারপর time-bound access-এ পুরো course unlock করুন।",
    cta: { label: "Browse courses", to: EDTECH.routes.courses },
    icon: PlayCircle,
  },
  {
    n: "02",
    kicker: "Learn live · লাইভ ক্লাস",
    title: "Live Studio join করুন",
    body:
      "যা শিখতে চান post করে teacher offer accept করুন — অথবা এক share-link দিয়ে live class open করুন, students-এর signup লাগে না।",
    cta: { label: "Open dashboard", to: EDTECH.routes.live },
    icon: MonitorPlay,
  },
  {
    n: "03",
    kicker: "Earn · উপার্জন",
    title: "Seller / Teacher হয়ে যান",
    body:
      "Video course publish করুন, marketplace-এ offer পাঠান, এবং admin-approved payout-এর মাধ্যমে instantly পেমেন্ট নিন।",
    cta: { label: "Start teaching", to: "/auth" },
    icon: Wallet,
  },
];

const PATHS = [
  {
    tag: "For learners",
    title: "Watch VOD courses",
    body:
      "Buy expert-made video courses with time-bound access. Free preview lessons, in-depth modules, and learn at your own pace.",
    cta: { label: "Browse courses", to: EDTECH.routes.courses },
    icon: GraduationCap,
  },
  {
    tag: "For teachers",
    title: "Go to Live Studio",
    body:
      "Upload PDFs, slides, video. Present to students in real time with one share-link. Private AI assistant on the side.",
    cta: { label: "Open studio", to: EDTECH.routes.live },
    icon: Presentation,
  },
  {
    tag: "For instructors & admins",
    title: "Sell courses & earn",
    body:
      "Publish video courses, accept marketplace offers, and get paid. Admin tools to approve teachers, coupons, and payouts.",
    cta: { label: "Start teaching", to: "/auth" },
    icon: Wallet,
  },
];

const HOW_STEPS = [
  { step: "STEP 1", title: "Post a request", body: "Tell us the subject, budget, and schedule. Or browse VOD courses directly." },
  { step: "STEP 2", title: "Teachers bid", body: "Verified teachers send live offers — pick the best price, rating, and time." },
  { step: "STEP 3", title: "Learn live or VOD", body: "Join the Live Studio with one link, or stream pre-recorded lessons." },
  { step: "STEP 4", title: "Progress & payout", body: "Track progress; teachers earn instantly via admin-approved payouts." },
];

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Marketplace",
    body: "Tell us what you want to learn. Verified teachers send you offers in minutes — pick the best price and schedule, then start learning.",
    bullets: ["Post in 30 seconds", "Real-time offers", "Pick & enroll"],
    cta: { label: "Post a request", to: "/auth" },
  },
  {
    icon: Video,
    title: "VOD Courses",
    body: "Watch expert video courses with free preview lessons. Unlock the full course with time-bound access — learn anytime, on any device.",
    bullets: ["Free previews", "Lifetime or rental", "Watch on mobile"],
    cta: { label: "Browse VOD", to: EDTECH.routes.courses },
  },
  {
    icon: MonitorPlay,
    title: "Live Studio",
    body: "Upload slides, PDFs, and videos — switch the live screen with one tap. Students join with a single link, no signup needed.",
    bullets: ["One-tap switch", "Share-link join", "Built-in chat"],
    cta: { label: "Open studio", to: EDTECH.routes.live },
  },
  {
    icon: CreditCard,
    title: "Payments",
    body: "Pay for courses securely inside কর্মশিক্ষা. Teachers get paid automatically via admin-approved payouts — clear, fast, no spreadsheets.",
    bullets: ["Secure checkout", "Coupons & discounts", "Auto payouts"],
    cta: { label: "See pricing", to: EDTECH.routes.pricing },
  },
  {
    icon: LayoutDashboard,
    title: "Admin Console",
    body: "One dashboard to approve teachers, publish courses, issue coupons, and release payouts — full control of your platform.",
    bullets: ["Approve teachers", "Manage courses", "Release payouts"],
    cta: { label: "Open admin", to: EDTECH.routes.adminLive },
  },
  {
    icon: Bot,
    title: "AI Assistant",
    body: "A teacher-only side panel that drafts explanations, examples, and quizzes on the spot. Students never see your prompts.",
    bullets: ["Private to teacher", "Bangla + English", "Quiz generator"],
    cta: { label: "Try in studio", to: EDTECH.routes.live },
  },
];

const SUBJECTS = [
  "AI & Data", "Hospitality", "Tourism", "Hotel Management",
  "Business English", "Culinary Arts", "Front Office", "Spoken Bangla",
  "Customer Service", "Web Development", "Public Speaking", "Excel",
];

const TESTIMONIALS = [
  { quote: "Live Studio দিয়ে ৫০+ student-কে একসাথে পড়াই — share link দিয়ে সব হয়।", who: "Rashed H.", role: "Hotel Trainer" },
  { quote: "Marketplace-এ post করার ২০ মিনিটে ৩টা teacher offer পাঠালো। দারুণ system।", who: "Nusrat A.", role: "AI Student" },
  { quote: "VOD course publish করে monthly stable income আসছে। Admin payout fast।", who: "Tanvir I.", role: "Course Creator" },
];

const FAQS = [
  { q: "How do live classes work?", a: "Teacher opens the Live Studio, picks the window/tab to share, and gets a join link. Students click the link — no signup needed — and watch the live stream with built-in chat." },
  { q: "How does on-demand learning work?", a: "Browse the VOD catalogue, preview the first lessons free, then unlock the full course with 3-month time-bound access. Learn at your own pace on any device." },
  { q: "How do payments and access work?", a: "Checkout runs securely inside কর্মশিক্ষা. Teachers get paid through admin-approved payouts. Course access is time-bound and tied to your account." },
  { q: "Do students need to sign up?", a: "For VOD purchases yes. For a one-off live class, no — the share-link is enough to join. Sign in only if you want progress tracking and certificates." },
  { q: "বাংলা না English — কোনটায় available?", a: "দুটোতেই। Courses, live captions, এবং AI assistant — সবই বাংলা + English support করে।" },
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

            {/* Dual primary CTAs — Student / Teacher */}
            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:mt-10 sm:grid-cols-2">
              <Link to="/auth?role=student" className="group">
                <div className="flex h-full items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 text-left edtech-shadow-panel transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:edtech-shadow-stage sm:p-5">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <GraduationCap className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">For students</div>
                    <div className="text-base font-bold text-foreground sm:text-lg">Create student account</div>
                    <div className="text-xs text-muted-foreground">Join live class · 3-month recording access</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                </div>
              </Link>
              <Link to="/auth?role=teacher" className="group">
                <div className="flex h-full items-center gap-3 rounded-2xl border-2 edtech-border-gold edtech-bg-gold-soft p-4 text-left edtech-shadow-panel transition hover:-translate-y-0.5 hover:edtech-shadow-stage sm:p-5">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl edtech-bg-gold edtech-text-gold shadow-md">
                    <Presentation className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider edtech-text-gold">For teachers</div>
                    <div className="text-base font-bold text-foreground sm:text-lg">Create teacher account</div>
                    <div className="text-xs text-muted-foreground">Live studio · publish courses · earn</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 edtech-text-gold transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
              {" · Google দিয়ে ৫ সেকেন্ডে · Free to start"}
            </p>

            {/* Secondary nav row */}
            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
              <Link to={EDTECH.routes.courses} className="rounded-full border border-border bg-card/60 px-3 py-1.5 font-medium text-foreground hover:bg-card">Browse courses</Link>
              <Link to={EDTECH.routes.live} className="rounded-full border border-border bg-card/60 px-3 py-1.5 font-medium text-foreground hover:bg-card">Browse teachers</Link>
              <Link to={EDTECH.routes.live} className="rounded-full border border-border bg-card/60 px-3 py-1.5 font-medium text-foreground hover:bg-card">Open Studio</Link>
            </div>

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

      {/* Two ways to learn */}
      <section className="border-b border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">Two ways to learn</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Live classes & On-demand learning</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Real-time-এ একজন expert-এর সাথে শিখুন, অথবা নিজের সময়ে recorded course দেখুন। যেটা suit করে সেটা বেছে নিন।
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border-2 edtech-border-gold edtech-bg-gold-soft p-6 sm:p-8 edtech-shadow-panel">
              <div className="inline-flex items-center gap-2 rounded-full edtech-bg-gold edtech-text-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Radio className="h-3.5 w-3.5" aria-hidden /> Live
              </div>
              <h3 className="mt-4 text-2xl font-bold text-foreground">Live classes</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Verified expert-এর সাথে real-time session — share-link দিয়ে এক click-এ join, whiteboard + slides + AI assistant সহ।
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
                {["Real-time whiteboard + slides", "Share-link দিয়ে instant join — কোনো signup না", "AI assistant teacher-side, polished student-view"].map(li => (
                  <li key={li} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 edtech-text-gold mt-0.5" aria-hidden /> {li}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={EDTECH.routes.live} className="inline-flex items-center gap-1.5 rounded-full edtech-bg-gold edtech-text-gold px-4 py-2 text-sm font-semibold hover:opacity-90">Find a live teacher <ArrowRight className="h-4 w-4" /></Link>
                <Link to={EDTECH.routes.live} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-card/80">Start a live class</Link>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-primary/40 bg-primary/5 p-6 sm:p-8 edtech-shadow-panel">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Video className="h-3.5 w-3.5" aria-hidden /> Anytime
              </div>
              <h3 className="mt-4 text-2xl font-bold text-foreground">On-demand learning</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pre-recorded video course — যেকোনো সময়, যেকোনো device-এ দেখুন। একবার buy, ৩ মাস access।
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground/85">
                {["Self-paced — pause, replay, যত বার চান", "Native video hosting — fast, secure", "৳৫০০ থেকে শুরু — ৩ মাস access সহ"].map(li => (
                  <li key={li} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden /> {li}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={EDTECH.routes.courses} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">Browse VOD courses <ArrowRight className="h-4 w-4" /></Link>
                <Link to={EDTECH.routes.myLearning} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-card/80">My Learning</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick onboarding */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">নতুন? Start in 3 steps</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">আপনার Quick Onboarding</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              যেটা আগে করতে চান সেটা select করুন — প্রতিটা step মাত্র এক মিনিটে।
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ONBOARDING_STEPS.map(({ n, kicker, title, body, cta, icon: Icon }) => (
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
          <p className="mt-8 text-center text-xs text-muted-foreground">
            No credit card · Google sign-in ৫ সেকেন্ডে · Preview-তে Free
          </p>
        </div>
      </section>

      {/* Featured courses (kept) */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">Featured cohorts</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Start with what's live now</h2>
            </div>
            <Link to={EDTECH.routes.courses} className="hidden text-sm font-semibold text-primary hover:underline sm:inline">
              See all courses →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
        </div>
      </section>

      {/* Pick your path */}
      <section className="border-b border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">আপনার Path বেছে নিন</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">কর্মশিক্ষা ব্যবহারের ৩টি উপায়</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Learner, Educator, Institution — সবার জন্য, এক tap-এ start।
            </p>
          </div>

          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-4">
            {[
              { k: "9+", v: "Platform features" },
              { k: "2", v: "Languages (বাং + Eng)" },
              { k: "0৳", v: "Student signup cost" },
              { k: "24/7", v: "Live studio uptime" },
            ].map(({ k, v }) => (
              <li key={v} className="rounded-2xl border border-border bg-card p-4 text-center edtech-shadow-panel">
                <div className="text-2xl font-black edtech-text-gradient">{k}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{v}</div>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PATHS.map(({ tag, title, body, cta, icon: Icon }) => (
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

      {/* How it works */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">কর্মশিক্ষা কীভাবে কাজ করে</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Uber-এর মতো — কিন্তু শেখার জন্য। ৪ ধাপে platform-এর ভেতরেই সব managed।
            </p>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(({ step, title, body }, i) => (
              <li key={step} className="relative rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
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

      {/* Features grid */}
      <section className="border-b border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">প্রতিটি Feature, সহজভাবে</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              ছয়টি tool একসাথে কাজ করে — যাতে আপনি শেখা বা পড়ানোতে focus করতে পারেন, setup-এ না।
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body, bullets, cta }) => (
              <div key={title} className="flex flex-col rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <ul className="mt-4 space-y-1.5 text-xs text-foreground/85">
                  {bullets.map((b) => (
                    <li key={b} className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden /> {b}</li>
                  ))}
                </ul>
                <Link to={cta.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated subjects */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">Curated subjects</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built for Skill + Hospitality niches</h2>
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

      {/* Testimonials */}
      <section className="border-b border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Learners ও Teachers-দের পছন্দ</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map(({ quote, who, role }) => (
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

      {/* FAQ */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Live classes, on-demand learning, এবং payments — সব কিছু একটাই জায়গায়।
            </p>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map(({ q, a }) => (
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

      {/* Final CTA */}
      <section className="bg-card/40 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border edtech-border-gold edtech-bg-gold-soft px-3.5 py-1.5 text-[11px] font-medium edtech-text-gold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Free during preview
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            শিখতে বা পড়াতে Ready?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            কর্মশিক্ষা-এ free join করুন — request post করুন, course দেখুন, বা ১০ সেকেন্ডে live studio open করুন।
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={EDTECH.routes.courses} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-card/80">
              <Search className="h-4 w-4" /> Explore marketplace
            </Link>
          </div>
        </div>
      </section>

    </EdtechShell>
  );
};

export default EdtechHome;