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

  if (pathname.startsWith("/admin") || pathname === "/auth") return null;

  const brand = useResolvedBrand();
  const contact = BRAND_CONTACTS[brand];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`${contact.displayName} contact channels`}
          aria-modal="false"
          className="rounded-2xl border border-gold/40 bg-[#0B1F3A]/90 backdrop-blur px-4 py-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] animate-fade-in"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold/80">
            {contact.displayName}
          </p>
          <SocialIcons brand={brand} variant="inline" size="md" />
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
          "inline-flex items-center justify-center w-12 h-12 rounded-full border border-gold/50 bg-gradient-to-br from-gold/30 to-gold/10 text-gold shadow-[0_10px_30px_-5px_rgba(200,169,81,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-5px_rgba(200,169,81,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default FloatingContact;