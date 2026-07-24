import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

const isoDate = z
  .string()
  .describe("ISO 8601 date or datetime, e.g. 2026-07-01 or 2026-07-01T00:00:00Z")
  .refine((s) => !Number.isNaN(Date.parse(s)), "must be a valid ISO date");

export default defineTool({
  name: "list_strategy_bookings",
  title: "List strategy bookings (admin)",
  description:
    "Admin-only. List TrendFlux strategy call bookings whose scheduled slot falls between `from` and `to` (inclusive). Returns contact info, session type, status, meeting link, and timestamps — for reporting and follow-ups.",
  inputSchema: {
    from: isoDate,
    to: isoDate,
    status: z
      .enum(["pending", "confirmed", "cancelled", "completed", "no_show"])
      .optional()
      .describe("Optional status filter."),
    limit: z.number().int().min(1).max(500).optional().describe("Max rows (default 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    // Admin gate via SECURITY DEFINER wrapper — runs as the caller.
    const { data: isAdmin, error: roleErr } = await supabase.rpc("current_user_has_role", {
      _role: "admin" as never,
    });
    if (roleErr) {
      return { content: [{ type: "text", text: `Role check failed: ${roleErr.message}` }], isError: true };
    }
    if (!isAdmin) {
      return { content: [{ type: "text", text: "Forbidden: admin role required." }], isError: true };
    }

    const fromIso = new Date(from).toISOString();
    const toIso = new Date(to).toISOString();
    if (fromIso > toIso) {
      return { content: [{ type: "text", text: "`from` must be earlier than or equal to `to`." }], isError: true };
    }

    // Prefer confirmed_slot_iso when present, otherwise requested_slot_iso.
    let query = supabase
      .from("strategy_bookings")
      .select(
        "id, name, email, phone, company, goal, session_type, status, requested_slot_iso, confirmed_slot_iso, meet_url, client_timezone, organizer_timezone, created_at, updated_at",
      )
      .or(
        `and(confirmed_slot_iso.gte.${fromIso},confirmed_slot_iso.lte.${toIso}),and(confirmed_slot_iso.is.null,requested_slot_iso.gte.${fromIso},requested_slot_iso.lte.${toIso})`,
      )
      .order("confirmed_slot_iso", { ascending: true, nullsFirst: false })
      .order("requested_slot_iso", { ascending: true })
      .limit(limit ?? 200);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const rows = data ?? [];
    const summary = `${rows.length} booking(s) between ${fromIso} and ${toIso}${status ? ` (status=${status})` : ""}.`;
    return {
      content: [
        { type: "text", text: summary },
        { type: "text", text: JSON.stringify(rows, null, 2) },
      ],
      structuredContent: { bookings: rows, from: fromIso, to: toIso, count: rows.length },
    };
  },
});