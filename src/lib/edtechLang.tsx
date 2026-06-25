import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type EdtechLang = "bn" | "en";

const STORAGE_KEY = "edtech.lang";

interface Ctx {
  lang: EdtechLang;
  setLang: (l: EdtechLang) => void;
  toggle: () => void;
  t: <K extends keyof typeof DICT>(key: K) => string;
}

const LangCtx = createContext<Ctx | null>(null);

/** All landing copy lives here. Keys are stable; values come in bn + en. */
export const DICT = {
  // header
  "header.home": { bn: "হোম", en: "Home" },
  "header.courses": { bn: "কোর্স", en: "Courses" },
  "header.live": { bn: "লাইভ", en: "Live" },
  "header.myLearning": { bn: "আমার লার্নিং", en: "My Learning" },
  "header.pricing": { bn: "প্রাইসিং", en: "Pricing" },
  "header.langToggle": { bn: "English-এ পড়ুন", en: "বাংলায় পড়ুন" },

  // hero
  "hero.badge": { bn: "IKT international standard · AI-চালিত শেখা", en: "IKT international standard · AI-powered learning" },
  "hero.title.a": { bn: "শেখার জন্য একটাই", en: "The" },
  "hero.title.brand": { bn: "EdTech", en: "EdTech" },
  "hero.title.b": { bn: "প্ল্যাটফর্ম।", en: "of Learning." },
  "hero.title.c": { bn: "লাইভ ক্লাস, যখন খুশি।", en: "Live classes, on demand." },
  "hero.subtitle": {
    bn: "শেখার দুটি উপায়, একটি প্ল্যাটফর্ম। ভেরিফায়েড এক্সপার্টের লাইভ ক্লাসে যোগ দিন, অথবা যেকোনো সময় on-demand ভিডিও কোর্স দেখে শিখুন — বাংলা + English-এ।",
    en: "Two ways to learn, one platform. Join a live class with a verified expert, or learn anytime from on-demand video courses — in Bangla + English.",
  },
  "hero.cta.student.kicker": { bn: "শিক্ষার্থীদের জন্য", en: "For students" },
  "hero.cta.student.title": { bn: "Student account তৈরি করুন", en: "Create student account" },
  "hero.cta.student.sub": { bn: "লাইভ ক্লাস · ৩ মাসের রেকর্ডিং access", en: "Join live class · 3-month recording access" },
  "hero.cta.teacher.kicker": { bn: "শিক্ষকদের জন্য", en: "For teachers" },
  "hero.cta.teacher.title": { bn: "Teacher account তৈরি করুন", en: "Create teacher account" },
  "hero.cta.teacher.sub": { bn: "লাইভ স্টুডিও · কোর্স পাবলিশ · উপার্জন", en: "Live studio · publish courses · earn" },
  "hero.signinHint.a": { bn: "আগে থেকেই account আছে?", en: "Already have an account?" },
  "hero.signinHint.b": { bn: "Sign in", en: "Sign in" },
  "hero.signinHint.c": { bn: "Google দিয়ে ৫ সেকেন্ডে · Free to start", en: "5 seconds with Google · Free to start" },
  "hero.nav.courses": { bn: "Browse courses", en: "Browse courses" },
  "hero.nav.teachers": { bn: "Browse teachers", en: "Browse teachers" },
  "hero.nav.studio": { bn: "Open Studio", en: "Open Studio" },
  "hero.chip.verified": { bn: "ভেরিফায়েড শিক্ষক", en: "Verified teachers" },
  "hero.chip.lang": { bn: "বাংলা + English", en: "Bangla + English" },
  "hero.chip.studio": { bn: "নেটিভ লাইভ স্টুডিও", en: "Native live studio" },
  "hero.chip.cert": { bn: "সার্টিফিকেট দেওয়া হয়", en: "Certificates on completion" },

  // two-ways
  "ways.eyebrow": { bn: "শেখার দুটি উপায়", en: "Two ways to learn" },
  "ways.title": { bn: "লাইভ ক্লাস ও অন-ডিমান্ড লার্নিং", en: "Live classes & On-demand learning" },
  "ways.body": {
    bn: "Real-time-এ একজন expert-এর সাথে শিখুন, অথবা নিজের সময়ে recorded course দেখুন। যেটা suit করে সেটা বেছে নিন।",
    en: "Learn in real time with an expert, or watch recorded courses on your own schedule. Pick what suits you.",
  },
  "ways.live.tag": { bn: "লাইভ", en: "Live" },
  "ways.live.title": { bn: "লাইভ ক্লাস", en: "Live classes" },
  "ways.live.body": {
    bn: "ভেরিফায়েড expert-এর সাথে real-time session — share-link দিয়ে এক click-এ join, whiteboard + slides + AI assistant সহ।",
    en: "Real-time sessions with a verified expert — join in one click via share-link, with whiteboard, slides, and AI assistant.",
  },
  "ways.live.b1": { bn: "Real-time whiteboard + slides", en: "Real-time whiteboard + slides" },
  "ways.live.b2": { bn: "Share-link দিয়ে instant join — কোনো signup না", en: "Share-link instant join — no signup needed" },
  "ways.live.b3": { bn: "Teacher-side AI assistant, polished student view", en: "Teacher-side AI assistant, polished student view" },
  "ways.live.cta1": { bn: "লাইভ teacher খুঁজুন", en: "Find a live teacher" },
  "ways.live.cta2": { bn: "লাইভ ক্লাস শুরু করুন", en: "Start a live class" },
  "ways.vod.tag": { bn: "যেকোনো সময়", en: "Anytime" },
  "ways.vod.title": { bn: "অন-ডিমান্ড লার্নিং", en: "On-demand learning" },
  "ways.vod.body": {
    bn: "Pre-recorded ভিডিও কোর্স — যেকোনো সময়, যেকোনো device-এ দেখুন। একবার কিনুন, ৩ মাস access।",
    en: "Pre-recorded video courses — watch anytime, on any device. Buy once, 3 months of access.",
  },
  "ways.vod.b1": { bn: "Self-paced — pause, replay, যত বার চান", en: "Self-paced — pause and replay as much as you want" },
  "ways.vod.b2": { bn: "Native video hosting — fast, secure", en: "Native video hosting — fast and secure" },
  "ways.vod.b3": { bn: "৳৫০০ থেকে শুরু — ৩ মাস access সহ", en: "From ৳500 — includes 3-month access" },
  "ways.vod.cta1": { bn: "VOD courses দেখুন", en: "Browse VOD courses" },
  "ways.vod.cta2": { bn: "My Learning", en: "My Learning" },

  // onboarding
  "ob.eyebrow": { bn: "নতুন? ৩ ধাপে শুরু", en: "New? Start in 3 steps" },
  "ob.title": { bn: "আপনার Quick Onboarding", en: "Your Quick Onboarding" },
  "ob.body": {
    bn: "যেটা আগে করতে চান সেটা select করুন — প্রতিটা step মাত্র এক মিনিটে।",
    en: "Pick what you want to do first — each step takes about a minute.",
  },
  "ob.s1.kicker": { bn: "দেখুন · Watch", en: "Watch" },
  "ob.s1.title": { bn: "VOD course দেখুন", en: "Watch a VOD course" },
  "ob.s1.body": {
    bn: "Curated video course browse করুন, প্রথম lesson free preview দেখুন, তারপর time-bound access-এ পুরো course unlock করুন।",
    en: "Browse curated video courses, watch the first lessons free, then unlock the full course with time-bound access.",
  },
  "ob.s1.cta": { bn: "Browse courses", en: "Browse courses" },
  "ob.s2.kicker": { bn: "লাইভ ক্লাস · Learn live", en: "Learn live" },
  "ob.s2.title": { bn: "Live Studio join করুন", en: "Join the Live Studio" },
  "ob.s2.body": {
    bn: "যা শিখতে চান post করে teacher offer accept করুন — অথবা এক share-link দিয়ে live class open করুন, students-এর signup লাগে না।",
    en: "Post what you want to learn and accept a teacher's offer — or open a live class with one share-link, no student signup needed.",
  },
  "ob.s2.cta": { bn: "Open dashboard", en: "Open dashboard" },
  "ob.s3.kicker": { bn: "উপার্জন · Earn", en: "Earn" },
  "ob.s3.title": { bn: "Seller / Teacher হয়ে যান", en: "Become a seller / teacher" },
  "ob.s3.body": {
    bn: "Video course publish করুন, marketplace-এ offer পাঠান, এবং admin-approved payout-এর মাধ্যমে দ্রুত পেমেন্ট নিন।",
    en: "Publish video courses, send offers in the marketplace, and get paid fast via admin-approved payouts.",
  },
  "ob.s3.cta": { bn: "Start teaching", en: "Start teaching" },
  "ob.footnote": {
    bn: "No credit card · Google sign-in ৫ সেকেন্ডে · Preview-তে Free",
    en: "No credit card · Google sign-in in 5 seconds · Free during preview",
  },

  // featured
  "feat.eyebrow": { bn: "Featured cohorts", en: "Featured cohorts" },
  "feat.title": { bn: "যা এখন লাইভ, সেটা দিয়ে শুরু করুন", en: "Start with what's live now" },
  "feat.seeAll": { bn: "সব courses দেখুন →", en: "See all courses →" },

  // path
  "path.eyebrow": { bn: "আপনার Path বেছে নিন", en: "Pick your path" },
  "path.title": { bn: "TrendFlux EdTech ব্যবহারের ৩টি উপায়", en: "3 ways to use TrendFlux EdTech" },
  "path.body": {
    bn: "Learner, Educator, Institution — সবার জন্য, এক tap-এ start।",
    en: "For learners, educators, and institutions — start in one tap.",
  },
  "path.stat1": { bn: "Platform features", en: "Platform features" },
  "path.stat2": { bn: "ভাষা (বাং + Eng)", en: "Languages (Bn + En)" },
  "path.stat3": { bn: "Student signup খরচ", en: "Student signup cost" },
  "path.stat4": { bn: "Live studio uptime", en: "Live studio uptime" },
  "path.learners.tag": { bn: "শিক্ষার্থীদের জন্য", en: "For learners" },
  "path.learners.title": { bn: "VOD courses দেখুন", en: "Watch VOD courses" },
  "path.learners.body": {
    bn: "Expert-নির্মিত video courses time-bound access সহ কিনুন। Free preview lessons, deep modules, নিজের পেসে শিখুন।",
    en: "Buy expert-made video courses with time-bound access. Free preview lessons, deep modules, and learn at your own pace.",
  },
  "path.learners.cta": { bn: "Browse courses", en: "Browse courses" },
  "path.teachers.tag": { bn: "শিক্ষকদের জন্য", en: "For teachers" },
  "path.teachers.title": { bn: "Live Studio-তে যান", en: "Go to Live Studio" },
  "path.teachers.body": {
    bn: "PDF, slides, video upload করুন। এক share-link-এ real-time present করুন। পাশে private AI assistant।",
    en: "Upload PDFs, slides, video. Present in real time with one share-link. Private AI assistant on the side.",
  },
  "path.teachers.cta": { bn: "Open studio", en: "Open studio" },
  "path.admin.tag": { bn: "Instructors ও admins", en: "For instructors & admins" },
  "path.admin.title": { bn: "Courses বিক্রি করে উপার্জন করুন", en: "Sell courses & earn" },
  "path.admin.body": {
    bn: "Video courses publish করুন, marketplace offer accept করুন, payment নিন। Admin tools-এ teacher approve, coupon, payout সব।",
    en: "Publish video courses, accept marketplace offers, and get paid. Admin tools to approve teachers, coupons, and payouts.",
  },
  "path.admin.cta": { bn: "Start teaching", en: "Start teaching" },

  // how
  "how.title": { bn: "TrendFlux EdTech কীভাবে কাজ করে", en: "How TrendFlux EdTech works" },
  "how.body": {
    bn: "Uber-এর মতো — কিন্তু শেখার জন্য। ৪ ধাপে platform-এর ভেতরেই সব managed।",
    en: "Like Uber — but for learning. 4 steps, all managed inside the platform.",
  },
  "how.s1": { bn: "STEP 1", en: "STEP 1" },
  "how.s1.t": { bn: "Request post করুন", en: "Post a request" },
  "how.s1.b": { bn: "Subject, budget, schedule বলুন। অথবা সরাসরি VOD courses browse করুন।", en: "Tell us the subject, budget, and schedule. Or browse VOD courses directly." },
  "how.s2": { bn: "STEP 2", en: "STEP 2" },
  "how.s2.t": { bn: "Teachers bid করেন", en: "Teachers bid" },
  "how.s2.b": { bn: "Verified teachers live offer পাঠান — best price, rating, time বেছে নিন।", en: "Verified teachers send live offers — pick the best price, rating, and time." },
  "how.s3": { bn: "STEP 3", en: "STEP 3" },
  "how.s3.t": { bn: "লাইভ বা VOD-তে শিখুন", en: "Learn live or VOD" },
  "how.s3.b": { bn: "এক link-এ Live Studio join করুন, অথবা pre-recorded lessons stream করুন।", en: "Join the Live Studio with one link, or stream pre-recorded lessons." },
  "how.s4": { bn: "STEP 4", en: "STEP 4" },
  "how.s4.t": { bn: "Progress ও payout", en: "Progress & payout" },
  "how.s4.b": { bn: "Progress track করুন; teachers admin-approved payout-এ দ্রুত earn করেন।", en: "Track progress; teachers earn instantly via admin-approved payouts." },

  // features
  "feats.title": { bn: "প্রতিটি Feature, সহজভাবে", en: "Every feature, simply" },
  "feats.body": {
    bn: "ছয়টি tool একসাথে কাজ করে — যাতে আপনি শেখা বা পড়ানোতে focus করতে পারেন, setup-এ না।",
    en: "Six tools work together — so you can focus on learning or teaching, not on setup.",
  },
  "feats.mp.t": { bn: "Marketplace", en: "Marketplace" },
  "feats.mp.b": { bn: "যা শিখতে চান বলুন। Verified teachers কিছুক্ষণের মধ্যেই offer পাঠাবেন — best price ও schedule বেছে নিন।", en: "Tell us what you want to learn. Verified teachers send offers in minutes — pick the best price and schedule." },
  "feats.mp.cta": { bn: "Post a request", en: "Post a request" },
  "feats.vod.t": { bn: "VOD Courses", en: "VOD Courses" },
  "feats.vod.b": { bn: "Expert video courses free preview সহ দেখুন। Time-bound access-এ পুরো course unlock করুন।", en: "Watch expert video courses with free previews. Unlock the full course with time-bound access." },
  "feats.vod.cta": { bn: "Browse VOD", en: "Browse VOD" },
  "feats.studio.t": { bn: "Live Studio", en: "Live Studio" },
  "feats.studio.b": { bn: "Slides, PDF, video upload করে এক tap-এ live screen switch করুন। Students এক link-এ join — signup-এর দরকার নেই।", en: "Upload slides, PDFs, video — switch live screen with one tap. Students join with a single link, no signup needed." },
  "feats.studio.cta": { bn: "Open studio", en: "Open studio" },
  "feats.pay.t": { bn: "Payments", en: "Payments" },
  "feats.pay.b": { bn: "Courses-এর জন্য নিরাপদে pay করুন। Teachers admin-approved payout-এ automatic earn করেন।", en: "Pay for courses securely. Teachers get paid automatically via admin-approved payouts." },
  "feats.pay.cta": { bn: "See pricing", en: "See pricing" },
  "feats.admin.t": { bn: "Admin Console", en: "Admin Console" },
  "feats.admin.b": { bn: "Teachers approve, courses publish, coupons issue, payouts release — একটাই dashboard।", en: "Approve teachers, publish courses, issue coupons, and release payouts — one dashboard." },
  "feats.admin.cta": { bn: "Open admin", en: "Open admin" },
  "feats.ai.t": { bn: "AI Assistant", en: "AI Assistant" },
  "feats.ai.b": { bn: "Teacher-only side panel — explanations, examples, quizzes draft করে। Students prompts দেখে না।", en: "A teacher-only side panel that drafts explanations, examples, and quizzes. Students never see your prompts." },
  "feats.ai.cta": { bn: "Try in studio", en: "Try in studio" },

  // subjects
  "subj.eyebrow": { bn: "Curated subjects", en: "Curated subjects" },
  "subj.title": { bn: "Skill + Hospitality niche-এর জন্য তৈরি", en: "Built for Skill + Hospitality niches" },

  // testimonials
  "tst.title": { bn: "Learners ও Teachers-দের পছন্দ", en: "Loved by learners & teachers" },
  "tst.q1": { bn: "Live Studio দিয়ে ৫০+ student-কে একসাথে পড়াই — share link দিয়ে সব হয়।", en: "I teach 50+ students together via Live Studio — everything works through the share link." },
  "tst.r1": { bn: "Hotel Trainer", en: "Hotel Trainer" },
  "tst.q2": { bn: "Marketplace-এ post করার ২০ মিনিটে ৩টা teacher offer পাঠালো। দারুণ system।", en: "Within 20 minutes of posting in the marketplace, 3 teachers sent offers. Great system." },
  "tst.r2": { bn: "AI Student", en: "AI Student" },
  "tst.q3": { bn: "VOD course publish করে monthly stable income আসছে। Admin payout fast।", en: "Publishing a VOD course gives me stable monthly income. Admin payouts are fast." },
  "tst.r3": { bn: "Course Creator", en: "Course Creator" },

  // faq
  "faq.eyebrow": { bn: "FAQ", en: "FAQ" },
  "faq.title": { bn: "Frequently asked questions", en: "Frequently asked questions" },
  "faq.body": { bn: "Live classes, on-demand learning, এবং payments — সব কিছু একটাই জায়গায়।", en: "Live classes, on-demand learning, and payments — all in one place." },
  "faq.q1": { bn: "Live classes কীভাবে কাজ করে?", en: "How do live classes work?" },
  "faq.a1": { bn: "Teacher Live Studio open করেন, যে window/tab share করবেন সেটা select করেন, এবং একটি join link পান। Students সেই link-এ click করেন — signup ছাড়াই — এবং built-in chat সহ live stream দেখেন।", en: "The teacher opens the Live Studio, picks the window/tab to share, and gets a join link. Students click the link — no signup needed — and watch the live stream with built-in chat." },
  "faq.q2": { bn: "On-demand learning কীভাবে কাজ করে?", en: "How does on-demand learning work?" },
  "faq.a2": { bn: "VOD catalogue browse করুন, প্রথম lessons free preview দেখুন, তারপর ৩ মাসের time-bound access-এ পুরো course unlock করুন।", en: "Browse the VOD catalogue, preview the first lessons free, then unlock the full course with 3-month time-bound access." },
  "faq.q3": { bn: "Payments ও access কীভাবে কাজ করে?", en: "How do payments and access work?" },
  "faq.a3": { bn: "Checkout প্ল্যাটফর্মের ভেতরেই নিরাপদে চলে। Teachers admin-approved payout পান। Course access time-bound এবং account-এর সাথে যুক্ত।", en: "Checkout runs securely inside the platform. Teachers are paid through admin-approved payouts. Course access is time-bound and tied to your account." },
  "faq.q4": { bn: "Students-এর কি signup করতে হয়?", en: "Do students need to sign up?" },
  "faq.a4": { bn: "VOD কেনার জন্য হ্যাঁ। এক-একটা live class-এর জন্য না — share-link-ই যথেষ্ট। Progress ও certificate চাইলে sign in করুন।", en: "For VOD purchases, yes. For one-off live classes, no — the share-link is enough. Sign in only if you want progress tracking and certificates." },
  "faq.q5": { bn: "বাংলা না English — কোনটায় available?", en: "Bangla or English — which is available?" },
  "faq.a5": { bn: "দুটোতেই। Courses, live captions, এবং AI assistant — সবই বাংলা + English support করে।", en: "Both. Courses, live captions, and the AI assistant — all support Bangla + English." },

  // final cta
  "cta.badge": { bn: "Preview-তে Free", en: "Free during preview" },
  "cta.title": { bn: "শিখতে বা পড়াতে Ready?", en: "Ready to learn or teach?" },
  "cta.body": { bn: "TrendFlux EdTech-এ free join করুন — request post করুন, course দেখুন, বা ১০ সেকেন্ডে live studio open করুন।", en: "Join TrendFlux EdTech free — post a request, browse courses, or open a live studio in 10 seconds." },
  "cta.primary": { bn: "Get started free", en: "Get started free" },
  "cta.secondary": { bn: "Explore marketplace", en: "Explore marketplace" },
} as const;

export function EdtechLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<EdtechLang>(() => {
    if (typeof window === "undefined") return "bn";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "bn";
  });

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.setAttribute("data-edtech-lang", lang);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: EdtechLang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((p) => (p === "bn" ? "en" : "bn")), []);
  const t = useCallback(<K extends keyof typeof DICT>(key: K) => DICT[key][lang], [lang]);

  const value = useMemo<Ctx>(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useEdtechLang(): Ctx {
  const ctx = useContext(LangCtx);
  if (!ctx) {
    // Safe fallback so components don't crash outside the provider.
    return {
      lang: "bn",
      setLang: () => {},
      toggle: () => {},
      t: ((k: keyof typeof DICT) => DICT[k].bn) as Ctx["t"],
    };
  }
  return ctx;
}