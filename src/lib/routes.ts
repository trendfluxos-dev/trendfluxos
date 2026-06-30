import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { SITE_LAYERS, type Layer } from "@/config/siteLayers";

// Route components have no public props (React Router passes none) — accept
// any component shape so each page can declare whatever internal props it
// likes, but still avoid `any` for the loader signature itself.
type AnyComponent = ComponentType<Record<string, unknown>>;
type Loader = () => Promise<{ default: AnyComponent }>;
type PreloadableLazy = LazyExoticComponent<AnyComponent> & { preload: Loader };

const make = (loader: Loader): PreloadableLazy => {
  const Comp = lazy(loader) as PreloadableLazy;
  Comp.preload = loader;
  return Comp;
};

export const routes = {
  "/": make(() => import("@/pages/Index")),
  "/ecosystem": make(() => import("@/pages/Ecosystem")),
  "/services": make(() => import("@/pages/Services")),
  "/about": make(() => import("@/pages/About")),
  "/contact": make(() => import("@/pages/Contact")),
  "/explore": make(() => import("@/pages/Explore")),
  "/project-lead": make(() => import("@/pages/ProjectLead")),
  "/showcase": make(() => import("@/pages/Showcase")),
  "/research/:slug": make(() => import("@/pages/ResearchDetail")),
  "/implementations/:slug": make(() => import("@/pages/ResearchDetail")),
  "/auth": make(() => import("@/pages/Auth")),
  "/dashboard": make(() => import("@/pages/Dashboard")),
  "/admin": make(() => import("@/pages/Admin")),
  "/admin/luxe-veil": make(() => import("@/pages/LuxeVeilAdmin")),
  "/admin/conversions": make(() => import("@/pages/ConversionDashboard")),
  "/admin/enterprise-demos": make(() => import("@/pages/EnterpriseDemos")),
  "/admin/course-enrollments": make(() => import("@/pages/CourseEnrollmentsAdmin")),
  "/admin/uptime": make(() => import("@/pages/UptimeAdmin")),
  "/admin/errors": make(() => import("@/pages/ErrorLogsAdmin")),
  "/admin/web-vitals": make(() => import("@/pages/WebVitalsAdmin")),
  "/admin/ga4-check": make(() => import("@/pages/Ga4Check")),
  "/admin/secrets-health": make(() => import("@/pages/SecretsHealthAdmin")),
  "/admin/telegram-tests": make(() => import("@/pages/TelegramTestLogsAdmin")),
  "/admin/security-audit": make(() => import("@/pages/SecurityAuditAdmin")),
  "/marriage": make(() => import("@/pages/Marriage")),
  "/the-stand": make(() => import("@/pages/TheStand")),
  "/the-stand/share": make(() => import("@/pages/TheStandShare")),
  "/quiet-positions": make(() => import("@/pages/QuietPositions")),
  "/brand-open": make(() => import("@/pages/BrandOpen")),
  "/trendflux-talent": make(() => import("@/pages/TrendfluxTalent")),
  "/luxe-veil": make(() => import("@/pages/LuxeVeil")),
  "/brandtoki": make(() => import("@/pages/BrandToki")),
  "/portfolio": make(() => import("@/pages/Portfolio")),
  "/enterprise": make(() => import("@/pages/Enterprise")),
  "/toolkit": make(() => import("@/pages/Toolkit")),
  "/course/trendflux": make(() => import("@/pages/CourseTrendflux")),
  "/masterclass": make(() => import("@/pages/Masterclass")),
  "/edtech": make(() => import("@/pages/edtech/EdtechHome")),
  "/class/:token": make(() => import("@/pages/edtech/ClassByToken")),
  "/edtech/courses": make(() => import("@/pages/edtech/EdtechCourses")),
  "/edtech/courses/:slug": make(() => import("@/pages/edtech/EdtechCourseDetail")),
  "/edtech/enroll/:slug": make(() => import("@/pages/edtech/EdtechEnroll")),
  "/edtech/pricing": make(() => import("@/pages/edtech/EdtechPricing")),
  "/edtech/certificate": make(() => import("@/pages/edtech/EdtechCertificate")),
  "/edtech/certificate/:slug": make(() => import("@/pages/edtech/EdtechCertificate")),
  "/edtech/verify": make(() => import("@/pages/edtech/EdtechVerify")),
  "/edtech/my-learning": make(() => import("@/pages/edtech/EdtechMyLearning")),
  "/edtech/learn/:slug": make(() => import("@/pages/edtech/EdtechLessonPlayer")),
  "/edtech/learn/:slug/:lessonN": make(() => import("@/pages/edtech/EdtechLessonPlayer")),
  "/edtech/live": make(() => import("@/pages/edtech/EdtechLive")),
  "/edtech/live/studio/:id": make(() => import("@/pages/edtech/EdtechLiveStudio")),
  "/edtech/live/watch/:id": make(() => import("@/pages/edtech/EdtechLiveWatch")),
  "/edtech/my-classes": make(() => import("@/pages/edtech/EdtechMyClasses")),
  "/class-recording/:token": make(() => import("@/pages/edtech/ClassRecording")),
  "/admin/edtech/live": make(() => import("@/pages/EdtechLiveAdmin")),
  // Teacher workspace
  "/edtech/teach/onboarding": make(() => import("@/pages/edtech/EdtechTeachOnboarding")),
  "/edtech/teach/classes": make(() => import("@/pages/edtech/EdtechTeachClasses")),
  "/edtech/teach/bookings": make(() => import("@/pages/edtech/EdtechTeachBookings")),
  // Tutor marketplace
  "/edtech/tutors": make(() => import("@/pages/edtech/EdtechTutors")),
  "/edtech/tutors/:id": make(() => import("@/pages/edtech/EdtechTutorProfile")),
  "/edtech/tutors/:id/book": make(() => import("@/pages/edtech/EdtechTutorBook")),
  "/edtech/me/bookings": make(() => import("@/pages/edtech/EdtechMyBookings")),
  "/edtech/voice-notes": make(() => import("@/pages/edtech/VoiceNotes")),
  "/edtech/teach/voice-studio": make(() => import("@/pages/edtech/VoiceStudio")),
  "/voice-clone": make(() => import("@/pages/VoiceClone")),
  "/voice-clone/deploy": make(() => import("@/pages/VoiceCloneDeploy")),
  "/press/:id": make(() => import("@/pages/PressDetail")),
  "/case-studies/:slug": make(() => import("@/pages/CaseStudyPage")),
  "/justice-appeal": make(() => import("@/pages/JusticeAppeal")),
  "/media-reports": make(() => import("@/pages/MediaReports")),
  "/share-kit": make(() => import("@/pages/ShareKit")),
  "/stories/ai-expert-emon": make(() => import("@/pages/StoryAiExpertEmon")),
  "/trust": make(() => import("@/pages/Trust")),
  "/settings": make(() => import("@/pages/Settings")),
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
  if (path.startsWith("/research/")) return routes["/research/:slug"].preload();
  if (path.startsWith("/implementations/")) return routes["/implementations/:slug"].preload();
  if (path.startsWith("/edtech/enroll/")) return routes["/edtech/enroll/:slug"].preload();
  if (path.startsWith("/edtech/courses/")) return routes["/edtech/courses/:slug"].preload();
};

