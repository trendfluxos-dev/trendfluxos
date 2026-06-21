/**
 * Single source of truth for the 4-layer site architecture:
 *   company  -> business identity, services, discovery
 *   founder  -> Zahid / Emon narrative, trust, authority
 *   brand    -> revenue-generating product ecosystem
 *   system   -> backend / account (noindex)
 *
 * Used by Navbar (mega-menu), Footer (4 columns), LayerBreadcrumb,
 * LayerFlowNav, EcosystemReturn, and SEO defaults.
 */
export type Layer = "company" | "founder" | "brand" | "system";

export interface LayerNode {
  path: string;
  title: string;
  layer: Layer;
  /** Short blurb shown in the mega-menu. Keep under ~80 chars. */
  blurb?: string;
  /** Sibling paths for prev/next within the layer flow. */
  siblings?: string[];
  /** Recommended cross-layer next step. */
  ctaNext?: { path: string; label: string };
  /** Also surface this node in another layer's nav (e.g. portfolio). */
  alsoIn?: Layer[];
  noindex?: boolean;
}

export const LAYER_META: Record<Layer, { label: string; tagline: string; hubPath: string }> = {
  company: { label: "Company",  tagline: "The brain — services + identity",      hubPath: "/ecosystem" },
  founder: { label: "Founder",  tagline: "The trust — Zahid / Emon narrative",   hubPath: "/trust" },
  brand:   { label: "Brands",   tagline: "The revenue — product ecosystem",      hubPath: "/ecosystem" },
  system:  { label: "System",   tagline: "The control — admin + account",        hubPath: "/dashboard" },
};

// Ordered flow within each layer (used for prev/next).
const COMPANY_FLOW = ["/", "/explore", "/ecosystem", "/services", "/enterprise", "/toolkit", "/contact"];
const FOUNDER_FLOW = ["/project-lead", "/portfolio", "/the-stand", "/quiet-positions", "/justice-appeal", "/media-reports", "/stories/ai-expert-emon", "/trust"];
const BRAND_FLOW   = ["/luxe-veil", "/brandtoki", "/trendflux-talent", "/marriage", "/portfolio", "/edtech", "/masterclass", "/course/trendflux"];

