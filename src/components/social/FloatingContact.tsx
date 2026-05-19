import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_CONTACTS } from "@/config/socialConfig";
import { useResolvedBrand } from "@/context/BrandPreviewContext";
import SocialIcons from "./SocialIcons";

export const FloatingContact = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Move focus to first link in the panel
    const first = panelRef.current?.querySelector<HTMLAnchorElement>("a[href]");
    first?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const brand = useResolvedBrand();
  const contact = BRAND_CONTACTS[brand];

  if (pathname.startsWith("/admin") || pathname === "/auth") return null;

  return (
    <div
      className="fixed right-4 sm:right-5 z-40 flex flex-col items-end gap-3"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`${contact.displayName} contact channels`}
          aria-modal="false"
          className="rounded-2xl border border-border bg-white/95 backdrop-blur px-4 py-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] animate-fade-in"
        >
          <p
            className="mb-2 text-[10px] uppercase tracking-[0.3em] text-primary"
            aria-live="polite"
          >
            {contact.displayName}
          </p>
          <SocialIcons brand={brand} variant="inline" size="lg" />
          <a
            href="https://t.me/LuxeVeil_Bot?start=support"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:scale-[1.02]"
          >
            Contact Support
          </a>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact menu" : "Open contact menu"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center justify-center w-14 h-14 sm:w-12 sm:h-12 rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(var(--primary-glow))] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {open ? <X className="w-6 h-6 sm:w-5 sm:h-5" /> : <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5" />}
      </button>
    </div>
  );
};

export default FloatingContact;