export type PageType = "Main" | "Brand" | "Admin" | "Account";

export type NavigablePage = {
  label: string;
  path: string;
  type: PageType;
  keywords?: string;
};

// Per-path overrides: search keywords, custom labels, and `type` mapping
// for routes that don't follow the default layer → type mapping.
// Paths NOT present in SITE_LAYERS (e.g. /showcase, /the-stand/share) are
// added via `EXTRA_PAGES` below.
const PAGE_META: Record<string, { label?: string; keywords?: string; type?: PageType }> = {
  "/":                         { keywords: "index landing start" },
  "/explore":                  { label: "Browse all pages", keywords: "sitemap browse explore directory map all pages navigation" },
  "/the-stand":                { label: "The Stand — Zahid Hasan Emon", keywords: "zahid emon jahid hasan jabi torture cell whistleblower mayer nishedh ache integrity stand story" },
  "/project-lead":             { keywords: "lead form contact" },
  "/stories/ai-expert-emon":   { label: "Audio Story — এআই বিশেষজ্ঞ ইমন", keywords: "audio story ai expert emon zahid hasan narrative voice note bangla" },
  "/marriage":                 { keywords: "wedding" },
  "/trendflux-talent":         { keywords: "careers talent platform" },
  "/luxe-veil":                { label: "Luxe Veil", keywords: "wedding luxe private invite" },
  "/brandtoki":                { label: "Studio BrandToki", keywords: "studio production photography videography podcast gulshan" },
  "/portfolio":                { label: "Portfolio — Zahid Hasan Emon", keywords: "resume cv portfolio executive zahid emon brand architect" },
  "/enterprise":               { label: "Enterprise Control", keywords: "enterprise control portal erp dashboard automation compliance audit" },
  "/toolkit":                  { label: "Growth Operator Toolkit Hub", keywords: "toolkit hub execution system modules prompt library automation portfolio growth operator" },
  "/masterclass":              { label: "Advanced AI Masterclass", keywords: "masterclass ai course growth operator automation income system training apply" },
  "/auth":                     { label: "Sign In", keywords: "login auth signin" },
  "/dashboard":                { keywords: "dashboard hub account home enrollments luxe veil admin" },
  "/settings":                 { label: "Site Settings", keywords: "settings preferences autoplay reduced motion accessibility audio chapter" },
  "/admin":                    { keywords: "dashboard manage" },
  // System layer → split into Account vs. Admin for the explore UI.
  "/admin/luxe-veil":          { label: "Luxe Veil Admin", type: "Admin", keywords: "admin luxe manage" },
};

