import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Camera,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Twitter,
  Facebook,
  Send,
} from "lucide-react";

const navy = "bg-[var(--justice-bg)]";
const navyCard = "bg-[var(--justice-card)]";
const navyBorder = "border-[var(--justice-border)]";
const accent = "text-[var(--justice-accent)]";
const accentBg = "bg-[var(--justice-accent)]";
const accentBorder = "border-[var(--justice-accent)]";

const PAGE_URL = "https://trendflux.digital/justice-appeal";

type Block = {
  id: string;
  label: string;
  context: string;
  text: string;
};

const blocks: Block[] = [
  {
    id: "short",
    label: "সংক্ষিপ্ত পোস্ট (Facebook / WhatsApp status)",
    context: "৪–৫ লাইনের ভদ্র, আইনি ভাষায় শেয়ার।",
    text: `পাবনার একটি লিখিত অভিযোগ ও সংশ্লিষ্ট সংবাদ রেফারেন্স একটি জনস্বার্থমূলক দলিল আকারে আর্কাইভ করা হয়েছে।
আবেদন — নিরপেক্ষ তদন্ত, আইনগত সুরক্ষা ও প্রাতিষ্ঠানিক জবাবদিহিতা।
এটি কোনো আক্রমণ নয়, কেবল documentation।
দলিল দেখুন: ${PAGE_URL}
#PabnaAccountability #JusticeRequest`,
  },
  {
    id: "long",
    label: "দীর্ঘ পোস্ট (Facebook note / blog comment)",
    context: "৮–১০ লাইনের পূর্ণ বিবরণ, সংবাদকর্মী/অ্যাক্টিভিস্টের জন্য।",
    text: `পাবনায় ২০২২ সাল থেকে ঘটে আসা কিছু ঘটনার উপর ভিত্তি করে একটি লিখিত অভিযোগ ২৯ আগস্ট ২০২৪ তারিখে আনুষ্ঠানিকভাবে প্রস্তুত করা হয়েছে।

দৈনিক যুগান্তরের প্রথম পাতায় (আর্কাইভ #৩৯৩৯৬১) প্রকাশিত একটি সংশ্লিষ্ট প্রতিবেদন প্রসঙ্গ হিসেবে রেফারেন্স দেওয়া হয়েছে।

এই পেজে যা থাকছে:
• ঘটনাপ্রবাহ (timeline)
• লিখিত অভিযোগের সারসংক্ষেপ ও PDF
• সংবাদ রেফারেন্স
• নিরাপত্তা উদ্বেগ বিবৃতি

আবেদন — সংশ্লিষ্ট আইনি কর্তৃপক্ষের মাধ্যমে নিরপেক্ষ তদন্ত ও আইনগত সুরক্ষা।
এটি কোনো হয়রানি, mob action বা ব্যক্তিগত আক্রমণের আহ্বান নয়; এটি একটি জনস্বার্থমূলক ডকুমেন্টেশন।

দলিল: ${PAGE_URL}`,
  },
  {
    id: "journalist",
    label: "সাংবাদিক / আইনজীবী-কে DM",
    context: "ব্যক্তিগত বার্তায় পাঠানোর জন্য — পেশাদার টোন।",
    text: `আসসালামু আলাইকুম।

পাবনার একটি ঘটনাকে কেন্দ্র করে একটি লিখিত অভিযোগ ও সংশ্লিষ্ট সংবাদ রেফারেন্স জনস্বার্থে আর্কাইভ করা হয়েছে। বিষয়টি যাচাইযোগ্য কিনা — এবং আইনি প্রক্রিয়ার মাধ্যমে নিরপেক্ষ তদন্তের জন্য আপনার পরামর্শ/সহযোগিতা পাওয়া যাবে কিনা — সে বিষয়ে আপনার মতামত প্রত্যাশা করছি।

দলিল: ${PAGE_URL}

ধন্যবাদ।`,
  },
  {
    id: "tweet",
    label: "X / Twitter পোস্ট",
    context: "২৮০ ক্যারেক্টারের মধ্যে।",
    text: `পাবনা অ্যাকাউন্টেবিলিটি প্রজেক্ট — একটি লিখিত অভিযোগ ও সংবাদ রেফারেন্সের জনস্বার্থমূলক দলিল।

আবেদন: নিরপেক্ষ তদন্ত ও আইনগত সুরক্ষা। কোনো আক্রমণ নয়, কেবল documentation।

${PAGE_URL}

#PabnaAccountability #JusticeRequest`,
  },
  {
    id: "email",
    label: "ই-মেইল (কর্তৃপক্ষ / মানবাধিকার সংস্থা)",
    context: "Formal email — Subject + Body।",
    text: `Subject: পাবনা সংক্রান্ত লিখিত অভিযোগ — নিরপেক্ষ তদন্ত ও সুরক্ষার আবেদন

মহোদয়/মহোদয়া,

পাবনা জেলার একটি লিখিত অভিযোগের ভিত্তিতে এবং দৈনিক যুগান্তরে প্রকাশিত একটি সংশ্লিষ্ট সংবাদ প্রতিবেদনের প্রেক্ষাপটে একটি জনস্বার্থমূলক ডকুমেন্টেশন পেজ প্রস্তুত করা হয়েছে।

বিনীত আবেদন — অভিযোগের ভিত্তিতে একটি নিরপেক্ষ তদন্ত পরিচালনা এবং আবেদনকারীর জন্য যথাযথ আইনগত সুরক্ষা নিশ্চিত করার জন্য আপনার সদয় বিবেচনা প্রার্থনা করছি।

সম্পূর্ণ দলিল: ${PAGE_URL}

বিনীত নিবেদক,
[আপনার নাম]`,
  },
];

