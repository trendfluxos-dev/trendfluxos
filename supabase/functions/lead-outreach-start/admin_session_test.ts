// Integration test: an admin session must be able to invoke
// lead-outreach-start without ever hitting a "permission denied" regression
// on the has_role / current_user_has_role chain.
//
// We use a non-existent lead_id so the function short-circuits with
// `lead_not_found` (404) *after* passing the admin gate. The important
// assertions are:
//   - status is NOT 403 (would mean the role check failed)
//   - body does NOT contain "permission denied" / "42501"
//
// Skipped when SUPABASE_SERVICE_ROLE_KEY is unavailable (Lovable Cloud does
// not expose it in local dev; runs in the edge test runner where it is set).
import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
loadSync({ export: true, allowEmptyValues: true, examplePath: null, defaultsPath: null });
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createAdminSession, assertNoPermissionDenied } from "../_shared/adminSessionTestHelper.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/lead-outreach-start`;

Deno.test("admin session passes the role gate and reaches business logic", async () => {
  const session = await createAdminSession("outreach-start");
  if (!session) {
    console.warn("[skip] SUPABASE_SERVICE_ROLE_KEY not available — cannot mint admin session");
    return;
  }

  try {
    const bogusLeadId = "00000000-0000-0000-0000-000000000000";
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ lead_id: bogusLeadId }),
    });
    const body = await res.json();

    assertNoPermissionDenied(res.status, body, "lead-outreach-start");
    assertNotEquals(res.status, 401, `admin session rejected as unauthorized: ${JSON.stringify(body)}`);
    assertNotEquals(res.status, 403, `admin session rejected as forbidden: ${JSON.stringify(body)}`);
    // Business logic should now report the missing lead, proving the gate passed.
    assertEquals(res.status, 404);
    assertEquals(body.error, "lead_not_found");
  } finally {
    await session.cleanup();
  }
});