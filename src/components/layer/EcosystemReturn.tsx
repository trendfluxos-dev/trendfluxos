import { Link, useLocation } from "react-router-dom";
import { Network } from "lucide-react";
import { getLayer } from "@/config/siteLayers";

/**
 * Floating bottom-right pill that returns the user to the ecosystem hub.
 * Shown on founder + brand layers (the "outer rings"). Hidden on
 * company + system pages where it would be redundant or noisy.
 */
const EcosystemReturn = () => {
  const { pathname } = useLocation();
  const layer = getLayer(pathname);
  if (!layer || layer === "company" || layer === "system") return null;

  return (
    <Link
      to="/ecosystem"
      aria-label="Back to ecosystem"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/85 backdrop-blur px-3.5 py-2 text-[12px] font-medium text-foreground/85 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] hover:text-foreground hover:border-foreground/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Network className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline">Back to Ecosystem</span>
      <span className="sm:hidden">Ecosystem</span>
    </Link>
  );
};

export default EcosystemReturn;