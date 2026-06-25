/**
 * Live state helpers — single source of truth for what is currently
 * visible to students inside a `live_classes` session.
 *
 * Lock spec (EISH "Controlled Tab Broadcast" model):
 *   - `live_state.is_live_visible` defaults to FALSE. Nothing in the
 *     teacher's studio is ever sent to students unless the teacher
 *     explicitly flips this flag with "Send to Live".
 *   - There is at most one `active_source_type` (material / whiteboard /
 *     web / video). Switching while live = instant hot-swap, no extra
 *     button press.
 *   - `live_state` is intentionally NOT in the supabase_realtime
 *     publication. Students learn about changes via the broadcast channel
 *     below so postgres_changes cannot leak another teacher's payload.
 *   - Teacher's secret notebook (`teacher_notes`) is NEVER referenced
 *     here — it has no path to the student channel by construction.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type ActiveSourceType =
  | "none"
  | "material"
  | "whiteboard"
  | "web"
  | "video";

export interface LiveStateRow {
  class_id: string;
  active_source_type: ActiveSourceType;
  payload: Record<string, unknown>;
  is_live_visible: boolean;
  whiteboard_snapshot: Record<string, unknown> | null;
  updated_at: string;
  updated_by: string | null;
}

const channelKey = (classId: string) => `class:${classId}`;

/** Fetch the row, returning a synthetic default if none exists yet. */
export async function fetchLiveState(classId: string): Promise<LiveStateRow> {
  const { data, error } = await supabase
    .from("live_state")
    .select("*")
    .eq("class_id", classId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as LiveStateRow;
  return {
    class_id: classId,
    active_source_type: "none",
    payload: {},
    is_live_visible: false,
    whiteboard_snapshot: null,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };
}

/**
 * Upsert live_state and broadcast a `live_changed` event so subscribed
 * students refresh immediately. Pass `notifyStudents: false` for the
 * teacher's private stage changes that must stay invisible.
 */
export async function setLiveState(
  classId: string,
  patch: Partial<Pick<LiveStateRow, "active_source_type" | "payload" | "is_live_visible" | "whiteboard_snapshot">>,
  options: { notifyStudents?: boolean } = {},
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const row = {
    class_id: classId,
    active_source_type: patch.active_source_type ?? "none",
    payload: (patch.payload ?? {}) as unknown as Json,
    is_live_visible: patch.is_live_visible ?? false,
    whiteboard_snapshot: (patch.whiteboard_snapshot ?? null) as unknown as Json,
    updated_by: auth.user?.id ?? null,
  };
  const { error } = await supabase
    .from("live_state")
    .upsert(row, { onConflict: "class_id" });
  if (error) throw error;

  if (options.notifyStudents !== false && row.is_live_visible) {
    const channel = supabase.channel(channelKey(classId));
    await channel.subscribe();
    channel.send({ type: "broadcast", event: "live_changed", payload: { at: Date.now() } });
    void supabase.removeChannel(channel);
  }
}

/**
 * React hook for the student/watcher side: returns the latest live state and
 * re-fetches whenever the teacher broadcasts `live_changed`.
 */
export function useLiveStateForStudent(classId: string | null) {
  const [state, setState] = useState<LiveStateRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) {
      setState(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const refresh = async () => {
      try {
        const next = await fetchLiveState(classId);
        if (!cancelled) setState(next);
      } catch {
        /* swallow — UI will show "waiting" placeholder */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void refresh();

    const channel = supabase
      .channel(channelKey(classId), { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "live_changed" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [classId]);

  return { state, loading };
}