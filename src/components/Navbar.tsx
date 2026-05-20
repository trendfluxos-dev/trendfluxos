import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, GraduationCap, LogIn, LayoutDashboard } from "lucide-react";
import { BRAND } from "@/config/brand";
import SocialIcons from "@/components/social/SocialIcons";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/trendflux-logo.webp";

const links = [
  { label: "Systems", href: "/#services" },
  { label: "Case Studies", href: "/#cases" },
  { label: "Enterprise Control", href: "/enterprise" },
  { label: "Project Lead", href: "/project-lead" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [isMac, setIsMac] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform));
  }, []);

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

  const openPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: !isMac, metaKey: isMac, bubbles: true }),
    );
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 transition-all duration-300 ${scrolled ? "mt-2" : "mt-4"}`}>
        <nav
          className={`glass-strong rounded-full flex items-center justify-between pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 border transition-all duration-300 ${
            scrolled ? "border-border/60 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)]" : "border-border/40"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 font-display font-semibold text-[15px] whitespace-nowrap shrink-0 tracking-tight">
            <img src={logo} alt={`${BRAND.name} logo`} className="h-7 w-7 rounded-md object-contain" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/55 font-normal">{BRAND.nameTrail}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[13px] text-foreground/65">
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`story-link transition-colors duration-200 hover:text-foreground ${
                  pathname === l.href ? "text-foreground" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <SocialIcons variant="inline" size="sm" className="hidden lg:flex mr-1" />
            <Link
              to="/toolkit"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 text-[12px] text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors"
              title="Course & Toolkit"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Course</span>
            </Link>
            <Link
              to={signedIn ? "/admin" : "/auth"}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 text-[12px] text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors"
              title={signedIn ? "Dashboard" : "Login"}
            >
              {signedIn ? <LayoutDashboard className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
              <span>{signedIn ? "Dashboard" : "Login"}</span>
            </Link>
            <button
              type="button"
              onClick={openPalette}
              aria-label={`Open command palette (${isMac ? "Cmd" : "Ctrl"}+K)`}
              title="Quick jump to any page"
              className="hidden lg:inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 text-[11px] text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <span>Quick jump</span>
              <kbd className="rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] leading-none">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <Button variant="hero" size="sm" className="hidden sm:inline-flex cta-fx">
              Book Strategic Consultation
            </Button>


            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-border/50 bg-background/40 text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors"
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
                <div className="mt-8 flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.href}
                      to={l.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-[15px] text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 border-t border-border/60 pt-6">
                  <Button variant="hero" size="sm" className="w-full" onClick={() => setOpen(false)}>
                    Book Strategic Consultation
                  </Button>
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
