import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, LogIn, LayoutDashboard, Search } from "lucide-react";
import { BRAND } from "@/config/brand";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <header className="fixed top-0 inset-x-0 z-50 will-change-transform">
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-white focus:dark:bg-[#0a0a10] focus:px-4 focus:py-2 focus:text-[12px] focus:font-medium focus:uppercase focus:tracking-[0.18em] focus:text-[#1a0a0a] focus:dark:text-white focus:shadow-[0_8px_24px_-8px_rgba(120,20,20,0.45)] focus:outline-none focus:ring-2 focus:ring-[#e25a5a]/70"
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
            "group/nav relative overflow-hidden rounded-2xl flex flex-nowrap items-center justify-between gap-2 lg:gap-4",
            "border text-[#3a0d10] dark:text-[#f5d3d3] transition-all duration-500 ease-out",
            // bottom shine line
            "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#e25a5a]/55 after:to-transparent",
            scrolled
              ? "pl-4 sm:pl-5 pr-2 sm:pr-3 py-2 sm:py-2.5 bg-white/80 dark:bg-[#0a0a10]/85 backdrop-blur-2xl backdrop-saturate-150 border-black/[0.06] dark:border-white/[0.06] shadow-[0_18px_50px_-25px_rgba(120,20,20,0.35)] dark:shadow-[0_20px_60px_-25px_rgba(200,60,60,0.55)]"
              : "pl-4 sm:pl-5 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-white/70 dark:bg-[#0e0e14]/55 backdrop-blur-2xl border-black/[0.05] dark:border-white/[0.05] shadow-xl dark:shadow-2xl",
          ].join(" ")}
        >
          {/* Kinetic update orb — soft radial glow anchored behind the brand */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-[#e25a5a]/15 dark:bg-[#7a1e1e]/25 blur-[80px] transition-colors duration-700 group-hover/nav:bg-[#e25a5a]/25 dark:group-hover/nav:bg-[#a02828]/35"
          />

          <Link
            to="/"
            className="group/brand relative flex items-center gap-3 font-display whitespace-nowrap shrink-0 tracking-tight transition-transform duration-300 ease-out hover:-translate-y-[1px]"
          >
            {/* Refined update orb: pulsing dot replaces the boxy ring-heavy logo */}
            <span className="relative flex items-center justify-center shrink-0" aria-hidden>
              <span className="absolute inset-0 -m-1 rounded-full bg-[#e25a5a]/40 blur-md animate-pulse" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[#e25a5a] border border-white/25 shadow-[0_0_15px_rgba(226,90,90,0.65)]" />
            </span>
            <img
              src={logoAsset.url}
              alt=""
              aria-hidden
              className="hidden lg:block h-6 w-6 rounded-md object-contain opacity-90 transition-opacity duration-300 group-hover/brand:opacity-100"
            />
            <span className="flex flex-col leading-none">
              <span className="flex items-baseline gap-1.5">
                <span className="uppercase tracking-[0.22em] font-bold text-[#1a0a0a] dark:text-white text-[12.5px] lg:text-[13px] transition-colors duration-300">
                  {BRAND.nameLead}
                </span>
                <span className="uppercase tracking-[0.22em] font-bold text-[#9a1818] dark:text-[#e25a5a] text-[12.5px] lg:text-[13px] transition-colors duration-300 group-hover/brand:text-[#b41f1f] dark:group-hover/brand:text-[#ff6b6b]">
                  {BRAND.nameTrail}
                </span>
              </span>
              {/* WCAG AA: opaque chip in both modes so contrast is independent
                  of the translucent navbar background. */}
              <span className="hidden sm:inline-flex mt-1 items-center gap-1.5 rounded-full bg-white dark:bg-[#0a0a10] border border-[#e25a5a]/40 dark:border-[#7a1e1e]/70 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.3em] uppercase text-[#9a1818] dark:text-[#ff7d7d]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#c11f1f] dark:bg-[#ff7d7d] shadow-[0_0_6px_rgba(193,31,31,0.65)] dark:shadow-[0_0_6px_rgba(255,125,125,0.85)]" />
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
            <span aria-hidden className="hidden md:block h-4 w-px bg-black/10 dark:bg-white/10 mr-1" />
            <button
              type="button"
              onClick={() => openCommandPalette()}
              aria-label="Search pages"
              title="Search pages (⌘K)"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#c11f1f]/35 dark:border-[#7a1e1e]/55 bg-white/70 dark:bg-[#1a0d10]/60 text-[#5a1818] dark:text-[#f0c9c9] hover:text-[#1a0a0a] dark:hover:text-white hover:border-[#c11f1f] dark:hover:border-[#e25a5a] hover:bg-white dark:hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-95 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => openLuxeVeilGate({ source: "navbar" })}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#c11f1f]/35 dark:border-[#7a1e1e]/55 bg-white/70 dark:bg-[#1a0d10]/60 px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#5a1818] dark:text-[#f0c9c9] whitespace-nowrap hover:text-[#1a0a0a] dark:hover:text-white hover:border-[#c11f1f] dark:hover:border-[#e25a5a] hover:bg-white dark:hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
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
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#c11f1f]/35 dark:border-[#7a1e1e]/55 bg-white/70 dark:bg-[#1a0d10]/60 px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#5a1818] dark:text-[#f0c9c9] whitespace-nowrap hover:text-[#1a0a0a] dark:hover:text-white hover:border-[#c11f1f] dark:hover:border-[#e25a5a] hover:bg-white dark:hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60 aria-[current=page]:bg-[#fbeaea] dark:aria-[current=page]:bg-[#3a1418]/80 aria-[current=page]:text-[#1a0a0a] dark:aria-[current=page]:text-white aria-[current=page]:border-[#c11f1f] dark:aria-[current=page]:border-[#e25a5a]"
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
                  className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#c11f1f]/35 dark:border-[#7a1e1e]/55 bg-white/70 dark:bg-[#1a0d10]/60 text-[#5a1818] dark:text-[#f0c9c9] hover:text-[#1a0a0a] dark:hover:text-white hover:border-[#c11f1f] dark:hover:border-[#e25a5a] hover:bg-white dark:hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.45)] active:scale-95 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[86%] max-w-sm border-l border-[#c11f1f]/30 dark:border-[#7a1e1e]/55 bg-white/95 dark:bg-[#08080d]/95 backdrop-blur-2xl text-[#3a0d10] dark:text-[#f5d3d3] shadow-[0_0_60px_-10px_rgba(120,20,20,0.25)] dark:shadow-[0_0_60px_-10px_rgba(200,60,60,0.4)]"
              >
                <SheetHeader>
                  <SheetTitle className="text-left font-display tracking-[0.22em] uppercase text-[12.5px]">
                    <span className="text-[#1a0a0a] dark:text-[#f1c9c9] font-semibold">{BRAND.nameLead}</span>
                    <span className="text-[#9a1818] dark:text-[#e25a5a]/80 font-medium"> {BRAND.nameTrail}</span>
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-6 flex flex-col gap-5">
                  {(["company", "founder", "brand"] as Layer[]).map((layer) => {
                    const meta = LAYER_META[layer];
                    const items = nodesByLayer(layer, { includeAlsoIn: true });
                    return (
                      <div key={layer} className="flex flex-col gap-0.5">
                        <p className="px-3 text-[10.5px] uppercase tracking-[0.24em] text-[#9a1818] dark:text-[#e25a5a]/75 font-medium mb-1">
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
                            className="group/item relative block rounded-xl px-3 py-2.5 min-h-10 hover:bg-[#fbeaea] dark:hover:bg-[#2a0f14]/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60 aria-[current=page]:bg-[#fbeaea] dark:aria-[current=page]:bg-[#3a1418]/70 aria-[current=page]:ring-1 aria-[current=page]:ring-[#c11f1f]/40 dark:aria-[current=page]:ring-[#e25a5a]/40 aria-[current=page]:before:absolute aria-[current=page]:before:left-0 aria-[current=page]:before:top-1/2 aria-[current=page]:before:-translate-y-1/2 aria-[current=page]:before:h-5 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-r aria-[current=page]:before:bg-[#c11f1f] dark:aria-[current=page]:before:bg-[#e25a5a]"
                          >
                            <span className="block text-[14px] text-[#3a0d10] dark:text-[#f0c9c9]/85 group-hover/item:text-[#1a0a0a] dark:group-hover/item:text-white group-aria-[current=page]/item:text-[#1a0a0a] dark:group-aria-[current=page]/item:text-white transition-colors">
                              {node.title}
                              {node.external && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-[0.18em] text-[#9a1818] dark:text-[#e25a5a]/80">↗</span>
                              )}
                            </span>
                            {node.blurb && (
                              <span className="block text-[11.5px] text-[#3a0d10]/65 dark:text-[#f0c9c9]/50 mt-0.5">
                                {node.blurb}
                              </span>
                            )}
                          </LinkTag>
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="flex flex-col gap-0.5 pt-3 border-t border-[#c11f1f]/30 dark:border-[#7a1e1e]/45">
                    <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openLuxeVeilGate({ source: "navbar_mobile" });
                    }}
                    className="text-left rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-[#3a0d10] dark:text-[#f0c9c9]/85 hover:text-[#1a0a0a] dark:hover:text-white hover:bg-[#fbeaea] dark:hover:bg-[#2a0f14]/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
                  >
                    Apply Access
                  </button>
                  <Link
                    to={signedIn ? "/admin" : "/auth"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-[#3a0d10] dark:text-[#f0c9c9]/85 hover:text-[#1a0a0a] dark:hover:text-white hover:bg-[#fbeaea] dark:hover:bg-[#2a0f14]/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
                  >
                    {signedIn ? <LayoutDashboard className="h-4 w-4 text-[#c11f1f] dark:text-[#e25a5a]" /> : <LogIn className="h-4 w-4 text-[#c11f1f] dark:text-[#e25a5a]" />}
                    {signedIn ? "Dashboard" : "Login"}
                  </Link>
                  </div>
                </nav>

                <div className="mt-6 border-t border-[#c11f1f]/30 dark:border-[#7a1e1e]/45 pt-6">
                  <div className="mt-5">
                    <SocialIcons variant="inline" size="sm" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
