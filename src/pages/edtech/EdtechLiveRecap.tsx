import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  PlayCircle,
  Users,
  Video,
} from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { useSeo } from "@/hooks/useSeo";
import { supabase } from "@/integrations/supabase/client";
import {
  formatRelative,
  formatStartsAt,
  getLiveClass,
  getRsvpCount,
  listLiveClasses,
  type LiveClass,
} from "@/lib/liveClasses";

interface Material {
  id: string;
  kind: string | null;
  title: string;
  external_url: string | null;
  storage_path: string | null;
}

interface Recording {
  id: string;
  title: string | null;
  description: string | null;
  duration_sec: number | null;
  recorded_at: string | null;
  public_token: string | null;
}

interface Notes {
  content: string;
  updated_at: string;
}

const fmtDuration = (sec: number | null) => {
  if (!sec || sec <= 0) return "";
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

/**
 * Post-class recap page. Shown after a live session ends — surfaces an
 * attendance summary, teacher's lesson notes / class description, downloadable
 * materials and recordings, plus quick links to the next scheduled sessions
 * in the same course track.
 */
const EdtechLiveRecap = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [cls, setCls] = useState<LiveClass | null>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [iAttended, setIAttended] = useState<boolean | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Notes | null>(null);
  const [upcoming, setUpcoming] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: cls ? `Recap — ${cls.title}` : "Class recap",
    description:
      "Attendance summary, lesson notes, materials and next-session links for the কর্মশিক্ষা TED Plus live class.",
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getLiveClass(id);
        if (cancelled) return;
        setCls(data);
        const [count, mats, recs, notesRes, rsvpMine, upcomingList] = await Promise.all([
          getRsvpCount(id),
          supabase
            .from("class_materials")
            .select("id, kind, title, external_url, storage_path")
            .eq("class_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("class_recordings")
            .select("id, title, description, duration_sec, recorded_at, public_token")
            .eq("class_id", id)
            .order("recorded_at", { ascending: false }),
          supabase
            .from("teacher_notes")
            .select("content, updated_at")
            .eq("class_id", id)
            .maybeSingle(),
          supabase
            .from("live_class_rsvps")
            .select("id")
            .eq("class_id", id)
            .limit(1),
          data
            ? listLiveClasses({ courseSlug: data.course_slug, upcomingOnly: true })
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setRsvpCount(count);
        setMaterials((mats.data ?? []) as Material[]);
        setRecordings((recs.data ?? []) as Recording[]);
        if (notesRes.data?.content) {
          setNotes({
            content: notesRes.data.content as string,
            updated_at: notesRes.data.updated_at as string,
          });
        }
        setIAttended((rsvpMine.data ?? []).length > 0);
        setUpcoming(
          (upcomingList as LiveClass[])
            .filter((c) => c.id !== id && new Date(c.starts_at).getTime() > Date.now())
            .slice(0, 3),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const lessonNotes = notes?.content || cls?.description || "";

  const endedAt = useMemo(() => {
    if (!cls) return null;
    return new Date(new Date(cls.starts_at).getTime() + cls.duration_min * 60_000);
  }, [cls]);

  return (
    <EdtechShell>
      <EdtechHeader />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <Link
          to="/edtech/live"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All live classes
        </Link>

        {loading && !cls ? (
          <div className="mt-12 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading recap…
          </div>
        ) : !cls ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold">Class not found</h1>
            <p className="mt-2 text-muted-foreground">
              The session may have been removed. Browse upcoming live classes instead.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Class recap
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
                {cls.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Hosted by {cls.host_name} · {formatStartsAt(cls.starts_at)} ·{" "}
                {cls.duration_min} min
              </p>
              {endedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ended {formatRelative(endedAt.toISOString())}
                </p>
              )}
            </header>

            {/* Attendance summary */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Registered
                </div>
                <div className="mt-2 text-3xl font-semibold">{rsvpCount}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total RSVPs for this session
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Your attendance
                </div>
                <div className="mt-2 text-lg font-medium">
                  {iAttended === null
                    ? "Sign in to view"
                    : iAttended
                      ? "You attended"
                      : "Not registered"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on your RSVP record
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Video className="h-3.5 w-3.5" /> Recordings
                </div>
                <div className="mt-2 text-3xl font-semibold">{recordings.length}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Available to replay below
                </p>
              </div>
            </div>

            {/* Lesson notes */}
            <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> Lesson notes
              </div>
              {lessonNotes ? (
                <article className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {lessonNotes}
                </article>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No written notes were published for this session.
                </p>
              )}
              {notes?.updated_at && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Notes last updated {formatRelative(notes.updated_at)}
                </p>
              )}
            </section>

            {/* Materials */}
            {materials.length > 0 && (
              <section className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
                  Materials
                </h2>
                <ul className="mt-3 divide-y divide-border">
                  {materials.map((m) => {
                    const href = m.external_url ?? undefined;
                    return (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <span className="truncate">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">
                            {m.kind ?? "file"}
                          </span>
                          {m.title}
                        </span>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">attached</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Recordings */}
            {recordings.length > 0 && (
              <section className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
                  Replay
                </h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {recordings.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <PlayCircle className="h-4 w-4 text-primary" />
                        {r.title || "Recording"}
                      </div>
                      {r.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {r.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{fmtDuration(r.duration_sec)}</span>
                        {r.public_token ? (
                          <Link
                            to={`/class-recording/${r.public_token}`}
                            className="text-primary hover:underline"
                          >
                            Watch replay
                          </Link>
                        ) : (
                          <span>Attendee-only</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Next sessions */}
            <section className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Next sessions
              </div>
              {upcoming.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No upcoming sessions scheduled in this track yet.{" "}
                  <Link to="/edtech/live" className="text-primary hover:underline">
                    Browse all live classes
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                  {upcoming.map((u) => (
                    <li
                      key={u.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        {formatRelative(u.starts_at)}
                      </div>
                      <div className="mt-1 text-sm font-medium line-clamp-2">{u.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatStartsAt(u.starts_at)} · {u.duration_min} min
                      </div>
                      <Link
                        to={`/edtech/live/watch/${u.id}`}
                        className="mt-3 inline-flex text-sm text-primary hover:underline"
                      >
                        Open session →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <Link
                  to="/edtech/live"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  View full live class schedule →
                </Link>
              </div>
            </section>
          </>
        )}
      </section>
    </EdtechShell>
  );
};

export default EdtechLiveRecap;