const doList = [
  "সংযম রেখে শেয়ার করুন — “তদন্ত চাই”, “নিরাপত্তা চাই”, “জবাবদিহিতা চাই”।",
  "মূল দলিলের লিংক সঙ্গে দিন — কেবল স্ক্রিনশট নয়।",
  "সংবাদ প্রতিবেদন বা PDF-এর স্ক্রিনশট হলে সোর্স attribution দিন।",
  "সাংবাদিক, আইনজীবী ও মানবাধিকার সংস্থাকে DM-এ শেয়ার করাই বেশি কার্যকর।",
  "প্রতিটি দাবিকে “অভিযোগ অনুযায়ী / প্রতিবেদনে উল্লেখ”—এভাবেই লিখুন।",
];

const dontList = [
  "“ধরে ফেলো”, “শাস্তি দাও”, “মারো” — এই ধরনের ভাষা কখনই নয়।",
  "ব্যক্তিগত ছবি বা পরিবারকে target করে পোস্ট নয়।",
  "কোনো ব্যক্তিকে আইনগত যাচাই ছাড়া “অপরাধী” হিসেবে আখ্যা নয়।",
  "ঠিকানা/ফোন/পরিবারের তথ্য — doxxing নিষিদ্ধ।",
  "Mass tagging / spam comment — এতে credibility নষ্ট হয়।",
];

const screenshotTips = [
  {
    title: "ক্রপ পরিষ্কার রাখুন",
    body: "Address bar, headline ও তারিখ যেন স্ক্রিনশটে থাকে — এতে যাচাই সহজ হয়।",
  },
  {
    title: "সোর্স attribution যোগ করুন",
    body: "“Source: দৈনিক যুগান্তর / আর্কাইভ #৩৯৩৯৬১” — ক্যাপশনে স্পষ্ট লিখুন।",
  },
  {
    title: "Edit বা manipulate নয়",
    body: "টেক্সট কাটা, হাইলাইট মুছে দেওয়া বা ফেক হেডলাইন বানানো — সম্পূর্ণ নিষিদ্ধ।",
  },
  {
    title: "প্রসঙ্গ ক্যাপশনে রাখুন",
    body: "“অভিযোগ অনুযায়ী / প্রতিবেদনে উল্লেখ” — দোষ-নির্ণয়মূলক ভাষা এড়িয়ে চলুন।",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* noop */
        }
      }}
      className={`inline-flex items-center gap-2 rounded-md ${
        copied ? accentBg : "bg-white/[0.06] hover:bg-white/[0.1]"
      } px-3 py-1.5 text-xs font-medium text-white transition-colors`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "কপি হয়েছে" : "কপি করুন"}
    </button>
  );
}