export const SITE_LAYERS: LayerNode[] = [
  // ---------- COMPANY ----------
  { path: "/",           title: "Home",        layer: "company", blurb: "The Trendflux Digital hub",            siblings: COMPANY_FLOW, ctaNext: { path: "/trust", label: "Meet the founder" } },
  { path: "/explore",    title: "Explore",     layer: "company", blurb: "Browse every page in the system",      siblings: COMPANY_FLOW },
  { path: "/ecosystem",  title: "Ecosystem",   layer: "company", blurb: "How the four layers connect",          siblings: COMPANY_FLOW },
  { path: "/services",   title: "Services",    layer: "company", blurb: "AI automation, paid media, CRM, brand", siblings: COMPANY_FLOW },
  { path: "/enterprise", title: "Enterprise",  layer: "company", blurb: "Control portal for enterprise teams",  siblings: COMPANY_FLOW },
  { path: "/toolkit",    title: "Toolkit",     layer: "company", blurb: "Growth operator execution modules",    siblings: COMPANY_FLOW },
  { path: "/contact",    title: "Contact",     layer: "company", blurb: "Start a conversation",                 siblings: COMPANY_FLOW, ctaNext: { path: "/project-lead", label: "Lead a project" } },

  // ---------- FOUNDER ----------
  { path: "/project-lead",            title: "Project Lead",    layer: "founder", blurb: "Zahid as the operator behind the system", siblings: FOUNDER_FLOW },
  { path: "/portfolio",               title: "Portfolio",       layer: "founder", blurb: "Full professional identity",              siblings: FOUNDER_FLOW, alsoIn: ["brand"] },
  { path: "/the-stand",               title: "The Stand",       layer: "founder", blurb: "Philosophy and integrity stance",         siblings: FOUNDER_FLOW },
  { path: "/quiet-positions",         title: "Quiet Positions", layer: "founder", blurb: "Personal thoughts and reflections",       siblings: FOUNDER_FLOW },
  { path: "/justice-appeal",          title: "Justice Appeal",  layer: "founder", blurb: "Belief system and ethical stance",        siblings: FOUNDER_FLOW },
  { path: "/media-reports",           title: "Media Reports",   layer: "founder", blurb: "Public perception coverage",              siblings: FOUNDER_FLOW },
  { path: "/stories/ai-expert-emon",  title: "AI Expert Emon",  layer: "founder", blurb: "Identity evolution story",                siblings: FOUNDER_FLOW },
  { path: "/trust",                   title: "Trust",           layer: "founder", blurb: "Credibility and validation layer",        siblings: FOUNDER_FLOW, ctaNext: { path: "/contact", label: "Work with us" } },

  // ---------- BRAND ----------
  { path: "/luxe-veil",         title: "Luxe Veil",        layer: "brand", blurb: "Invite-only luxury weddings",          siblings: BRAND_FLOW },
  { path: "/brandtoki",         title: "Studio BrandToki", layer: "brand", blurb: "Production studio in Gulshan",         siblings: BRAND_FLOW },
  { path: "/trendflux-talent",  title: "Trendflux Talent", layer: "brand", blurb: "Careers and talent platform",          siblings: BRAND_FLOW },
  { path: "/marriage",          title: "Marriage",         layer: "brand", blurb: "Marriage planning service",            siblings: BRAND_FLOW },
  { path: "/masterclass",       title: "Masterclass",      layer: "brand", blurb: "Advanced AI masterclass",              siblings: BRAND_FLOW },
  { path: "/edtech",            title: "KormoShikkha",     layer: "brand", blurb: "TrendFlux's online EdTech platform",   siblings: BRAND_FLOW, ctaNext: { path: "/masterclass", label: "See the masterclass" } },
  { path: "/course/trendflux",  title: "Trendflux Course", layer: "brand", blurb: "Growth operator course",               siblings: BRAND_FLOW, ctaNext: { path: "/ecosystem", label: "Back to ecosystem" } },

  // ---------- SYSTEM ----------
  { path: "/auth",      title: "Sign In",       layer: "system", blurb: "Account access",            noindex: true },
  { path: "/dashboard", title: "Dashboard",     layer: "system", blurb: "Your hub once signed in",    noindex: true },
  { path: "/settings",  title: "Site Settings", layer: "system", blurb: "Preferences and a11y",       noindex: true },
  { path: "/admin",     title: "Admin",         layer: "system", blurb: "Operator dashboard",         noindex: true },
];

const NODE_BY_PATH = new Map(SITE_LAYERS.map((n) => [n.path, n]));

export const getNode = (path: string): LayerNode | undefined => {
  if (NODE_BY_PATH.has(path)) return NODE_BY_PATH.get(path);
  // Admin sub-routes all live in the system layer.
  if (path.startsWith("/admin/")) {
    return { path, title: "Admin", layer: "system", noindex: true };
  }
  return undefined;
};

export const getLayer = (path: string): Layer | undefined => getNode(path)?.layer;

export const nodesByLayer = (layer: Layer, opts: { includeAlsoIn?: boolean } = {}) => {
  const main = SITE_LAYERS.filter((n) => n.layer === layer);
  if (!opts.includeAlsoIn) return main;
  const extras = SITE_LAYERS.filter((n) => n.layer !== layer && n.alsoIn?.includes(layer));
  return [...main, ...extras];
};

/** prev/next within the layer flow for a given path. */
export const getFlowNeighbors = (path: string) => {
  const node = getNode(path);
  if (!node?.siblings) return { prev: undefined, next: undefined };
  const idx = node.siblings.indexOf(path);
  if (idx === -1) return { prev: undefined, next: undefined };
  const prevPath = idx > 0 ? node.siblings[idx - 1] : undefined;
  const nextPath = idx < node.siblings.length - 1 ? node.siblings[idx + 1] : undefined;
  return {
    prev: prevPath ? getNode(prevPath) : undefined,
    next: nextPath ? getNode(nextPath) : undefined,
  };
};