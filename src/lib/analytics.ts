// Lightweight analytics wrapper.
// Pushes to window.dataLayer (GA4 / GTM compatible) and dispatches a CustomEvent
// so any other tag (Meta Pixel, PostHog, Plausible, etc.) can listen.
// Safe no-op if no analytics tag is installed.

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(event: string, params: AnalyticsParams = {}) {
  const payload = {
    event,
    ...params,
    timestamp: new Date().toISOString(),
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
    w.dataLayer.push(payload);

    // gtag (if GA4 installed directly)
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params);
    }

    // Meta Pixel (if installed) — only for known conversion events
    if (typeof w.fbq === "function" && event === "lead_submit") {
      w.fbq("track", "Lead", params);
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
