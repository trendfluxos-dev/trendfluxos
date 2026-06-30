import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  FileText,
  Shield,
  Newspaper,
  Scale,
  Download,
  ExternalLink,
  Phone,
  ClipboardList,
  Stethoscope,
  Users,
  Building2,
  PhoneCall,
} from "lucide-react";
import referencedFigure from "@/assets/justice/referenced-figure.webp";


// Justice sub-brand tokens — defined in src/index.css under
// `[data-brand="justice"]`. Page root sets `data-brand="justice"` so the
// CSS variables resolve correctly and don't leak into other routes.
const navy = "bg-[var(--justice-bg)]";
const navyCard = "bg-[var(--justice-card)]";
const navyBorder = "border-[var(--justice-border)]";
const accent = "text-[var(--justice-accent)]";
const accentBg = "bg-[var(--justice-accent)]";
const accentBorder = "border-[var(--justice-accent)]";
const accentFill = "bg-[var(--justice-accent-strong)]";

const timeline = [
  { date: "১৭ মার্চ ২০২২", title: "প্রথম ফোন যোগাযোগ ও অভিযুক্ত হুমকি", body: "অভিযোগ অনুযায়ী, ফোনকলের মাধ্যমে হুমকি পাওয়া যায়।" },
  { date: "১৮ মার্চ ২০২২", title: "পরিবারের সদস্যদের ওপর অভিযুক্ত হামলা", body: "অভিযোগে আবেদনকারীর পরিবারকে কেন্দ্র করে শারীরিক ঘটনার বিবরণ রয়েছে।" },
  { date: "পরবর্তী সময়", title: "অভিযোগ গ্রহণ না করার অভিযোগ", body: "আবেদনকারীর বক্তব্য — সে সময় স্থানীয় থানায় আনুষ্ঠানিক অভিযোগ দাখিল করা সম্ভব হয়নি।" },
  { date: "২৯ আগস্ট ২০২৪", title: "আনুষ্ঠানিক লিখিত অভিযোগ প্রস্তুত", body: "যথাযথ আইনি কর্তৃপক্ষের কাছে দাখিলের জন্য একটি লিখিত অভিযোগ প্রস্তুত করা হয়।" },
  { date: "বর্তমান", title: "চলমান নিরাপত্তা শঙ্কা ও তদন্তের আবেদন", body: "আবেদনকারী এখনো নিরপেক্ষ তদন্ত ও আইনগত সুরক্ষার আবেদন জানাচ্ছেন।" },
];

const evidenceItems = [
  { icon: FileText, label: "লিখিত অভিযোগ" },
  { icon: Newspaper, label: "সংবাদ প্রতিবেদন" },
  { icon: PhoneCall, label: "কল রেকর্ড প্রমাণ" },
  { icon: Stethoscope, label: "চিকিৎসা / আঘাতের নথি" },
  { icon: Users, label: "সাক্ষীর বিবৃতি" },
  { icon: Building2, label: "থানা ভিজিটের রেকর্ড" },
];

