// Regression tests for the role-check gate on lead-outreach-start.
// We only assert behaviour reachable without an admin session:
//   - CORS preflight passes
//   - Wrong HTTP method is rejected
//   - Missing / invalid Authorization is rejected with 401
// These guard against accidental removal of the auth + has_role gate.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/lead-outreach-start`;

Deno.test("OPTIONS preflight returns ok", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("GET is rejected as method_not_allowed", async () => {
  const res = await fetch(FN_URL, {
    method: "GET",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  const body = await res.json();
  assertEquals(res.status, 405);
  assertEquals(body.error, "method_not_allowed");
});

Deno.test("POST without Authorization header → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify({ lead_id: "00000000-0000-0000-0000-000000000000" }),
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});

Deno.test("POST with anon bearer (no user session) → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify({ lead_id: "00000000-0000-0000-0000-000000000000" }),
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});

Deno.test("POST with malformed bearer → 401", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: "Bearer not-a-real-jwt",
    },
    body: JSON.stringify({ lead_id: "00000000-0000-0000-0000-000000000000" }),
  });
  const body = await res.json();
  assertEquals(res.status, 401);
  assertEquals(body.error, "unauthorized");
});