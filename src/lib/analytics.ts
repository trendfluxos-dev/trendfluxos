// Lightweight analytics layer for TrendFlux.
// - Pushes to window.dataLayer (GA4 / GTM compatible)
// - Forwards to gtag() and Meta Pixel (fbq) when present
// - Persists events in localStorage so the internal Conversion Dashboard
//   can show conversions across reloads
// - Dispatches a CustomEvent (ANALYTICS_EVENT) for live in-app listeners
// Safe no-op if nothing is installed.

export type AnalyticsParams = Record<string, string | number | boolean | undefined | null>;

export type StoredEvent = {
  event: string;
  params: AnalyticsParams;
  ts: number;
};

export const ANALYTICS_EVENT = "tf:analytics";
const STORAGE_KEY = "tf_analytics_events";
const MAX_STORED = 500;

const META_PIXEL_MAP: Record<string, string> = {
  lead_submit: "Lead",
  quote_submit: "Lead",
  strategy_session_request: "Lead",
  strategy_session_booked: "Schedule",
  whatsapp_open: "Contact",
  copy_message: "Contact",
  enterprise_demo_submit_success: "Lead",
  enterprise_portal_open: "Contact",
};

function persist(stored: StoredEvent) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: StoredEvent[] = raw ? JSON.parse(raw) : [];
    list.push(stored);
    if (list.length > MAX_STORED) list.splice(0, list.length - MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function track(event: string, params: AnalyticsParams = {}) {
  const stored: StoredEvent = {
    event,
    params,
    ts: Date.now(),
  };

  try {
    if (typeof window === "undefined") return;

    const w = window as unknown as {
      dataLayer?: Array<Record<string, unknown>>;
      gtag?: (...args: unknown[]) => void;
      fbq?: (...args: unknown[]) => void;
    };

    // GA4 / GTM dataLayer
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });

    // gtag (if GA4 installed directly)
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params);
    }

    // Meta Pixel — map known conversion events
    const fbEvent = META_PIXEL_MAP[event];
    if (fbEvent && typeof w.fbq === "function") {
      w.fbq("track", fbEvent, params);
    }

    persist(stored);
    window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: stored }));

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, params);
    }
  } catch {
    /* never let analytics break the UI */
  }
}

// Backwards-compatible alias used by some call sites.
export const trackEvent = track;

export function readStoredEvents(): StoredEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearStoredEvents() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: null }));
    }
  } catch {
    /* ignore */
  }
}
