import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useStandLang } from "@/context/StandLanguageContext";
import { STAND_ARCHIVE_UTILS } from "@/content/theStand";
import { Reveal } from "./Reveal";

/**
 * Demoted "tools" strip. Quote generator + share/OG export live here as
 * understated text links — never the page's center of gravity.
 */
export function ArchiveUtilities() {
  const { lang } = useStandLang();
  const t = lang === "bn" ? STAND_ARCHIVE_UTILS.bn : STAND_ARCHIVE_UTILS.en;

  return (
    <section
      aria-label="Archive utilities"
      className="px-6 lg:px-10 py-24 md:py-32 bg-[hsl(var(--stand-bone-soft))]"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p
            lang={lang}
            className="text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--stand-muted))]"
          >
            {t.eyebrow}
          </p>
          <p
            lang={lang}
            className="mt-6 max-w-xl text-base md:text-lg text-[hsl(var(--stand-ink))]/85"
          >
            {t.body}
          </p>

          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
            <Link
              to="/the-stand/share"
              lang={lang}
              className="group inline-flex items-center gap-2 border-b border-[hsl(var(--stand-hairline))] pb-1 text-sm uppercase tracking-[0.3em] text-[hsl(var(--stand-ink))] transition-colors hover:text-[hsl(var(--stand-red))] hover:border-[hsl(var(--stand-red))]"
            >
              {t.primary}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/the-stand/share"
              lang={lang}
              className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[hsl(var(--stand-muted))] transition-colors hover:text-[hsl(var(--stand-red))]"
            >
              {t.secondary}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
