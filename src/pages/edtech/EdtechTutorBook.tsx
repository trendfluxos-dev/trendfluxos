import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { EDTECH } from "@/config/edtech";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

const EdtechTutorBook = () => {
  useSeo({ title: "Book a tutor — TrendFlux EdTech", noindex: true });
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUid(data.session?.user.id ?? null);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      toast.error("Please sign in to book.");
      navigate("/auth");
      return;
    }
    if (!subject.trim() || !startsAt) {
      toast.error("Subject এবং start time আবশ্যক।");
      return;
    }
    setBusy(true);
    try {
      const start = new Date(startsAt);
      const end = new Date(start.getTime() + duration * 60_000);
      const { error } = await supabase.from("tutor_bookings").insert({
        tutor_id: id,
        student_id: uid,
        subject: subject.trim(),
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "requested",
        notes: notes.trim() || null,
        price: 0,
        currency: "BDT",
      });
      if (error) throw error;
      toast.success("Booking requested. Payment opens in Phase 2.");
      navigate(EDTECH.routes.myBookings);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Could not request booking.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <EdtechShell>
      <EdtechHeader />
      <EdtechPageHeader
        eyebrow="Book a 1:1 session"
        title="Request booking"
        description="Tutor 10 মিনিটের মধ্যে accept বা decline করবেন। Payment Phase-2 এ activate হবে।"
        actions={
          <Link to={EDTECH.routes.tutorProfile(id)} className="text-sm text-foreground/70 hover:text-foreground">
            ← Back to profile
          </Link>
        }
      />
      <main className="mx-auto max-w-xl px-6 py-10 lg:px-10">
        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-border/60 bg-card/40 p-6"
        >
          <Field label="Subject">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              required
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
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Sending…" : "Request booking"}
          </button>
        </form>
      </main>
    </EdtechShell>
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

export default EdtechTutorBook;