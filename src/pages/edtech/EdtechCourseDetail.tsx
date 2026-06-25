import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Clock, GraduationCap, Users } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { getCourseBySlug } from "@/data/edtechCourses";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";

const formatBdt = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const EdtechCourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? getCourseBySlug(slug) : undefined;

  useSeo({
    title: course ? `${course.title} — KormoShikkha` : "Course — KormoShikkha",
    description: course?.summary ?? "KormoShikkha course detail.",
    canonical: course ? `${BRAND.url}/edtech/courses/${course.slug}` : undefined,
  });
  useJsonLd(
    course
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: course.summary,
            provider: {
              "@type": "Organization",
              name: EDTECH.name,
              sameAs: `${BRAND.url}/edtech`,
            },
            educationalLevel: course.level,
            offers: {
              "@type": "Offer",
              price: course.earlyBirdBdt ?? course.priceBdt,
              priceCurrency: "BDT",
              availability: "https://schema.org/InStock",
              url: `${BRAND.url}/edtech/enroll/${course.slug}`,
            },
          },
        ]
      : [],
  );

  if (!course) return <Navigate to={EDTECH.routes.courses} replace />;

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background pt-16 pb-10">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <nav className="mb-6 text-[12px] text-foreground/55">
            <Link to={EDTECH.routes.home} className="hover:text-foreground">
              KormoShikkha
            </Link>{" "}
            /{" "}
            <Link to={EDTECH.routes.courses} className="hover:text-foreground">
              Courses
            </Link>{" "}
            / <span className="text-foreground/75">{course.title}</span>
          </nav>

          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            {course.category} · {course.level} · {course.format}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[44px]">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-[1.75] text-muted-foreground">
            {course.tagline}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-[12px] text-foreground/65">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {course.durationWeeks} weeks · {course.lessons.length} lessons
            </span>
            {course.seatsLeft != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
                <Users className="h-3.5 w-3.5" aria-hidden /> {course.seatsLeft} seats left
              </span>
            )}
            {course.nextCohort && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
                {course.nextCohort}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1.5fr_1fr] lg:px-10">
          {/* Main column */}
          <div className="space-y-10">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">About this course</h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-foreground/80">{course.summary}</p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Outcomes</h2>
              <ul className="mt-4 space-y-3">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 text-[15px] text-foreground/85">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Curriculum</h2>
              <ol className="mt-4 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/30">
                {course.lessons.map((l) => (
                  <li key={l.n} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-foreground/45">{l.n}</span>
                      <span className="text-sm font-medium text-foreground/85">{l.title}</span>
                    </div>
                    <span className="text-[12px] text-foreground/55">{l.duration}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Who it's for</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {course.audience.map((a) => (
                  <li
                    key={a}
                    className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[12px] text-foreground/70"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sticky enrol card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Instructor
                  </p>
                  <p className="text-sm font-semibold text-foreground">{course.instructor.name}</p>
                  <p className="text-[12px] text-foreground/60">{course.instructor.role}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/50 bg-background/40 p-4">
                {course.earlyBirdBdt != null ? (
                  <>
                    <p className="text-[10px] uppercase tracking-wider text-foreground/55">Early bird</p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      ৳{formatBdt(course.earlyBirdBdt)}
                      <span className="ml-2 text-sm font-normal text-foreground/45 line-through">
                        ৳{formatBdt(course.priceBdt)}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="font-display text-2xl font-bold text-foreground">
                    ৳{formatBdt(course.priceBdt)}
                  </p>
                )}
              </div>

              <Link
                to={EDTECH.routes.enroll(course.slug)}
                className="mt-5 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Enroll now <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={EDTECH.routes.learn(course.slug)}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-[12px] font-medium text-foreground/80 hover:bg-background/70 hover:text-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden /> Preview lessons
              </Link>
              <p className="mt-3 text-center text-[11px] text-foreground/55">
                Secure payment · seat confirmed after admin verification
              </p>
              <Link
                to={EDTECH.routes.certificateFor(course.slug)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-[12px] font-medium text-foreground/75 hover:bg-background/70 hover:text-foreground"
              >
                Already completed? Get your certificate
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechCourseDetail;