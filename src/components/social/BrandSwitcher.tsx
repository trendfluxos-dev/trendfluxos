import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_CONTACTS, BrandKey, getBrandForRoute } from "@/config/socialConfig";
import { useBrandPreview } from "@/context/BrandPreviewContext";

const BRANDS: BrandKey[] = ["trendflux", "zahid", "luxeveil"];

export const BrandSwitcher = () => {
  const { pathname } = useLocation();
  const { override, setOverride } = useBrandPreview();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const has = params.has("preview") || params.has("brand");
    const stored = window.localStorage.getItem("brand-switcher") === "1";
    setEnabled(has || stored || import.meta.env.DEV);
    if (has) window.localStorage.setItem("brand-switcher", "1");
  }, []);

  if (!enabled) return null;
  if (pathname.startsWith("/admin") || pathname === "/auth") return null;

  const active = override ?? getBrandForRoute(pathname);

  return (
    <div className="fixed bottom-5 left-5 z-40">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Brand preview switcher"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/80 backdrop-blur px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{BRAND_CONTACTS[active].displayName}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
        </button>
        {override && (
          <button
            type="button"
            aria-label="Clear brand preview override"
            onClick={() => setOverride(null)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gold/30 text-gold/80 hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div
          role="menu"
          aria-label="Choose brand to preview"
          className="mt-2 w-56 rounded-xl border border-gold/30 bg-background/95 backdrop-blur p-1 shadow-xl animate-fade-in"
        >
          {BRANDS.map((b) => (
            <button
              key={b}
              role="menuitemradio"
              aria-checked={active === b}
              onClick={() => {
                setOverride(b);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                active === b
                  ? "bg-gold/15 text-gold"
                  : "text-foreground/80 hover:bg-foreground/5",
              )}
            >
              <span>{BRAND_CONTACTS[b].displayName}</span>
              {active === b && <span aria-hidden>●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandSwitcher;