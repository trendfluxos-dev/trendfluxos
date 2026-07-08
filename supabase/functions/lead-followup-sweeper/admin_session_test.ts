// Integration test: an admin session must be able to invoke
// lead-followup-sweeper without ever tripping a "permission denied"
// regression on the role-check chain.
//
// The sweeper has no required body — with an admin session it should scan
// due follow-ups and return 200 with a JSON summary. We do not assert on
// how many leads were processed (that depends on live data). We only assert:
//   - status is 200 (admin gate accepted the caller)
//   - body does NOT contain any "permission denied" hint
//
// Skipped when SUPABASE_SERVICE_ROLE_KEY is unavailable.
import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
loadSync({ export: true, allowEmptyValues: true, examplePath: null, defaultsPath: null });
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createAdminSession, assertNoPermissionDenied } from "../_shared/adminSessionTestHelper.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/lead-followup-sweeper`;

Deno.test("admin session can trigger the sweeper without permission denied", async () => {
  const session = await createAdminSession("followup-sweeper");
  if (!session) {
    console.warn("[skip] SUPABASE_SERVICE_ROLE_KEY not available — cannot mint admin session");
    return;
  }

  try {
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ dry_run: true }),
    });
    const text = await res.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }

    assertNoPermissionDenied(res.status, body, "lead-followup-sweeper");
    assertEquals(
      res.status,
      200,
      `admin session should reach the sweeper's success path — got ${res.status}: ${text}`,
    );
  } finally {
    await session.cleanup();
  }
});