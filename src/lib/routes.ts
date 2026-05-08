import { lazy, ComponentType } from "react";

type Loader = () => Promise<{ default: ComponentType<any> }>;

const make = (loader: Loader) => {
  const Comp = lazy(loader);
  (Comp as any).preload = loader;
  return Comp as ReturnType<typeof lazy> & { preload: Loader };
};

export const routes = {
  "/": make(() => import("@/pages/Index")),
  "/project-lead": make(() => import("@/pages/ProjectLead")),
  "/auth": make(() => import("@/pages/Auth")),
  "/admin": make(() => import("@/pages/Admin")),
  "/admin/luxe-veil": make(() => import("@/pages/LuxeVeilAdmin")),
  "/admin/conversions": make(() => import("@/pages/ConversionDashboard")),
  "/marriage": make(() => import("@/pages/Marriage")),
  "/brand-open": make(() => import("@/pages/BrandOpen")),
  "/trendflux-talent": make(() => import("@/pages/TrendfluxTalent")),
  "/luxe-veil": make(() => import("@/pages/LuxeVeil")),
  "/brandtoki": make(() => import("@/pages/BrandToki")),
  "/portfolio": make(() => import("@/pages/Portfolio")),
  "/press/:id": make(() => import("@/pages/PressDetail")),
  "/case-studies/:slug": make(() => import("@/pages/CaseStudyPage")),
  "*": make(() => import("@/pages/NotFound")),
} as const;

export type RoutePath = keyof typeof routes;

export const preloadRoute = (path: string) => {
  // Match concrete + dynamic routes
  const exact = (routes as any)[path];
  if (exact?.preload) return exact.preload();
  // Dynamic match by prefix
  if (path.startsWith("/press/")) return routes["/press/:id"].preload();
  if (path.startsWith("/case-studies/")) return routes["/case-studies/:slug"].preload();
};

export type PageType = "Main" | "Brand" | "Admin" | "Account";

export const navigablePages: {
  label: string;
  path: string;
  type: PageType;
  keywords?: string;
}[] = [
  { label: "Home", path: "/", type: "Main", keywords: "index landing start" },
  { label: "Project Lead", path: "/project-lead", type: "Main", keywords: "lead form contact" },
  { label: "Marriage", path: "/marriage", type: "Main", keywords: "wedding" },
  { label: "Brand Open", path: "/brand-open", type: "Brand", keywords: "branding open mass public" },
  { label: "Trendflux Talent", path: "/trendflux-talent", type: "Brand", keywords: "careers talent platform" },
  { label: "Luxe Veil", path: "/luxe-veil", type: "Brand", keywords: "wedding luxe private invite" },
  { label: "Studio BrandToki", path: "/brandtoki", type: "Brand", keywords: "studio production photography videography podcast gulshan" },
  { label: "Portfolio — Zahid Hasan Emon", path: "/portfolio", type: "Brand", keywords: "resume cv portfolio executive zahid emon brand architect" },
  { label: "Admin", path: "/admin", type: "Admin", keywords: "dashboard manage" },
  { label: "Luxe Veil Admin", path: "/admin/luxe-veil", type: "Admin", keywords: "admin luxe manage" },
  { label: "Sign In", path: "/auth", type: "Account", keywords: "login auth signin" },
];