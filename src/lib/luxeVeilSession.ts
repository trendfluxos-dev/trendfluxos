import { supabase } from "@/integrations/supabase/client";

/**
 * Luxe Veil unlock-token persistence.
 *
 * The signed token issued by the `verify-invite` edge function is stored in
 * localStorage. To avoid a network round-trip on every gate open we also
 * cache the last successful remote verification with a short TTL — within
 * that window the session is considered valid and the dialog is skipped.
 */

export const LUXE_VEIL_TOKEN_KEY = "luxe_veil_token";
const VERIFIED_AT_KEY = "luxe_veil_token_verified_at";
const VERIFIED_FOR_KEY = "luxe_veil_token_verified_for";

// Treat a remote verification as fresh for 30 minutes.
const VERIFY_TTL_MS = 30 * 60 * 1000;

const safeGet = (k: string): string | null => {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(k); } catch { return null; }
};
const safeSet = (k: string, v: string) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(k, v); } catch { /* ignore */ }
};
const safeRemove = (k: string) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(k); } catch { /* ignore */ }
};

export const getLuxeVeilToken = (): string | null => safeGet(LUXE_VEIL_TOKEN_KEY);

export const clearLuxeVeilSession = () => {
  safeRemove(LUXE_VEIL_TOKEN_KEY);
  safeRemove(VERIFIED_AT_KEY);
  safeRemove(VERIFIED_FOR_KEY);
};

const markVerified = (token: string) => {
  safeSet(VERIFIED_AT_KEY, String(Date.now()));
  safeSet(VERIFIED_FOR_KEY, token);
};

export const persistLuxeVeilToken = (token: string) => {
  safeSet(LUXE_VEIL_TOKEN_KEY, token);
  markVerified(token);
};

/** Returns true when a token exists and was verified within the TTL window. */
export const hasFreshLuxeVeilSession = (): boolean => {
  const token = getLuxeVeilToken();
  if (!token) return false;
  const verifiedFor = safeGet(VERIFIED_FOR_KEY);
  const verifiedAt = Number(safeGet(VERIFIED_AT_KEY) ?? 0);
  if (verifiedFor !== token || !verifiedAt) return false;
  return Date.now() - verifiedAt < VERIFY_TTL_MS;
};

/**
 * Ensures the persisted token is valid. Uses the cached TTL when fresh,
 * otherwise calls the edge function and refreshes the cache. Clears the
 * session on failure. Returns true when the user has a valid unlock.
 */
export const ensureLuxeVeilSession = async (): Promise<boolean> => {
  const token = getLuxeVeilToken();
  if (!token) return false;
  if (hasFreshLuxeVeilSession()) return true;
  try {
    const { data, error } = await supabase.functions.invoke<{ ok: boolean }>(
      "verify-invite?action=verify-token",
      { body: { token } },
    );
    if (error || !data?.ok) {
      clearLuxeVeilSession();
      return false;
    }
    markVerified(token);
    return true;
  } catch {
    // Network blip — keep the token but don't claim freshness.
    return false;
  }
};