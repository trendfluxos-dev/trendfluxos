import { useEffect, useId, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ExternalLink,
  Newspaper,
  Archive,
  FileText,
  Filter,
  ShieldAlert,
  Crosshair,
  Pill,
  Users,
} from "lucide-react";

type SourceKey = "all" | "jugantor" | "ntv" | "bdpratidin" | "samakal";
const FILTERS: { key: SourceKey; label: string }[] = [
  { key: "all", label: "সব সোর্স" },
  { key: "jugantor", label: "যুগান্তর" },
  { key: "ntv", label: "এনটিভি" },
  { key: "bdpratidin", label: "বাংলাদেশ প্রতিদিন" },
  { key: "samakal", label: "সমকাল" },
];

const navy = "bg-[var(--justice-bg)]";
const navyCard = "bg-[var(--justice-card)]";
const navyBorder = "border-[var(--justice-border)]";
const accent = "text-[var(--justice-accent)]";
const accentBg = "bg-[var(--justice-accent)]";
const accentBorder = "border-[var(--justice-accent)]";

const JUGANTOR_URL =
  "https://www.jugantor.com/todays-paper/first-page/393961/পাবনায়-রাজনৈতিক-পরিচয়ে-অস্ত্র-ও-মাদক-ব্যবসা-নিয়ন্ত্রণ";
const JUGANTOR_ARCHIVE =
  "https://web.archive.org/web/2024/https://www.jugantor.com/todays-paper/first-page/393961/";
const NTV_URL = "https://www.ntvbd.com/bangladesh/news-1662301";
const NTV_ARCHIVE = "https://web.archive.org/web/2025/https://www.ntvbd.com/bangladesh/news-1662301";
const BDPRATIDIN_URL = "https://www.bd-pratidin.com/country/2025/12/13/1191438";
const BDPRATIDIN_ARCHIVE =
  "https://web.archive.org/web/2025/https://www.bd-pratidin.com/country/2025/12/13/1191438";
const SAMAKAL_URL =
  "https://samakal.com/whole-country/article/250259/সাবেক-এমপি-প্রিন্সসহ-আ-লীগের-১০৩-নেতাকর্মীর-নামে-মামলা";
const SAMAKAL_ARCHIVE =
  "https://web.archive.org/web/2025/https://samakal.com/whole-country/article/250259/";

type Allegation = {
  icon: typeof ShieldAlert;
  category: string;
  excerpt: string;
  note: string;
};

// Section 02 cards — separately referenced themes from the Jugantor report.
// The headline itself lives in Section 01 and is intentionally NOT duplicated here.
const allegations: Allegation[] = [
  {
    icon: Crosshair,
    category: "অস্ত্র ব্যবসা নিয়ন্ত্রণের অভিযোগ",
    excerpt:
      "অস্ত্র ব্যবসা নিয়ন্ত্রণ সংক্রান্ত অভিযোগ প্রতিবেদনে উল্লেখ করা হয়েছে।",
    note: "Reported allegation — আইনগত তদন্ত ছাড়া এই দাবিকে প্রমাণিত সত্য হিসেবে গণ্য করা যাবে না।",
  },
  {
    icon: Pill,
    category: "মাদক ব্যবসার অভিযোগ",
    excerpt:
      "মাদক ব্যবসা নিয়ন্ত্রণ সংক্রান্ত অভিযোগও একই প্রতিবেদনে স্থান পেয়েছে।",
    note: "Reported allegation — সংশ্লিষ্ট দাবি যাচাইযোগ্য তদন্তের অধীন।",
  },
  {
    icon: Users,
    category: "স্থানীয় প্রভাব ও নিরাপত্তা শঙ্কা",
    excerpt:
      "প্রতিবেদনে স্থানীয় পর্যায়ে প্রভাব বিস্তার ও সাধারণ মানুষের নিরাপত্তা শঙ্কা প্রসঙ্গে আলোকপাত করা হয়েছে।",
    note: "Reported context — নিরপেক্ষ তদন্তের মাধ্যমে যাচাই হওয়া প্রয়োজন।",
  },
];

const futureSources = [
  { outlet: "প্রথম আলো", status: "অপেক্ষমাণ" },
  { outlet: "Daily Star", status: "অপেক্ষমাণ" },
  { outlet: "বাংলা ট্রিবিউন", status: "অপেক্ষমাণ" },
];

// ---------- Reusable building blocks ----------

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
      <Newspaper className="h-3.5 w-3.5" /> সেকশন {index} · {label}
    </div>
  );
}

