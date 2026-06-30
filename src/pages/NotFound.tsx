import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Compass, Home, Mail, Search } from "lucide-react";
import { resolveRoute } from "@/lib/routeSearch";
import { useSeo } from "@/hooks/useSeo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUGGESTED = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ecosystem", label: "Ecosystem", icon: Compass },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/contact", label: "Contact", icon: Mail },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMemo(
    () => resolveRoute(location.pathname + location.search),
    [location.pathname, location.search],
  );
  const willRedirect =
    !!match && match.path !== location.pathname && match.score >= 0.7;
  // High-confidence hits (exact / alias / substring) redirect on the next
  // animation frame (~16ms — well under the 100ms budget). Fuzzy matches
  // wait 250ms so the user can read what we're inferring before we jump.
  const redirectDelayMs = match && match.score >= 0.85 ? 0 : 250;
  const [countdown, setCountdown] = useState(willRedirect ? 1 : 0);

  useSeo({
    title: "Page not found — TrendFlux Ecosystem",
    description: "The page you are looking for could not be found.",
    noindex: true,
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Instant smart redirect when we have a confident match.
  useEffect(() => {
    if (!willRedirect || !match) return;
    if (redirectDelayMs === 0) {
      const raf = window.requestAnimationFrame(() => {
        navigate(match.path, { replace: true });
      });
      return () => window.cancelAnimationFrame(raf);
    }
    const t = window.setTimeout(() => {
      navigate(match.path, { replace: true });
    }, redirectDelayMs);
    return () => window.clearTimeout(t);
  }, [willRedirect, match, navigate, redirectDelayMs]);

  useEffect(() => {
    if (!willRedirect) return;
    const i = window.setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(i);
  }, [willRedirect]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content"
        role="main"
        className="flex flex-1 items-center justify-center px-6 py-24 sm:py-32"
      >
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Error 404
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">
            This page took a quiet exit.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
            We couldn't find{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
              {location.pathname}
            </code>
            . The link may be outdated, or the page may have moved.
          </p>

          {willRedirect && match && (
            <p className="mx-auto mt-5 max-w-lg text-sm text-foreground">
              Redirecting to{" "}
              <Link
                to={match.path}
                replace
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {match.path}
              </Link>
              …
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Home className="h-4 w-4" />
              Return home
            </Link>
          </div>

          <div className="mt-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Or continue to
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SUGGESTED.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
