import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BRAND_CONTACTS, BrandKey, getBrandForRoute } from "@/config/socialConfig";
import { track } from "@/lib/analytics";

type Ctx = {
  override: BrandKey | null;
  setOverride: (b: BrandKey | null) => void;
};

const BrandPreviewContext = createContext<Ctx>({ override: null, setOverride: () => {} });

const STORAGE_KEY = "brand-preview-override";

const isBrandKey = (v: string | null): v is BrandKey =>
  !!v && Object.prototype.hasOwnProperty.call(BRAND_CONTACTS, v);

const readInitialOverride = (): BrandKey | null => {
  if (typeof window === "undefined") return null;
  const url = new URLSearchParams(window.location.search).get("brand");
  if (isBrandKey(url)) {
    try { window.localStorage.setItem(STORAGE_KEY, url); } catch { /* ignore */ }
    return url;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isBrandKey(stored)) return stored;
  } catch { /* ignore */ }
  return null;
};

export const BrandPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [override, setOverrideState] = useState<BrandKey | null>(() => readInitialOverride());

  const setOverride = useCallback((b: BrandKey | null) => {
    setOverrideState(b);
    if (typeof window === "undefined") return;
    try {
      if (b) window.localStorage.setItem(STORAGE_KEY, b);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  const { search, pathname } = useLocation();
  useEffect(() => {
    const url = new URLSearchParams(search).get("brand");
    if (url === null) return;
    if (url === "" || url === "clear" || url === "off") {
      track("brand_preview_change", {
        brand: null,
        previous: override,
        page: pathname,
        source: "query_param",
        action: "clear",
      });
      setOverride(null);
      return;
    }
    if (isBrandKey(url) && url !== override) {
      track("brand_preview_change", {
        brand: url,
        previous: override,
        page: pathname,
        source: "query_param",
        action: "set",
      });
      setOverride(url);
    }
  }, [search, pathname, override, setOverride]);

  const value = useMemo(() => ({ override, setOverride }), [override, setOverride]);
  return <BrandPreviewContext.Provider value={value}>{children}</BrandPreviewContext.Provider>;
};

export const useBrandPreview = () => useContext(BrandPreviewContext);

export const useResolvedBrand = (explicit?: BrandKey): BrandKey => {
  const { pathname } = useLocation();
  const { override } = useBrandPreview();
  return explicit ?? override ?? getBrandForRoute(pathname);
};