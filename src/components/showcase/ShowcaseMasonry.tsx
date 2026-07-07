import { ArrowUpRight, Share2, AlertCircle, Cog, Sparkles, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ShowcaseItem } from "@/data/showcase";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";

const accentRing: Record<NonNullable<ShowcaseItem["accent"]>, string> = {
  cyan: "before:bg-gradient-to-br before:from-cyan-400/20 before:to-transparent",
  gold: "before:bg-gradient-to-br before:from-amber-400/20 before:to-transparent",
  violet: "before:bg-gradient-to-br before:from-violet-400/20 before:to-transparent",
  rose: "before:bg-gradient-to-br before:from-rose-400/20 before:to-transparent",
  emerald: "before:bg-gradient-to-br before:from-emerald-400/20 before:to-transparent",
};

const Card = ({ item, onShare }: { item: ShowcaseItem; onShare: (p: SharePayload) => void }) => {
  const navigate = useNavigate();
  const inner = (
    <article
      className={[
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm",
        "p-6 lg:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.35)]",
        "before:absolute before:inset-0 before:opacity-60 before:pointer-events-none",
        accentRing[item.accent ?? "cyan"],
      ].join(" ")}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const url = item.href
            ? item.external
              ? item.href
              : `${origin}${item.href}`
            : `${origin}/showcase#${item.id}`;
          onShare({
            title: item.title,
            summary: item.summary,
            url,
            category: item.category,
            tags: item.tags,
            videoUrl: item.videoUrl,
          });
        }}
        aria-label={`Share ${item.title}`}
        title="AI Share"
        className="absolute top-3 right-3 z-20 inline-flex items-center justify-center h-11 w-11 rounded-full border border-border/50 bg-background/70 backdrop-blur-sm text-foreground/60 opacity-0 group-hover:opacity-100 hover:text-primary hover:border-primary/50 transition-all"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-medium">
            {item.category}
          </span>
          <span className="text-[10px] text-foreground/45 whitespace-nowrap">
            {item.year}
          </span>
        </div>

        <h3 className="font-display text-xl lg:text-2xl font-bold leading-tight flex items-start gap-2">
          <span className="flex-1">{item.title}</span>
          {item.href && (
            <ArrowUpRight className="h-4 w-4 mt-1 text-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </h3>

        <p className="text-foreground/70 text-sm leading-relaxed mt-3">
          {item.summary}
        </p>

        {item.caseStudy && (
          <ol className="mt-5 space-y-2.5" aria-label="Case study breakdown">
            {[
              { icon: AlertCircle, label: "Problem", text: item.caseStudy.problem, tone: "text-rose-300/90" },
              { icon: Cog, label: "System", text: item.caseStudy.system, tone: "text-cyan-300/90" },
              { icon: Sparkles, label: "Result", text: item.caseStudy.result, tone: "text-amber-300/90" },
            ].map(({ icon: Icon, label, text, tone }) => (
              <li
                key={label}
                className="flex gap-3 rounded-xl border border-border/40 bg-background/40 px-3 py-2.5"
              >
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${tone}`} aria-hidden />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-medium">
                    {label}
                  </div>
                  <p className="text-[13px] leading-relaxed text-foreground/80 mt-0.5">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {item.metrics && item.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            {item.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border/40 bg-background/40 px-3 py-2.5"
              >
                <div className="font-display text-lg font-bold text-gradient">
                  {m.value}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-foreground/50 mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2.5 py-1 rounded-full border border-border/40 bg-background/30 text-foreground/60"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-border/40">
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
            View case study
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );

  if (!item.href) return inner;
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return (
    <Link to={item.href} className="block">
      {inner}
    </Link>
  );
};

type Props = {
  items: ShowcaseItem[];
};

const ShowcaseMasonry = ({ items }: Props) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);

  const onShare = (p: SharePayload) => {
    setSharePayload(p);
    setShareOpen(true);
  };

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5 lg:gap-6 [column-fill:_balance]">
        {items.map((item) => (
          <div key={item.id} id={item.id} className="mb-5 lg:mb-6 break-inside-avoid">
            <Card item={item} onShare={onShare} />
          </div>
        ))}
      </div>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={sharePayload} />
    </>
  );
};

export default ShowcaseMasonry;