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
  "/admin/enterprise-demos": make(() => import("@/pages/EnterpriseDemos")),
  "/admin/course-enrollments": make(() => import("@/pages/CourseEnrollmentsAdmin")),
  "/admin/uptime": make(() => import("@/pages/UptimeAdmin")),
  "/admin/errors": make(() => import("@/pages/ErrorLogsAdmin")),
  "/marriage": make(() => import("@/pages/Marriage")),
  "/the-stand": make(() => import("@/pages/TheStand")),
  "/brand-open": make(() => import("@/pages/BrandOpen")),
  "/trendflux-talent": make(() => import("@/pages/TrendfluxTalent")),
  "/luxe-veil": make(() => import("@/pages/LuxeVeil")),
  "/brandtoki": make(() => import("@/pages/BrandToki")),
  "/portfolio": make(() => import("@/pages/Portfolio")),
  "/enterprise": make(() => import("@/pages/Enterprise")),
  "/toolkit": make(() => import("@/pages/Toolkit")),
  "/course/trendflux": make(() => import("@/pages/CourseTrendflux")),
  "/masterclass": make(() => import("@/pages/Masterclass")),
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
  { label: "The Stand — Zahid Hasan Emon", path: "/the-stand", type: "Main", keywords: "zahid emon jahid hasan jabi torture cell whistleblower mayer nishedh ache integrity stand story" },
  { label: "Project Lead", path: "/project-lead", type: "Main", keywords: "lead form contact" },
  { label: "Marriage", path: "/marriage", type: "Main", keywords: "wedding" },
  { label: "Brand Open", path: "/brand-open", type: "Brand", keywords: "branding open mass public" },
  { label: "Trendflux Talent", path: "/trendflux-talent", type: "Brand", keywords: "careers talent platform" },
  { label: "Luxe Veil", path: "/luxe-veil", type: "Brand", keywords: "wedding luxe private invite" },
  { label: "Studio BrandToki", path: "/brandtoki", type: "Brand", keywords: "studio production photography videography podcast gulshan" },
  { label: "Portfolio — Zahid Hasan Emon", path: "/portfolio", type: "Brand", keywords: "resume cv portfolio executive zahid emon brand architect" },
  { label: "Enterprise Control", path: "/enterprise", type: "Brand", keywords: "enterprise control portal erp dashboard automation compliance audit" },
  { label: "Growth Operator Toolkit Hub", path: "/toolkit", type: "Brand", keywords: "toolkit hub execution system modules prompt library automation portfolio growth operator" },
  { label: "Advanced AI Masterclass", path: "/masterclass", type: "Brand", keywords: "masterclass ai course growth operator automation income system training apply" },
  { label: "Admin", path: "/admin", type: "Admin", keywords: "dashboard manage" },
  { label: "Luxe Veil Admin", path: "/admin/luxe-veil", type: "Admin", keywords: "admin luxe manage" },
  { label: "Enterprise Demo Requests", path: "/admin/enterprise-demos", type: "Admin", keywords: "admin demos enterprise leads requests triage" },
  { label: "Course Enrollments", path: "/admin/course-enrollments", type: "Admin", keywords: "admin course enrollments telegram bkash trx timeline" },
  { label: "Uptime Monitor", path: "/admin/uptime", type: "Admin", keywords: "uptime monitor status health probe alert downtime telegram" },
  { label: "Sign In", path: "/auth", type: "Account", keywords: "login auth signin" },
];