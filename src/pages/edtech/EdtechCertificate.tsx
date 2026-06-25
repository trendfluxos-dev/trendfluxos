import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Award, Download, Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toPng } from "html-to-image";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES, getCourseBySlug, type Course } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getProgress, progressPercent } from "@/lib/edtechProgress";

/**
 * Course-completion certificate.
 * - Pick a course + enter student name (or come pre-loaded via /edtech/certificate/:slug?name=...).
 * - Live preview of an A4-landscape certificate.
 * - Download as PNG (html-to-image) or print to PDF (window.print).
 * - Verification ID is deterministic from name+slug so the same student gets the same code.
 */

const hashId = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).toUpperCase().padStart(8, "0");
  return `KS-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

const slugifyName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "student";

const EdtechCertificate = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();

  const initialCourse = slug ? getCourseBySlug(slug) : undefined;
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialCourse?.slug ?? EDTECH_COURSES[0]?.slug ?? "",
  );
  const [name, setName] = useState<string>(params.get("name") ?? "");
  const [issuedAt] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);

  const course: Course | undefined = useMemo(
    () => getCourseBySlug(selectedSlug),
    [selectedSlug],
  );

  useSeo({
    title: "Certificate — KormoShikkha",
    description:
      "Generate, view and download your KormoShikkha course-completion certificate.",
    canonical: `${BRAND.url}/edtech/certificate`,
  });

  const certRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (slug && !getCourseBySlug(slug)) return;
    if (slug) setSelectedSlug(slug);
  }, [slug]);

  const verificationId = useMemo(
    () => hashId(`${slugifyName(name)}::${selectedSlug}`),
    [name, selectedSlug],
  );

  const studentName = name.trim() || "Your Name";

  // Course completion gate — we don't block download but we surface progress.
  const completion = useMemo(() => {
    if (!course) return { pct: 0, done: 0, total: 0, complete: false };
    const p = getProgress(course.slug);
    const total = course.lessons.length;
    const done = p.completed.length;
    return { pct: progressPercent(done, total), done, total, complete: done === total && total > 0 };
  }, [course]);

  // Persist the certificate to the backend so /edtech/verify can validate it.
  // Safe to retry — the edge function upserts on verification_id.
  const persistCertificate = async () => {
    if (!course || !name.trim()) return;
    try {
      await supabase.functions.invoke("issue-certificate", {
        body: {
          student_name: name.trim(),
          course_slug: course.slug,
          course_title: course.title,
        },
      });
    } catch (err) {
      // Non-blocking — generation still works, just won't be verifiable.
      console.warn("issue-certificate failed", err);
    }
  };

  const handleDownloadPng = async () => {
    if (!certRef.current || !course || !name.trim()) {
      toast.error("Enter your name first to generate the certificate.");
      return;
    }
    try {
      setDownloading(true);
      await persistCertificate();
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0b0b0f",
      });
      const link = document.createElement("a");
      link.download = `kormoshikkha-certificate-${slugifyName(studentName)}-${course.slug}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Certificate downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate image. Try Print → Save as PDF instead.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!name.trim()) {
      toast.error("Enter your name first to print the certificate.");
      return;
    }
    void persistCertificate();
    window.print();
  };

  if (!course) {
    return (
      <EdtechShell>
        <EdtechHeader />
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">No course selected</h1>
          <Link to={EDTECH.routes.courses} className="mt-6 inline-block text-primary underline">
            Browse courses
          </Link>
        </section>
      </EdtechShell>
    );
  }

  return (
    <EdtechShell>
      <EdtechHeader />

      {/* print-only stylesheet — hide app chrome, show the certificate full-page */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          header, footer, [data-print-hide] { display: none !important; }
          [data-print-area] { padding: 0 !important; margin: 0 !important; }
          [data-cert] { box-shadow: none !important; border-radius: 0 !important; width: 100% !important; max-width: none !important; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>

      <section className="bg-background pt-12 pb-6" data-print-hide>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <nav className="mb-6 text-[12px] text-foreground/55">
            <Link to={EDTECH.routes.home} className="hover:text-foreground">KormoShikkha</Link>{" / "}
            <span className="text-foreground/75">Certificate</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
                <Award className="h-3.5 w-3.5" aria-hidden /> Completion certificate
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Generate your certificate
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground">
                কোর্স সম্পন্ন হলে নিচের ফর্ম পূরণ করুন — আপনার সার্টিফিকেট তৎক্ষণাৎ
                প্রিভিউ হবে এবং PNG / PDF আকারে ডাউনলোড করতে পারবেন।
              </p>
            </div>
            <Link
              to={EDTECH.routes.course(course.slug)}
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to course
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background pb-20" data-print-area>
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1fr_2fr] lg:px-10">
          {/* Form */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" data-print-hide>
            <div className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">
                  Student name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Rakibul Hasan"
                  className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">
                  Course
                </span>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {EDTECH_COURSES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={downloading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {downloading ? "..." : "PNG"}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background/80"
                >
                  <Printer className="h-4 w-4" aria-hidden />
                  PDF
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-foreground/50">
                PDF: click <strong>PDF</strong> → ব্রাউজারের প্রিন্ট ডায়ালগে
                <em> Save as PDF</em> সিলেক্ট করুন।
              </p>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/30 p-5 text-[12px] text-foreground/70">
              <p className="flex items-center gap-2 font-medium text-foreground/85">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> Verification ID
              </p>
              <p className="mt-1 font-mono text-[13px] tracking-wider text-foreground">{verificationId}</p>
              <p className="mt-2 leading-relaxed">
                যেকোনো ব্যক্তি{" "}
                <Link to={EDTECH.routes.verify} className="text-primary hover:underline">
                  /edtech/verify
                </Link>{" "}
                পেইজে এই ID ও আপনার নাম দিয়ে সত্যতা যাচাই করতে পারবেন।
              </p>
            </div>

            <div
              className={[
                "rounded-3xl border p-5 text-[12px]",
                completion.complete
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/5 text-amber-200",
              ].join(" ")}
            >
              <p className="font-medium">
                {completion.complete
                  ? "Course complete — certificate unlocked"
                  : "Course in progress"}
              </p>
              <p className="mt-1 leading-relaxed text-foreground/70">
                {completion.done} of {completion.total} lessons · {completion.pct}%
              </p>
              {!completion.complete && (
                <Link
                  to={EDTECH.routes.learn(course.slug)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-200 hover:bg-amber-500/15"
                >
                  Continue learning →
                </Link>
              )}
            </div>
          </aside>

          {/* Certificate preview */}
          <div className="min-w-0">
            <div className="overflow-x-auto">
              <div
                ref={certRef}
                data-cert
                className="relative mx-auto aspect-[1.414/1] w-full max-w-[1100px] overflow-hidden rounded-2xl border border-border/60 shadow-2xl"
                style={{
                  background:
                    "radial-gradient(120% 80% at 10% 0%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(120% 80% at 90% 100%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b0f1a 0%, #0a1410 100%)",
                  color: "#f5f5f5",
                }}
              >
                {/* gilded frame */}
                <div
                  className="pointer-events-none absolute inset-3 rounded-xl"
                  style={{ border: "1px solid rgba(212,175,55,0.55)" }}
                />
                <div
                  className="pointer-events-none absolute inset-5 rounded-lg"
                  style={{ border: "1px solid rgba(212,175,55,0.25)" }}
                />

                <div className="relative flex h-full flex-col px-[6%] py-[5%]">
                  {/* header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.35em]" style={{ color: "#d4af37" }}>
                        KormoShikkha · TrendFlux
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/55">
                        Online Edtech Platform
                      </p>
                    </div>
                    <div
                      className="grid h-12 w-12 place-items-center rounded-full"
                      style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.45)" }}
                    >
                      <Award className="h-6 w-6" style={{ color: "#d4af37" }} aria-hidden />
                    </div>
                  </div>

                  {/* body */}
                  <div className="mt-[5%] flex-1">
                    <p className="text-[12px] uppercase tracking-[0.3em] text-white/55">
                      Certificate of Completion
                    </p>
                    <p className="mt-6 text-[13px] text-white/65">This is to certify that</p>
                    <h2
                      className="mt-3 font-display text-[clamp(28px,5vw,52px)] font-semibold leading-tight"
                      style={{ color: "#ffffff", letterSpacing: "-0.01em" }}
                    >
                      {studentName}
                    </h2>
                    <p className="mt-4 max-w-[80%] text-[14px] leading-[1.7] text-white/75">
                      has successfully completed the {course.durationWeeks}-week
                      cohort program
                    </p>
                    <p className="mt-2 text-[clamp(16px,2.2vw,22px)] font-semibold" style={{ color: "#22d3ee" }}>
                      {course.title}
                    </p>
                    <p className="mt-3 max-w-[85%] text-[12px] leading-relaxed text-white/55">
                      covering {course.lessons.length} modules across {course.category.toLowerCase()},
                      with hands-on capstone delivery and instructor review.
                    </p>
                  </div>

                  {/* footer / signatures */}
                  <div className="mt-auto grid grid-cols-3 gap-6 pt-6 text-[11px] text-white/65">
                    <div>
                      <p className="border-b border-white/25 pb-2 font-display text-base text-white">
                        Zahid Hasan Emon
                      </p>
                      <p className="mt-2 uppercase tracking-[0.18em] text-white/55">Founder &amp; CEO</p>
                      <p className="text-white/45">TrendFlux · KormoShikkha</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-[12px] tracking-widest" style={{ color: "#d4af37" }}>
                        {verificationId}
                      </p>
                      <p className="mt-2 uppercase tracking-[0.18em] text-white/55">Verification ID</p>
                      <p className="text-white/45">verify at {BRAND.url.replace(/^https?:\/\//, "")}/edtech/verify</p>
                    </div>
                    <div className="text-right">
                      <p className="border-b border-white/25 pb-2 font-display text-base text-white">
                        {formatDate(issuedAt)}
                      </p>
                      <p className="mt-2 uppercase tracking-[0.18em] text-white/55">Date issued</p>
                      <p className="text-white/45">{course.instructor.name} · Lead instructor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-foreground/50" data-print-hide>
              Preview · A4 landscape · scales to fit your screen
            </p>
          </div>
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechCertificate;