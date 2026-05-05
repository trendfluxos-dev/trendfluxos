import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProjectLead from "./pages/ProjectLead.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import LuxeVeilAdmin from "./pages/LuxeVeilAdmin.tsx";
import PressDetail from "./pages/PressDetail.tsx";
import Marriage from "./pages/Marriage.tsx";
import BrandOpen from "./pages/BrandOpen.tsx";
import TrendfluxTalent from "./pages/TrendfluxTalent.tsx";
import LuxeVeil from "./pages/LuxeVeil.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/project-lead" element={<ProjectLead />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/press/:id" element={<PressDetail />} />
          <Route path="/marriage" element={<Marriage />} />
          <Route path="/brand-open" element={<BrandOpen />} />
          <Route path="/trendflux-talent" element={<TrendfluxTalent />} />
          <Route path="/luxe-veil" element={<LuxeVeil />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
