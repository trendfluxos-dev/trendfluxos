import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "./lib/routes";
import ScrollToTop from "./components/ScrollToTop";
import CommandPalette from "./components/CommandPalette";

const queryClient = new QueryClient();

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
        <ScrollToTop />
        <CommandPalette />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<routes["/"] />} />
            <Route path="/project-lead" element={<routes["/project-lead"] />} />
            <Route path="/auth" element={<routes["/auth"] />} />
            <Route path="/admin" element={<routes["/admin"] />} />
            <Route path="/admin/luxe-veil" element={<routes["/admin/luxe-veil"] />} />
            <Route path="/press/:id" element={<routes["/press/:id"] />} />
            <Route path="/marriage" element={<routes["/marriage"] />} />
            <Route path="/brand-open" element={<routes["/brand-open"] />} />
            <Route path="/trendflux-talent" element={<routes["/trendflux-talent"] />} />
            <Route path="/luxe-veil" element={<routes["/luxe-veil"] />} />
            <Route path="/case-studies/:slug" element={<routes["/case-studies/:slug"] />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<routes["*"] />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
