import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { dict, Dict, Lang } from "./dictionaries";

const LangContext = createContext<Lang>("en");

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const lang: Lang = pathname === "/bn" || pathname.startsWith("/bn/") ? "bn" : "en";

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("tf_lang", lang); } catch { /* ignore */ }
  }, [lang]);

  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
};

export const useLang = (): Lang => useContext(LangContext);

export const useT = (): Dict => {
  const lang = useLang();
  return dict[lang] as Dict;
};

/** Returns a localized href that preserves the active language prefix. */
export const useLocalizedHref = () => {
  const lang = useLang();
  return (path: string) => {
    if (path.startsWith("http") || path.startsWith("#") || path.startsWith("mailto:") || path.startsWith("tel:")) return path;
    if (lang === "en") return path;
    // strip leading slash, prefix with /bn
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (clean === "/") return "/bn";
    return `/bn${clean}`;
  };
};

/** Strip language prefix from a pathname to get the underlying route. */
export const stripLangPrefix = (pathname: string): string => {
  if (pathname === "/bn") return "/";
  if (pathname.startsWith("/bn/")) return pathname.slice(3);
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
};

export { dict };
export type { Lang, Dict };