export default function JusticeAppeal() {
  return (
    <div data-brand="justice" lang="bn" className={`min-h-dvh ${navy} text-[var(--justice-ink)]`}>
      <Helmet>
        <title>Pabna Accountability Project — Public Interest Documentation</title>
        <meta name="description" content="A documentary archive of a written complaint and related media references, requesting lawful investigation and safety protection." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://trendflux.digital/justice-appeal" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Pabna Accountability Project — Public Interest Documentation" />
        <meta property="og:description" content="When fear replaces justice, documentation becomes necessary. A structured public-interest dossier." />
        <meta property="og:url" content="https://trendflux.digital/justice-appeal" />
        <meta property="og:image" content="https://trendflux.digital/og-justice-appeal.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pabna Accountability Project" />
        <meta name="twitter:description" content="When fear replaces justice, documentation becomes necessary." />
        <meta name="twitter:image" content="https://trendflux.digital/og-justice-appeal.jpg" />
        {/* Article schema: helps search engines understand this is a
            documentary public-interest archive (not a marketing page).
            Pairs with the page-level noindex above — schema describes
            the content for any crawler that does see it. */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Pabna Accountability Project — Public Interest Documentation",
          description: "A documentary archive of a written complaint and related media references, requesting lawful investigation and safety protection.",
          inLanguage: "bn",
          isAccessibleForFree: true,
          mainEntityOfPage: "https://trendflux.digital/justice-appeal",
          image: "https://trendflux.digital/og-justice-appeal.jpg",
          author: { "@type": "Organization", name: "TrendFlux Ecosystem", url: "https://trendflux.digital" },
          publisher: { "@type": "Organization", name: "TrendFlux Ecosystem", url: "https://trendflux.digital" },
        })}</script>
      </Helmet>


      {/* Masthead */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className={`inline-block h-2 w-2 rounded-full ${accentBg}`} />
            <span lang="en" className="font-serif text-sm tracking-[0.18em] text-white">PABNA ACCOUNTABILITY PROJECT</span>
          </Link>
          <span lang="en" className="hidden text-[10px] uppercase tracking-[0.25em] text-slate-300 sm:inline">Public Interest Documentation · Vol. 01</span>
        </div>
      </header>

      {/* Hero — newspaper documentary layout */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, hsl(220 50% 18% / 0.55), transparent 55%), radial-gradient(circle at 10% 80%, hsl(0 40% 18% / 0.35), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div lang="en" className={`inline-flex items-center gap-2 rounded-full border ${accentBorder}/40 ${accentBg}/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${accent}`}>
                <Shield className="h-3.5 w-3.5" /> Public Interest Dossier
              </div>
              <h1 lang="en" className="mt-6 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-[52px]">
                When fear replaces justice,<br className="hidden sm:block" />{" "}
                <span className="italic text-slate-300">documentation becomes necessary.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
                একটি লিখিত অভিযোগ ও সংশ্লিষ্ট সংবাদ রেফারেন্সের ভিত্তিতে নির্মিত আর্কাইভ —
                নিরপেক্ষ তদন্ত, আইনগত সুরক্ষা ও প্রাতিষ্ঠানিক জবাবদিহিতার আবেদন।
                <span lang="en"> A structured public-interest dossier — not a campaign of attack.</span>
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a lang="en" href="#timeline" className={`inline-flex items-center gap-2 rounded-md ${accentFill} px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90`}>
                  Read Timeline
                </a>
                <a lang="en" href="#complaint" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]">
                  View Documents
                </a>
              </div>
            </div>

            <figure className="relative">
              {/* Newspaper clipping wrapper */}
              <div className="relative rounded-sm bg-[#e9e3d3] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] sm:p-4"
                   style={{ transform: "rotate(-1.2deg)" }}>
                <div className="relative overflow-hidden border border-black/20 bg-black">
                  <div className="relative aspect-[4/5] w-full">
                    <img
                      src={referencedFigure}
                      alt="Person referenced in the written complaint and related media reports"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: "grayscale(1) contrast(1.05) brightness(0.92)" }}
                    />
                    {/* halftone-ish overlay */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-25 mix-blend-multiply"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1.2px)",
                        backgroundSize: "3px 3px",
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{ boxShadow: "inset 0 0 100px 10px rgba(0,0,0,0.55)" }}
                    />
                  </div>
                </div>
                {/* clipping caption strip */}
                <div className="mt-3 flex items-baseline justify-between px-1 text-black/80">
                  <span className="font-serif text-[11px] italic">Referenced in complaint and media reports</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-black/75">Archive · 01</span>
                </div>
              </div>
              <figcaption className="mt-5 max-w-sm text-[11px] leading-relaxed text-slate-300">
                Allegations mentioned on this page remain subject to lawful investigation and verification.
                No determination of guilt is made or implied.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>



      {/* Timeline */}
      <section id="timeline" className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <ClipboardList className="h-3.5 w-3.5" /> সেকশন ০১
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">ঘটনাপ্রবাহ (টাইমলাইন)</h2>
          <p className="mt-3 text-sm text-slate-400">সব এন্ট্রি অভিযোগ ও প্রতিবেদিত তথ্যের ভিত্তিতে। কোনোটিকেই প্রমাণিত সত্য হিসেবে গণ্য করা যাবে না।</p>

          <ol className="mt-10 space-y-0 border-l border-white/10 pl-6">
            {timeline.map((t, i) => (
              <li key={i} className="relative pb-8 last:pb-0">
                <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${accentBg} ring-4 ring-[var(--justice-bg)]`} />
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{t.date}</div>
                <h3 className="mt-1.5 text-base font-semibold text-white">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Formal Complaint */}
      <section id="complaint" className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <FileText className="h-3.5 w-3.5" /> সেকশন ০২
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">আনুষ্ঠানিক অভিযোগের সারসংক্ষেপ</h2>

          <div className={`mt-8 rounded-lg border ${navyBorder} ${navyCard} p-8 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-300">ডকুমেন্ট রেফারেন্স</div>
                <div className="mt-1 text-sm text-slate-200">লিখিত অভিযোগ · ২৯ আগস্ট ২০২৪</div>
              </div>
              <div className={`rounded border ${accentBorder}/40 ${accentBg}/10 px-2 py-0.5 text-[10px] uppercase tracking-wider ${accent}`}>অভিযুক্ত</div>
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-slate-300">
              লিখিত অভিযোগ অনুযায়ী, <span className="text-white">জাহিদ হাসান ইমন</span> ১৭ মার্চ ২০২২ থেকে শুরু হওয়া
              ঘটনার সাথে সম্পর্কিত অভিযুক্ত হুমকি ও হামলার পর তার ও তার পরিবারের জন্য আইনগত
              তদন্ত এবং সুরক্ষার আবেদন জানিয়েছেন।
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/pabna-accountability-complaint.pdf"
                download
                className={`inline-flex items-center gap-2 rounded-md ${accentFill} px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90`}
              >
                <Download className="h-4 w-4" /> অভিযোগের PDF ডাউনলোড
              </a>
              <Link
                to="/media-reports"
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04]"
              >
                <Newspaper className="h-4 w-4" /> মিডিয়া রিপোর্টস দেখুন
              </Link>
              <span className="text-xs text-slate-300">A4 · বাংলা · জনস্বার্থে প্রকাশিত</span>
            </div>
          </div>
        </div>
      </section>

      {/* Media Reference */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <Newspaper className="h-3.5 w-3.5" /> সেকশন ০৩
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">সংশ্লিষ্ট সংবাদ রেফারেন্স</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            জনস্বার্থের প্রেক্ষাপটে <span className="text-white">দৈনিক যুগান্তর</span>-এ প্রকাশিত একটি
            সংবাদ প্রতিবেদন রেফারেন্স হিসেবে দেওয়া হয়েছে। সংবাদ প্রতিবেদনে উল্লেখিত যেকোনো
            দাবিকে আইনগত তদন্তে যাচাই না হওয়া পর্যন্ত কেবল প্রতিবেদিত অভিযোগ হিসেবেই গণ্য করতে হবে।
          </p>

          {/* Newspaper clipping card */}
          <figure className={`mt-8 overflow-hidden rounded-md border ${navyBorder} ${navyCard}`}>
            <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-5 py-3">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-base italic tracking-wide text-white">দৈনিক যুগান্তর</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-300">প্রথম পাতা · Archive Ref #393961</span>
              </div>
              <span className={`rounded border ${accentBorder}/40 ${accentBg}/10 px-2 py-0.5 text-[10px] uppercase tracking-wider ${accent}`}>
                Reported
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">প্রকাশিত শিরোনাম</div>
              <blockquote className="mt-3 border-l-2 border-white/15 pl-5 font-serif text-xl leading-snug text-white sm:text-2xl">
                “পাবনায় রাজনৈতিক পরিচয়ে অস্ত্র ও মাদক ব্যবসা নিয়ন্ত্রণ”
              </blockquote>
              <p className="mt-5 text-sm leading-relaxed text-slate-400">
                দৈনিক যুগান্তরের প্রথম পাতায় প্রকাশিত প্রতিবেদনের শিরোনাম। প্রতিবেদনের
                সম্পূর্ণ বিবরণ পত্রিকার আর্কাইভে দেখা যাবে। প্রতিবেদনে উল্লেখিত সব দাবি
                <span className="text-slate-300"> reported allegations</span> — আইনগত তদন্ত
                ছাড়া দোষ-নির্ণয় নয়।
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://www.jugantor.com/todays-paper/first-page/393961/পাবনায়-রাজনৈতিক-পরিচয়ে-অস্ত্র-ও-মাদক-ব্যবসা-নিয়ন্ত্রণ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-md border ${navyBorder} bg-black/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]`}
                >
                  মূল প্রতিবেদন দেখুন <ExternalLink className="h-4 w-4 text-slate-400" />
                </a>
                <a
                  href="https://web.archive.org/web/2024/https://www.jugantor.com/todays-paper/first-page/393961/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04]"
                >
                  Web Archive <ExternalLink className="h-4 w-4 text-slate-300" />
                </a>
              </div>
            </div>
          </figure>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-300">
            Source attribution: Dainik Jugantor, First Page, Article ID 393961. Reproduced
            here as a public-interest citation only; copyright remains with the publisher.
          </p>
        </div>
      </section>



      {/* Evidence Gallery */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <ClipboardList className="h-3.5 w-3.5" /> সেকশন ০৪
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">প্রমাণ গ্যালারি</h2>
          <p className="mt-3 text-sm text-slate-400">আইনগত যাচাইয়ের পর ডকুমেন্ট যুক্ত করা হবে।</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidenceItems.map(({ icon: Icon, label }) => (
              <div key={label} className={`rounded-lg border ${navyBorder} ${navyCard} p-5`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                  <Icon className="h-4 w-4 text-slate-300" />
                </div>
                <div className="mt-4 text-sm font-medium text-white">{label}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-300">যাচাই প্রক্রিয়াধীন</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Concern */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5" /> সেকশন ০৫
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">নিরাপত্তা উদ্বেগ বিবৃতি</h2>
          <div className={`mt-6 rounded-lg border-l-2 ${accentBorder} ${navyCard} p-6`}>
            <p className="text-[15px] leading-relaxed text-slate-200">
              আবেদনকারীর বক্তব্য — স্থানীয় থানায় সরাসরি যাওয়া তার জন্য নিরাপত্তা ঝুঁকি তৈরি করতে
              পারে; তাই তিনি যথাযথ আইনি কর্তৃপক্ষের মাধ্যমে সুরক্ষার আবেদন জানাচ্ছেন।
            </p>
          </div>
        </div>
      </section>

      {/* Appeal to Authorities */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <Scale className="h-3.5 w-3.5" /> সেকশন ০৬
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">কর্তৃপক্ষের প্রতি আবেদন</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            এই পেজটি যথাযথ কর্তৃপক্ষের মাধ্যমে একটি নিরপেক্ষ তদন্ত, আইনগত সুরক্ষা এবং সঠিক
            প্রশাসনিক পদক্ষেপের জন্য বিনীত আবেদন জানাচ্ছে।
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="tel:999" className={`inline-flex items-center justify-between rounded-md border ${navyBorder} ${navyCard} px-4 py-3 text-sm text-white hover:bg-white/[0.05]`}>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> জরুরি সেবা</span>
              <span className="font-mono text-slate-300">999</span>
            </a>
            <a href="tel:333" className={`inline-flex items-center justify-between rounded-md border ${navyBorder} ${navyCard} px-4 py-3 text-sm text-white hover:bg-white/[0.05]`}>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> নাগরিক সেবা</span>
              <span className="font-mono text-slate-300">333</span>
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-xs text-slate-300/80">হয়রানি নিষিদ্ধ · আইনি দাবিত্যাগ</div>
          <p className="mt-4 text-[15px] leading-[1.85] text-slate-200/85">
            এই পেজটি কোনো হয়রানি, হুমকি, mob action, মানহানি বা ব্যক্তিগত আক্রমণে উৎসাহ দেওয়ার
            উদ্দেশ্যে তৈরি করা হয়নি। এটি কেবলমাত্র আইনগত তদন্ত, ব্যক্তিগত নিরাপত্তা এবং প্রাতিষ্ঠানিক
            জবাবদিহিতার সমর্থনে তৈরি।
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-300">
            ন্যায়বিচার · নিরাপত্তা · আইনি তদন্ত
          </div>
          <Link to="/" className="text-xs text-slate-400 hover:text-white">হোমে ফিরে যান</Link>
        </div>
      </footer>
    </div>
  );
}
