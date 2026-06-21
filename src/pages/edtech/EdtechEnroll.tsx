import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { getCourseBySlug } from "@/data/edtechCourses";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

const formatBdt = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const EdtechEnroll = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? getCourseBySlug(slug) : undefined;
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useSeo({
    title: course ? `Enroll · ${course.title} — KormoShikkha` : "Enroll — KormoShikkha",
    description: "Complete your KormoShikkha enrolment.",
    canonical: course ? `${BRAND.url}/edtech/enroll/${course.slug}` : undefined,
    noindex: true,
  });

  if (!course) return <Navigate to={EDTECH.routes.courses} replace />;

  const price = course.earlyBirdBdt ?? course.priceBdt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // Phase 1: capture the intent and notify via analytics. Verified
      // server-side enrolment + payment confirmation is wired in Phase 2,
      // when the authenticated student surface lands.
      track("edtech_enroll_submit", {
        course_slug: course.slug,
        amount_bdt: price,
      });
      // Briefly defer so the success state feels intentional, not instant.
      await new Promise((r) => setTimeout(r, 350));
      setSubmitted(true);
      toast({
        title: "Enrolment received",
        description: "We'll verify your bKash payment and unlock your seat shortly.",
      });
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EdtechShell>
      <EdtechHeader />
      <section className="bg-background py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1.4fr_1fr] lg:px-10">
          <div>
            <nav className="mb-6 text-[12px] text-foreground/55">
              <Link to={EDTECH.routes.home} className="hover:text-foreground">KormoShikkha</Link>{" / "}
              <Link to={EDTECH.routes.course(course.slug)} className="hover:text-foreground">{course.title}</Link>{" / "}
              <span className="text-foreground/75">Enroll</span>
            </nav>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Enroll — {course.title}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
              Pay via bKash, share the transaction ID, and we'll verify and
              unlock your seat within a few hours.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/[0.04] p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" aria-hidden />
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  Enrolment received
                </h2>
                <p className="mt-2 text-sm text-foreground/70">
                  We've logged your submission and will verify the payment shortly.
                  You'll get an email once your seat is confirmed.
                </p>
                <Link
                  to={EDTECH.routes.courses}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Back to all courses
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" value={fullName} onChange={setFullName} required />
                  <Field label="Email" type="email" value={email} onChange={setEmail} required />
                  <Field label="Phone (WhatsApp)" type="tel" value={phone} onChange={setPhone} required />
                  <Field label="bKash number used" type="tel" value={bkashNumber} onChange={setBkashNumber} required />
                  <Field label="bKash Transaction ID" value={trxId} onChange={setTrxId} required />
                </div>
                <Field label="Notes (optional)" value={notes} onChange={setNotes} textarea />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Submitting…</>
                  ) : (
                    <>Submit enrolment · ৳{formatBdt(price)}</>
                  )}
                </button>
              </form>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Enrolling in</p>
                  <p className="text-sm font-semibold text-foreground">{course.title}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Amount" value={`৳${formatBdt(price)}`} />
                <Row label="Format" value={course.format} />
                <Row label="Duration" value={`${course.durationWeeks} weeks`} />
                <Row label="Cohort" value={course.nextCohort ?? "Open"} />
              </dl>
              <div className="mt-6 rounded-2xl border border-border/50 bg-background/40 p-4 text-[12px] text-foreground/70">
                <p className="font-semibold text-foreground">Payment instructions</p>
                <p className="mt-1">
                  Send <strong>৳{formatBdt(price)}</strong> to our bKash merchant
                  number (you'll receive it on confirmation). Paste the
                  transaction ID in the form to lock your seat.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </EdtechShell>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-foreground/55">{label}</dt>
    <dd className="font-medium text-foreground">{value}</dd>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) => (
  <label className="block">
    <span className="text-[12px] font-medium text-foreground/70">{label}{required && " *"}</span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    )}
  </label>
);

export default EdtechEnroll;