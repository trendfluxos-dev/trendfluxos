import { ArrowUpRight, Share2, FileText, CalendarClock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ShowcaseItem } from "@/data/showcase";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";

const accentGlow: Record<NonNullable<ShowcaseItem["accent"]>, string> = {
  cyan: "before:bg-gradient-to-br before:from-cyan-400/15 before:to-transparent",
  gold: "before:bg-gradient-to-br before:from-amber-400/15 before:to-transparent",
  violet: "before:bg-gradient-to-br before:from-violet-400/15 before:to-transparent",
  rose: "before:bg-gradient-to-br before:from-rose-400/15 before:to-transparent",
  emerald: "before:bg-gradient-to-br before:from-emerald-400/15 before:to-transparent",
};

type Props = {
  items: ShowcaseItem[];
  onBookCall?: (item: ShowcaseItem) => void;
};

/**
 * ShowcaseGrid — uniform CSS-grid layout (equal-height cards, consistent
 * gutters) focused on quick scanning: category, title, one-line summary,
 * up to two headline metrics, and top tags. Use for the Projects tab where
 * comparability across cards matters more than long-form storytelling.
 */
const ShowcaseGrid = ({ items, onBookCall }: Props) => {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);

  const openShare = (item: ShowcaseItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = item.href
      ? item.external
        ? item.href
        : `${origin}${item.href}`
      : `${origin}/showcase#${item.id}`;
    setSharePayload({
      title: item.title,
      summary: item.summary,
      url,
      category: item.category,
      tags: item.tags,
      videoUrl: item.videoUrl,
    });
    setShareOpen(true);
  };

  return (
    <>
      <div className="grid gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const metrics = (item.metrics ?? []).slice(0, 2);
          const tags = (item.tags ?? []).slice(0, 4);
          const Wrapper: React.ElementType = item.href
            ? item.external
              ? "a"
              : Link
            : "div";
          const wrapperProps = item.href
            ? item.external
              ? { href: item.href, target: "_blank", rel: "noreferrer" }
              : { to: item.href }
            : {};
          return (
            <Wrapper
              key={item.id}
              id={item.id}
              {...wrapperProps}
              className="block h-full"
            >
              <article
                className={[
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl",
                  "border border-border/50 bg-card/40 backdrop-blur-sm",
                  "p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40",
                  "hover:shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.35)]",
                  "before:absolute before:inset-0 before:opacity-60 before:pointer-events-none",
                  accentGlow[item.accent ?? "cyan"],
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openShare(item);
                  }}
                  aria-label={`Share ${item.title}`}
                  title="AI Share"
                  className="absolute top-3 right-3 z-20 inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/50 bg-background/70 backdrop-blur-sm text-foreground/60 opacity-0 group-hover:opacity-100 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>

                <div className="relative z-10 flex flex-1 flex-col">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-medium">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-foreground/45 whitespace-nowrap">
                      {item.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg lg:text-xl font-bold leading-tight flex items-start gap-2">
                    <span className="flex-1">{item.title}</span>
                    {item.href && (
                      <ArrowUpRight className="h-4 w-4 mt-1 text-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </h3>

                  {/* Summary — clamp for uniformity */}
                  <p className="text-foreground/70 text-sm leading-relaxed mt-2 line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Quick metrics */}
                  {metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      {metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-lg border border-border/40 bg-background/40 px-2.5 py-2"
                        >
                          <div className="font-display text-base font-bold text-gradient leading-tight">
                            {m.value}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-foreground/50 mt-0.5 line-clamp-1">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 bg-background/30 text-foreground/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Spacer to push footer down for equal-height rows */}
                  <div className="flex-1" />

                  {/* Footer actions */}
                  <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/showcase/${item.id}`);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary/90 hover:text-primary transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      Case study
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                    {onBookCall && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onBookCall(item);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400/90 hover:text-amber-300 transition-colors"
                      >
                        <CalendarClock className="h-3 w-3" />
                        Book call
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </Wrapper>
          );
        })}
      </div>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={sharePayload} />
    </>
  );
};

export default ShowcaseGrid;