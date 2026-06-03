import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns whether the cookie consent banner is enabled for the *current*
 * environment (preview vs live), based on toggles stored in
 * `public.site_settings`. Admins can flip these without code changes.
 *
 * Preview = lovable.app / lovable.dev / lovableproject.com / localhost / 127.0.0.1
 * Live    = anything else (custom domains).
 */
export function isPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  return /lovable\.(app|dev)|lovableproject\.com|localhost|127\.0\.0\.1/.test(
    window.location.hostname,
  );
}

export const CONSENT_KEY_PREVIEW = "consent_banner_preview";
export const CONSENT_KEY_LIVE = "consent_banner_live";

export function useConsentBannerEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const key = isPreviewHost() ? CONSENT_KEY_PREVIEW : CONSENT_KEY_LIVE;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setEnabled(data?.value === true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return enabled;
}
