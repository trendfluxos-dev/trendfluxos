import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, LogIn, LayoutDashboard, Search, MessageCircle } from "lucide-react";
import { BRAND } from "@/config/brand";
import { BRAND_CONTACTS } from "@/config/socialConfig";
import { openLuxeVeilGate } from "@/lib/luxeVeilGate";
import { openCommandPalette } from "@/lib/commandPalette";
import SocialIcons from "@/components/social/SocialIcons";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/trendflux-arrow-icon.jpeg.asset.json";
import ThemeToggle from "@/components/ThemeToggle";
import LayerMegaMenu from "@/components/layer/LayerMegaMenu";
import { LAYER_META, nodesByLayer, type Layer } from "@/config/siteLayers";

const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Measure the navbar (+ any currently-pinned sticky headers marked with
  // `data-sticky-header`) and publish the total to --nav-offset on <html>.
  // Keeps in-page jumps aligned across screens, zoom levels, and states
  // where the navbar's own height shrinks on scroll.
  useEffect(() => {
    const root = document.documentElement;
    const COMFORT = 12; // small breathing room below the header

    const measure = () => {
      const navH = headerRef.current?.getBoundingClientRect().height ?? 64;
      // Any sticky header currently sitting near the top of the viewport
      // (its top is within [0, navH + 8]) is stacked under the navbar.
      let stickyH = 0;
      document.querySelectorAll<HTMLElement>("[data-sticky-header]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top >= 0 && r.top <= navH + 8 && r.height > 0) {
          stickyH = Math.max(stickyH, r.height);
        }
      });
      root.style.setProperty("--nav-offset", `${Math.round(navH + stickyH + COMFORT)}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    document.querySelectorAll("[data-sticky-header]").forEach((el) => ro.observe(el));

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    // Re-scan for late-mounted sticky headers (lazy-loaded sections).
    const mo = new MutationObserver(() => {
      document.querySelectorAll("[data-sticky-header]").forEach((el) => ro.observe(el));
      measure();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header ref={headerRef} className="fixed top-0 inset-x-0 z-50 will-change-transform">
      {/* Skip-to-content link — visible only on keyboard focus, lets screen
          reader / keyboard users jump past the navbar straight into the
          page's primary <main>. Targets the first <main> regardless of id. */}
      <a
        href="#main-content"
        onClick={(e) => {
          const target = document.querySelector("main");
          if (target) {
            e.preventDefault();
            (target as HTMLElement).setAttribute("tabindex", "-1");
            (target as HTMLElement).focus({ preventScroll: false });
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-paper focus:dark:bg-noir focus:px-4 focus:py-2 focus:text-[12px] focus:font-medium focus:uppercase focus:tracking-[0.18em] focus:text-noir focus:dark:text-scrim-foreground focus:shadow-[0_8px_24px_-8px_rgba(120,20,20,0.45)] focus:outline-none focus:ring-2 focus:ring-crimson-glow/70"
      >
        Skip to main content
      </a>
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 transition-[margin,padding] duration-500 ease-out ${
          scrolled ? "mt-2" : "mt-4"
        }`}
      >
        <nav
          aria-label="Primary"
          className={[
            // NOTE: overflow must stay visible so the Company/Founder/Brands
            // dropdown panel (Radix NavigationMenu viewport) can render below
            // the navbar. The decorative glow blob is clipped by its own
            // inner wrapper instead.
            "group/nav relative overflow-visible rounded-2xl flex flex-nowrap items-center justify-between gap-2 lg:gap-4",
            "border text-noir-rim dark:text-crimson-mist transition-all duration-500 ease-out",
            // bottom shine line
            "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-crimson-glow/55 after:to-transparent",
            scrolled
              ? "pl-4 sm:pl-5 pr-2 sm:pr-3 py-2 sm:py-2.5 bg-scrim-foreground/80 dark:bg-noir/85 backdrop-blur-2xl backdrop-saturate-150 border-scrim/[0.06] dark:border-scrim-foreground/[0.06] shadow-[0_18px_50px_-25px_rgba(120,20,20,0.35)] dark:shadow-[0_20px_60px_-25px_rgba(200,60,60,0.55)]"
              : "pl-4 sm:pl-5 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-scrim-foreground/70 dark:bg-noir/55 backdrop-blur-2xl border-scrim/[0.05] dark:border-scrim-foreground/[0.05] shadow-xl dark:shadow-2xl",
          ].join(" ")}
        >
          {/* Kinetic update orb — clipped to the rounded nav shape so it
              doesn't bleed outside, while letting the dropdown overflow. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          >
            <span className="absolute -left-12 top-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-crimson-glow/15 dark:bg-crimson-rim/25 blur-[80px] transition-colors duration-700 group-hover/nav:bg-crimson-glow/25 dark:group-hover/nav:bg-primary/35" />
          </span>

          <Link
            to="/"
            className="group/brand relative flex items-center gap-3 font-display whitespace-nowrap shrink-0 tracking-tight transition-transform duration-300 ease-out hover:-translate-y-[1px]"
          >
            {/* Refined update orb: pulsing dot replaces the boxy ring-heavy logo */}
            <span className="relative flex items-center justify-center shrink-0" aria-hidden>
              <span className="absolute inset-0 -m-1 rounded-full bg-crimson-glow/40 blur-md animate-pulse" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-crimson-glow border border-scrim-foreground/25 shadow-[0_0_15px_rgba(226,90,90,0.65)]" />
            </span>
            <img
              src={logoAsset.url}
              alt=""
              aria-hidden
              className="hidden lg:block h-6 w-6 rounded-md object-contain opacity-90 transition-opacity duration-300 group-hover/brand:opacity-100"
            />
            <span className="flex flex-col leading-none">
              <span className="flex items-baseline gap-1.5">
                <span className="uppercase tracking-[0.22em] font-bold text-noir dark:text-scrim-foreground text-[12.5px] lg:text-[13px] transition-colors duration-300">
                  {BRAND.nameLead}
                </span>
                <span className="uppercase tracking-[0.22em] font-bold text-primary dark:text-crimson-glow text-[12.5px] lg:text-[13px] transition-colors duration-300 group-hover/brand:text-primary dark:group-hover/brand:text-crimson-glow-strong">
                  {BRAND.nameTrail}
                </span>
              </span>
              {/* WCAG AA: opaque chip in both modes so contrast is independent
                  of the translucent navbar background. */}
              <span className="hidden sm:inline-flex mt-1 items-center gap-1.5 rounded-full bg-paper dark:bg-noir border border-crimson-glow/40 dark:border-crimson-rim/70 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.3em] uppercase text-primary dark:text-crimson-glow-strong">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-crimson-glow-strong shadow-[0_0_6px_rgba(193,31,31,0.65)] dark:shadow-[0_0_6px_rgba(255,125,125,0.85)]" />
                Status · Live
              </span>
            </span>
          </Link>

          {/* Center: 4-layer mega-menu (Company / Founder / Brands) */}
          <div className="relative">
            <LayerMegaMenu />
          </div>

          {/* Right: Search + Apply Access + Login */}
          <div className="relative flex flex-nowrap items-center gap-1.5 shrink-0">
            <span aria-hidden className="hidden md:block h-4 w-px bg-scrim/10 dark:bg-scrim-foreground/10 mr-1" />
            <button
              type="button"
              onClick={() => openCommandPalette()}
              aria-label="Search pages"
              title="Search pages (⌘K)"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-primary/35 dark:border-crimson-rim/55 bg-scrim-foreground/70 dark:bg-noir/60 text-crimson-rim dark:text-crimson-mist hover:text-noir dark:hover:text-scrim-foreground hover:border-primary dark:hover:border-crimson-glow hover:bg-paper dark:hover:bg-noir-rim/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-95 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <ThemeToggle />
            {BRAND_CONTACTS.trendflux.whatsapp && (
              <a
                href={BRAND_CONTACTS.trendflux.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with TrendFlux on WhatsApp"
                title="Chat on WhatsApp"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-wa-green/40 bg-wa-green/10 dark:bg-wa-green/15 px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-wa-green-deep dark:text-wa-green-glow whitespace-nowrap hover:bg-wa-green/20 hover:border-wa-green hover:shadow-[0_0_18px_-4px_rgba(37,211,102,0.55)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa-green/60"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => openLuxeVeilGate({ source: "navbar" })}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-primary/35 dark:border-crimson-rim/55 bg-scrim-foreground/70 dark:bg-noir/60 px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-crimson-rim dark:text-crimson-mist whitespace-nowrap hover:text-noir dark:hover:text-scrim-foreground hover:border-primary dark:hover:border-crimson-glow hover:bg-paper dark:hover:bg-noir-rim/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60"
            >
              Apply Access
            </button>
            <Link
              to={signedIn ? "/admin" : "/auth"}
              aria-current={
                (signedIn ? pathname.startsWith("/admin") : pathname.startsWith("/auth"))
                  ? "page"
                  : undefined
              }
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-primary/35 dark:border-crimson-rim/55 bg-scrim-foreground/70 dark:bg-noir/60 px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-crimson-rim dark:text-crimson-mist whitespace-nowrap hover:text-noir dark:hover:text-scrim-foreground hover:border-primary dark:hover:border-crimson-glow hover:bg-paper dark:hover:bg-noir-rim/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60 aria-[current=page]:bg-crimson-blush dark:aria-[current=page]:bg-noir-rim/80 aria-[current=page]:text-noir dark:aria-[current=page]:text-scrim-foreground aria-[current=page]:border-primary dark:aria-[current=page]:border-crimson-glow"
              title={signedIn ? "Dashboard" : "Login"}
            >
              {signedIn ? <LayoutDashboard className="h-3.5 w-3.5 shrink-0" /> : <LogIn className="h-3.5 w-3.5 shrink-0" />}
              <span>{signedIn ? "Dashboard" : "Login"}</span>
            </Link>

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-primary/35 dark:border-crimson-rim/55 bg-scrim-foreground/70 dark:bg-noir/60 text-crimson-rim dark:text-crimson-mist hover:text-noir dark:hover:text-scrim-foreground hover:border-primary dark:hover:border-crimson-glow hover:bg-paper dark:hover:bg-noir-rim/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-95 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[92%] max-w-sm border-l border-primary/30 dark:border-crimson-rim/55 bg-scrim-foreground/95 dark:bg-noir/95 backdrop-blur-2xl text-noir-rim dark:text-crimson-mist shadow-[0_0_60px_-10px_rgba(120,20,20,0.25)] dark:shadow-[0_0_60px_-10px_rgba(200,60,60,0.4)] flex flex-col p-0 overflow-hidden"
              >
                <SheetHeader className="px-5 pt-5 pb-3 border-b border-primary/15 dark:border-crimson-rim/35 shrink-0">
                  <SheetTitle className="text-left font-display tracking-[0.22em] uppercase text-[12.5px]">
                    <span className="text-noir dark:text-crimson-mist font-semibold">{BRAND.nameLead}</span>
                    <span className="text-primary dark:text-crimson-glow/80 font-medium"> {BRAND.nameTrail}</span>
                  </SheetTitle>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openCommandPalette();
                    }}
                    className="mt-3 flex w-full items-center gap-2 rounded-xl border border-primary/30 dark:border-crimson-rim/55 bg-scrim-foreground/70 dark:bg-noir/60 px-3 py-2.5 text-left text-[13px] text-crimson-rim/80 dark:text-crimson-mist/70 hover:border-primary dark:hover:border-crimson-glow transition-colors"
                  >
                    <Search className="h-4 w-4 shrink-0" />
                    <span>Search pages…</span>
                  </button>
                </SheetHeader>
                <nav aria-label="Mobile" className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 flex flex-col gap-5">
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    aria-current={pathname === "/" ? "page" : undefined}
                    className="rounded-xl px-3 py-2.5 min-h-11 text-[14px] font-medium text-noir-rim dark:text-crimson-mist/90 hover:bg-crimson-blush dark:hover:bg-noir-rim/60 transition-colors aria-[current=page]:bg-crimson-blush dark:aria-[current=page]:bg-noir-rim/70"
                  >
                    Home
                  </Link>
                  {(["company", "founder", "brand", "system"] as Layer[]).map((layer) => {
                    const meta = LAYER_META[layer];
                    const items = nodesByLayer(layer, { includeAlsoIn: true });
                    if (items.length === 0) return null;
                    return (
                      <div key={layer} className="flex flex-col gap-0.5">
                        <p className="px-3 text-[10.5px] uppercase tracking-[0.24em] text-primary dark:text-crimson-glow/75 font-medium mb-1">
                          {meta.label}
                        </p>
                        {items.map((node) => {
                          const LinkTag: any = node.external ? "a" : Link;
                          const linkProps = node.external
                            ? { href: node.path, target: "_blank", rel: "noopener noreferrer" }
                            : { to: node.path };
                          return (
                          <LinkTag
                            key={`${layer}-${node.path}`}
                            {...linkProps}
                            aria-current={pathname === node.path ? "page" : undefined}
                            onClick={() => setOpen(false)}
                            className="group/item relative block rounded-xl px-3 py-2.5 min-h-10 hover:bg-crimson-blush dark:hover:bg-noir-rim/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60 aria-[current=page]:bg-crimson-blush dark:aria-[current=page]:bg-noir-rim/70 aria-[current=page]:ring-1 aria-[current=page]:ring-primary/40 dark:aria-[current=page]:ring-crimson-glow/40 aria-[current=page]:before:absolute aria-[current=page]:before:left-0 aria-[current=page]:before:top-1/2 aria-[current=page]:before:-translate-y-1/2 aria-[current=page]:before:h-5 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-r aria-[current=page]:before:bg-primary dark:aria-[current=page]:before:bg-crimson-glow"
                          >
                            <span className="block text-[14px] text-noir-rim dark:text-crimson-mist/85 group-hover/item:text-noir dark:group-hover/item:text-scrim-foreground group-aria-[current=page]/item:text-noir dark:group-aria-[current=page]/item:text-scrim-foreground transition-colors">
                              {node.title}
                              {node.external && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-[0.18em] text-primary dark:text-crimson-glow/80">↗</span>
                              )}
                            </span>
                            {node.blurb && (
                              <span className="block text-[11.5px] text-noir-rim/65 dark:text-crimson-mist/50 mt-0.5">
                                {node.blurb}
                              </span>
                            )}
                          </LinkTag>
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="flex flex-col gap-0.5 pt-3 border-t border-primary/30 dark:border-crimson-rim/45">
                    {BRAND_CONTACTS.trendflux.whatsapp && (
                      <a
                        href={BRAND_CONTACTS.trendflux.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-wa-green-deep dark:text-wa-green-glow hover:bg-wa-green/10 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa-green/60"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat on WhatsApp
                      </a>
                    )}
                    <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openLuxeVeilGate({ source: "navbar_mobile" });
                    }}
                    className="text-left rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-noir-rim dark:text-crimson-mist/85 hover:text-noir dark:hover:text-scrim-foreground hover:bg-crimson-blush dark:hover:bg-noir-rim/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60"
                  >
                    Apply Access
                  </button>
                  <Link
                    to={signedIn ? "/admin" : "/auth"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-noir-rim dark:text-crimson-mist/85 hover:text-noir dark:hover:text-scrim-foreground hover:bg-crimson-blush dark:hover:bg-noir-rim/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-glow/60"
                  >
                    {signedIn ? <LayoutDashboard className="h-4 w-4 text-primary dark:text-crimson-glow" /> : <LogIn className="h-4 w-4 text-primary dark:text-crimson-glow" />}
                    {signedIn ? "Dashboard" : "Login"}
                  </Link>
                  </div>
                  <div className="pt-5 border-t border-primary/30 dark:border-crimson-rim/45">
                    <SocialIcons variant="inline" size="sm" />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
