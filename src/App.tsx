import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import OverflowDetector from "@/components/dev/OverflowDetector";


import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "./lib/routes";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ScrollProgress";
import CommandPalette from "./components/CommandPalette";
import FloatingContact from "./components/social/FloatingContact";
import BrandSwitcher from "./components/social/BrandSwitcher";
import LuxeVeilGate from "./components/LuxeVeilGate";
import TelegramGroupPopup from "./components/TelegramGroupPopup";
import ConsentBannerGate from "./components/ConsentBannerGate";
import AccessRequestGate from "./components/AccessRequestGate";
import { BrandPreviewProvider } from "./context/BrandPreviewContext";
import { SeoHead } from "@/hooks/useSeo";
import { SentryErrorBoundary } from "@/lib/sentry";
import RequireRole from "@/components/auth/RequireRole";

// Dev-only diagnostic panels. They are heavy and only ever rendered when
// `?perf` is in the URL during development, so we code-split them out of the
// production bundle entirely and lazy-load on demand.
const ThemeDebugPanel = import.meta.env.DEV
  ? lazy(() => import("@/components/ThemeDebugPanel"))
  : null;
const PerfMonitor = import.meta.env.DEV
  ? lazy(() => import("@/components/PerfMonitor"))
  : null;

const queryClient = new QueryClient();

const Index = routes["/"];
const Ecosystem = routes["/ecosystem"];
const ServicesPage = routes["/services"];
const AboutPage = routes["/about"];
const ContactPage = routes["/contact"];
const Explore = routes["/explore"];
const ProjectLead = routes["/project-lead"];
const Showcase = routes["/showcase"];
const ResearchDetail = routes["/research/:slug"];
const ImplementationDetail = routes["/implementations/:slug"];
const Auth = routes["/auth"];
const Dashboard = routes["/dashboard"];
const Admin = routes["/admin"];
const LuxeVeilAdmin = routes["/admin/luxe-veil"];
const ConversionDashboard = routes["/admin/conversions"];
const EnterpriseDemos = routes["/admin/enterprise-demos"];
const CourseEnrollmentsAdmin = routes["/admin/course-enrollments"];
const UptimeAdmin = routes["/admin/uptime"];
const ErrorLogsAdmin = routes["/admin/errors"];
const WebVitalsAdmin = routes["/admin/web-vitals"];
const Ga4Check = routes["/admin/ga4-check"];
const SecretsHealthAdmin = routes["/admin/secrets-health"];
const PressDetail = routes["/press/:id"];
const TheStand = routes["/the-stand"];
const TheStandShare = routes["/the-stand/share"];
const QuietPositions = routes["/quiet-positions"];
const Marriage = routes["/marriage"];
const BrandOpen = routes["/brand-open"];
const TrendfluxTalent = routes["/trendflux-talent"];
const LuxeVeil = routes["/luxe-veil"];
const BrandToki = routes["/brandtoki"];
const Portfolio = routes["/portfolio"];
const Enterprise = routes["/enterprise"];
const Toolkit = routes["/toolkit"];
const CourseTrendflux = routes["/course/trendflux"];
const Masterclass = routes["/masterclass"];
const CaseStudyPage = routes["/case-studies/:slug"];
const JusticeAppeal = routes["/justice-appeal"];
const MediaReports = routes["/media-reports"];
const ShareKit = routes["/share-kit"];
const StoryAiExpertEmon = routes["/stories/ai-expert-emon"];
const NotFound = routes["*"];
const PerfCompare = import.meta.env.DEV ? lazy(() => import("./pages/PerfCompare")) : null;

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <SentryErrorBoundary
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We've been notified and are looking into it. Try refreshing the page.
          </p>
        </div>
      </div>
    }
  >
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BrandPreviewProvider>
          <SeoHead />
          <ScrollToTop />
          <ScrollProgress />
          <CommandPalette />
          <FloatingContact />
          <BrandSwitcher />
          <LuxeVeilGate />
          <TelegramGroupPopup />
          <ConsentBannerGate />
          <AccessRequestGate />
          {ThemeDebugPanel && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("perf") && (
            <Suspense fallback={null}>
              <ThemeDebugPanel />
            </Suspense>
          )}
          {PerfMonitor && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("perf") && (
            <Suspense fallback={null}>
              <PerfMonitor />
            </Suspense>
          )}
          <OverflowDetector />



          <Suspense fallback={<PageFallback />}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus-visible:outline-none"
          >
            Skip to main content
          </a>
          <div id="main-content" tabIndex={-1} className="outline-none">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ecosystem" element={<Ecosystem />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/project-lead" element={<ProjectLead />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/research/:slug" element={<ResearchDetail />} />
            <Route path="/implementations/:slug" element={<ImplementationDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<RequireRole roles={["admin", "editor"]}><Admin /></RequireRole>} />
            <Route path="/admin/luxe-veil" element={<RequireRole roles={["admin"]}><LuxeVeilAdmin /></RequireRole>} />
            <Route path="/admin/conversions" element={<RequireRole roles={["admin"]}><ConversionDashboard /></RequireRole>} />
            <Route path="/admin/enterprise-demos" element={<RequireRole roles={["admin"]}><EnterpriseDemos /></RequireRole>} />
            <Route path="/admin/course-enrollments" element={<RequireRole roles={["admin"]}><CourseEnrollmentsAdmin /></RequireRole>} />
            <Route path="/admin/uptime" element={<RequireRole roles={["admin"]}><UptimeAdmin /></RequireRole>} />
            <Route path="/admin/errors" element={<RequireRole roles={["admin"]}><ErrorLogsAdmin /></RequireRole>} />
            <Route path="/admin/web-vitals" element={<RequireRole roles={["admin"]}><WebVitalsAdmin /></RequireRole>} />
            <Route path="/admin/ga4-check" element={<RequireRole roles={["admin"]}><Ga4Check /></RequireRole>} />
            <Route path="/admin/secrets-health" element={<RequireRole roles={["admin"]}><SecretsHealthAdmin /></RequireRole>} />
            <Route path="/press/:id" element={<PressDetail />} />
            <Route path="/the-stand" element={<TheStand />} />
            <Route path="/the-stand/share" element={<TheStandShare />} />
            <Route path="/quiet-positions" element={<QuietPositions />} />
            <Route path="/marriage" element={<Marriage />} />
            <Route path="/brand-open" element={<BrandOpen />} />
            <Route path="/trendflux-talent" element={<TrendfluxTalent />} />
            <Route path="/luxe-veil" element={<LuxeVeil />} />
            <Route path="/brandtoki" element={<BrandToki />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/toolkit" element={<Toolkit />} />
            <Route path="/course/trendflux" element={<CourseTrendflux />} />
            <Route path="/masterclass" element={<Masterclass />} />
            <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
            <Route path="/justice-appeal" element={<JusticeAppeal />} />
            <Route path="/media-reports" element={<MediaReports />} />
            <Route path="/share-kit" element={<ShareKit />} />
            <Route path="/stories/ai-expert-emon" element={<StoryAiExpertEmon />} />
            {PerfCompare && <Route path="/dev/perf-compare" element={<PerfCompare />} />}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </Suspense>
        </BrandPreviewProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
  </SentryErrorBoundary>
);

export default App;
