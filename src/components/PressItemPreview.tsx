import { useState } from "react";
import { ArrowUpRight, MoreHorizontal, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PressItem } from "@/hooks/usePressItems";

type Props = {
  item: PressItem;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

/**
 * Renders a single press item exactly the way it appears on the homepage:
 *  - The clickable headline card (Phase 03 grid)
 *  - The "Explore details" modal that opens when clicked
 *
 * Used by /admin so editors can preview drafts before publishing.
 */
export function PressItemPreview({ item, open, onOpenChange }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-gold/30 sm:max-w-2xl">
        <DialogHeader className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Homepage Preview
          </p>
          <DialogTitle className="font-display text-xl">
            How this item will appear
            {item.published === false && (
              <span className="ml-2 rounded-full border border-border bg-foreground/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground/60">
                Draft
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Card preview — mirrors src/pages/Index.tsx lines 469-490 */}
        <div className="mt-2">
          <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-foreground/40">
            Card in the Press Coverage grid
          </p>
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="group/card flex w-full flex-col rounded-xl border border-border bg-foreground/[0.03] p-4 text-left hover:border-gold/40 hover:bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                  {item.outlet || "Outlet name"}
                </span>
                <MoreHorizontal className="h-4 w-4 text-foreground/40 transition-colors group-hover/card:text-gold" />
              </div>
              <p className="mt-2 text-sm leading-snug text-foreground/80 group-hover/card:text-foreground">
                {item.headline || "Headline will appear here"}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40 group-hover/card:text-gold transition-colors">
                Explore details
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
              </span>
            </button>
            <p className="mt-3 text-[11px] text-foreground/40">
              <Eye className="mr-1 inline h-3 w-3" />
              Click the card to preview the detail modal.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close preview
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Detail modal preview — mirrors src/pages/Index.tsx lines 505-555 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass border-gold/30 shadow-gold sm:max-w-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <DialogHeader className="space-y-3 pt-2 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {item.outlet}
            </p>
            <DialogTitle className="font-display text-2xl leading-snug md:text-3xl">
              {item.headline}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm leading-relaxed text-foreground/70">
            {item.context || (
              <span className="italic text-foreground/40">
                No context written yet — add one in the editor.
              </span>
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            {["Bangladesh", "National Press", "2023–2024 coverage"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] uppercase tracking-wider text-foreground/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-foreground/40 break-all">
            Article URL: {item.href || "— not set —"}
          </p>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="ghost" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
            {item.href && (
              <Button asChild variant="gold">
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  Read original
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
