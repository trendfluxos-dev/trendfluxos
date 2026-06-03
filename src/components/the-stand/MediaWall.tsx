import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_MEDIA } from "@/content/theStand";
import { usePressItems } from "@/hooks/usePressItems";
import { Reveal } from "./Reveal";
import { ArrowUpRight } from "lucide-react";

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

/**
 * "Documented Public Record" / "নথিভুক্ত দলিল"
 * Editorial archive of independently published national reporting.
 * Monochrome cards, restrained red, documentary pacing — not a news portal.
 */
export function MediaWall() {
  const { items } = usePressItems();
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_MEDIA.bn : STAND_MEDIA.en;
  if (!items.length) return null;

  const count = lang === "bn" ? toBnDigits(items.length) : items.length;

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
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-[hsl(var(--stand-hairline))] border border-[hsl(var(--stand-hairline))]">
          {items.map((item, i) => {
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

                  <span
                    lang={lang}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--stand-muted))] group-hover:text-[hsl(var(--stand-red))] transition-colors"
                  >
                    {t.read}
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
