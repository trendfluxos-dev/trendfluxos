import { useState } from "react";
import { Link } from "react-router-dom";
import { Share2, Clock, ArrowUpRight } from "lucide-react";
import ShareDialog, { type SharePayload } from "./ShareDialog";
import type { ResearchEntry } from "@/data/research";

const accentRing: Record<NonNullable<ResearchEntry["cover"]>["accent"], string> = {
  cyan: "from-cyan-400/30 to-cyan-500/0",
  gold: "from-amber-400/30 to-amber-500/0",
  violet: "from-violet-400/30 to-violet-500/0",
  rose: "from-rose-400/30 to-rose-500/0",
  emerald: "from-emerald-400/30 to-emerald-500/0",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

type Props = {
  items: ResearchEntry[];
  basePath: "/research" | "/implementations";
};

const ResearchList = ({ items, basePath }: Props) => {
  const [shareFor, setShareFor] = useState<ResearchEntry | null>(null);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://trendflux.digital";

  const payload: SharePayload | null = shareFor
    ? {
        title: shareFor.title,
        summary: shareFor.excerpt,
        url: `${origin}${basePath}/${shareFor.slug}`,
        category: shareFor.category,
        tags: shareFor.tags,
      }
    : null;

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-foreground/50 text-sm">
        No entries yet. Check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((e) => {
          const accent = e.cover?.accent ?? "cyan";
          return (
            <article
              key={e.slug}
              className="group relative rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm overflow-hidden hover:border-foreground/30 transition-all"
            >
              <div
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentRing[accent]}`}
                aria-hidden
              />

              <Link to={`${basePath}/${e.slug}`} className="block p-6">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-foreground/55">
                  <span className="text-primary">{e.cover?.eyebrow ?? e.category}</span>
                  <span className="text-foreground/30">·</span>
                  <span>{fmtDate(e.publishedAt)}</span>
                </div>

                <h3 className="font-display text-xl md:text-[22px] leading-tight mt-3 group-hover:text-gradient transition-colors">
                  {e.title}
                </h3>

                {e.subtitle && (
                  <p className="text-sm text-foreground/55 mt-1.5">{e.subtitle}</p>
                )}

                <p className="text-sm text-foreground/70 mt-3 leading-relaxed line-clamp-3">
                  {e.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {e.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-foreground/55"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30 text-[11px] text-foreground/55">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {e.readingMinutes} min read
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                    Read
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  setShareFor(e);
                }}
                aria-label={`Share ${e.title}`}
                className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/50 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:border-primary/60 hover:text-primary transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </article>
          );
        })}
      </div>

      <ShareDialog
        open={!!shareFor}
        onOpenChange={(o) => !o && setShareFor(null)}
        payload={payload}
      />
    </>
  );
};

export default ResearchList;