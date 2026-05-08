// Lightweight analytics wrapper.
// Pushes to window.dataLayer (GA4 / GTM compatible) and dispatches a CustomEvent
// so any other tag (Meta Pixel, PostHog, Plausible, etc.) can listen.
// Safe no-op if no analytics tag is installed.

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params: AnalyticsParams = {}) {
  const payload = {
    event,
    ...params,
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof window === "undefined") return;

    // GA4 / GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    // gtag (if GA4 installed directly)
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }

    // Meta Pixel (if installed) — only for known conversion events
    if (typeof window.fbq === "function" && event === "lead_submit") {
      window.fbq("track", "Lead", params);
    }

    // Custom event for any other listener
    window.dispatchEvent(new CustomEvent("tf:analytics", { detail: payload }));

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, params);
    }
  } catch {
    // Never let analytics break the UI
  }
}
