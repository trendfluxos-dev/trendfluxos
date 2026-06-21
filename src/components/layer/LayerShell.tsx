import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LayerBreadcrumb from "./LayerBreadcrumb";
import LayerFlowNav from "./LayerFlowNav";
import EcosystemReturn from "./EcosystemReturn";
import { getNode } from "@/config/siteLayers";

/**
 * Mounts the layer-aware chrome (breadcrumb, flow nav, floating return)
 * once at the app root so every page gets it without per-page changes.
 *
 * Also forces `noindex,nofollow` on system routes so admin / dashboard /
 * settings never leak into search results.
 */
const LayerShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const node = getNode(pathname);
  const isSystem = node?.layer === "system" || node?.noindex;

  // Force `noindex,nofollow` on system routes imperatively so the signal
  // lands even if a page doesn't call useSeo(). We avoid calling useSeo()
  // here because the shared store would otherwise overwrite per-page SEO.
  useEffect(() => {
    if (!isSystem) return;
    const tag = document.querySelector('meta[name="robots"]');
    const prev = tag?.getAttribute("content");
    tag?.setAttribute("content", "noindex,nofollow");
    return () => { if (prev) tag?.setAttribute("content", prev); };
  }, [isSystem, pathname]);

  return (
    <>
      <LayerBreadcrumb />
      {children}
      <LayerFlowNav />
      <EcosystemReturn />
    </>
  );
};

export default LayerShell;