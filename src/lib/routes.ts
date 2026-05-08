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
  "/marriage": make(() => import("@/pages/Marriage")),
  "/brand-open": make(() => import("@/pages/BrandOpen")),
  "/trendflux-talent": make(() => import("@/pages/TrendfluxTalent")),
  "/luxe-veil": make(() => import("@/pages/LuxeVeil")),
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

export const navigablePages: { label: string; path: string; keywords?: string }[] = [
  { label: "Home", path: "/", keywords: "index landing" },
  { label: "Project Lead", path: "/project-lead", keywords: "lead form" },
  { label: "Marriage", path: "/marriage", keywords: "wedding" },
  { label: "Brand Open", path: "/brand-open", keywords: "branding" },
  { label: "Trendflux Talent", path: "/trendflux-talent", keywords: "careers talent" },
  { label: "Luxe Veil", path: "/luxe-veil", keywords: "wedding luxe" },
  { label: "Admin", path: "/admin", keywords: "dashboard" },
  { label: "Luxe Veil Admin", path: "/admin/luxe-veil", keywords: "admin" },
  { label: "Sign In", path: "/auth", keywords: "login auth" },
];