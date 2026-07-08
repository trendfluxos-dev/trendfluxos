// Shared admin-role check with a secure service_role fallback.
//
// Primary path: call the SECURITY DEFINER wrapper
//   `public.current_user_has_role(_role)` through the caller's user-scoped
//   client. This preserves per-request auth context and is the only path
//   that should normally run.
//
// Fallback path: if the RPC fails (typically Postgres 42501
//   "permission denied for function ..." after an EXECUTE revoke on the
//   underlying `has_role` chain), we re-check the role using a
//   service_role client that reads `public.user_roles` directly for the
//   *same* JWT-verified user id. Service_role bypasses RLS, so the check
//   still works even if grants regressed.
//
// Security notes:
// - The user id passed in MUST come from a verified JWT (e.g.
//   `supabase.auth.getUser(jwt)`), never from request body/query.
// - The fallback client uses SUPABASE_SERVICE_ROLE_KEY, which is only
//   available inside the edge runtime. It is never exposed to callers.
// - We only *read* one row; we never write with the elevated client here.
// - Any unexpected error is logged and returns `false` (fail-closed).

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export type AppRole = "admin" | "moderator" | "user" | "student" | "teacher" | "tutor" | "editor";

let cachedAdminClient: SupabaseClient | null = null;

const getServiceRoleClient = (): SupabaseClient | null => {
  if (cachedAdminClient) return cachedAdminClient;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  cachedAdminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdminClient;
};

const isPermissionDenied = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "42501") return true;
  const msg = (e.message ?? "").toLowerCase();
  return msg.includes("permission denied") || msg.includes("must be owner");
};

/**
 * Check whether the given verified user id currently holds `role`.
 *
 * @param userClient  A Supabase client created with the caller's JWT.
 * @param userId      The user id resolved from `supabase.auth.getUser(jwt)`.
 * @param role        The role to check (default: "admin").
 * @returns           `true` iff the user has the role; `false` on any error.
 */
export async function userHasRole(
  userClient: SupabaseClient,
  userId: string,
  role: AppRole = "admin",
): Promise<boolean> {
  // Primary: user-scoped RPC through the security-definer wrapper.
  try {
    const { data, error } = await userClient.rpc("current_user_has_role", { _role: role });
    if (!error) return Boolean(data);

    if (!isPermissionDenied(error)) {
      console.warn("[adminCheck] current_user_has_role rpc error:", error.message ?? error);
      return false;
    }
    console.warn("[adminCheck] permission denied on current_user_has_role — using service_role fallback");
  } catch (err) {
    console.warn("[adminCheck] current_user_has_role threw:", (err as Error).message);
  }

  // Fallback: read user_roles directly with a service_role client, scoped
  // to the *same* JWT-verified user id. We never trust caller-supplied ids.
  const admin = getServiceRoleClient();
  if (!admin) {
    console.error("[adminCheck] fallback unavailable: SUPABASE_SERVICE_ROLE_KEY missing");
    return false;
  }

  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  if (error) {
    console.error("[adminCheck] service_role fallback failed:", error.message);
    return false;
  }
  return Boolean(data);
}

/** Convenience: admin-only check. */
export const isAdmin = (userClient: SupabaseClient, userId: string) =>
  userHasRole(userClient, userId, "admin");