import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Search, ArrowLeft, Award } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH } from "@/config/edtech";
import { EDTECH_COURSES, getCourseBySlug, type Course } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";

/**
 * Public certificate verification.
 * Enter Verification ID + student name → we recompute the deterministic hash
 * against every course in the catalog. If a match is found, the certificate
 * is authentic and we surface the student name + earned course.
 */

const hashId = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).toUpperCase().padStart(8, "0");
  return `KS-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

const slugifyName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "student";

const normalizeId = (raw: string) =>
  raw.trim().toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");

type Result =
  | { status: "idle" }
  | { status: "valid"; course: Course; name: string; id: string }
  | { status: "invalid"; id: string };

const EdtechVerify = () => {
  const [params, setParams] = useSearchParams();
  const [name, setName] = useState(params.get("name") ?? "");
  const [id, setId] = useState(params.get("id") ?? "");
  const [result, setResult] = useState<Result>({ status: "idle" });

  useSeo({
    title: "Verify Certificate — KormoShikkha",
    description:
      "Confirm the authenticity of a KormoShikkha certificate by entering the verification ID and student name.",
    canonical: `${BRAND.url}/edtech/verify`,
  });

  const autoVerify = useMemo(
    () => Boolean(params.get("id") && params.get("name")),
    [params],
  );

  const verify = (rawName: string, rawId: string) => {
    const cleanName = rawName.trim();
    const cleanId = normalizeId(rawId);
    if (!cleanName || !cleanId) {
      setResult({ status: "idle" });
      return;
    }
    const nameSlug = slugifyName(cleanName);
    const match = EDTECH_COURSES.find(
      (c) => hashId(`${nameSlug}::${c.slug}`) === cleanId,
    );
    if (match) {
      setResult({ status: "valid", course: match, name: cleanName, id: cleanId });
    } else {
      setResult({ status: "invalid", id: cleanId });
    }
  };

  // Run once on mount if URL pre-fills both fields (?id=...&name=...)
  useMemo(() => {
    if (autoVerify) verify(params.get("name") ?? "", params.get("id") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(name, id);
    const next = new URLSearchParams();
    if (name.trim()) next.set("name", name.trim());
    if (id.trim()) next.set("id", normalizeId(id));
    setParams(next, { replace: true });
  };

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background pt-12 pb-6">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <nav className="mb-6 text-[12px] text-foreground/55">
            <Link to={EDTECH.routes.home} className="hover:text-foreground">KormoShikkha</Link>{" / "}
            <span className="text-foreground/75">Verify</span>
          </nav>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Certificate verification
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Verify a KormoShikkha certificate
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground">
            সার্টিফিকেট-এ ছাপা <strong>Verification ID</strong> এবং শিক্ষার্থীর নাম
            লিখুন — আমরা তাৎক্ষণিকভাবে সত্যতা যাচাই করে কোর্স ও নাম প্রদর্শন করব।
          </p>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">
                  Student name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Rakibul Hasan"
                  maxLength={120}
                  className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">
                  Verification ID
                </span>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="KS-XXXX-XXXX"
                  maxLength={20}
                  className="mt-2 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 font-mono text-sm tracking-wider text-foreground placeholder:text-foreground/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Search className="h-4 w-4" aria-hidden /> Verify certificate
            </button>
          </form>

          {result.status === "valid" && (
            <div
              role="status"
              className="mt-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 sm:p-8"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Authentic
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {result.name}
              </h2>
              <p className="mt-2 text-[14px] text-muted-foreground">
                has successfully completed the {result.course.durationWeeks}-week cohort program
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-[16px] font-semibold text-primary">
                <Award className="h-4 w-4" aria-hidden /> {result.course.title}
              </p>
              <dl className="mt-5 grid gap-3 text-[13px] sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-foreground/55">Verification ID</dt>
                  <dd className="mt-1 font-mono tracking-wider text-foreground">{result.id}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-foreground/55">Category</dt>
                  <dd className="mt-1 text-foreground">{result.course.category}</dd>
                </div>
              </dl>
              <Link
                to={EDTECH.routes.course(result.course.slug)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View course details <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden />
              </Link>
            </div>
          )}

          {result.status === "invalid" && (
            <div
              role="alert"
              className="mt-6 rounded-3xl border border-destructive/40 bg-destructive/[0.06] p-6 sm:p-8"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-destructive">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Not verified
              </p>
              <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                We could not verify <span className="font-mono">{result.id}</span>
              </h2>
              <p className="mt-2 text-[14px] text-muted-foreground">
                নামের বানান হুবহু সার্টিফিকেটে যেমন আছে তেমন লিখুন এবং
                Verification ID আবার মিলিয়ে দেখুন। সমস্যা থাকলে{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  সাপোর্টে যোগাযোগ করুন
                </Link>
                ।
              </p>
            </div>
          )}
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechVerify;