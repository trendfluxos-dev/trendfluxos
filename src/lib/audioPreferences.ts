import { useEffect, useState } from "react";

export const AUTOPLAY_PREF_KEY = "tf:chapter1:autoplayPreview";
export const REDUCED_MOTION_OVERRIDE_KEY = "tf:a11y:reducedMotionOverride";

const PREF_EVENT = "tf:audio-preferences:change";

type PrefDetail = { key: string; value: string | null };

function emit(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PrefDetail>(PREF_EVENT, { detail: { key, value } }));
}

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
}

function writeBool(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, String(value));
    emit(key, String(value));
  } catch {}
}

function subscribe(key: string, onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === key) onChange();
  };
  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent<PrefDetail>).detail;
    if (!detail || detail.key === key) onChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(PREF_EVENT, handleCustom as EventListener);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PREF_EVENT, handleCustom as EventListener);
  };
}

/** Chapter I autoplay-preview preference (default: true). */
export function readAutoplayPreview(): boolean {
  return readBool(AUTOPLAY_PREF_KEY, true);
}

export function writeAutoplayPreview(value: boolean) {
  writeBool(AUTOPLAY_PREF_KEY, value);
}

/** User override that forces reduced-motion behavior even when the OS does not. */
export function readReducedMotionOverride(): boolean {
  return readBool(REDUCED_MOTION_OVERRIDE_KEY, false);
}

export function writeReducedMotionOverride(value: boolean) {
  writeBool(REDUCED_MOTION_OVERRIDE_KEY, value);
}

/** Reactive hook for the autoplay-preview preference, synced across tabs and components. */
export function useAutoplayPreview(): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => readAutoplayPreview());
  useEffect(() => subscribe(AUTOPLAY_PREF_KEY, () => setValue(readAutoplayPreview())), []);
  const set = (next: boolean) => {
    setValue(next);
    writeAutoplayPreview(next);
  };
  return [value, set];
}

/** Reactive hook for the user reduced-motion override. */
export function useReducedMotionOverride(): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => readReducedMotionOverride());
  useEffect(() => subscribe(REDUCED_MOTION_OVERRIDE_KEY, () => setValue(readReducedMotionOverride())), []);
  const set = (next: boolean) => {
    setValue(next);
    writeReducedMotionOverride(next);
  };
  return [value, set];
}

/** True when the OS reports prefers-reduced-motion: reduce. */
export function useSystemReducedMotion(): boolean {
  const [value, setValue] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setValue(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return value;
}

/** Effective reduced-motion = system pref OR user override. */
export function useEffectiveReducedMotion(): boolean {
  const sys = useSystemReducedMotion();
  const [override] = useReducedMotionOverride();
  return sys || override;
}