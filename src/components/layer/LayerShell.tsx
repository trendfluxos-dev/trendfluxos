import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LayerBreadcrumb from "./LayerBreadcrumb";
import LayerFlowNav from "./LayerFlowNav";
import EcosystemReturn from "./EcosystemReturn";
import { useSeo } from "@/hooks/useSeo";
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

  // Apply system-layer SEO defaults. Page-level useSeo() calls still win
  // because they re-set state after this effect.
  useSeo(isSystem ? { noindex: true } : {});

  // Belt-and-suspenders: also set the robots meta imperatively so any
  // page that forgets to call useSeo() still gets the right signal.
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