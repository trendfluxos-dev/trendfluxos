import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Eye, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_CONTACTS, BrandKey, getBrandForRoute } from "@/config/socialConfig";
import { useBrandPreview } from "@/context/BrandPreviewContext";

type Entry =
  | { kind: "preview"; key: BrandKey; label: string }
  | { kind: "group"; key: string; label: string; items: BrandLink[] };

type BrandLink = { label: string; href: string; external?: boolean };

const BRAND_LINKS: BrandLink[] = [
  { label: "TrendFlux Space", href: "https://trendflux.space", external: true },
  { label: "VerdaFlux Spectrum", href: "https://spectrum.trendflux.space", external: true },
  { label: "কর্মশিক্ষা — EdTech", href: "/edtech" },
  { label: "TrendFlux Ecosystem", href: "/ecosystem" },
  { label: "Luxe Veil", href: "/luxe-veil" },
  { label: "Studio BrandToki", href: "/brandtoki" },
  { label: "TrendFlux Talent", href: "/trendflux-talent" },
  { label: "Enterprise Portal", href: "/enterprise" },
  { label: "The Stand", href: "/the-stand" },
  { label: "Advanced AI Masterclass", href: "/masterclass" },
  { label: "Justice Appeal", href: "/justice-appeal" },
];

const ENTRIES: Entry[] = [
  { kind: "preview", key: "trendflux", label: "Company — TrendFlux Digital" },
  { kind: "preview", key: "zahid", label: "Founder — Zahid Hasan Emon" },
  { kind: "group", key: "brands", label: "Browse all brands", items: BRAND_LINKS },
];

export const BrandSwitcher = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { override, setOverride } = useBrandPreview();
  const [open, setOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
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
          className="mt-2 w-64 rounded-xl border border-gold/30 bg-background/95 backdrop-blur p-1 shadow-xl animate-fade-in"
        >
          {ENTRIES.map((e) => {
            const isActive = e.kind === "preview" && active === e.key;
            if (e.kind === "group") {
              return (
                <div key={e.key} className="mt-1">
                  <button
                    type="button"
                    aria-expanded={brandsOpen}
                    onClick={() => setBrandsOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-foreground/80 hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span>{e.label}</span>
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", brandsOpen && "rotate-90")} />
                  </button>
                  {brandsOpen && (
                    <div className="mt-1 ml-2 border-l border-gold/20 pl-2 space-y-0.5">
                      {e.items.map((b) => (
                        <button
                          key={b.href}
                          role="menuitem"
                          onClick={() => {
                            if (b.external) {
                              window.open(b.href, "_blank", "noopener,noreferrer");
                            } else {
                              navigate(b.href);
                            }
                            setOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[11px] text-foreground/75 hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <span>{b.label}</span>
                          {b.external && <ExternalLink className="w-3 h-3 opacity-60" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={e.key}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setOverride(e.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  isActive
                    ? "bg-gold/15 text-gold"
                    : "text-foreground/80 hover:bg-foreground/5",
                )}
              >
                <span>{e.label}</span>
                {isActive && <span aria-hidden>●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandSwitcher;