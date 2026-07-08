import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import OverflowDetector from "@/components/dev/OverflowDetector";


import { TooltipProvider } from "@/components/ui/tooltip";
import { routes, preloadRoute } from "./lib/routes";
import { queryClient } from "@/lib/queryClient";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ScrollProgress";
import CommandPalette from "./components/CommandPalette";
import FloatingContact from "./components/social/FloatingContact";
import ChatAssistWidget from "./components/chat/ChatAssistWidget";
import BrandSwitcher from "./components/social/BrandSwitcher";
import LuxeVeilGate from "./components/LuxeVeilGate";
import TelegramGroupPopup from "./components/TelegramGroupPopup";
import ConsentBannerGate from "./components/ConsentBannerGate";
import SiteStatusBanner from "./components/SiteStatusBanner";
import AccessRequestGate from "./components/AccessRequestGate";
import { BrandPreviewProvider } from "./context/BrandPreviewContext";
import { SeoHead } from "@/hooks/useSeo";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import RequireRole from "@/components/auth/RequireRole";
import { AppBoomTrigger, RouteBoom } from "@/components/dev/BoomTrigger";
import LayerShell from "@/components/layer/LayerShell";
import { RouteLoadingProvider } from "@/lib/routeLoading";
import { PageFallback } from "@/components/PageFallback";

// Dev-only diagnostic panels. They are heavy and only ever rendered when
// `?perf` is in the URL during development, so we code-split them out of the
// production bundle entirely and lazy-load on demand.
const ThemeDebugPanel = import.meta.env.DEV
  ? lazy(() => import("@/components/ThemeDebugPanel"))
  : null;
const PerfMonitor = import.meta.env.DEV
  ? lazy(() => import("@/components/PerfMonitor"))
  : null;

// Resolved once at module load. The `?perf` flag is dev-only and never
// changes within a session, so there's no reason to re-parse window.location
// on every render of <App />.
const PERF_FLAG =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("perf");

const Index = routes["/"];
const Ecosystem = routes["/ecosystem"];
const Brands = routes["/brands"];
const ServicesPage = routes["/services"];
const AboutPage = routes["/about"];
const ContactPage = routes["/contact"];
const Explore = routes["/explore"];
const ProjectLead = routes["/project-lead"];
const Showcase = routes["/showcase"];
const ShowcaseDetail = routes["/showcase/:id"];
const ResearchDetail = routes["/research/:slug"];
const ImplementationDetail = routes["/implementations/:slug"];
const Auth = routes["/auth"];
const Dashboard = routes["/dashboard"];
const Admin = routes["/admin"];
const LuxeVeilAdmin = routes["/admin/luxe-veil"];
const ConversionDashboard = routes["/admin/conversions"];
const EnterpriseDemos = routes["/admin/enterprise-demos"];
const TalentApplicationsAdmin = routes["/admin/talent"];
const TalentEmailsAdmin = routes["/admin/talent/emails"];
const CourseEnrollmentsAdmin = routes["/admin/course-enrollments"];
const UptimeAdmin = routes["/admin/uptime"];
const ErrorLogsAdmin = routes["/admin/errors"];
const WebVitalsAdmin = routes["/admin/web-vitals"];
const Ga4Check = routes["/admin/ga4-check"];
const SecretsHealthAdmin = routes["/admin/secrets-health"];
const TelegramTestLogsAdmin = routes["/admin/telegram-tests"];
const SecurityAuditAdmin = routes["/admin/security-audit"];
const PublishGateAdmin = routes["/admin/publish-gate"];
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
const Founder = routes["/founder"];
const BdjobsProfile = routes["/bdjobs-profile"];
const BdjobsProfileEdit = routes["/bdjobs-profile/edit"];
const Enterprise = routes["/enterprise"];
const Toolkit = routes["/toolkit"];
const Ebooks = routes["/ebooks"];
const CourseTrendflux = routes["/course/trendflux"];
const Masterclass = routes["/masterclass"];
const EdtechHome = routes["/edtech"];
const ClassByToken = routes["/class/:token"];
const EdtechCourses = routes["/edtech/courses"];
const EdtechCourseDetail = routes["/edtech/courses/:slug"];
const EdtechEnroll = routes["/edtech/enroll/:slug"];
const EdtechPricing = routes["/edtech/pricing"];
const EdtechCertificate = routes["/edtech/certificate"];
const EdtechVerify = routes["/edtech/verify"];
const EdtechMyLearning = routes["/edtech/my-learning"];
const EdtechLessonPlayer = routes["/edtech/learn/:slug"];
const EdtechLive = routes["/edtech/live"];
const EdtechLiveStudio = routes["/edtech/live/studio/:id"];
const EdtechLiveWatch = routes["/edtech/live/watch/:id"];
const EdtechLiveRecap = routes["/edtech/live/recap/:id"];
const EdtechLiveAdmin = routes["/admin/edtech/live"];
const EdtechTeachOnboarding = routes["/edtech/teach/onboarding"];
const EdtechTeachClasses = routes["/edtech/teach/classes"];
const EdtechTeachBookings = routes["/edtech/teach/bookings"];
const EdtechTutors = routes["/edtech/tutors"];
const EdtechTutorProfile = routes["/edtech/tutors/:id"];
const EdtechTutorBook = routes["/edtech/tutors/:id/book"];
const EdtechMyBookings = routes["/edtech/me/bookings"];
const EdtechMyClasses = routes["/edtech/my-classes"];
const ClassRecording = routes["/class-recording/:token"];
const VoiceNotes = routes["/edtech/voice-notes"];
const VoiceStudio = routes["/edtech/teach/voice-studio"];
const VoiceClone = routes["/voice-clone"];
const VoiceCloneDeploy = routes["/voice-clone/deploy"];
const CaseStudyPage = routes["/case-studies/:slug"];
const JusticeAppeal = routes["/justice-appeal"];
const MediaReports = routes["/media-reports"];
const ShareKit = routes["/share-kit"];
const StoryAiExpertEmon = routes["/stories/ai-expert-emon"];
const Settings = routes["/settings"];
const Privacy = routes["/privacy"];
const GrowthOs = routes["/growth-os"];
const GrowthConsole = routes["/admin/growth-console"];
const LeadLifecycle = routes["/admin/lead-lifecycle"];
const OutreachLogsAdmin = routes["/admin/outreach-logs"];
const CreatorStudio = routes["/admin/creator-studio"];
const GrowthOsHub = routes["/growth-os/hub"];
const TaskQueue = routes["/admin/task-queue"];
const ClassAnalytics = routes["/admin/class-analytics"];
const NotFound = routes["*"];
const PerfCompare = import.meta.env.DEV ? lazy(() => import("./pages/PerfCompare")) : null;
const DevRoutesPage = import.meta.env.DEV ? lazy(() => import("./pages/DevRoutes")) : null;

