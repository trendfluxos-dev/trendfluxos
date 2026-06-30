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
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 transition-[margin,padding] duration-500 ease-out ${
          scrolled ? "mt-2" : "mt-4"
        }`}
      >
        <nav
          aria-label="Primary"
          className={[
            "group/nav rounded-full flex flex-nowrap items-center justify-between gap-2 lg:gap-4",
            "border text-[#f5d3d3] transition-all duration-500 ease-out",
            scrolled
              ? "pl-3 sm:pl-4 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-[#08080d]/90 backdrop-blur-2xl backdrop-saturate-150 border-[#7a1e1e]/75 shadow-[0_0_0_1px_rgba(200,60,60,0.28),0_20px_50px_-22px_rgba(200,60,60,0.55)]"
              : "pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 bg-[#0b0b10]/70 backdrop-blur-xl border-[#7a1e1e]/55 shadow-[0_0_0_1px_rgba(180,40,40,0.15)]",
          ].join(" ")}
        >
          <Link
            to="/"
            className="group/brand flex items-center gap-2.5 font-display whitespace-nowrap shrink-0 tracking-tight transition-transform duration-300 ease-out hover:-translate-y-[1px]"
          >
            <img
              src={logoAsset.url}
              alt={`${BRAND.name} logo`}
              className="h-7 w-7 rounded-md bg-white object-contain p-0.5 ring-1 ring-[#e25a5a]/30 transition-shadow duration-300 group-hover/brand:ring-[#e25a5a]/70 group-hover/brand:shadow-[0_0_18px_-4px_rgba(226,90,90,0.6)]"
            />
            <span className="uppercase tracking-[0.24em] font-semibold text-[#f1c9c9] text-[12px] lg:text-[12.5px] [text-shadow:0_1px_0_rgba(0,0,0,0.45)] transition-colors duration-300 group-hover/brand:text-white">
              {BRAND.nameLead}
            </span>
            <span className="uppercase tracking-[0.24em] font-medium text-[#e25a5a]/85 text-[12px] lg:text-[12.5px] transition-colors duration-300 group-hover/brand:text-[#e25a5a]">
              {BRAND.nameTrail}
            </span>
          </Link>

          {/* Center: 4-layer mega-menu (Company / Founder / Brands) */}
          <LayerMegaMenu />

          {/* Right: Search + Apply Access + Login */}
          <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => openCommandPalette()}
              aria-label="Search pages"
              title="Search pages (⌘K)"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#7a1e1e]/55 bg-[#1a0d10]/60 text-[#f0c9c9] hover:text-white hover:border-[#e25a5a] hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.65)] active:scale-95 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => openLuxeVeilGate({ source: "navbar" })}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#7a1e1e]/55 bg-[#1a0d10]/60 px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#f0c9c9] whitespace-nowrap hover:text-white hover:border-[#e25a5a] hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.65)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
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
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#7a1e1e]/55 bg-[#1a0d10]/60 px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#f0c9c9] whitespace-nowrap hover:text-white hover:border-[#e25a5a] hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.65)] active:scale-[0.97] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60 aria-[current=page]:bg-[#3a1418]/80 aria-[current=page]:text-white aria-[current=page]:border-[#e25a5a]"
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
                  className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#7a1e1e]/55 bg-[#1a0d10]/60 text-[#f0c9c9] hover:text-white hover:border-[#e25a5a] hover:bg-[#2a0f14]/70 hover:shadow-[0_0_18px_-4px_rgba(226,90,90,0.65)] active:scale-95 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[86%] max-w-sm border-l border-[#7a1e1e]/55 bg-[#08080d]/95 backdrop-blur-2xl text-[#f5d3d3] shadow-[0_0_60px_-10px_rgba(200,60,60,0.4)]"
              >
                <SheetHeader>
                  <SheetTitle className="text-left font-display tracking-[0.22em] uppercase text-[12.5px]">
                    <span className="text-[#f1c9c9] font-semibold">{BRAND.nameLead}</span>
                    <span className="text-[#e25a5a]/80 font-medium"> {BRAND.nameTrail}</span>
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-6 flex flex-col gap-5">
                  {(["company", "founder", "brand"] as Layer[]).map((layer) => {
                    const meta = LAYER_META[layer];
                    const items = nodesByLayer(layer, { includeAlsoIn: true });
                    return (
                      <div key={layer} className="flex flex-col gap-0.5">
                        <p className="px-3 text-[10.5px] uppercase tracking-[0.24em] text-[#e25a5a]/75 font-medium mb-1">
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
                            className="group/item relative block rounded-xl px-3 py-2.5 min-h-10 hover:bg-[#2a0f14]/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60 aria-[current=page]:bg-[#3a1418]/70 aria-[current=page]:ring-1 aria-[current=page]:ring-[#e25a5a]/40 aria-[current=page]:before:absolute aria-[current=page]:before:left-0 aria-[current=page]:before:top-1/2 aria-[current=page]:before:-translate-y-1/2 aria-[current=page]:before:h-5 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-r aria-[current=page]:before:bg-[#e25a5a]"
                          >
                            <span className="block text-[14px] text-[#f0c9c9]/85 group-hover/item:text-white group-aria-[current=page]/item:text-white transition-colors">
                              {node.title}
                              {node.external && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-[0.18em] text-[#e25a5a]/80">↗</span>
                              )}
                            </span>
                            {node.blurb && (
                              <span className="block text-[11.5px] text-[#f0c9c9]/50 mt-0.5">
                                {node.blurb}
                              </span>
                            )}
                          </LinkTag>
                          );
                        })}
                      </div>
                    );
                  })}

                  <div className="flex flex-col gap-0.5 pt-3 border-t border-[#7a1e1e]/45">
                    <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openLuxeVeilGate({ source: "navbar_mobile" });
                    }}
                    className="text-left rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-[#f0c9c9]/85 hover:text-white hover:bg-[#2a0f14]/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
                  >
                    Apply Access
                  </button>
                  <Link
                    to={signedIn ? "/admin" : "/auth"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-3 min-h-11 text-[14px] uppercase tracking-[0.16em] font-medium text-[#f0c9c9]/85 hover:text-white hover:bg-[#2a0f14]/60 hover:translate-x-1 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/60"
                  >
                    {signedIn ? <LayoutDashboard className="h-4 w-4 text-[#e25a5a]" /> : <LogIn className="h-4 w-4 text-[#e25a5a]" />}
                    {signedIn ? "Dashboard" : "Login"}
                  </Link>
                  </div>
                </nav>

                <div className="mt-6 border-t border-[#7a1e1e]/45 pt-6">
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
