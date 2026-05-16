import { useEffect, useState } from "react";

export type Breakpoint = "base" | "sm" | "lg";

const DEFAULTS: Record<Breakpoint, number> = { base: 22, sm: 28, lg: 32 };
const STORAGE_KEY = "portrait-focus-v1";

const read = (): Record<Breakpoint, number> => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
};

export const getActiveBreakpoint = (): Breakpoint => {
  if (typeof window === "undefined") return "base";
  const w = window.innerWidth;
  if (w >= 1024) return "lg";
  if (w >= 640) return "sm";
  return "base";
};

/** Reactive store for portrait focus values (Y-percent per breakpoint). */
export const usePortraitFocus = () => {
  const [values, setValues] = useState<Record<Breakpoint, number>>(read);
  const [activeBp, setActiveBp] = useState<Breakpoint>(() =>
    getActiveBreakpoint(),
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setValues(read());
    };
    const onCustom = () => setValues(read());
    const onResize = () => setActiveBp(getActiveBreakpoint());
    window.addEventListener("storage", onStorage);
    window.addEventListener("portrait-focus-change", onCustom);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("portrait-focus-change", onCustom);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const set = (bp: Breakpoint, value: number) => {
    const next = { ...values, [bp]: value };
    setValues(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("portrait-focus-change"));
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("portrait-focus-change"));
    } catch {
      /* ignore */
    }
  };

  const activeValue = values[activeBp];
  return { values, activeBp, activeValue, set, reset, defaults: DEFAULTS };
};
