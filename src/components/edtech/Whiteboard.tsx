import { useEffect, useRef } from "react";
import { Tldraw, type Editor, type TLEditorSnapshot, getSnapshot, loadSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  classId: string;
  mode: "edit" | "view";
  initialSnapshot?: unknown;
};

function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => { last = Date.now(); timer = null; fn(...args); }, remaining);
    }
  }) as T;
}

/**
 * Tldraw whiteboard wired to Supabase realtime + live_state persistence.
 *
 * - mode="edit": teacher draws; updates broadcast on `wb:<classId>` and
 *   persist to `live_state.whiteboard_snapshot` (throttled).
 * - mode="view": student reads the snapshot and listens for updates.
 */
export function Whiteboard({ classId, mode, initialSnapshot }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastPersistRef = useRef<number>(0);
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    const ch = supabase.channel(`wb:${classId}`, { config: { broadcast: { self: false } } });
    channelRef.current = ch;
    ch.on("broadcast", { event: "wb_update" }, ({ payload }: { payload?: { snapshot?: unknown } }) => {
      const ed = editorRef.current;
      if (!ed || !payload?.snapshot) return;
      try {
        applyingRemoteRef.current = true;
        loadSnapshot(ed.store, payload.snapshot as TLEditorSnapshot);
      } catch (e) {
        console.warn("whiteboard load failed", e);
      } finally {
        applyingRemoteRef.current = false;
      }
    }).subscribe();
    return () => { void supabase.removeChannel(ch); channelRef.current = null; };
  }, [classId]);

  function handleMount(editor: Editor) {
    editorRef.current = editor;

    if (initialSnapshot) {
      try { loadSnapshot(editor.store, initialSnapshot as TLEditorSnapshot); } catch (e) { console.warn(e); }
    }

    if (mode === "view") {
      editor.updateInstanceState({ isReadonly: true });
      return;
    }

    const push = throttle(() => {
      if (applyingRemoteRef.current) return;
      const snap = getSnapshot(editor.store);
      channelRef.current?.send({ type: "broadcast", event: "wb_update", payload: { snapshot: snap } });
      const now = Date.now();
      if (now - lastPersistRef.current > 2500) {
        lastPersistRef.current = now;
        void supabase.from("live_state").upsert(
          { class_id: classId, whiteboard_snapshot: snap as never, active_source_type: "whiteboard" },
          { onConflict: "class_id" },
        );
      }
    }, 150);

    editor.store.listen(() => push(), { scope: "document", source: "user" });
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-white">
      <Tldraw onMount={handleMount} hideUi={mode === "view"} />
    </div>
  );
}