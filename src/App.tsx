import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import ThemeDebugPanel from "@/components/ThemeDebugPanel";
import PerfMonitor from "@/components/PerfMonitor";

import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "./lib/routes";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ScrollProgress";
import CommandPalette from "./components/CommandPalette";
import FloatingContact from "./components/social/FloatingContact";
import BrandSwitcher from "./components/social/BrandSwitcher";
import LuxeVeilGate from "./components/LuxeVeilGate";
import TelegramGroupPopup from "./components/TelegramGroupPopup";
import AccessRequestGate from "./components/AccessRequestGate";
import { BrandPreviewProvider } from "./context/BrandPreviewContext";
import { SeoHead } from "@/hooks/useSeo";

const queryClient = new QueryClient();

const Index = routes["/"];
const ProjectLead = routes["/project-lead"];
const Auth = routes["/auth"];
const Admin = routes["/admin"];
const LuxeVeilAdmin = routes["/admin/luxe-veil"];
const ConversionDashboard = routes["/admin/conversions"];
const EnterpriseDemos = routes["/admin/enterprise-demos"];
const CourseEnrollmentsAdmin = routes["/admin/course-enrollments"];
const PressDetail = routes["/press/:id"];
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
const NotFound = routes["*"];
const PerfCompare = import.meta.env.DEV ? (await import("./pages/PerfCompare")).default : null;

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
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
          <AccessRequestGate />
          {import.meta.env.DEV && <ThemeDebugPanel />}
          {import.meta.env.DEV && <PerfMonitor />}

          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project-lead" element={<ProjectLead />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/luxe-veil" element={<LuxeVeilAdmin />} />
            <Route path="/admin/conversions" element={<ConversionDashboard />} />
            <Route path="/admin/enterprise-demos" element={<EnterpriseDemos />} />
            <Route path="/admin/course-enrollments" element={<CourseEnrollmentsAdmin />} />
            <Route path="/press/:id" element={<PressDetail />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </BrandPreviewProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
