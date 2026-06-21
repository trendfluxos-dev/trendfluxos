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
    <header className="fixed top-0 inset-x-0 z-50">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 transition-all duration-300 ${scrolled ? "mt-2" : "mt-4"}`}>
        <nav
          aria-label="Primary"
          className={`glass-strong rounded-full flex flex-nowrap items-center justify-between gap-2 lg:gap-4 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 border transition-all duration-300 ${
            scrolled ? "border-border/60 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)]" : "border-border/40"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 font-display font-semibold text-[14px] lg:text-[15px] whitespace-nowrap shrink-0 tracking-tight">
            <img src={logoAsset.url} alt={`${BRAND.name} logo`} className="h-7 w-7 rounded-md bg-white object-contain p-0.5" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/55 font-normal">{BRAND.nameTrail}</span>
          </Link>

          {/* Center: Explore + Browse */}
          <div className="hidden md:flex flex-nowrap items-center gap-5 text-[12px] lg:text-[13px] text-foreground/65">
            <Link
              to="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`story-link whitespace-nowrap transition-colors duration-200 hover:text-foreground ${
                pathname === "/" ? "text-foreground" : ""
              }`}
            >
              Explore
            </Link>
            <Link
              to="/explore"
              aria-current={pathname === "/explore" ? "page" : undefined}
              className={`story-link whitespace-nowrap transition-colors duration-200 hover:text-foreground ${
                pathname === "/explore" ? "text-foreground" : ""
              }`}
            >
              Browse
            </Link>
            <Link
              to="/showcase"
              aria-current={pathname === "/showcase" ? "page" : undefined}
              className={`story-link whitespace-nowrap transition-colors duration-200 hover:text-foreground ${
                pathname === "/showcase" ? "text-foreground" : ""
              }`}
            >
              Showcase
            </Link>
          </div>

          {/* Right: Search + Apply Access + Login */}
          <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => openCommandPalette()}
              aria-label="Search pages"
              title="Search pages (⌘K)"
              className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-border/50 bg-background/30 text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => openLuxeVeilGate({ source: "navbar" })}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 text-[12px] text-foreground/70 whitespace-nowrap hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Apply Access
            </button>
            <Link
              to={signedIn ? "/admin" : "/auth"}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 text-[12px] text-foreground/70 whitespace-nowrap hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-border/50 bg-background/40 text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86%] max-w-sm">
                <SheetHeader>
                  <SheetTitle className="text-left font-display tracking-tight">
                    <span className="text-gradient">{BRAND.nameLead}</span>
                    <span className="text-foreground/55 font-normal"> {BRAND.nameTrail}</span>
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                  <Link
                    to="/"
                    aria-current={pathname === "/" ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 min-h-11 text-[15px] text-foreground/80 hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-foreground aria-[current=page]:bg-muted/60"
                  >
                    Explore
                  </Link>
                  <Link
                    to="/explore"
                    aria-current={pathname === "/explore" ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 min-h-11 text-[15px] text-foreground/80 hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-foreground aria-[current=page]:bg-muted/60"
                  >
                    Browse all pages
                  </Link>
                  <Link
                    to="/showcase"
                    aria-current={pathname === "/showcase" ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 min-h-11 text-[15px] text-foreground/80 hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-foreground aria-[current=page]:bg-muted/60"
                  >
                    Showcase
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openLuxeVeilGate({ source: "navbar_mobile" });
                    }}
                    className="text-left rounded-xl px-3 py-3 min-h-11 text-[15px] text-foreground/80 hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Apply Access
                  </button>
                  <Link
                    to={signedIn ? "/admin" : "/auth"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-3 min-h-11 text-[15px] text-foreground/80 hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {signedIn ? <LayoutDashboard className="h-4 w-4 text-primary" /> : <LogIn className="h-4 w-4 text-primary" />}
                    {signedIn ? "Dashboard" : "Login"}
                  </Link>
                </nav>

                <div className="mt-6 border-t border-border/60 pt-6">
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
