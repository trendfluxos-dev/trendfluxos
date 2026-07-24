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
    "Admin-only. List TrendFlux strategy call bookings whose scheduled slot falls between `from` and `to` (inclusive). Supports pagination (`limit` + `offset`) and sorting (`sort_by` + `sort_dir`) so large date ranges can be exported page-by-page without timeouts. Returns contact info, session type, status, meeting link, timestamps, and pagination metadata.",
  inputSchema: {
    from: isoDate,
    to: isoDate,
    status: z
      .enum(["pending", "confirmed", "cancelled", "completed", "no_show"])
      .optional()
      .describe("Optional status filter."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe("Page size (default 200, max 500)."),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Row offset for pagination (default 0). Use `next_offset` from the previous page."),
    sort_by: z
      .enum(["scheduled_slot", "confirmed_slot_iso", "requested_slot_iso", "created_at", "updated_at"])
      .optional()
      .describe("Sort column. `scheduled_slot` (default) sorts by confirmed_slot_iso and falls back to requested_slot_iso for pending rows."),
    sort_dir: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction (default `asc`)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, status, limit, offset, sort_by, sort_dir }, ctx) => {
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

    const pageSize = limit ?? 200;
    const pageOffset = offset ?? 0;
    const dir = sort_dir ?? "asc";
    const asc = dir === "asc";
    const sortCol = sort_by ?? "scheduled_slot";

    // Prefer confirmed_slot_iso when present, otherwise requested_slot_iso.
    const rangeFilter = `and(confirmed_slot_iso.gte.${fromIso},confirmed_slot_iso.lte.${toIso}),and(confirmed_slot_iso.is.null,requested_slot_iso.gte.${fromIso},requested_slot_iso.lte.${toIso})`;
    const selectCols =
      "id, name, email, phone, company, goal, session_type, status, requested_slot_iso, confirmed_slot_iso, meet_url, client_timezone, organizer_timezone, created_at, updated_at";

    let query = supabase
      .from("strategy_bookings")
      .select(selectCols, { count: "exact" })
      .or(rangeFilter);

    if (status) query = query.eq("status", status);

    if (sortCol === "scheduled_slot") {
      // Two-key sort so pending rows (null confirmed_slot) fall back to requested_slot.
      query = query
        .order("confirmed_slot_iso", { ascending: asc, nullsFirst: !asc })
        .order("requested_slot_iso", { ascending: asc });
    } else {
      query = query.order(sortCol, { ascending: asc });
    }

    // Deterministic tiebreaker so pagination is stable across pages.
    query = query.order("id", { ascending: true });

    query = query.range(pageOffset, pageOffset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const rows = data ?? [];
    const total = count ?? rows.length + pageOffset;
    const returned = rows.length;
    const hasMore = pageOffset + returned < total;
    const nextOffset = hasMore ? pageOffset + returned : null;
    const summary =
      `${returned} of ${total} booking(s) between ${fromIso} and ${toIso}` +
      `${status ? ` (status=${status})` : ""}` +
      ` — page offset=${pageOffset}, size=${pageSize}, sort=${sortCol} ${dir}` +
      `${hasMore ? `, next_offset=${nextOffset}` : `, end of results`}.`;
    return {
      content: [
        { type: "text", text: summary },
        { type: "text", text: JSON.stringify(rows, null, 2) },
      ],
      structuredContent: {
        bookings: rows,
        from: fromIso,
        to: toIso,
        count: returned,
        total,
        offset: pageOffset,
        limit: pageSize,
        next_offset: nextOffset,
        has_more: hasMore,
        sort_by: sortCol,
        sort_dir: dir,
      },
    };
  },
});