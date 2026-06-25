import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { supabase } from "@/integrations/supabase/client";
import {
  createLiveClass,
  deleteLiveClass,
  formatStartsAt,
  listLiveClasses,
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
  useSeo({ title: "Live classes admin — KormoShikkha", noindex: true });

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [draft, setDraft] = useState<Draft>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setClasses(await listLiveClasses());
    } catch (err) {
      console.error(err);
      toast.error("Could not load classes.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          <Link
            to={EDTECH.routes.live}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Public schedule
          </Link>
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