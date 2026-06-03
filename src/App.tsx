import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import ThemeDebugPanel from "@/components/ThemeDebugPanel";
import PerfMonitor from "@/components/PerfMonitor";
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

const queryClient = new QueryClient();

const Index = routes["/"];
const Ecosystem = routes["/ecosystem"];
const ServicesPage = routes["/services"];
const AboutPage = routes["/about"];
const ContactPage = routes["/contact"];
const Explore = routes["/explore"];
const ProjectLead = routes["/project-lead"];
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
          {import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("perf") && <ThemeDebugPanel />}
          {import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("perf") && <PerfMonitor />}
          <OverflowDetector />



          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ecosystem" element={<Ecosystem />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/project-lead" element={<ProjectLead />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/luxe-veil" element={<LuxeVeilAdmin />} />
            <Route path="/admin/conversions" element={<ConversionDashboard />} />
            <Route path="/admin/enterprise-demos" element={<EnterpriseDemos />} />
            <Route path="/admin/course-enrollments" element={<CourseEnrollmentsAdmin />} />
            <Route path="/admin/uptime" element={<UptimeAdmin />} />
            <Route path="/admin/errors" element={<ErrorLogsAdmin />} />
            <Route path="/admin/web-vitals" element={<WebVitalsAdmin />} />
            <Route path="/admin/ga4-check" element={<Ga4Check />} />
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
            {PerfCompare && <Route path="/dev/perf-compare" element={<PerfCompare />} />}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </BrandPreviewProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
  </SentryErrorBoundary>
);

export default App;
