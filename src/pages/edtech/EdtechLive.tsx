import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  PlayCircle,
  Radio,
  Sparkles,
  Video,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import BookLiveSessionDialog from "@/components/edtech/BookLiveSessionDialog";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import { supabase } from "@/integrations/supabase/client";
import { hasAny, useCurrentRoles } from "@/lib/edtechRoles";
import { getCourseBySlug } from "@/data/edtechCourses";
import {
  cancelRsvp,
  computeRuntimeStatus,
  formatRelative,
  formatStartsAt,
  getRsvpCount,
  isJoinable,
  listLiveClasses,
  listMyRsvps,
  getMeetingUrl,
  rsvp,
  type LiveClass,
} from "@/lib/liveClasses";

/**
 * Public live-class schedule.
 * - Anyone can browse upcoming + past sessions.
 * - Signed-in students can RSVP / cancel and join via meeting link.
 * - Unauthenticated users are pushed to /auth before they can RSVP.
 */
const EdtechLive = () => {
  useSeo({
    title: "Live Classes — কর্মশিক্ষা TED Plus",
    description: "Upcoming live cohort sessions on কর্মশিক্ষা TED Plus. RSVP and join the call.",
  });

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingClassId, setBookingClassId] = useState<string | null>(null);
  const roles = useCurrentRoles();
  const isTeacher = hasAny(roles, ["admin", "teacher", "tutor"]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sessionRes] = await Promise.all([
        listLiveClasses(),
        supabase.auth.getUser(),
      ]);
      setClasses(list);
      const uid = sessionRes.data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const mine = await listMyRsvps();
        setRsvpIds(new Set(mine.map((r) => r.class_id)));
      } else {
        setRsvpIds(new Set());
      }
      // Counts (parallel)
      const entries = await Promise.all(
        list.map(async (c) => [c.id, await getRsvpCount(c.id)] as const),
      );
      setCounts(Object.fromEntries(entries));
    } catch (err) {
      console.error(err);
      toast.error("Could not load the live schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000); // refresh every minute for status changes
    return () => clearInterval(id);
  }, [refresh]);

  const { upcoming, past } = useMemo(() => {
    const up: LiveClass[] = [];
    const pa: LiveClass[] = [];
    for (const c of classes) {
      const s = computeRuntimeStatus(c);
      if (s === "ended" || s === "cancelled") pa.push(c);
      else up.push(c);
    }
    return { upcoming: up, past: pa.reverse() };
  }, [classes]);

  const openBooking = (classId?: string) => {
    setBookingClassId(classId ?? null);
    setBookingOpen(true);
  };

  const handleRsvp = async (cls: LiveClass) => {
    if (!userId) {
      toast.error("Sign in to RSVP for live classes.");
      window.location.href = `/auth?next=${EDTECH.routes.live}`;
      return;
    }
    try {
      if (rsvpIds.has(cls.id)) {
        await cancelRsvp(cls.id, userId);
        toast.success("RSVP cancelled.");
      } else {
        await rsvp(cls.id, userId);
        toast.success("You're in! We'll show the join link 15 min before start.");
      }
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Could not update your RSVP. Try again.");
    }
  };

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background pt-12 pb-6">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            <Radio className="h-3.5 w-3.5" aria-hidden /> Live cohort sessions
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Join the next live class
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground">
            Cohort calls happen weekly. RSVP to lock your seat — the join link
            unlocks 15 minutes before start, and we'll mark the session as
            "Live" while it's in progress.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <CalendarClock className="h-4 w-4" aria-hidden /> Book a Live Session
            </button>
            <Link
              to={EDTECH.routes.courses}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:border-primary/40 hover:text-foreground"
            >
              <GraduationCap className="h-4 w-4" aria-hidden /> Browse cohorts
            </Link>
          </div>
        </div>
      </section>

      {isTeacher && <TeacherQuickActions />}

      <section className="bg-background pb-2">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <SpectrumBridge />
        </div>
      </section>

      <section className="bg-background pb-20 pt-6">
        <div className="mx-auto max-w-5xl space-y-12 px-6 lg:px-10">
          <div>
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Upcoming
            </h2>
            {loading ? (
              <Skeleton />
            ) : upcoming.length === 0 ? (
              <Empty />
            ) : (
              <ul className="grid gap-4">
                {upcoming.map((c) => (
                  <LiveCard
                    key={c.id}
                    cls={c}
                    rsvped={rsvpIds.has(c.id)}
                    attendees={counts[c.id] ?? 0}
                    onRsvp={() => handleRsvp(c)}
                    onBook={() => openBooking(c.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground/80">
                Past sessions
              </h2>
              <ul className="grid gap-3 opacity-80">
                {past.slice(0, 12).map((c) => (
                  <LiveCard
                    key={c.id}
                    cls={c}
                    rsvped={rsvpIds.has(c.id)}
                    attendees={counts[c.id] ?? 0}
                    onRsvp={() => {}}
                    compact
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <BookLiveSessionDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        classes={upcoming}
        selectedClassId={bookingClassId}
        onBooked={refresh}
      />
    </EdtechShell>
  );
};

const Skeleton = () => (
  <div className="grid gap-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-28 animate-pulse rounded-2xl border border-border/40 bg-card/30" />
    ))}
  </div>
);

const Empty = () => (
  <div className="rounded-3xl border border-dashed border-border/70 bg-card/30 p-10 text-center">
    <CalendarClock className="mx-auto h-10 w-10 text-foreground/40" aria-hidden />
    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
      No live classes scheduled yet
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-foreground/65">
      The next cohort is being planned. Check back soon — or browse recorded
      lessons in the meantime.
    </p>
    <Link
      to={EDTECH.routes.courses}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
    >
      Browse courses
    </Link>
  </div>
);

const LiveCard = ({
  cls,
  rsvped,
  attendees,
  onRsvp,
  onBook,
  compact,
}: {
  cls: LiveClass;
  rsvped: boolean;
  attendees: number;
  onRsvp: () => void;
  onBook?: () => void;
  compact?: boolean;
}) => {
  const course = getCourseBySlug(cls.course_slug);
  const runtime = computeRuntimeStatus(cls);
  const joinable = isJoinable(cls);
  const isLive = runtime === "live";
  const isCancelled = runtime === "cancelled";
  const isEnded = runtime === "ended";

  return (
    <li
      className={[
        "rounded-2xl border bg-card/40 p-5 backdrop-blur-sm transition-colors",
        isLive
          ? "border-rose-500/40 ring-1 ring-rose-500/20"
          : "border-border/60 hover:border-primary/40",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={runtime} />
            <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/55">
              {course?.title ?? cls.course_slug}
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
            {cls.title}
          </h3>
          {!compact && cls.description && (
            <p className="mt-1 text-[13px] text-foreground/65">{cls.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-foreground/65">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              {formatStartsAt(cls.starts_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {cls.duration_min} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden /> {attendees} attending
            </span>
            {!isEnded && !isCancelled && (
              <span className="text-foreground/50">· {formatRelative(cls.starts_at)}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {!isEnded && !isCancelled && (
            <button
              type="button"
              onClick={onRsvp}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors",
                rsvped
                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              ].join(" ")}
            >
              {rsvped ? (
                <><CheckCircle2 className="h-4 w-4" aria-hidden /> Going</>
              ) : (
                "RSVP"
              )}
            </button>
          )}

          {!isEnded && !isCancelled && onBook && (
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-[12px] font-semibold text-primary hover:bg-primary/10"
            >
              <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Book this session
            </button>
          )}

          {joinable && rsvped ? (
            <button
              type="button"
              onClick={async () => {
                const url = await getMeetingUrl(cls.id);
                if (!url) {
                  toast.error("Meeting link not available yet. Try again closer to start time.");
                  return;
                }
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors",
                isLive
                  ? "bg-rose-500 text-white hover:bg-rose-500/90"
                  : "border border-border/60 bg-background/60 text-foreground hover:bg-background/80",
              ].join(" ")}
              aria-label={isLive ? "Join live meeting" : "Join meeting room"}
            >
              {isLive ? "Join live" : "Join room"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : isLive ? (
            <Link
              to={`/edtech/live/watch/${cls.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-[12px] font-semibold text-white hover:bg-rose-500/90"
            >
              <PlayCircle className="h-3.5 w-3.5" aria-hidden /> Watch in-app
            </Link>
          ) : !isEnded && !isCancelled && rsvped ? (
            <p className="text-[11px] text-foreground/50">
              Join link unlocks 15 min before start
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
};

const StatusPill = ({ status }: { status: "scheduled" | "live" | "ended" | "cancelled" }) => {
  const map = {
    live: { label: "Live now", cls: "border-rose-500/40 bg-rose-500/15 text-rose-300", Icon: Radio },
    scheduled: { label: "Scheduled", cls: "border-primary/30 bg-primary/10 text-primary", Icon: CalendarClock },
    ended: { label: "Ended", cls: "border-border/60 bg-background/60 text-foreground/60", Icon: CheckCircle2 },
    cancelled: { label: "Cancelled", cls: "border-rose-500/30 bg-rose-500/5 text-rose-300/80", Icon: XCircle },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${cls}`}>
      <Icon className="h-3 w-3" aria-hidden /> {label}
    </span>
  );
};

export default EdtechLive;

/* ------------------------------------------------------------------ */
/* Teacher quick actions — visible only to admin / teacher / tutor.   */
/* Surfaces BOTH modes: instant room + scheduled class.               */
/* ------------------------------------------------------------------ */
const TeacherQuickActions = () => (
  <section className="bg-background pt-2 pb-6">
    <div className="mx-auto max-w-5xl px-6 lg:px-10">
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-card/40 to-card/20 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3 w-3" aria-hidden /> Teacher console
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold text-foreground sm:text-xl">
              Start a class — instant or scheduled
            </h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-foreground/65">
              Spin up a room right now, or schedule ahead so students get
              notified and the join link unlocks automatically 15 min before
              start.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/edtech/live?instant=1"
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-500/90"
            >
              <Video className="h-4 w-4" aria-hidden /> Go live now
            </Link>
            <Link
              to="/admin/edtech/live"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[12px] font-semibold text-primary hover:bg-primary/15"
            >
              <CalendarClock className="h-4 w-4" aria-hidden /> Schedule a class
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Spectrum cross-link — surfaces the ecosystem connection between    */
/* edtech live classes and VerdaFlux Spectrum (operations layer).     */
/* ------------------------------------------------------------------ */
const SpectrumBridge = () => (
  <a
    href="https://spectrum.trendflux.space/"
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/30 px-4 py-3 text-[12px] text-foreground/70 transition-colors hover:border-primary/40 hover:text-foreground"
  >
    <span className="inline-flex items-center gap-2">
      <Layers className="h-4 w-4 text-primary" aria-hidden />
      <span>
        <span className="font-semibold text-foreground">VerdaFlux Spectrum</span>
        <span className="text-foreground/55"> · operations & analytics for live cohorts</span>
      </span>
    </span>
    <span className="inline-flex items-center gap-1 text-primary opacity-80 transition-opacity group-hover:opacity-100">
      Open <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </span>
  </a>
);