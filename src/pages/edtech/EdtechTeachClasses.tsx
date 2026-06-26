import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Radio, Users, X } from "lucide-react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { StudioOnboardingChecklist } from "@/components/edtech/StudioOnboardingChecklist";
import { EDTECH } from "@/config/edtech";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import {
  computeRuntimeStatus,
  createLiveClass,
  formatStartsAt,
  type LiveClass,
} from "@/lib/liveClasses";

const EdtechTeachClasses = () => {
  useSeo({ title: "My classes — TrendFlux EdTech", noindex: true });
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const reload = async (userId: string) => {
    const { data, error } = await supabase
      .from("live_classes")
      .select("id,course_slug,title,description,host_name,starts_at,duration_min,status,created_by,created_at,updated_at")
      .eq("created_by", userId)
      .order("starts_at", { ascending: false });
    if (error) toast.error(error.message);
    setClasses(((data ?? []) as unknown as LiveClass[]).map((c) => ({ ...c, meeting_url: null })));
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user.id ?? null;
      setUid(id);
      if (id) await reload(id);
      setLoading(false);
    })();
  }, []);

  return (
    <EdtechShell>
      <EdtechHeader />
      <EdtechPageHeader
        eyebrow="Teacher · Classes"
        title="My classes"
        description="Live sessions আপনি host করছেন। নতুন class create করতে audience gate (open বা enrolled-only) ঠিক করুন।"
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New class
          </button>
        }
      />
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        {!loading && (
          <StudioOnboardingChecklist
            classCount={classes.length}
            firstClassId={classes[0]?.id ?? null}
            hasLiveActivity={classes.some((c) => c.status === "live" || c.status === "ended")}
          />
        )}
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
            <Radio className="mx-auto h-10 w-10 text-foreground/40" />
            <p className="mt-3 font-display text-lg">এখনো কোনো class নেই।</p>
            <p className="mt-1 text-sm text-foreground/60">
              "+ New class" press করে শুরু করুন।
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {classes.map((c) => {
              const rt = computeRuntimeStatus(c);
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:bg-card/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-[15px] font-semibold">{c.title}</h3>
                        <StatusPill status={rt} />
                      </div>
                      <p className="mt-1 text-[12px] text-foreground/60">
                        {formatStartsAt(c.starts_at)} · {c.duration_min} min · {c.host_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={EDTECH.routes.liveStudio(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
                      >
                        <Radio className="h-3.5 w-3.5" /> Studio
                      </Link>
                      <Link
                        to={EDTECH.routes.liveWatch(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-semibold"
                      >
                        <Users className="h-3.5 w-3.5" /> Student view
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {open && uid && (
        <CreateClassModal
          userId={uid}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            void reload(uid);
          }}
        />
      )}
    </EdtechShell>
  );
};

const StatusPill = ({ status }: { status: string }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
      status === "live"
        ? "bg-rose-500/15 text-rose-400"
        : status === "scheduled"
        ? "bg-primary/15 text-primary"
        : "bg-muted text-foreground/60",
    ].join(" ")}
  >
    {status}
  </span>
);

const CreateClassModal = ({
  userId,
  onClose,
  onCreated,
}: {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(45);
  const [audience, setAudience] = useState<"open" | "enrolled">("open");
  const [courseSlug, setCourseSlug] = useState("general");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startsAt) {
      toast.error("Title এবং start time আবশ্যক।");
      return;
    }
    setBusy(true);
    try {
      const cls = await createLiveClass(
        {
          course_slug: courseSlug || "general",
          title: title.trim(),
          description: description.trim() || null,
          starts_at: new Date(startsAt).toISOString(),
          duration_min: duration,
          meeting_url: meetingUrl.trim() || null,
          status: "scheduled",
        },
        userId,
      );
      // Persist audience_mode separately (not in LiveClassInput type)
      await supabase
        .from("live_classes")
        .update({ audience_mode: audience })
        .eq("id", cls.id);
      toast.success("Class created.");
      onCreated();
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Could not create class.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl border border-border/60 bg-card p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">New class</h2>
          <button type="button" onClick={onClose} className="text-foreground/60 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts at">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 45)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label="Course slug">
            <input
              value={courseSlug}
              onChange={(e) => setCourseSlug(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Meeting URL (Meet/Zoom)">
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Audience">
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: "open", label: "Any registered student" },
                { v: "enrolled", label: "Enrolled only" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setAudience(o.v)}
                  className={[
                    "rounded-lg border px-3 py-2 text-left text-[12px]",
                    audience === o.v
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground/70",
                  ].join(" ")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create class"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/60">
      {label}
    </span>
    {children}
  </label>
);

export default EdtechTeachClasses;