function ReferencedBadge() {
  return (
    <span
      className={`rounded border ${accentBorder}/40 ${accentBg}/10 px-2 py-0.5 text-[10px] uppercase tracking-wider ${accent}`}
    >
      Referenced in reporting
    </span>
  );
}

function LegalNote() {
  return (
    <p className="mt-5 rounded border border-white/10 bg-black/20 p-4 text-[12px] leading-relaxed text-slate-400">
      <span className={`${accent} font-medium`}>আইনি স্পষ্টীকরণ:</span> এজাহারভুক্ত বা চার্জশিটভুক্ত
      আসামি হওয়া এবং দোষী সাব্যস্ত হওয়া এক জিনিস নয়। উপরের সব তথ্য সংশ্লিষ্ট সংবাদমাধ্যমের
      প্রকাশিত প্রতিবেদন থেকে রেফার করা হয়েছে; কাউকেই আদালতের রায়ের পূর্বে দোষী বলা হচ্ছে না।
    </p>
  );
}

function SourceLinks({ url, archive }: { url: string; archive: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-md border ${navyBorder} bg-black/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]`}
      >
        মূল প্রতিবেদন <ExternalLink className="h-4 w-4 text-slate-400" />
      </a>
      <a
        href={archive}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04]"
      >
        Web Archive <ExternalLink className="h-4 w-4 text-slate-500" />
      </a>
    </div>
  );
}

const SECTION_IDS = ["section-০১", "section-০২", "section-০৩", "section-০৪", "section-০৫"];

const OPEN_STORAGE_KEY = "mr:open-sections";
const SECTIONS_CHANGE_EVENT = "mr:sections-change";

function readOpenSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("open");
    if (q !== null) {
      return new Set(q.split(",").map((s) => s.trim()).filter(Boolean));
    }
    const raw = window.localStorage.getItem(OPEN_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* noop */
  }
  return new Set();
}

function persistOpenSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(set).sort();
    window.localStorage.setItem(OPEN_STORAGE_KEY, JSON.stringify(arr));
    const url = new URL(window.location.href);
    if (arr.length) url.searchParams.set("open", arr.join(","));
    else url.searchParams.delete("open");
    window.history.replaceState(null, "", url.toString());
    window.dispatchEvent(new Event(SECTIONS_CHANGE_EVENT));
  } catch {
    /* noop */
  }
}

function expandAll() {
  persistOpenSet(new Set(SECTION_IDS));
}

function collapseAll() {
  persistOpenSet(new Set());
}

function useSectionOpen(id: string): [boolean, (next: boolean) => void] {
  const [open, setOpen] = useState<boolean>(() => readOpenSet().has(id));
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === OPEN_STORAGE_KEY) setOpen(readOpenSet().has(id));
    };
    const onChange = () => setOpen(readOpenSet().has(id));
    window.addEventListener("storage", onStorage);
    window.addEventListener(SECTIONS_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SECTIONS_CHANGE_EVENT, onChange);
    };
  }, [id]);
  const update = (next: boolean) => {
    setOpen(next);
    const set = readOpenSet();
    if (next) set.add(id);
    else set.delete(id);
    persistOpenSet(set);
  };
  return [open, update];
}

function CollapsibleShell({
  id,
  sectionIndex,
  sectionLabel,
  heading,
  summary,
  children,
}: {
  id: string;
  sectionIndex: string;
  sectionLabel: string;
  heading: string;
  summary: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useSectionOpen(id);
  const reactId = useId();
  const panelId = `mr-panel-${reactId}`;
  const headingId = `mr-heading-${reactId}`;
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className={`group flex w-full items-start justify-between gap-4 rounded-md border ${navyBorder} ${navyCard} px-5 py-4 text-left transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40`}
        >
          <div className="min-w-0 flex-1">
            <SectionLabel index={sectionIndex} label={sectionLabel} />
            <h2
              id={headingId}
              className="mt-2 font-serif text-xl font-semibold text-white sm:text-2xl"
            >
              {heading}
            </h2>
            <p className="mt-1.5 truncate text-[13px] text-slate-400">{summary}</p>
          </div>
          <ChevronDown
            className={`mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          aria-hidden={!open}
          {...(!open ? { inert: "" as unknown as undefined } : {})}
          className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
            open ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SourceCard({
  sectionIndex,
  sectionLabel,
  heading,
  summary,
  outlet,
  meta,
  headline,
  bullets,
  url,
  archive,
  withLegalNote = true,
}: {
  sectionIndex: string;
  sectionLabel: string;
  heading: string;
  summary: string;
  outlet: string;
  meta: string;
  headline?: string;
  bullets?: string[];
  url: string;
  archive: string;
  withLegalNote?: boolean;
}) {
  return (
    <CollapsibleShell
      id={`section-${sectionIndex}`}
      sectionIndex={sectionIndex}
      sectionLabel={sectionLabel}
      heading={heading}
      summary={summary}
    >
      <article className={`overflow-hidden rounded-md border ${navyBorder} ${navyCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-5 py-3">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-base italic tracking-wide text-white">
              {outlet}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              {meta}
            </span>
          </div>
          <ReferencedBadge />
        </div>

        <div className="p-6 sm:p-8">
          {headline && (
            <>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                প্রকাশিত শিরোনাম
              </div>
              <blockquote className="mt-3 border-l-2 border-white/15 pl-5 font-serif text-xl leading-snug text-white sm:text-2xl">
                {headline}
              </blockquote>
            </>
          )}

          {bullets && bullets.length > 0 && (
            <>
              <div className="mt-6 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                প্রতিবেদন থেকে যাচাইযোগ্য তথ্য
              </div>
              <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-300">
                {bullets.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className={`${accent} mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full ${accentBg}`}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {withLegalNote && <LegalNote />}
          <SourceLinks url={url} archive={archive} />
        </div>
      </article>
    </CollapsibleShell>
  );
}

export default function MediaReports() {
  const [filter, setFilter] = useState<SourceKey>("all");
  const show = (k: SourceKey) => filter === "all" || filter === k;
  return (
    <div className={`min-h-dvh ${navy} text-slate-100`}>
      <Helmet>
        <title>মিডিয়া রিপোর্টস — পাবনা অ্যাকাউন্টেবিলিটি প্রজেক্ট</title>
        <meta
          name="description"
          content="সংশ্লিষ্ট সংবাদ প্রতিবেদন, highlighted excerpts ও clickable sources-এর জনস্বার্থমূলক গ্যালারি।"
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://trendflux.digital/media-reports" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="মিডিয়া রিপোর্টস — পাবনা অ্যাকাউন্টেবিলিটি প্রজেক্ট" />
        <meta
          property="og:description"
          content="Clickable sources, highlighted excerpts — Referenced in reporting."
        />
        <meta property="og:url" content="https://trendflux.digital/media-reports" />
        <meta
          property="og:image"
          content="https://trendflux.digital/og-justice-appeal.jpg"
        />
      </Helmet>

      {/* Masthead */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div
            className={`inline-flex items-center gap-2 rounded-full border ${accentBorder}/40 ${accentBg}/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${accent}`}
          >
            <Archive className="h-3.5 w-3.5" /> Media Reference Gallery · Vol. 01
          </div>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
            সংবাদ প্রতিবেদন ও <span className="italic text-slate-300">highlighted excerpts</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            প্রতিটি সেকশন একটি প্রকাশিত প্রতিবেদনের নির্দিষ্ট অভিযোগ বা প্রসঙ্গ উপস্থাপন করছে।
            সাথে original source link ও archive link দেওয়া আছে। কোনো দাবিকেই আইনগত যাচাইয়ের
            পূর্বে প্রমাণিত সত্য হিসেবে গণ্য করা যাবে না।
          </p>
        </div>
      </section>

      {/* Source filter */}
      <section className="border-b border-white/5 bg-black/20">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
              <Filter className="h-3.5 w-3.5" /> সোর্স ফিল্টার
            </span>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                      active
                        ? `${accentBorder} ${accentBg}/15 ${accent}`
                        : "border-white/15 text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={expandAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-white/[0.05]"
              >
                <ChevronsDown className="h-3.5 w-3.5" /> সব খুলুন
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-white/[0.05]"
              >
                <ChevronsUp className="h-3.5 w-3.5" /> সব বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 01 — Jugantor */}
      {show("jugantor") && (
        <SourceCard
          sectionIndex="০১"
          sectionLabel="প্রাথমিক সোর্স"
          heading="দৈনিক যুগান্তর · প্রথম পাতা"
          summary="প্রথম পাতার শিরোনাম — অস্ত্র ও মাদক ব্যবসা নিয়ন্ত্রণ সংক্রান্ত প্রতিবেদন।"
          outlet="দৈনিক যুগান্তর"
          meta="প্রথম পাতা · Archive #393961"
          headline="“পাবনায় রাজনৈতিক পরিচয়ে অস্ত্র ও মাদক ব্যবসা নিয়ন্ত্রণ”"
          url={JUGANTOR_URL}
          archive={JUGANTOR_ARCHIVE}
          withLegalNote={false}
        />
      )}

      {/* Section 02 — NTV */}
      {show("ntv") && (
        <SourceCard
          sectionIndex="০২"
          sectionLabel="এনটিভি অনলাইন"
          heading="এনটিভি অনলাইন · জাতীয় সংবাদ"
          summary="আওয়ামী লীগের তিন নেতা গ্রেপ্তার — গোয়েন্দা পুলিশের অভিযান।"
          outlet="এনটিভি"
          meta="পাবনা প্রতিনিধি · ১৩ ডিসেম্বর ২০২৫"
          headline="“নাশকতার অভিযোগে আওয়ামী লীগের তিন নেতা গ্রেপ্তার”"
          bullets={[
            "এনটিভি জানায়, পাবনা শহরের কৃষ্ণপুর এলাকা থেকে জেলা আওয়ামী লীগের সাবেক প্রচার সম্পাদককে গোয়েন্দা পুলিশ গ্রেপ্তার করেছে।",
            "প্রতিবেদনে উল্লেখ — ২০২৪ সালের ৪ আগস্ট বৈষম্যবিরোধী ছাত্র আন্দোলনের সময় দুই শিক্ষার্থী নিহত হওয়ার মামলায় তিনি চার্জশিটভুক্ত আসামি হিসেবে চিহ্নিত।",
            "পাবনার অতিরিক্ত পুলিশ সুপার এনটিভিকে জানান, “সুনির্দিষ্ট অভিযোগের পরিপ্রেক্ষিতে তাদের গ্রেপ্তার করা হয়েছে” এবং জিজ্ঞাসাবাদ চলছে।",
          ]}
          url={NTV_URL}
          archive={NTV_ARCHIVE}
        />
      )}

      {/* Section 03 — Bangladesh Pratidin */}
      {show("bdpratidin") && (
        <SourceCard
          sectionIndex="০৩"
          sectionLabel="বাংলাদেশ প্রতিদিন"
          heading="বাংলাদেশ প্রতিদিন · দেশজুড়ে"
          summary="আদালতের নির্দেশনায় ডিবির গ্রেপ্তার — হত্যা মামলায় এজাহারভুক্ত।"
          outlet="বাংলাদেশ প্রতিদিন"
          meta="পাবনা প্রতিনিধি · ১৩ ডিসেম্বর ২০২৫"
          bullets={[
            "প্রতিবেদন অনুযায়ী, আদালতের নির্দেশনার পরিপ্রেক্ষিতে গোয়েন্দা পুলিশ (ডিবি) শহরের কৃষ্ণপুর এলাকা থেকে অভিযুক্ত ব্যক্তিকে গ্রেপ্তার করে।",
            "বাংলাদেশ প্রতিদিন উল্লেখ করেছে, তিনি বৈষম্যবিরোধী ছাত্র আন্দোলন সংশ্লিষ্ট হত্যা মামলার অন্যতম আসামি হিসেবে এজাহারভুক্ত।",
            "প্রতিবেদনে আরও জানানো হয়, গ্রেপ্তারকৃতকে আদালতে সোপর্দ করা হবে এবং মামলার তদন্ত কার্যক্রম চলমান।",
          ]}
          url={BDPRATIDIN_URL}
          archive={BDPRATIDIN_ARCHIVE}
        />
      )}

      {/* Section 04 — Samakal */}
      {show("samakal") && (
        <SourceCard
          sectionIndex="০৪"
          sectionLabel="সমকাল"
          heading="সমকাল · সারাদেশ"
          summary="সাবেক এমপিসহ ১০৩ নেতাকর্মীর নামে হত্যা মামলার এজাহার।"
          outlet="সমকাল"
          meta="পাবনা প্রতিনিধি · বিশেষ প্রতিবেদন"
          headline="“সাবেক এমপি প্রিন্সসহ আ. লীগের ১০৩ নেতাকর্মীর নামে মামলা”"
          bullets={[
            "সমকালের প্রতিবেদন অনুযায়ী, পাবনা সদর থানায় সাবেক সংসদ সদস্যসহ আওয়ামী লীগের ১০৩ জন নেতাকর্মীর নামে হত্যা মামলার এজাহার দায়ের করা হয়েছে।",
            "মামলাটি বৈষম্যবিরোধী ছাত্র আন্দোলনের সময় শিক্ষার্থী নিহতের ঘটনার সাথে সম্পর্কিত — প্রতিবেদনে এজাহারভুক্ত আসামিদের তালিকায় একাধিক স্থানীয় নেতার নাম উল্লেখ করা হয়েছে।",
            "প্রতিবেদনে ঘটনার সময়কাল, স্থান ও পুলিশের তদন্ত-অগ্রগতি সম্পর্কিত তথ্য প্রকাশিত হয়েছে।",
          ]}
          url={SAMAKAL_URL}
          archive={SAMAKAL_ARCHIVE}
        />
      )}

      {/* Section 05 — Allegation breakdown from Jugantor */}
      {show("jugantor") && (
        <CollapsibleShell
          id="section-০৫"
          sectionIndex="০৫"
          sectionLabel="highlighted অভিযোগসমূহ"
          heading="যুগান্তর প্রতিবেদনের অভিযোগসমূহ — কার্ড অনুযায়ী"
          summary="যুগান্তর প্রতিবেদনের ৩টি স্বতন্ত্র অভিযোগ — কার্ড অনুযায়ী।"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {allegations.map((a, i) => {
              const Icon = a.icon;
              return (
                <article
                  key={a.category}
                  className={`group flex flex-col overflow-hidden rounded-md border ${navyBorder} ${navyCard} transition-colors hover:border-white/25`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                        <Icon className={`h-4 w-4 ${accent}`} />
                      </span>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                          অভিযোগ {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="font-serif text-sm text-white">{a.category}</div>
                      </div>
                    </div>
                    <span
                      className={`rounded border ${accentBorder}/40 ${accentBg}/10 px-2 py-0.5 text-[9px] uppercase tracking-wider ${accent}`}
                    >
                      Referenced
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <blockquote className="border-l-2 border-white/15 pl-5 font-serif text-[17px] leading-snug text-white">
                      {a.excerpt}
                    </blockquote>
                    <p className="mt-4 text-[13px] leading-relaxed text-slate-400">{a.note}</p>

                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                      <a
                        href={JUGANTOR_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[12px] text-slate-200 hover:bg-white/[0.06]"
                      >
                        Source <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                      <a
                        href={JUGANTOR_ARCHIVE}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.04]"
                      >
                        Archive <ExternalLink className="h-3 w-3 text-slate-500" />
                      </a>
                      <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        Jugantor · #393961
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </CollapsibleShell>
      )}



      {/* Section 06 — Pending sources */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <FileText className="h-3.5 w-3.5" /> সেকশন ০৬ · সংযোজন অপেক্ষমাণ
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-white sm:text-3xl">
            আরও সোর্স — যাচাই প্রক্রিয়াধীন
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            যাচাইযোগ্য আরও সংবাদ প্রতিবেদন পাওয়ামাত্রই এই গ্যালারিতে একই legal-safe ফরম্যাটে যুক্ত
            করা হবে।
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {futureSources.map((s) => (
              <div
                key={s.outlet}
                className={`rounded-md border border-dashed ${navyBorder} ${navyCard} p-5 text-center`}
              >
                <div className="font-serif text-sm text-white">{s.outlet}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  {s.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">আইনি দাবিত্যাগ</div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            এই গ্যালারিতে উদ্ধৃত সংবাদ প্রতিবেদনসমূহ সংশ্লিষ্ট প্রকাশকের কপিরাইটাধীন এবং কেবলমাত্র
            জনস্বার্থে রেফারেন্স হিসেবে দেওয়া হয়েছে। প্রতিটি অভিযোগ আইনগত যাচাইয়ের অধীন; কাউকেই
            আদালতের রায়ের পূর্বে দোষী সাব্যস্ত করা হচ্ছে না। এই পেজটি হয়রানি, mob action বা
            ব্যক্তিগত আক্রমণের উদ্দেশ্যে নয় — এটি একটি জনস্বার্থমূলক ডকুমেন্টেশন।
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            ন্যায়বিচার · নিরাপত্তা · আইনি তদন্ত
          </div>
          <Link to="/justice-appeal" className="text-xs text-slate-400 hover:text-white">
            ← মূল দলিলে ফিরুন
          </Link>
        </div>
      </footer>
    </div>
  );
}
