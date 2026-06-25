/**
 * Access regression: live class `meeting_url` must not be reachable by anon
 * callers, neither through the table API nor through the SECURITY DEFINER
 * RPC `get_live_class_meeting_url`. The admin listing RPC must also reject
 * unauthenticated callers.
 *
 * Hits the real Lovable Cloud backend with only the publishable key.
 */
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const hasCreds = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const d = hasCreds ? describe : describe.skip;

const anon = hasCreds ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

d("Live class meeting_url access restrictions", () => {
  it("anon cannot SELECT meeting_url column directly", async () => {
    // Asking for the protected column should fail with a permission error.
    const { data, error } = await anon!
      .from("live_classes")
      .select("id, meeting_url")
      .limit(1);
    // Either the request errors (permission denied) or the column comes back
    // missing/null — both are acceptable; what's NOT acceptable is a real URL.
    if (!error) {
      for (const row of data ?? []) {
        expect((row as { meeting_url: unknown }).meeting_url ?? null).toBeNull();
      }
    } else {
      expect(error.message.toLowerCase()).toMatch(/permission|denied|column/);
    }
  });

  it("anon SELECT * does not leak meeting_url", async () => {
    const { data, error } = await anon!.from("live_classes").select("*").limit(5);
    // SELECT * shouldn't fail (other columns are public) — but if it does,
    // that's still a deny path, which is fine.
    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission|denied|column/);
      return;
    }
    for (const row of data ?? []) {
      expect((row as Record<string, unknown>).meeting_url ?? null).toBeNull();
    }
  });

  it("anon RPC get_live_class_meeting_url returns null (no session)", async () => {
    const { data, error } = await anon!.rpc("get_live_class_meeting_url", {
      _class_id: "00000000-0000-0000-0000-000000000000",
    });
    // Either permission denied or null payload — never a string.
    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission|denied|forbidden/);
    } else {
      expect(data).toBeNull();
    }
  });

  it("anon RPC admin_list_live_classes is rejected", async () => {
    const { data, error } = await anon!.rpc("admin_list_live_classes");
    // Anonymous EXECUTE was revoked, so this should error.
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
});