export default function ShareKit() {
  const encodedUrl = encodeURIComponent(PAGE_URL);
  const encodedShort = encodeURIComponent(blocks[0].text);

  return (
    <div className={`min-h-dvh ${navy} text-slate-100`}>
      <Helmet>
        <title>শেয়ার কিট — পাবনা অ্যাকাউন্টেবিলিটি প্রজেক্ট</title>
        <meta
          name="description"
          content="আইনি দিক থেকে নিরাপদ ভাষায় শেয়ার করার জন্য preformatted text blocks ও screenshot guidelines।"
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://trendflux.digital/share-kit" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="শেয়ার কিট — পাবনা অ্যাকাউন্টেবিলিটি প্রজেক্ট" />
        <meta
          property="og:description"
          content="Preformatted text + screenshot guidelines — harassment নয়, documentation।"
        />
        <meta property="og:url" content="https://trendflux.digital/share-kit" />
        <meta property="og:image" content="https://trendflux.digital/og-justice-appeal.jpg" />
      </Helmet>

      {/* Masthead */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/justice-appeal" className="flex items-center gap-3">
            <span className={`inline-block h-2 w-2 rounded-full ${accentBg}`} />
            <span className="font-serif text-sm tracking-[0.18em] text-white">
              PABNA ACCOUNTABILITY PROJECT
            </span>
          </Link>
          <Link
            to="/justice-appeal"
            className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-400 hover:text-white sm:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> মূল দলিলে ফিরুন
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div
            className={`inline-flex items-center gap-2 rounded-full border ${accentBorder}/40 ${accentBg}/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${accent}`}
          >
            <Share2 className="h-3.5 w-3.5" /> Legal-Safe Share Kit
          </div>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
            দায়িত্বশীলভাবে শেয়ার করুন,{" "}
            <span className="italic text-slate-300">তদন্তের আবেদন জানান।</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            এই পেজে রয়েছে আগে থেকেই প্রস্তুতকৃত আইনি ভাষায় লেখা পোস্ট, ই-মেইল ও DM template, এবং
            screenshot ব্যবহারের সুস্পষ্ট নির্দেশনা। উদ্দেশ্য — হয়রানি নয়, নিরপেক্ষ তদন্তের আবেদন।
          </p>

          {/* Quick share row */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-md border ${navyBorder} ${navyCard} px-4 py-2 text-sm text-white hover:bg-white/[0.05]`}
            >
              <Facebook className="h-4 w-4 text-slate-300" /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedShort}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-md border ${navyBorder} ${navyCard} px-4 py-2 text-sm text-white hover:bg-white/[0.05]`}
            >
              <Twitter className="h-4 w-4 text-slate-300" /> X / Twitter
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodedShort}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-md border ${navyBorder} ${navyCard} px-4 py-2 text-sm text-white hover:bg-white/[0.05]`}
            >
              <MessageSquare className="h-4 w-4 text-slate-300" /> WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedShort}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-md border ${navyBorder} ${navyCard} px-4 py-2 text-sm text-white hover:bg-white/[0.05]`}
            >
              <Send className="h-4 w-4 text-slate-300" /> Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Preformatted text blocks */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <MessageSquare className="h-3.5 w-3.5" /> সেকশন ০১
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
            Preformatted টেক্সট ব্লক
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            কপি করুন, পেস্ট করুন, শেয়ার করুন। সংশোধনের প্রয়োজন নেই।
          </p>

          <div className="mt-10 space-y-6">
            {blocks.map((b) => (
              <article
                key={b.id}
                className={`overflow-hidden rounded-md border ${navyBorder} ${navyCard}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-5 py-3">
                  <div>
                    <div className="font-serif text-sm text-white">{b.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{b.context}</div>
                  </div>
                  <CopyButton text={b.text} />
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap px-5 py-5 font-sans text-[14px] leading-relaxed text-slate-200">
                  {b.text}
                </pre>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Do / Don't */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> সেকশন ০২
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
            শেয়ারের নিয়মাবলি
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className={`rounded-md border ${navyBorder} ${navyCard} p-6`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Check className={`h-4 w-4 ${accent}`} /> যা করুন
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {doList.map((d) => (
                  <li key={d} className="flex gap-2.5 leading-relaxed">
                    <span className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${accentBg}`} />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`rounded-md border ${navyBorder} ${navyCard} p-6`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> যা করবেন না
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {dontList.map((d) => (
                  <li key={d} className="flex gap-2.5 leading-relaxed">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Guidelines */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <Camera className="h-3.5 w-3.5" /> সেকশন ০৩
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
            Screenshot ব্যবহারের নির্দেশনা
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            একটি বিকৃত স্ক্রিনশট পুরো credibility শেষ করে দিতে পারে। নিচের নিয়ম অনুসরণ করলে শেয়ার
            যাচাইযোগ্য ও আইনিভাবে নিরাপদ থাকবে।
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {screenshotTips.map((s, i) => (
              <div key={s.title} className={`rounded-md border ${navyBorder} ${navyCard} p-6`}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Rule {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 font-serif text-base font-semibold text-white">{s.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>

          <div
            className={`mt-8 rounded-md border-l-2 ${accentBorder} ${navyCard} p-5 text-sm leading-relaxed text-slate-300`}
          >
            <strong className="text-white">টিপ —</strong> মূল দলিলের লিংক
            (<span className="font-mono text-slate-200">{PAGE_URL}</span>) সবসময় ক্যাপশনে দিন।
            স্ক্রিনশট কেবল সমর্থনকারী উপাদান, প্রমাণের একমাত্র মাধ্যম নয়।
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            হয়রানি নিষিদ্ধ · আইনি দাবিত্যাগ
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            এই শেয়ার কিটটি কেবলমাত্র দায়িত্বশীল, আইনগতভাবে নিরাপদ এবং অহিংস উপায়ে নিরপেক্ষ
            তদন্তের আবেদন প্রচারের উদ্দেশ্যে প্রস্তুত। কোনো ব্যক্তি বা গোষ্ঠীর প্রতি হয়রানি, mob
            action, মানহানি বা ব্যক্তিগত আক্রমণে ব্যবহারের জন্য নয়। এই নিয়ম লঙ্ঘন করলে শেয়ারকারী
            স্বয়ং দায়ী থাকবেন।
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            documentation · নয় harassment
          </div>
          <Link to="/justice-appeal" className="text-xs text-slate-400 hover:text-white">
            ← মূল দলিলে ফিরুন
          </Link>
        </div>
      </footer>
    </div>
  );
}
