// Lightweight analytics helper. Forwards to GA4 (gtag) and GTM (dataLayer) when present,
// and is a no-op otherwise. Safe to call from anywhere.

type EventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "tf_analytics_events";
const MAX_STORED = 500;

export type StoredEvent = {
  event: string;
  params: EventParams;
  ts: number;
};

export const ANALYTICS_EVENT = "tf:analytics";

function persist(event: string, params: EventParams) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: StoredEvent[] = raw ? JSON.parse(raw) : [];
    list.push({ event, params, ts: Date.now() });
    const trimmed = list.slice(-MAX_STORED);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    try {
      window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: { event } }));
    } catch {
      /* noop */
    }
  } catch {
    /* ignore quota / parse errors */
  }
}

export function readStoredEvents(): StoredEvent[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearStoredEvents() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...params });
    }
    persist(event, params);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, params);
    }
  } catch {
    /* never throw from analytics */
  }
}