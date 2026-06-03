import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type StandLang = "bn" | "en";
const KEY = "the-stand-lang";

type Ctx = { lang: StandLang; setLang: (l: StandLang) => void };
const StandLanguageContext = createContext<Ctx | null>(null);

export function StandLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<StandLang>("bn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as StandLang | null;
      if (saved === "bn" || saved === "en") setLangState(saved);
    } catch {
      /* noop */
    }
  }, []);

  const setLang = (l: StandLang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* noop */
    }
  };

  return (
    <StandLanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </StandLanguageContext.Provider>
  );
}

export function useStandLang() {
  const ctx = useContext(StandLanguageContext);
  if (!ctx) throw new Error("useStandLang must be used inside <StandLanguageProvider>");
  return ctx;
}

/** Pick the right string from a bilingual pair based on active lang. */
export function pick<T>(lang: StandLang, bn: T, en: T): T {
  return lang === "bn" ? bn : en;
}