const RoutedApp = () => {
  const location = useLocation();
  return (
    <RouteErrorBoundary>
      {/*
        Per-route Suspense keyed on pathname. React Router runs navigation
        inside `startTransition` (v7 flag), which by default keeps the old
        page visible while the next lazy chunk loads. Keying Suspense on the
        pathname resets the boundary on every route change so PageFallback's
        skeleton is shown for the transition, not just the initial mount.

        The RouteLoadingProvider extends that skeleton across the route's
        *data* fetching — pages call `useRouteDataLoading(isLoading)` to
        keep the fallback visible until their initial queries settle,
        then the content is revealed atomically. Pages without any data
        fetching don't need to opt in; the gate auto-disarms after one
        paint frame.
      */}
      <Suspense key={location.pathname} fallback={<PageFallback />}>
      <RouteLoadingProvider>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/ecosystem" element={<Ecosystem />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/project-lead" element={<ProjectLead />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/showcase/:id" element={<ShowcaseDetail />} />
        <Route path="/research/:slug" element={<ResearchDetail />} />
        <Route path="/implementations/:slug" element={<ImplementationDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<RequireRole roles={["admin", "editor"]}><Admin /></RequireRole>} />
        <Route path="/admin/luxe-veil" element={<RequireRole roles={["admin"]}><LuxeVeilAdmin /></RequireRole>} />
        <Route path="/admin/conversions" element={<RequireRole roles={["admin"]}><ConversionDashboard /></RequireRole>} />
        <Route path="/admin/enterprise-demos" element={<RequireRole roles={["admin"]}><EnterpriseDemos /></RequireRole>} />
        <Route path="/admin/talent" element={<RequireRole roles={["admin", "editor"]}><TalentApplicationsAdmin /></RequireRole>} />
        <Route path="/admin/talent/emails" element={<RequireRole roles={["admin"]}><TalentEmailsAdmin /></RequireRole>} />
        <Route path="/admin/course-enrollments" element={<RequireRole roles={["admin"]}><CourseEnrollmentsAdmin /></RequireRole>} />
        <Route path="/admin/uptime" element={<RequireRole roles={["admin"]}><UptimeAdmin /></RequireRole>} />
        <Route path="/admin/errors" element={<RequireRole roles={["admin"]}><ErrorLogsAdmin /></RequireRole>} />
        <Route path="/admin/web-vitals" element={<RequireRole roles={["admin"]}><WebVitalsAdmin /></RequireRole>} />
        <Route path="/admin/ga4-check" element={<RequireRole roles={["admin"]}><Ga4Check /></RequireRole>} />
        <Route path="/admin/secrets-health" element={<RequireRole roles={["admin"]}><SecretsHealthAdmin /></RequireRole>} />
        <Route path="/admin/telegram-tests" element={<RequireRole roles={["admin"]}><TelegramTestLogsAdmin /></RequireRole>} />
        <Route path="/admin/security-audit" element={<RequireRole roles={["admin"]}><SecurityAuditAdmin /></RequireRole>} />
        <Route path="/admin/publish-gate" element={<RequireRole roles={["admin"]}><PublishGateAdmin /></RequireRole>} />
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
        <Route path="/founder" element={<Founder />} />
        <Route path="/bdjobs-profile" element={<BdjobsProfile />} />
        <Route path="/bdjobs-profile/edit" element={<RequireRole roles={["admin"]}><BdjobsProfileEdit /></RequireRole>} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/toolkit" element={<Toolkit />} />
        <Route path="/ebooks" element={<Ebooks />} />
        <Route path="/course/trendflux" element={<CourseTrendflux />} />
        <Route path="/masterclass" element={<Masterclass />} />
        <Route path="/edtech" element={<EdtechHome />} />
        {/* No-account student join via teacher's share link */}
        <Route path="/class/:token" element={<ClassByToken />} />
        <Route path="/edtech/join/:token" element={<ClassByToken />} />
        <Route path="/edtech/courses" element={<EdtechCourses />} />
        <Route path="/edtech/courses/:slug" element={<EdtechCourseDetail />} />
        <Route path="/edtech/enroll/:slug" element={<EdtechEnroll />} />
        <Route path="/edtech/pricing" element={<EdtechPricing />} />
        <Route path="/edtech/certificate" element={<EdtechCertificate />} />
        <Route path="/edtech/certificate/:slug" element={<EdtechCertificate />} />
        <Route path="/edtech/verify" element={<EdtechVerify />} />
        <Route path="/edtech/my-learning" element={<EdtechMyLearning />} />
        <Route path="/edtech/my-classes" element={<EdtechMyClasses />} />
        <Route path="/class-recording/:token" element={<ClassRecording />} />
        <Route path="/edtech/learn/:slug" element={<EdtechLessonPlayer />} />
        <Route path="/edtech/learn/:slug/:lessonN" element={<EdtechLessonPlayer />} />
        <Route path="/edtech/live" element={<EdtechLive />} />
        <Route path="/edtech/live/watch/:id" element={<EdtechLiveWatch />} />
        <Route path="/edtech/live/recap/:id" element={<EdtechLiveRecap />} />
        <Route path="/edtech/live/studio/:id" element={<RequireRole roles={["admin","teacher","tutor"]}><EdtechLiveStudio /></RequireRole>} />
        <Route path="/admin/edtech/live" element={<RequireRole roles={["admin","teacher","tutor"]}><EdtechLiveAdmin /></RequireRole>} />
        {/* Teacher workspace */}
        <Route path="/edtech/teach/onboarding" element={<RequireRole roles={["admin","teacher","tutor"]}><EdtechTeachOnboarding /></RequireRole>} />
        <Route path="/edtech/teach/classes" element={<RequireRole roles={["admin","teacher","tutor"]}><EdtechTeachClasses /></RequireRole>} />
        <Route path="/edtech/teach/bookings" element={<RequireRole roles={["admin","teacher","tutor"]}><EdtechTeachBookings /></RequireRole>} />
        {/* Tutor marketplace (public discovery + auth-gated booking) */}
        <Route path="/edtech/tutors" element={<EdtechTutors />} />
        <Route path="/edtech/tutors/:id" element={<EdtechTutorProfile />} />
        <Route path="/edtech/tutors/:id/book" element={<EdtechTutorBook />} />
        <Route path="/edtech/me/bookings" element={<EdtechMyBookings />} />
        {/* Voice features */}
        <Route path="/edtech/voice-notes" element={<VoiceNotes />} />
        <Route path="/edtech/teach/voice-studio" element={<RequireRole roles={["admin","teacher","tutor"]}><VoiceStudio /></RequireRole>} />
        {/* Personal AI Voice — founder-only standalone */}
        <Route path="/voice-clone" element={<RequireRole roles={["admin"]}><VoiceClone /></RequireRole>} />
        <Route path="/voice-clone/deploy" element={<RequireRole roles={["admin"]}><VoiceCloneDeploy /></RequireRole>} />
        <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
        <Route path="/justice-appeal" element={<JusticeAppeal />} />
        <Route path="/media-reports" element={<MediaReports />} />
        <Route path="/share-kit" element={<ShareKit />} />
        <Route path="/stories/ai-expert-emon" element={<StoryAiExpertEmon />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/growth-os" element={<GrowthOs />} />
        <Route path="/growth-os/hub" element={<RequireRole roles={["admin","teacher","tutor","editor"]}><GrowthOsHub /></RequireRole>} />
        <Route path="/admin/task-queue" element={<RequireRole roles={["admin"]}><TaskQueue /></RequireRole>} />
        <Route path="/admin/class-analytics" element={<RequireRole roles={["admin","teacher","tutor"]}><ClassAnalytics /></RequireRole>} />
        <Route path="/admin/growth-console" element={<RequireRole roles={["admin"]}><GrowthConsole /></RequireRole>} />
        <Route path="/admin/lead-lifecycle" element={<RequireRole roles={["admin"]}><LeadLifecycle /></RequireRole>} />
        <Route path="/admin/outreach-logs" element={<RequireRole roles={["admin"]}><OutreachLogsAdmin /></RequireRole>} />
        <Route path="/admin/creator-studio" element={<RequireRole roles={["admin","editor","teacher","tutor"]}><CreatorStudio /></RequireRole>} />
        {PerfCompare && <Route path="/dev/perf-compare" element={<PerfCompare />} />}
        {DevRoutesPage && <Route path="/dev/routes" element={<DevRoutesPage />} />}
        {/* Synthetic error route for Playwright error-boundary smoke tests. */}
        <Route path="/__test/boom-route" element={<RouteBoom />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </RouteLoadingProvider>
      </Suspense>
    </RouteErrorBoundary>
  );
};

const IdlePrefetcher = () => {
  useEffect(() => {
    // Prefetch high-traffic routes when the browser is idle so subsequent
    // navigations resolve from cache instantly instead of waiting on a
    // network round-trip for the lazy chunk.
    const paths = [
      "/", "/about", "/portfolio", "/the-stand", "/showcase", "/explore",
      "/services", "/contact", "/project-lead", "/masterclass", "/marriage",
      "/brandtoki", "/luxe-veil", "/justice-appeal",
    ];
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 800));
    const handle = schedule(() => {
      paths.forEach((p) => { try { preloadRoute(p); } catch { /* noop */ } });
    }, { timeout: 2500 });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (cancel && typeof handle === "number") cancel(handle);
    };
  }, []);
  return null;
};

const App = () => (
  <AppErrorBoundary
    fallback={
      <div className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
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
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <BrandPreviewProvider>
          <SeoHead />
          <ScrollToTop />
          <AppBoomTrigger />
          <ScrollProgress />
          <CommandPalette />
          <FloatingContact />
          <ChatAssistWidget />
          <BrandSwitcher />
          <LuxeVeilGate />
          <TelegramGroupPopup />
          <ConsentBannerGate />
          <SiteStatusBanner />
          <AccessRequestGate />
          {ThemeDebugPanel && PERF_FLAG && (
            <Suspense fallback={null}>
              <ThemeDebugPanel />
            </Suspense>
          )}
          {PerfMonitor && PERF_FLAG && (
            <Suspense fallback={null}>
              <PerfMonitor />
            </Suspense>
          )}
          <OverflowDetector />
          <IdlePrefetcher />



          <Suspense fallback={<PageFallback />}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus-visible:outline-none"
          >
            Skip to main content
          </a>
          <div id="main-content" tabIndex={-1} className="outline-none">
          <LayerShell>
            <RoutedApp />
          </LayerShell>
          </div>
        </Suspense>
        </BrandPreviewProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
