import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import SocialIcons from "@/components/social/SocialIcons";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useT, useLocalizedHref, useLang } from "@/i18n";

const Navbar = () => {
  const { pathname } = useLocation();
  const [isMac, setIsMac] = useState(false);
  const t = useT();
  const localized = useLocalizedHref();
  const lang = useLang();
  const links = [
    { label: t.nav.systems, href: "/#services" },
    { label: t.nav.cases, href: "/#cases" },
    { label: t.nav.projectLead, href: localized("/project-lead") },
  ];

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
        <nav className="glass-strong rounded-full flex items-center justify-between px-5 py-3">
          <Link to={localized("/")} className="flex items-center gap-2 font-display font-bold text-lg whitespace-nowrap shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-cyan animate-pulse-glow" />
            <span className="text-gradient">{BRAND.nameLead}</span>
            <span className="text-foreground/60 font-normal">{BRAND.nameTrail}</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-foreground/70" lang={lang}>
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`transition-colors hover:text-primary ${
                  pathname === l.href ? "text-primary" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <SocialIcons variant="inline" size="sm" className="hidden lg:flex mr-1" />
            <button
              type="button"
              onClick={openPalette}
              aria-label={`${t.nav.quickJump} (${isMac ? "Cmd" : "Ctrl"}+K)`}
              title={t.nav.quickJump}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-foreground/70 hover:text-primary hover:border-primary/50 transition-colors"
            >
              <span>{t.nav.quickJump}</span>
              <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <Button variant="hero" size="sm" className="hidden sm:inline-flex">
              {t.nav.bookConsult}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
