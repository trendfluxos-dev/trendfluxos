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

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export type AppRole = "admin" | "moderator" | "user" | "student" | "teacher" | "tutor" | "editor";

/** Structured diagnostic for a role check. Emitted via console AND returned
 *  so call-sites can persist it (outreach_execution_logs, alert-postgres-error,
 *  etc.) without re-plumbing internal state. */
export type RoleCheckSource =
  | "rpc"                 // primary RPC returned a definitive answer
  | "service_role"        // fallback path answered after an RPC failure
  | "rpc_error"           // primary RPC errored AND fallback also failed
  | "no_fallback";        // primary RPC blocked and no service_role available

export type RoleCheckDiagnostic = {
  allowed: boolean;
  source: RoleCheckSource;
  role: AppRole;
  user_id: string;
  fn?: string;                          // caller function name, for grepping logs
  rpc_error?: { code?: string; message?: string };
  fallback_error?: { code?: string; message?: string };
  duration_ms: number;
  used_fallback: boolean;
};

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

const summarizeError = (err: unknown): { code?: string; message?: string } | undefined => {
  if (!err || typeof err !== "object") return undefined;
  const e = err as { code?: string; message?: string; details?: string; hint?: string };
  return {
    code: e.code,
    message: [e.message, e.details, e.hint].filter(Boolean).join(" | ") || undefined,
  };
};

/**
 * Detailed variant of {@link userHasRole} — same security guarantees, but
 * returns a structured diagnostic instead of a bare boolean. Prefer this at
 * privileged entry points so failures can be logged with full context.
 */
export async function userHasRoleDetailed(
  userClient: SupabaseClient,
  userId: string,
  role: AppRole = "admin",
  fn?: string,
): Promise<RoleCheckDiagnostic> {
  const startedAt = Date.now();
  const tag = `[adminCheck${fn ? `:${fn}` : ""}]`;
  const base = { role, user_id: userId, fn } as const;

  // Primary: user-scoped RPC through the security-definer wrapper.
  let rpcErrorSummary: { code?: string; message?: string } | undefined;
  try {
    const { data, error } = await userClient.rpc("current_user_has_role", { _role: role });
    if (!error) {
      const allowed = Boolean(data);
      if (!allowed) {
        console.warn(`${tag} rpc → not allowed`, { user_id: userId, role });
      }
      return { ...base, allowed, source: "rpc", used_fallback: false, duration_ms: Date.now() - startedAt };
    }
    rpcErrorSummary = summarizeError(error);
    if (!isPermissionDenied(error)) {
      console.warn(`${tag} rpc error (non-permission)`, { user_id: userId, role, error: rpcErrorSummary });
      return {
        ...base, allowed: false, source: "rpc_error", used_fallback: false,
        rpc_error: rpcErrorSummary, duration_ms: Date.now() - startedAt,
      };
    }
    console.warn(`${tag} rpc permission denied — using service_role fallback`, { user_id: userId, role, error: rpcErrorSummary });
  } catch (err) {
    rpcErrorSummary = { message: (err as Error).message };
    console.warn(`${tag} rpc threw — using service_role fallback`, { user_id: userId, role, error: rpcErrorSummary });
  }

  // Fallback: read user_roles directly with a service_role client, scoped
  // to the *same* JWT-verified user id. We never trust caller-supplied ids.
  const admin = getServiceRoleClient();
  if (!admin) {
    console.error(`${tag} fallback unavailable: SUPABASE_SERVICE_ROLE_KEY missing`, { user_id: userId, role });
    return {
      ...base, allowed: false, source: "no_fallback", used_fallback: false,
      rpc_error: rpcErrorSummary, duration_ms: Date.now() - startedAt,
    };
  }

  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();

  if (error) {
    const fallbackErr = summarizeError(error);
    console.error(`${tag} service_role fallback failed`, { user_id: userId, role, error: fallbackErr });
    return {
      ...base, allowed: false, source: "rpc_error", used_fallback: true,
      rpc_error: rpcErrorSummary, fallback_error: fallbackErr,
      duration_ms: Date.now() - startedAt,
    };
  }

  const allowed = Boolean(data);
  console.warn(`${tag} answered via service_role fallback`, {
    user_id: userId, role, allowed, rpc_error: rpcErrorSummary,
  });
  return {
    ...base, allowed, source: "service_role", used_fallback: true,
    rpc_error: rpcErrorSummary, duration_ms: Date.now() - startedAt,
  };
}

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
  const result = await userHasRoleDetailed(userClient, userId, role);
  return result.allowed;
}

/** Convenience: admin-only check. */
export const isAdmin = (userClient: SupabaseClient, userId: string) =>
  userHasRole(userClient, userId, "admin");