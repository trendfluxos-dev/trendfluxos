import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import ThemeDebugPanel from "@/components/ThemeDebugPanel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "./lib/routes";
import ScrollToTop from "./components/ScrollToTop";
import CommandPalette from "./components/CommandPalette";
import FloatingContact from "./components/social/FloatingContact";
import BrandSwitcher from "./components/social/BrandSwitcher";
import { BrandPreviewProvider } from "./context/BrandPreviewContext";

const queryClient = new QueryClient();

const Index = routes["/"];
const ProjectLead = routes["/project-lead"];
const Auth = routes["/auth"];
const Admin = routes["/admin"];
const LuxeVeilAdmin = routes["/admin/luxe-veil"];
const ConversionDashboard = routes["/admin/conversions"];
const PressDetail = routes["/press/:id"];
const Marriage = routes["/marriage"];
const BrandOpen = routes["/brand-open"];
const TrendfluxTalent = routes["/trendflux-talent"];
const LuxeVeil = routes["/luxe-veil"];
const BrandToki = routes["/brandtoki"];
const CaseStudyPage = routes["/case-studies/:slug"];
const NotFound = routes["*"];

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
          <ScrollToTop />
          <CommandPalette />
          <FloatingContact />
          <BrandSwitcher />
          {import.meta.env.DEV && <ThemeDebugPanel />}
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project-lead" element={<ProjectLead />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/luxe-veil" element={<LuxeVeilAdmin />} />
            <Route path="/admin/conversions" element={<ConversionDashboard />} />
            <Route path="/press/:id" element={<PressDetail />} />
            <Route path="/marriage" element={<Marriage />} />
            <Route path="/brand-open" element={<BrandOpen />} />
            <Route path="/trendflux-talent" element={<TrendfluxTalent />} />
            <Route path="/luxe-veil" element={<LuxeVeil />} />
            <Route path="/brandtoki" element={<BrandToki />} />
            <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </BrandPreviewProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
