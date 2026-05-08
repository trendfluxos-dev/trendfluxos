import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BRAND_CONTACTS, BrandKey, getBrandForRoute } from "@/config/socialConfig";

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

  const setOverride = (b: BrandKey | null) => {
    setOverrideState(b);
    if (typeof window === "undefined") return;
    try {
      if (b) window.localStorage.setItem(STORAGE_KEY, b);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  // Re-read ?brand= when URL changes (e.g. SPA navigation)
  const { search } = useLocation();
  useEffect(() => {
    const url = new URLSearchParams(search).get("brand");
    if (url === null) return;
    if (url === "" || url === "clear" || url === "off") {
      setOverride(null);
      return;
    }
    if (isBrandKey(url)) setOverride(url);
  }, [search]);

  const value = useMemo(() => ({ override, setOverride }), [override]);
  return <BrandPreviewContext.Provider value={value}>{children}</BrandPreviewContext.Provider>;
};

export const useBrandPreview = () => useContext(BrandPreviewContext);

export const useResolvedBrand = (explicit?: BrandKey): BrandKey => {
  const { pathname } = useLocation();
  const { override } = useBrandPreview();
  return explicit ?? override ?? getBrandForRoute(pathname);
};