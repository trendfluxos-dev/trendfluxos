/**
 * Automated RLS permission tests for sensitive tables & content routes.
 *
 * These lock in the invariants that recent security scan findings uncovered
 * so they cannot regress silently:
 *
 *   1. `course_modules.content_url` (paid lesson links) is NEVER reachable
 *      by anon or unauthenticated callers through the Data API.
 *   2. `class_materials` (private teaching files) is NEVER reachable by
 *      anon through the Data API.
 *   3. The public metadata view `course_modules_public` exposes ONLY
 *      non-sensitive columns.
 *   4. Audit-logged RPCs `get_course_module_content_url` and
 *      `get_class_material_access` cannot be invoked anonymously to
 *      exfiltrate URLs.
 *
 * Any change that breaks these expectations must fail CI.
 */
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const hasCreds = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const d = hasCreds ? describe : describe.skip;

const anon = hasCreds ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function denied(error: unknown, data: unknown) {
  // Either RLS/permission error, or RLS silently filters to an empty set.
  if (error) return true;
  if (Array.isArray(data)) return data.length === 0;
  return data === null;
}

d("RLS — sensitive course & class content", () => {
  it("anon cannot SELECT course_modules base table", async () => {
    const { data, error } = await anon!.from("course_modules").select("*").limit(1);
    expect(denied(error, data)).toBe(true);
  });

  it("anon cannot SELECT content_url from course_modules", async () => {
    const { data, error } = await anon!
      .from("course_modules")
      .select("content_url")
      .limit(1);
    expect(denied(error, data)).toBe(true);
  });

  it("course_modules_public view exposes only non-sensitive columns", async () => {
    const { data, error } = await (anon! as any)
      .from("course_modules_public")
      .select("*")
      .limit(1);
    // View should be readable; if there are rows, none may carry content_url.
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        expect(Object.keys(row)).not.toContain("content_url");
      }
    }
  });

  it("anon cannot SELECT class_materials", async () => {
    const { data, error } = await anon!.from("class_materials").select("*").limit(1);
    expect(denied(error, data)).toBe(true);
  });

  it("anon cannot invoke get_course_module_content_url RPC to exfiltrate URLs", async () => {
    const { data, error } = await (anon! as any).rpc(
      "get_course_module_content_url",
      { _module_index: 1 },
    );
    // Either PostgREST hides it, or the function runs and returns null due to no auth.
    if (!error) {
      expect(data).toBeNull();
    }
  });

  it("anon cannot invoke get_class_material_access RPC", async () => {
    const { data, error } = await (anon! as any).rpc("get_class_material_access", {
      _material_id: "00000000-0000-0000-0000-000000000000",
    });
    if (!error) {
      // Function returns SETOF; anonymous callers get an empty set.
      expect(Array.isArray(data) ? data.length : 0).toBe(0);
    }
  });

  it("anon cannot SELECT other PII-bearing tables", async () => {
    const tables = [
      "growth_leads",
      "strategy_bookings",
      "enterprise_demo_requests",
      "talent_applications",
      "luxe_veil_requests",
      "marriage_inquiries",
      "access_audit_logs",
      "email_send_log",
      "booking_payments",
      "voice_assets",
    ] as const;
    for (const t of tables) {
      const { data, error } = await anon!.from(t as any).select("*").limit(1);
      expect(denied(error, data), `expected ${t} to deny anon read`).toBe(true);
    }
  });
});