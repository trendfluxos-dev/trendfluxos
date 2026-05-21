import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";
import { supabase } from "@/integrations/supabase/client";

const RELEASE = (import.meta.env.VITE_BUILD_SHA as string | undefined) ?? "dev";

let installed = false;

const send = async (m: Metric) => {
  try {
    await supabase.from("web_vitals").insert({
      metric: m.name,
      value: m.value,
      rating: m.rating ?? null,
      navigation_type: m.navigationType ?? null,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      release: RELEASE,
    });
  } catch {
    // Never throw from telemetry.
  }
};

export function installWebVitals() {
  if (installed) return;
  installed = true;

  // Skip dev and Lovable preview/sandbox domains.
  if (import.meta.env.DEV) return;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("lovable.app") || host.endsWith("lovableproject.com")) return;
  }

  onLCP(send);
  onINP(send);
  onCLS(send);
  onFCP(send);
  onTTFB(send);
}