// Pages discoverable in /explore + ⌘K that aren't part of the 4-layer map
// (one-off utility routes, admin sub-routes, etc.).
const EXTRA_PAGES: NavigablePage[] = [
  { label: "The Stand — Share Quote Cards", path: "/the-stand/share", type: "Main", keywords: "share quote card facebook instagram story generator the stand zahid emon mayer nishedh ache" },
  { label: "Showcase — Zahid Hasan Emon", path: "/showcase", type: "Main", keywords: "showcase portfolio work brands websites enterprise systems social platforms initiatives zahid emon" },
  { label: "Brand Open", path: "/brand-open", type: "Brand", keywords: "branding open mass public" },
  { label: "Enterprise Demo Requests", path: "/admin/enterprise-demos", type: "Admin", keywords: "admin demos enterprise leads requests triage" },
  { label: "Course Enrollments", path: "/admin/course-enrollments", type: "Admin", keywords: "admin course enrollments telegram bkash trx timeline" },
  { label: "Uptime Monitor", path: "/admin/uptime", type: "Admin", keywords: "uptime monitor status health probe alert downtime telegram" },
  { label: "Client Error Logs", path: "/admin/errors", type: "Admin", keywords: "errors runtime client logs sentry stack trace" },
  { label: "Web Vitals", path: "/admin/web-vitals", type: "Admin", keywords: "performance web vitals lcp inp cls fcp ttfb speed core" },
];

// Default mapping from the 4-layer architecture to the legacy PageType
// taxonomy used by /explore + ⌘K. `system` is split between Account and
// Admin via `PAGE_META` overrides — by default system routes are Account.
const LAYER_TO_TYPE: Record<Layer, PageType> = {
  company: "Main",
  founder: "Main",
  brand:   "Brand",
  system:  "Account",
};

const derived: NavigablePage[] = SITE_LAYERS.filter((n) => !n.external).map((node) => {
  const meta = PAGE_META[node.path] ?? {};
  return {
    path: node.path,
    label: meta.label ?? node.title,
    type: meta.type ?? LAYER_TO_TYPE[node.layer],
    keywords: meta.keywords,
  };
});

export const navigablePages: NavigablePage[] = [...derived, ...EXTRA_PAGES];