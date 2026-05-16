import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import SocialIcons from "@/components/social/SocialIcons";
import logo from "@/assets/trendflux-logo.png";

const links = [
  { label: "Systems", href: "/#services" },
  { label: "Case Studies", href: "/#cases" },
  { label: "Enterprise Control", href: "/enterprise" },
  { label: "Project Lead", href: "/project-lead" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform));
  }, []);

  const openPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: !isMac, metaKey: isMac, bubbles: true }),
    );
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-4">
        <nav className="glass-strong rounded-full flex items-center justify-between pl-4 pr-3 py-2.5 border border-border/40">
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
                className={`transition-colors duration-200 hover:text-foreground ${
                  pathname === l.href ? "text-foreground" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <SocialIcons variant="inline" size="sm" className="hidden lg:flex mr-1" />
            <button
              type="button"
              onClick={openPalette}
              aria-label={`Open command palette (${isMac ? "Cmd" : "Ctrl"}+K)`}
              title="Quick jump to any page"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 text-[11px] text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <span>Quick jump</span>
              <kbd className="rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] leading-none">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <Button variant="hero" size="sm" className="hidden sm:inline-flex">
              Book Strategic Consultation
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
