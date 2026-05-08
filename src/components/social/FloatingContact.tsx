import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrandForRoute, BRAND_CONTACTS } from "@/config/socialConfig";
import SocialIcons from "./SocialIcons";

export const FloatingContact = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname === "/auth") return null;

  const brand = getBrandForRoute(pathname);
  const contact = BRAND_CONTACTS[brand];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="rounded-2xl border border-gold/40 bg-[#0B1F3A]/90 backdrop-blur px-4 py-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] animate-fade-in">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold/80">
            {contact.displayName}
          </p>
          <SocialIcons brand={brand} variant="inline" size="md" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact menu" : "Open contact menu"}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-full border border-gold/50 bg-gradient-to-br from-gold/30 to-gold/10 text-gold shadow-[0_10px_30px_-5px_rgba(200,169,81,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-5px_rgba(200,169,81,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        )}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default FloatingContact;