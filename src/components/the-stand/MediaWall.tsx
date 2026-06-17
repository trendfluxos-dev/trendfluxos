import { useState } from "react";
import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_MEDIA } from "@/content/theStand";
import { usePressItems } from "@/hooks/usePressItems";
import { Reveal } from "./Reveal";
import { ArrowUpRight, Search } from "lucide-react";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBnDigits = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

const BN_MONTHS = [
  "জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন",
  "জুলা", "আগ", "সেপ্টে", "অক্টো", "নভে", "ডিসে",
];
const EN_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string | undefined, lang: "bn" | "en") {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth();
  return lang === "bn"
    ? `${BN_MONTHS[m]} ${toBnDigits(y)}`
    : `${EN_MONTHS[m]} ${y}`;
}

type SectionKey = "initial" | "safety" | "background" | "institutional" | "other";

const SECTION_LABELS: Record<SectionKey, { bn: { eyebrow: string; title: string }; en: { eyebrow: string; title: string } }> = {
  initial: {
    bn: { eyebrow: "পর্ব ০১", title: "প্রাথমিক প্রতিবেদন" },
    en: { eyebrow: "Chapter 01", title: "Initial Reports" },
  },
  safety: {
    bn: { eyebrow: "পর্ব ০২", title: "নিরাপত্তার আবেদন" },
    en: { eyebrow: "Chapter 02", title: "Plea for Safety" },
  },
  background: {
    bn: { eyebrow: "পর্ব ০৩", title: "পটভূমি অনুসন্ধান" },
    en: { eyebrow: "Chapter 03", title: "Background Investigation" },
  },
  institutional: {
    bn: { eyebrow: "পর্ব ০৪", title: "প্রাতিষ্ঠানিক প্রতিক্রিয়া" },
    en: { eyebrow: "Chapter 04", title: "Institutional Response" },
  },
  other: {
    bn: { eyebrow: "পর্ব ০৫", title: "অন্যান্য কভারেজ" },
    en: { eyebrow: "Chapter 05", title: "Additional Coverage" },
  },
};

const SECTION_ORDER: SectionKey[] = ["initial", "safety", "background", "institutional", "other"];

function classify(headline: string): SectionKey {
  const h = headline.toLowerCase();
  if (/(নিরাপত্তা|জীবনের|ভিসি|উপাচার্য|safety|security)/i.test(headline)) return "safety";
  if (/(তদন্ত|কমিটি|উদ্বেগ|ছাত্র ইউনিয়ন|প্রশাসন|inquiry|committee)/i.test(headline)) return "institutional";
  if (/(অপকর্ম|সাম্রাজ্য|মায়ের নিষেধ|বেপরোয়া|পার পেয়ে|empire|background)/i.test(headline)) return "background";
  if (/(টর্চার|নির্যাতন|মারধর|আটকে|torture|beaten)/i.test(headline)) return "initial";
  return "other";
}

/**
 * "Documented Public Record" / "নথিভুক্ত দলিল"
 * Editorial archive of independently published national reporting.
 * Monochrome cards, restrained red, documentary pacing — not a news portal.
 */
