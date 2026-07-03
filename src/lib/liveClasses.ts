import { supabase } from "@/integrations/supabase/client";

export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";

/**
 * Columns safe to expose to anon/auth via the standard table API.
 * `meeting_url` is intentionally excluded — it's gated by the
 * `get_live_class_meeting_url` SECURITY DEFINER RPC and only returned
 * to admins or RSVPed users.
 */
const PUBLIC_COLUMNS =
  "id,course_slug,title,description,host_name,starts_at,duration_min,status,created_by,created_at,updated_at,audience_mode";

// Public-facing view that omits sensitive columns (meeting_url, share_token).
// Anon + authenticated have SELECT on this view; the base table is owner/admin only.
const PUBLIC_VIEW = "live_classes_public" as const;

export interface LiveClass {
  id: string;
  course_slug: string;
  title: string;
  description: string | null;
  host_name: string;
  starts_at: string;
  duration_min: number;
  /** Hidden from non-RSVPed users. Always null when fetched publicly — use {@link getMeetingUrl}. */
  meeting_url: string | null;
  status: LiveClassStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  share_token?: string | null;
  audience_mode?: "open" | "enrolled" | null;
}

export interface LiveClassRsvp {
  id: string;
  class_id: string;
  user_id: string;
  reminder_opt_in: boolean;
  created_at: string;
}

/** Derived runtime state — "live now" if start ≤ now ≤ start + duration. */
export const computeRuntimeStatus = (c: LiveClass): LiveClassStatus => {
  if (c.status === "cancelled" || c.status === "ended") return c.status;
  const start = new Date(c.starts_at).getTime();
  const end = start + c.duration_min * 60_000;
  const now = Date.now();
  if (now >= start && now <= end) return "live";
  if (now > end) return "ended";
  return "scheduled";
};

export const isJoinable = (c: LiveClass) => {
  const runtime = computeRuntimeStatus(c);
  if (runtime !== "live" && runtime !== "scheduled") return false;
  // Allow joining 15 min before start
  const start = new Date(c.starts_at).getTime();
  return Date.now() >= start - 15 * 60_000;
};

export const formatStartsAt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelative = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60_000);
  if (min < 1) return diff > 0 ? "now" : "just now";
  if (min < 60) return diff > 0 ? `in ${min}m` : `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return diff > 0 ? `in ${hr}h` : `${hr}h ago`;
  const day = Math.round(hr / 24);
  return diff > 0 ? `in ${day}d` : `${day}d ago`;
};

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

export const listLiveClasses = async (opts?: { courseSlug?: string; upcomingOnly?: boolean }) => {
  let q = supabase
    .from(PUBLIC_VIEW as never)
    .select(PUBLIC_COLUMNS)
    .order("starts_at", { ascending: true });
  if (opts?.courseSlug) q = q.eq("course_slug", opts.courseSlug);
  if (opts?.upcomingOnly) q = q.in("status", ["scheduled", "live"]);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as unknown as Omit<LiveClass, "meeting_url">[]).map((c) => ({
    ...c,
    meeting_url: null,
  })) as LiveClass[];
};

export const getRsvpCount = async (classId: string) => {
  const { data, error } = await supabase.rpc("live_class_rsvp_count", { _class_id: classId });
  if (error) return 0;
  return (data as number) ?? 0;
};

export const listMyRsvps = async () => {
  const { data, error } = await supabase.from("live_class_rsvps").select("*");
  if (error) throw error;
  return (data ?? []) as LiveClassRsvp[];
};

export const rsvp = async (classId: string, userId: string, reminderOptIn = true) => {
  const { error } = await supabase.from("live_class_rsvps").insert({
    class_id: classId,
    user_id: userId,
    reminder_opt_in: reminderOptIn,
  });
  if (error && error.code !== "23505") throw error; // ignore unique-violation
};

export const cancelRsvp = async (classId: string, userId: string) => {
  const { error } = await supabase
    .from("live_class_rsvps")
    .delete()
    .eq("class_id", classId)
    .eq("user_id", userId);
  if (error) throw error;
};

export interface LiveClassInput {
  course_slug: string;
  title: string;
  description?: string | null;
  host_name?: string;
  starts_at: string;
  duration_min: number;
  meeting_url?: string | null;
  status?: LiveClassStatus;
}

export const createLiveClass = async (input: LiveClassInput, createdBy: string) => {
  const { data, error } = await supabase
    .from("live_classes")
    .insert({ ...input, created_by: createdBy })
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return { ...(data as unknown as Omit<LiveClass, "meeting_url">), meeting_url: null } as LiveClass;
};

export const updateLiveClass = async (id: string, patch: Partial<LiveClassInput>) => {
  const { error } = await supabase.from("live_classes").update(patch).eq("id", id);
  if (error) throw error;
};

export const getLiveClass = async (id: string) => {
  const { data, error } = await supabase
    .from(PUBLIC_VIEW as never)
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  // Owners/admins additionally have SELECT on the base table (RLS-gated),
  // which exposes share_token. Non-privileged callers silently get null and
  // never see the token. This keeps "Copy student link" working for teachers
  // without forcing a destructive reset.
  let shareToken: string | null = null;
  try {
    const { data: baseRow } = await supabase
      .from("live_classes")
      .select("share_token")
      .eq("id", id)
      .maybeSingle();
    shareToken = (baseRow as { share_token: string | null } | null)?.share_token ?? null;
  } catch {
    shareToken = null;
  }
  return {
    ...(data as unknown as Omit<LiveClass, "meeting_url">),
    meeting_url: null,
    share_token: shareToken,
  } as LiveClass;
};

export const setLiveClassStatus = async (id: string, status: LiveClassStatus) => {
  const { error } = await supabase
    .from("live_classes")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
};

export const deleteLiveClass = async (id: string) => {
  const { error } = await supabase.from("live_classes").delete().eq("id", id);
  if (error) throw error;
};

/**
 * Generate a fresh share_token for a class. The old token stops working
 * immediately (the public view RPC matches on the new value).
 * Requires the caller to own the class (or be admin) per RLS.
 */
export const resetShareToken = async (id: string): Promise<string> => {
  const newToken =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  const { data, error } = await supabase
    .from("live_classes")
    .update({ share_token: newToken })
    .eq("id", id)
    .select("share_token")
    .single();
  if (error) throw error;
  return (data as { share_token: string }).share_token;
};

/**
 * Fetch the meeting URL for a class. Returns `null` for callers who are
 * neither admins nor RSVPed — the gate is enforced server-side by the
 * `get_live_class_meeting_url` SECURITY DEFINER function.
 */
export const getMeetingUrl = async (classId: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc("get_live_class_meeting_url", {
    _class_id: classId,
  });
  if (error) return null;
  return (data as string | null) ?? null;
};

/**
 * Admin-only listing including the protected `meeting_url`. Throws when the
 * caller is not an admin (server-side check).
 */
export const adminListLiveClasses = async (): Promise<LiveClass[]> => {
  const { data, error } = await supabase.rpc("admin_list_live_classes");
  if (error) throw error;
  return (data ?? []) as LiveClass[];
};