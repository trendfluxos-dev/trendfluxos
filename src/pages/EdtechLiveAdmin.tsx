import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, CheckCircle2, Loader2, MonitorPlay, Pencil, Radio, Save, Trash2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { supabase } from "@/integrations/supabase/client";
import {
  createLiveClass,
  deleteLiveClass,
  formatStartsAt,
  adminListLiveClasses,
  updateLiveClass,
  type LiveClass,
  type LiveClassStatus,
} from "@/lib/liveClasses";

/**
 * Admin surface — schedule, edit, cancel and delete live classes.
 * Wrapped in <RequireRole roles={["admin"]}> at the route level.
 */
const blank = (): Draft => ({
  course_slug: EDTECH_COURSES[0]?.slug ?? "",
  title: "",
  description: "",
  host_name: "Zahid Hasan Emon",
  starts_at: "",
  duration_min: 60,
  meeting_url: "",
  status: "scheduled",
});

interface Draft {
  course_slug: string;
  title: string;
  description: string;
  host_name: string;
  starts_at: string; // datetime-local string
  duration_min: number;
  meeting_url: string;
  status: LiveClassStatus;
}

const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EdtechLiveAdmin = () => {
  useSeo({ title: "Live classes admin — কর্মশিক্ষা TED Plus", noindex: true });

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [draft, setDraft] = useState<Draft>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [instantOpen, setInstantOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setClasses(await adminListLiveClasses());
    } catch (err) {
      console.error(err);
      toast.error("Could not load classes.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Open the instant room flow when `?instant=1` is present.
  useEffect(() => {
    if (searchParams.get("instant") === "1") {
      setInstantOpen(true);
    }
  }, [searchParams]);

  const closeInstant = useCallback(() => {
    setInstantOpen(false);
    if (searchParams.get("instant")) {
      const next = new URLSearchParams(searchParams);
      next.delete("instant");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const startEdit = (c: LiveClass) => {
    setEditingId(c.id);
    setDraft({
      course_slug: c.course_slug,
      title: c.title,
      description: c.description ?? "",
      host_name: c.host_name,
      starts_at: toLocalInputValue(c.starts_at),
      duration_min: c.duration_min,
      meeting_url: c.meeting_url ?? "",
      status: c.status,
    });
  };

  const reset = () => {
    setEditingId(null);
    setDraft(blank());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.starts_at) {
      toast.error("Title and start time are required.");
      return;
    }
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Not signed in.");
      const startsIso = new Date(draft.starts_at).toISOString();
      const payload = {
        course_slug: draft.course_slug,
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        host_name: draft.host_name.trim() || "TrendFlux Faculty",
        starts_at: startsIso,
        duration_min: Number(draft.duration_min) || 60,
        meeting_url: draft.meeting_url.trim() || null,
        status: draft.status,
      };
      if (editingId) {
        await updateLiveClass(editingId, payload);
        toast.success("Class updated.");
      } else {
        await createLiveClass(payload, uid);
        toast.success("Class scheduled.");
      }
      reset();
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Save failed. Check the form and try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this class? This also removes all RSVPs.")) return;
    try {
      await deleteLiveClass(id);
      toast.success("Deleted.");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-20">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-primary">Admin</p>
            <h1 className="font-display text-xl font-semibold text-foreground">Live classes</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInstantOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-rose-500/90"
            >
              <Video className="h-3.5 w-3.5" aria-hidden /> Go live now
            </button>
            <Link
              to={EDTECH.routes.live}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Public schedule
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_2fr] lg:px-10">
        {/* Form */}
        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm lg:sticky lg:top-6 lg:self-start"
        >
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {editingId ? "Edit class" : "Schedule a class"}
            </p>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-border/60 px-2 py-1 text-[11px] text-foreground/65 hover:bg-background/60"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>

          <Field label="Course">
            <select
              value={draft.course_slug}
              onChange={(e) => setDraft((d) => ({ ...d, course_slug: e.target.value }))}
              className={inputCls}
            >
              {EDTECH_COURSES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </Field>

          <Field label="Title">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              required
              className={inputCls}
              placeholder="e.g. Week 2 — Prompting deep dive"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
              className={inputCls}
              placeholder="Optional agenda / pre-work"
            />
          </Field>

          <Field label="Host name">
            <input
              type="text"
              value={draft.host_name}
              onChange={(e) => setDraft((d) => ({ ...d, host_name: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts at">
              <input
                type="datetime-local"
                value={draft.starts_at}
                onChange={(e) => setDraft((d) => ({ ...d, starts_at: e.target.value }))}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                min={5}
                max={600}
                value={draft.duration_min}
                onChange={(e) => setDraft((d) => ({ ...d, duration_min: Number(e.target.value) }))}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Meeting URL">
            <input
              type="url"
              value={draft.meeting_url}
              onChange={(e) => setDraft((d) => ({ ...d, meeting_url: e.target.value }))}
              placeholder="https://meet.google.com/… or https://meet.jit.si/…"
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <select
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as LiveClassStatus }))}
              className={inputCls}
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live (override)</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {busy ? "Saving…" : editingId ? "Update class" : "Schedule class"}
          </button>
        </form>

        {/* List */}
        <section>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
            All classes · {classes.length}
          </p>
          {classes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-6 text-sm text-foreground/65">
              No classes scheduled yet. Use the form to schedule the first one.
            </p>
          ) : (
            <ul className="grid gap-3">
              {classes.map((c) => (
                <li key={c.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
                        {c.course_slug} · {c.status}
                      </p>
                      <h3 className="mt-1 font-display text-base font-semibold text-foreground">{c.title}</h3>
                      <p className="mt-1 text-[12px] text-foreground/65">
                        {formatStartsAt(c.starts_at)} · {c.duration_min} min · host {c.host_name}
                      </p>
                      {c.meeting_url && (
                        <a
                          href={c.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block max-w-full truncate text-[12px] text-primary hover:underline"
                        >
                          {c.meeting_url}
                        </a>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        to={EDTECH.routes.liveStudio(c.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-500/90"
                        title="Open teacher studio"
                      >
                        <MonitorPlay className="h-3 w-3" aria-hidden /> Studio
                      </Link>
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[11px] text-foreground/75 hover:bg-background/80"
                      >
                        <Pencil className="h-3 w-3" aria-hidden /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-300 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      {instantOpen && (
        <InstantRoomDialog
          onClose={closeInstant}
          onLaunched={(id) => {
            closeInstant();
            refresh();
            navigate(EDTECH.routes.liveStudio(id));
          }}
        />
      )}
    </div>
  );
};

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">{label}</span>
    {children}
  </label>
);

export default EdtechLiveAdmin;

// ---------------------------------------------------------------------------
// Instant room flow — confirms availability, creates a live class with a
// fresh Jitsi room, then navigates to the teacher studio. Designed to be
// resilient: every step reports a status, retries are one-click, and the
// dialog never gets stuck without an exit.
// ---------------------------------------------------------------------------

type StepStatus = "pending" | "running" | "done" | "error";
interface StepState {
  id: "auth" | "availability" | "room" | "create" | "navigate";
  label: string;
  status: StepStatus;
  detail?: string;
  startedAt?: number;
  elapsedMs?: number;
  slow?: boolean;
}

const initialSteps: StepState[] = [
  { id: "auth", label: "Verifying your teacher session", status: "pending" },
  { id: "availability", label: "Checking room availability", status: "pending" },
  { id: "room", label: "Reserving a fresh Jitsi room", status: "pending" },
  { id: "create", label: "Publishing the live class", status: "pending" },
  { id: "navigate", label: "Opening the teacher studio", status: "pending" },
];

const InstantRoomDialog = ({
  onClose,
  onLaunched,
}: {
  onClose: () => void;
  onLaunched: (id: string) => void;
}) => {
  const [title, setTitle] = useState("Instant session — " + new Date().toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" }));
  const [courseSlug, setCourseSlug] = useState(EDTECH_COURSES[0]?.slug ?? "");
  const [duration, setDuration] = useState(60);
  const [steps, setSteps] = useState<StepState[]>(initialSteps);
  const [running, setRunning] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const realtimeConfirmRef = useRef<{ classId?: string; confirmed: boolean }>({ confirmed: false });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Tick every 500ms while any step is running — keeps elapsed/slow flags fresh.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSteps((prev) => {
        const now = Date.now();
        let changed = false;
        const next = prev.map((s) => {
          if (s.status !== "running" || !s.startedAt) return s;
          const elapsed = now - s.startedAt;
          // "Slow" thresholds: backend work (room/create) gets 6s grace.
          const slowAt = s.id === "room" || s.id === "create" ? 6000 : 4000;
          const becameSlow = elapsed >= slowAt;
          if (elapsed !== s.elapsedMs || becameSlow !== !!s.slow) {
            changed = true;
            return { ...s, elapsedMs: elapsed, slow: becameSlow };
          }
          return s;
        });
        return changed ? next : prev;
      });
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  // Always clean up the realtime channel on unmount.
  useEffect(() => () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const setStep = (id: StepState["id"], patch: Partial<StepState>) =>
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const merged: StepState = { ...s, ...patch };
        if (patch.status === "running") {
          merged.startedAt = Date.now();
          merged.elapsedMs = 0;
          merged.slow = false;
        }
        if (patch.status === "done" || patch.status === "error") {
          merged.elapsedMs = merged.startedAt ? Date.now() - merged.startedAt : merged.elapsedMs;
          merged.slow = false;
        }
        return merged;
      }),
    );

  const launch = async () => {
    setRunning(true);
    setFatalError(null);
    setSteps(initialSteps.map((s) => ({ ...s })));
    try {
      // 1. Auth + role
      setStep("auth", { status: "running" });
      const { data: u, error: authErr } = await supabase.auth.getUser();
      if (authErr || !u.user?.id) throw new Error("You're not signed in. Please log in again.");
      const uid = u.user.id;
      setStep("auth", { status: "done", detail: u.user.email ?? "session ok" });

      // Subscribe to live_classes changes for this user BEFORE we insert, so the
      // INSERT event lands even if the REST round-trip is slow.
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      realtimeConfirmRef.current = { confirmed: false };
      channelRef.current = supabase
        .channel(`instant-room-${uid}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "live_classes", filter: `created_by=eq.${uid}` },
          (payload) => {
            const row = payload.new as { id: string; status: string };
            if (row.status === "live") {
              realtimeConfirmRef.current = { classId: row.id, confirmed: true };
              setStep("create", {
                status: "done",
                detail: `Confirmed by backend · #${row.id.slice(0, 8)}`,
              });
            }
          },
        )
        .subscribe();

      // 2. Availability — make sure this user isn't already hosting a live room
      setStep("availability", { status: "running" });
      const { data: existing, error: availErr } = await supabase
        .from("live_classes")
        .select("id,title,status")
        .eq("created_by", uid)
        .eq("status", "live")
        .limit(1);
      if (availErr) throw new Error("Could not check current rooms. Try again.");
      if (existing && existing.length > 0) {
        const open = existing[0] as { id: string; title: string };
        setStep("availability", {
          status: "error",
          detail: `You already have a live room: "${open.title}". Open it or end it first.`,
        });
        setFatalError("active-room:" + open.id);
        setRunning(false);
        return;
      }
      setStep("availability", { status: "done", detail: "No conflicting live room" });

      // 3. Reserve a fresh Jitsi room slug
      setStep("room", { status: "running" });
      const slug =
        "trendflux-" +
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10));
      const meetingUrl = `https://meet.jit.si/${slug}`;
      // Lightweight reachability probe — Jitsi serves CORS, so any response (even opaque) is fine.
      // Race against an 8s watchdog so a hung probe never blocks the flow.
      const probe = (async () => {
        try {
          await fetch(meetingUrl, { method: "HEAD", mode: "no-cors" });
          return "ok" as const;
        } catch {
          return "skipped" as const;
        }
      })();
      const timed = await Promise.race([
        probe,
        new Promise<"timeout">((r) => setTimeout(() => r("timeout"), 8000)),
      ]);
      setStep("room", {
        status: "done",
        detail:
          timed === "timeout"
            ? `${meetingUrl} · probe slow, continuing`
            : meetingUrl,
      });

      // 4. Create the class
      setStep("create", { status: "running" });
      const createPromise = createLiveClass(
        {
          course_slug: courseSlug || EDTECH_COURSES[0]?.slug || "general",
          title: title.trim() || "Instant live session",
          description: "Instant room — started on demand.",
          host_name: u.user.user_metadata?.full_name ?? u.user.email ?? "TrendFlux Faculty",
          starts_at: new Date().toISOString(),
          duration_min: Math.max(5, Math.min(600, Number(duration) || 60)),
          meeting_url: meetingUrl,
          status: "live",
        },
        uid,
      );
      // The realtime subscription above may flip this step to "done" first —
      // either way we wait on the REST call's row to get the canonical id.
      const created = await createPromise;
      if (!realtimeConfirmRef.current.confirmed) {
        setStep("create", { status: "done", detail: `Class #${created.id.slice(0, 8)}` });
      }

      // 5. Navigate
      setStep("navigate", { status: "running" });
      toast.success("Room is live — opening the studio");
      // Small delay so the user sees the final tick before unmount.
      await new Promise((r) => setTimeout(r, 350));
      setStep("navigate", { status: "done" });
      onLaunched(created.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      console.error("[instant-room]", err);
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error", detail: msg } : s)),
      );
      setFatalError(msg);
      toast.error(msg);
    } finally {
      setRunning(false);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
  };

  const activeRoomId =
    fatalError && fatalError.startsWith("active-room:") ? fatalError.slice("active-room:".length) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start an instant live room"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !running) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300">
              <Radio className="h-3 w-3" aria-hidden /> Instant room
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold text-foreground">Go live in seconds</h2>
            <p className="mt-1 text-[12px] text-foreground/65">
              We'll reserve a fresh meeting room, publish the class as <strong>live</strong>, and drop you into the teacher studio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={running}
            className="rounded-full border border-border/60 p-1.5 text-foreground/65 hover:bg-background/60 disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!running && steps.every((s) => s.status === "pending") && (
          <div className="mt-5 grid gap-3">
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">Session title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">Course</span>
                <select value={courseSlug} onChange={(e) => setCourseSlug(e.target.value)} className={inputCls}>
                  {EDTECH_COURSES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">Duration (min)</span>
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={inputCls}
                />
              </label>
            </div>
          </div>
        )}

        {(running || steps.some((s) => s.status !== "pending")) && (
          <ol className="mt-5 space-y-2.5">
            {steps.map((s) => (
              <li
                key={s.id}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-[13px] ${
                  s.status === "error"
                    ? "border-rose-500/40 bg-rose-500/10"
                    : s.status === "done"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : s.status === "running"
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/50 bg-background/40"
                }`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                  {s.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />}
                  {s.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />}
                  {s.status === "error" && <X className="h-4 w-4 text-rose-400" aria-hidden />}
                  {s.status === "pending" && <span className="h-2 w-2 rounded-full bg-foreground/30" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{s.label}</p>
                  {s.detail && (
                    <p className="mt-0.5 truncate text-[11px] text-foreground/60">{s.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          {activeRoomId ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[12px] font-semibold text-foreground/75 hover:bg-background/80"
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={() => onLaunched(activeRoomId)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <MonitorPlay className="h-3.5 w-3.5" aria-hidden /> Open existing room
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={running}
                className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[12px] font-semibold text-foreground/75 hover:bg-background/80 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={launch}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-rose-500/90 disabled:opacity-60"
              >
                {running ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Working…
                  </>
                ) : fatalError ? (
                  <>
                    <Video className="h-3.5 w-3.5" aria-hidden /> Retry
                  </>
                ) : (
                  <>
                    <Video className="h-3.5 w-3.5" aria-hidden /> Start room
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};