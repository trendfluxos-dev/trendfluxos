// Test-only helper: mint (or reuse) an ephemeral admin user and return an
// access token so integration tests can hit an edge function as a real
// admin session. Requires SUPABASE_SERVICE_ROLE_KEY at test time.
//
// Not imported by any production code path — lives under _shared/ only so
// both lead-outreach test suites can share it without duplication.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export type AdminSession = {
  userId: string;
  email: string;
  accessToken: string;
  admin: SupabaseClient;
  cleanup: () => Promise<void>;
};

/**
 * Create a throwaway confirmed admin user and sign in as them.
 * Returns `null` if the service-role key is not available in the test env
 * (Lovable Cloud does not expose it locally); callers should skip in that
 * case instead of failing.
 */
export async function createAdminSession(label = "outreach-test"): Promise<AdminSession | null> {
  const url = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !serviceKey) return null;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `admin-${label}-${suffix}@lovable-test.local`;
  const password = crypto.randomUUID();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Admin Test ${label}` },
  });
  if (createErr || !created.user) {
    throw new Error(`createUser failed: ${createErr?.message ?? "unknown"}`);
  }
  const userId = created.user.id;

  const { error: roleErr } = await admin
    .from("user_roles")
    .insert({ user_id: userId, role: "admin" });
  if (roleErr) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    throw new Error(`grant admin role failed: ${roleErr.message}`);
  }

  const anonClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: session, error: signErr } = await anonClient.auth.signInWithPassword({
    email, password,
  });
  if (signErr || !session.session?.access_token) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    throw new Error(`sign in failed: ${signErr?.message ?? "no token"}`);
  }

  return {
    userId,
    email,
    accessToken: session.session.access_token,
    admin,
    cleanup: async () => {
      try { await admin.from("outreach_execution_logs").delete().eq("actor_id", userId); } catch { /* ignore */ }
      try { await admin.from("user_roles").delete().eq("user_id", userId); } catch { /* ignore */ }
      try { await admin.auth.admin.deleteUser(userId); } catch { /* ignore */ }
    },
  };
}

/** Fails the test if the response body hints at a Postgres permission-denied
 *  regression on the role-check chain. */
export function assertNoPermissionDenied(status: number, body: unknown, ctx: string) {
  const text = typeof body === "string" ? body : JSON.stringify(body ?? {});
  const lower = text.toLowerCase();
  const looksDenied =
    lower.includes("permission denied") ||
    lower.includes("must be owner") ||
    lower.includes("42501");
  if (looksDenied) {
    throw new Error(`[${ctx}] response leaked permission-denied error: ${text}`);
  }
  // Admin sessions must never be rejected as forbidden by the role gate.
  if (status === 403) {
    throw new Error(`[${ctx}] admin session got 403 forbidden — role check regressed: ${text}`);
  }
}