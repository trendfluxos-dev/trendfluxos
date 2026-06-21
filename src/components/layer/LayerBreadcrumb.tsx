import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getNode, LAYER_META } from "@/config/siteLayers";

/**
 * Renders `Home › <Layer> › <Page>` across every non-home page.
 * Resolves crumbs from the central layer map so adding a route only
 * requires updating `siteLayers.ts`.
 */
const LayerBreadcrumb = () => {
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  const node = getNode(pathname);
  if (!node) return null;
  const meta = LAYER_META[node.layer];

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-24 pb-2 text-[12px] text-foreground/55"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        </li>
        <li aria-hidden><ChevronRight className="h-3 w-3 opacity-50" /></li>
        <li>
          <Link to={meta.hubPath} className="hover:text-foreground transition-colors uppercase tracking-[0.18em] text-[11px]">
            {meta.label}
          </Link>
        </li>
        <li aria-hidden><ChevronRight className="h-3 w-3 opacity-50" /></li>
        <li aria-current="page" className="text-foreground/85">{node.title}</li>
      </ol>
    </nav>
  );
};

export default LayerBreadcrumb;