export function MediaWall() {
  const { items } = usePressItems();
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_MEDIA.bn : STAND_MEDIA.en;
  const [queries, setQueries] = useState<Record<SectionKey, string>>({
    initial: "",
    safety: "",
    background: "",
    institutional: "",
    other: "",
  });

  if (!items.length) return null;

  const count = lang === "bn" ? toBnDigits(items.length) : items.length;

  const matchesQuery = (item: (typeof items)[number], q: string) => {
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    const date = formatDate(item.created_at, lang);
    return (
      item.outlet.toLowerCase().includes(term) ||
      item.headline.toLowerCase().includes(term) ||
      (date ? date.toLowerCase().includes(term) : false)
    );
  };

  const grouped = SECTION_ORDER.map((key) => ({
    key,
    label: SECTION_LABELS[key][lang],
    entries: items.filter((it) => classify(it.headline) === key),
  })).filter((g) => g.entries.length > 0);

  return (
    <section
      aria-label={lang === "bn" ? "নথিভুক্ত দলিল" : "Documented public record"}
      className="px-6 lg:px-10 py-32 md:py-44 bg-[hsl(var(--stand-bone))]"
    >
      <div className="mx-auto max-w-5xl">
        {/* Editorial header */}
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
          >
            {t.eyebrow}
          </p>
          <h2
            lang={lang}
            className="mt-6 font-display text-3xl md:text-5xl font-semibold leading-tight text-[hsl(var(--stand-ink))]"
          >
            {t.title}
          </h2>
          <p
            lang={lang}
            className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-[hsl(var(--stand-muted))]"
          >
            {t.note}
          </p>
          <p
            lang={lang}
            className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--stand-muted))]"
          >
            <span className="h-px w-8 bg-[hsl(var(--stand-red))]/60" />
            {count} {t.countSuffix}
          </p>
        </Reveal>

        {/* Coverage continuity timeline */}
        <Reveal delay={120}>
          <div className="mt-20 border-t border-[hsl(var(--stand-hairline))] pt-10">
            <p
              lang={lang}
              className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))]"
            >
              {t.timelineEyebrow}
            </p>
            <ol className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
              {t.timeline.map((step, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden
                    className="absolute -top-[26px] left-0 inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--stand-red))]"
                  />
                  <p
                    lang={lang}
                    className="font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--stand-ink))]"
                  >
                    {step.year}
                  </p>
                  <p
                    lang={lang}
                    className="mt-2 text-sm leading-relaxed text-[hsl(var(--stand-muted))]"
                  >
                    {step.label}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Documented entries — editorial cards */}
        <div className="mt-20 space-y-20">
          {grouped.map((group) => (
            <div key={group.key}>
              <Reveal>
                <div className="flex items-baseline justify-between gap-6 border-b border-[hsl(var(--stand-hairline))] pb-5">
                  <div>
                    <p
                      lang={lang}
                      className="font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-red))]"
                    >
                      {group.label.eyebrow}
                    </p>
                    <h3
                      lang={lang}
                      className="mt-3 font-display text-xl md:text-2xl font-semibold text-[hsl(var(--stand-ink))]"
                    >
                      {group.label.title}
                    </h3>
                  </div>
                  <span
                    lang={lang}
                    className="font-mono text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))]"
                  >
                    {lang === "bn" ? toBnDigits(group.entries.length) : group.entries.length}
                    {" / "}
                    {lang === "bn" ? toBnDigits(items.length) : items.length}
                  </span>
                </div>
              </Reveal>

              <div className="mt-6 flex items-center gap-3">
                <Search className="h-3.5 w-3.5 text-[hsl(var(--stand-muted))]" />
                <input
                  type="text"
                  value={queries[group.key]}
                  onChange={(e) =>
                    setQueries((prev) => ({ ...prev, [group.key]: e.target.value }))
                  }
                  placeholder={t.searchPlaceholder}
                  lang={lang}
                  className="w-full max-w-md bg-transparent text-sm text-[hsl(var(--stand-ink))] placeholder:text-[hsl(var(--stand-muted))]/60 focus:outline-none"
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-px bg-[hsl(var(--stand-hairline))] border border-[hsl(var(--stand-hairline))]">
                {group.entries.filter((it) => matchesQuery(it, queries[group.key])).map((item, i) => {
                  const date = formatDate(item.created_at, lang);
                  const isBn = /[\u0980-\u09FF]/.test(item.headline);
                  return (
                    <Reveal key={item.id ?? item.href} delay={(i % 6) * 50}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col justify-between gap-10 bg-[hsl(var(--stand-bone))] p-8 md:p-10 transition-colors hover:bg-[hsl(var(--stand-bone-soft))]"
                      >
                        <div>
                          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))]">
                            <span
                              aria-hidden
                              className="inline-block h-1 w-1 rounded-full bg-[hsl(var(--stand-red))]"
                            />
                            <span lang="en" className="font-mono text-[hsl(var(--stand-ink))]">
                              {item.outlet}
                            </span>
                            {date && (
                              <>
                                <span aria-hidden className="text-[hsl(var(--stand-muted))]/40">·</span>
                                <span lang={lang} className="font-mono">{date}</span>
                              </>
                            )}
                          </div>
                          <p
                            lang={isBn ? "bn" : "en"}
                            className="mt-6 font-display text-lg md:text-xl leading-snug text-[hsl(var(--stand-ink))]"
                          >
                            {item.headline}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[hsl(var(--stand-hairline))] pt-5">
                          <span
                            lang="en"
                            className="font-mono text-[11px] leading-snug text-[hsl(var(--stand-muted))] break-all group-hover:text-[hsl(var(--stand-ink))] transition-colors"
                          >
                            {item.href.replace(/^https?:\/\//, "")}
                          </span>
                          <span
                            lang={lang}
                            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))] group-hover:text-[hsl(var(--stand-red))] transition-colors"
                          >
                            {t.read}
                            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </a>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
