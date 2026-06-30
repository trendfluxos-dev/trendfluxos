/**
 * Marriage page conversion attribution.
 *
 * Goal: connect a WhatsApp click on /marriage to whatever lead action
 * comes next (inquiry form submit, Gmail click, reference call, etc.)
 * via a shared, stable `inquirer_id`.
 *
 * Flow:
 *  1. getOrCreateInquirerId() returns a stable browser-scoped UUID,
 *     created lazily even before any form submit. If MarriageInquiryDialog
 *     later inserts a real `marriage_inquiries.id`, call setInquirerId()
 *     to replace the anonymous one — subsequent events stay on that id.
 *  2. recordWhatsAppClick() persists the most recent click context
 *     (placement, utm, click_id, ts) and emits `whatsapp_click_recorded`.
 *  3. recordLeadAction() reads the most recent click; if it happened
 *     within ATTRIBUTION_WINDOW_MS, the action is emitted as
 *     `marriage_lead_conversion` with attributed_to='whatsapp', the
 *     originating click_id and seconds-since-click. Otherwise the
 *     action is still tracked as `marriage_lead_action` (organic).
 *
 * All events also funnel through the existing `track()` layer so they
 * land in GA4/GTM, Meta Pixel and the in-app conversion dashboard.
 */
import { track, type AnalyticsParams } from "@/lib/analytics";

const INQUIRER_ID_KEY = "marriage_inquirer_id";
const LAST_CLICK_KEY = "marriage_last_wa_click";
/** 30-minute attribution window — long enough for a chat-then-call flow,
 *  short enough to avoid stale-credit on returning visits. */
export const ATTRIBUTION_WINDOW_MS = 30 * 60 * 1000;

export type WaClickContext = {
  click_id: string;
  inquirer_id: string;
  placement: string;
  number?: string;
  language?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ts: number;
};

export type LeadAction =
  | "inquiry_form_open"
  | "inquiry_form_submit"
  | "gmail_click"
  | "facebook_click"
  | "reference_call"
  | "reference_whatsapp"
  | "reference_facebook"
  | "copy_number";

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return (crypto as Crypto).randomUUID();
    }
  } catch { /* ignore */ }
  // RFC4122-ish fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readLS(key: string): string | null {
  try { return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null; }
  catch { return null; }
}
function writeLS(key: string, value: string) {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(key, value); }
  catch { /* ignore */ }
}

/** Returns the current inquirer_id, minting one if none exists. */
export function getOrCreateInquirerId(): string {
  const existing = readLS(INQUIRER_ID_KEY);
  if (existing) return existing;
  const id = uuid();
  writeLS(INQUIRER_ID_KEY, id);
  return id;
}

/** Overwrite the inquirer_id (e.g. after MarriageInquiryDialog inserts a row). */
export function setInquirerId(id: string) {
  if (!id) return;
  writeLS(INQUIRER_ID_KEY, id);
}

/** Persist a WhatsApp click for later attribution. */
export function recordWhatsAppClick(
  ctx: Omit<WaClickContext, "click_id" | "inquirer_id" | "ts"> & {
    inquirer_id?: string;
  },
): WaClickContext {
  const inquirer_id = ctx.inquirer_id || getOrCreateInquirerId();
  const click_id = uuid();
  const full: WaClickContext = {
    click_id,
    inquirer_id,
    ts: Date.now(),
    ...ctx,
  };

  try { writeLS(LAST_CLICK_KEY, JSON.stringify(full)); } catch { /* ignore */ }
  track("whatsapp_click_recorded", { ...full } as AnalyticsParams);
  return full;
}

/** Returns the most recent WhatsApp click context, if any. */
export function getLastWhatsAppClick(): WaClickContext | null {
  const raw = readLS(LAST_CLICK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WaClickContext;
    if (typeof parsed?.ts !== "number") return null;
    return parsed;
  } catch { return null; }
}

/**
 * Record any post-click lead action. If a WhatsApp click happened
 * inside ATTRIBUTION_WINDOW_MS, emit a unified conversion event tying
 * the two together via inquirer_id + click_id.
 */
export function recordLeadAction(
  action: LeadAction,
  extra: AnalyticsParams = {},
): { attributed: boolean; inquirer_id: string; click_id?: string } {
  const inquirer_id = getOrCreateInquirerId();
  const last = getLastWhatsAppClick();
  const now = Date.now();
  const ageMs = last ? now - last.ts : Infinity;
  const attributed = !!last && ageMs <= ATTRIBUTION_WINDOW_MS && last.inquirer_id === inquirer_id;

  const base: AnalyticsParams = {
    page: "marriage",
    action,
    inquirer_id,
    ...extra,
  };

  if (attributed && last) {
    track("marriage_lead_conversion", {
      ...base,
      attributed_to: "whatsapp",
      wa_click_id: last.click_id,
      wa_placement: last.placement,
      seconds_since_click: Math.round(ageMs / 1000),
      utm_source: last.utm_source,
      utm_medium: last.utm_medium,
      utm_campaign: last.utm_campaign,
      utm_content: last.utm_content,
      utm_term: last.utm_term,
    });
    return { attributed: true, inquirer_id, click_id: last.click_id };
  }

  track("marriage_lead_action", { ...base, attributed_to: "organic" });
  return { attributed: false, inquirer_id };
}