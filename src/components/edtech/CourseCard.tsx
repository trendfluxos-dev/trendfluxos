import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import type { Course } from "@/data/edtechCourses";
import { EDTECH } from "@/config/edtech";

const accentBar: Record<NonNullable<Course["accent"]>, string> = {
  cyan: "from-cyan-400/70 to-cyan-400/0",
  emerald: "from-emerald-400/70 to-emerald-400/0",
  gold: "from-amber-400/70 to-amber-400/0",
  violet: "from-violet-400/70 to-violet-400/0",
  rose: "from-rose-400/70 to-rose-400/0",
};

const formatBdt = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const CourseCard = ({ course }: { course: Course }) => {
  const accent = course.accent ?? "cyan";
  return (
    <Link
      to={EDTECH.routes.course(course.slug)}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-25px_hsl(var(--primary)/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentBar[accent]}`}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.22em] text-primary font-medium">
          {course.category}
        </span>
        <span className="text-[10px] text-foreground/45 whitespace-nowrap">
          {course.level} · {course.format}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold leading-tight flex items-start gap-2">
        <span className="flex-1">{course.title}</span>
        <ArrowUpRight
          className="h-4 w-4 mt-1 shrink-0 text-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </h3>

      <p className="text-foreground/70 text-sm leading-relaxed mt-2">
        {course.tagline}
      </p>

      <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-foreground/60">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden /> {course.durationWeeks} weeks · {course.lessons.length} lessons
        </span>
        {course.seatsLeft != null && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden /> {course.seatsLeft} seats left
          </span>
        )}
      </div>

      <div className="mt-auto pt-5 flex items-end justify-between">
        <div>
          {course.earlyBirdBdt != null ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-foreground/50">
                Early bird
              </div>
              <div className="font-display text-lg font-bold text-foreground">
                ৳{formatBdt(course.earlyBirdBdt)}
                <span className="ml-2 text-xs font-normal text-foreground/40 line-through">
                  ৳{formatBdt(course.priceBdt)}
                </span>
              </div>
            </>
          ) : (
            <div className="font-display text-lg font-bold text-foreground">
              ৳{formatBdt(course.priceBdt)}
            </div>
          )}
        </div>
        <span className="text-[11px] text-foreground/55">{course.nextCohort}</span>
      </div>
    </Link>
  );
};

export default CourseCard;