/**
 * Runtime detection of staging vs production.
 *
 * Staging is auto-detected when ANY of the following is true:
 *   - hostname contains "lovable.app" (preview/published Lovable subdomain)
 *   - hostname contains "preview"
 *   - hostname is localhost / 127.0.0.1
 *   - URL has `?mode=staging`
 *   - localStorage has `app_mode=staging` (sticky override)
 *
 * Otherwise the app is in production mode (e.g. served from the custom domain).
 *
 * The detected mode is forwarded to edge functions via the `mode` field in the
 * request body so server-side code can pick the matching secret set.
 */
export type AppMode = "staging" | "production";

export const getAppMode = (): AppMode => {
  if (typeof window === "undefined") return "production";
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("mode") === "staging") {
      try { window.localStorage.setItem("app_mode", "staging"); } catch { /* noop */ }
      return "staging";
    }
    if (url.searchParams.get("mode") === "production") {
      try { window.localStorage.removeItem("app_mode"); } catch { /* noop */ }
      return "production";
    }
    try {
      if (window.localStorage.getItem("app_mode") === "staging") return "staging";
    } catch { /* noop */ }
    const h = window.location.hostname.toLowerCase();
    if (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h.includes("lovable.app") ||
      h.includes("preview")
    ) return "staging";
  } catch { /* noop */ }
  return "production";
};

export const isStaging = (): boolean => getAppMode() === "staging";
