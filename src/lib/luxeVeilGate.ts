/**
 * Lightweight event bus to open the global Luxe Veil invite-code gate
 * from any entry point (Footer, BrandShell, hero card, etc.).
 *
 * The gate component (src/components/LuxeVeilGate.tsx) listens for this
 * event, prompts for the invite code, and navigates to /luxe-veil on
 * successful verification.
 */

const EVENT_NAME = "luxe-veil:open";

export type LuxeVeilGateDetail = {
  /** Optional source label for analytics (e.g. "footer", "brand-shell"). */
  source?: string;
};

export const openLuxeVeilGate = (detail: LuxeVeilGateDetail = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<LuxeVeilGateDetail>(EVENT_NAME, { detail }),
  );
};

export const LUXE_VEIL_GATE_EVENT = EVENT_NAME;
