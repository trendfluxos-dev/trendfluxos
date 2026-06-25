import { supabase } from "@/integrations/supabase/client";

export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface LiveClass {
  id: string;
  course_slug: string;
  title: string;
  description: string | null;
  host_name: string;
  starts_at: string;
  duration_min: number;
  meeting_url: string | null;
  status: LiveClassStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
  let q = supabase.from("live_classes").select("*").order("starts_at", { ascending: true });
  if (opts?.courseSlug) q = q.eq("course_slug", opts.courseSlug);
  if (opts?.upcomingOnly) q = q.in("status", ["scheduled", "live"]);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as LiveClass[];
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
    .select("*")
    .single();
  if (error) throw error;
  return data as LiveClass;
};

export const updateLiveClass = async (id: string, patch: Partial<LiveClassInput>) => {
  const { error } = await supabase.from("live_classes").update(patch).eq("id", id);
  if (error) throw error;
};

export const getLiveClass = async (id: string) => {
  const { data, error } = await supabase
    .from("live_classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as LiveClass | null;
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