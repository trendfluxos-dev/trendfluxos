import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getNode, getFlowNeighbors, LAYER_META } from "@/config/siteLayers";

/**
 * Page-bottom contextual prev/next bar.
 * Reads `siblings` + `ctaNext` from the layer map so each page
 * automatically gets logical forward/back navigation without per-page code.
 */
const LayerFlowNav = () => {
  const { pathname } = useLocation();
  const node = getNode(pathname);
  if (!node || node.layer === "system" || pathname === "/") return null;

  const { prev, next } = getFlowNeighbors(pathname);
  const cta = node.ctaNext;
  const meta = LAYER_META[node.layer];

  // Don't render an empty bar.
  if (!prev && !next && !cta) return null;

  return (
    <section
      aria-label={`${meta.label} layer navigation`}
      data-layer-chrome
      className="border-t border-border/60 mt-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 grid gap-4 sm:grid-cols-3">
        <div>
          {prev && (
            <Link
              to={prev.path}
              className="group inline-flex items-start gap-2 rounded-xl border border-border/50 bg-background/30 px-4 py-3 hover:border-foreground/30 transition-colors w-full"
            >
              <ArrowLeft className="h-4 w-4 mt-0.5 text-foreground/55 group-hover:text-foreground transition-colors" />
              <span className="flex flex-col">
                <span className="text-[10.5px] uppercase tracking-[0.2em] text-foreground/45">Previous</span>
                <span className="text-[13.5px] text-foreground/85">{prev.title}</span>
              </span>
            </Link>
          )}
        </div>

        <div className="sm:text-center text-[11px] uppercase tracking-[0.22em] text-foreground/45 self-center">
          {meta.label} · {meta.tagline}
        </div>

        <div className="sm:text-right space-y-2">
          {next && (
            <Link
              to={next.path}
              className="group inline-flex items-start gap-2 rounded-xl border border-border/50 bg-background/30 px-4 py-3 hover:border-foreground/30 transition-colors w-full sm:justify-end"
            >
              <span className="flex flex-col sm:text-right">
                <span className="text-[10.5px] uppercase tracking-[0.2em] text-foreground/45">Next</span>
                <span className="text-[13.5px] text-foreground/85">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 mt-0.5 text-foreground/55 group-hover:text-foreground transition-colors" />
            </Link>
          )}
          {cta && (
            <Link
              to={cta.path}
              className="inline-flex items-center gap-1.5 text-[12px] text-foreground/65 hover:text-foreground transition-colors"
            >
              {cta.label} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default LayerFlowNav;