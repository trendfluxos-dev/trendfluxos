// Regression tests for the role-check gate on lead-followup-sweeper.
// The function accepts either (a) an admin user session OR (b) an internal
// x-n8n-secret header. We assert every unauthenticated path is rejected so
// the has_role/current_user_has_role gate cannot silently regress.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/lead-followup-sweeper`;

Deno.test("OPTIONS preflight returns ok", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("No auth + no secret → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});

Deno.test("Wrong x-n8n-secret + no auth → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      "x-n8n-secret": "definitely-not-the-secret",
    },
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});

Deno.test("Anon bearer (no user session) → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});

Deno.test("Malformed bearer → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: "Bearer not-a-real-jwt",
    },
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});