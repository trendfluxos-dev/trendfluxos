import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BrandKey, getBrandForRoute } from "@/config/socialConfig";

type Ctx = {
  override: BrandKey | null;
  setOverride: (b: BrandKey | null) => void;
};

const BrandPreviewContext = createContext<Ctx>({ override: null, setOverride: () => {} });

export const BrandPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [override, setOverride] = useState<BrandKey | null>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);
  return <BrandPreviewContext.Provider value={value}>{children}</BrandPreviewContext.Provider>;
};

export const useBrandPreview = () => useContext(BrandPreviewContext);

export const useResolvedBrand = (explicit?: BrandKey): BrandKey => {
  const { pathname } = useLocation();
  const { override } = useBrandPreview();
  return explicit ?? override ?? getBrandForRoute(pathname);
};