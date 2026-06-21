import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Search,
  Award,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";
import { supabase } from "@/integrations/supabase/client";

/**
 * Public certificate verification.
 * Asks for a Verification ID, shows a loading state while the
 * `verify-certificate` edge function looks it up, and renders one of
 * three dedicated result cards: valid, expired, or invalid.
 */

type Status = "valid" | "expired" | "revoked" | "invalid";

interface VerifyPayload {
  status: Status;
  verification_id?: string;
  student_name?: string;
  course_title?: string;
  course_slug?: string;
  issued_at?: string;
  expires_at?: string | null;
  message?: string;
}

type ViewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; data: VerifyPayload }
  | { kind: "error"; message: string };

const normalizeId = (raw: string) =>
  raw.trim().toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const EdtechVerify = () => {
  const [params, setParams] = useSearchParams();
  const [id, setId] = useState(params.get("id") ?? "");
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  useSeo({
    title: "Verify Certificate — KormoShikkha",
    description:
      "Confirm the authenticity of a KormoShikkha course-completion certificate by its Verification ID.",
    canonical: `${BRAND.url}/edtech/verify`,
  });

  const runVerify = async (rawId: string) => {
    const verification_id = normalizeId(rawId);
    if (!verification_id) {
      setState({ kind: "error", message: "Please enter a Verification ID." });
      return;
    }
    setState({ kind: "loading" });
    try {
      const { data, error } = await supabase.functions.invoke<VerifyPayload>(
        "verify-certificate",
        { body: { verification_id } },
      );
      if (error || !data) {
        setState({
          kind: "error",
          message: error?.message ?? "Could not reach the verification service.",
        });
        return;
      }
      setState({ kind: "result", data });
    } catch (err) {
      console.error("verify-certificate invoke", err);
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  };

  // Auto-run if ?id= is present on first load.
  useEffect(() => {
    const initial = params.get("id");
    if (initial) void runVerify(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    const clean = normalizeId(id);
    if (clean) next.set("id", clean);
    setParams(next, { replace: true });
    void runVerify(id);
  };

  return (
    <EdtechShell>
      <EdtechHeader />

      <section className="bg-background pt-12 pb-6">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <nav className="mb-6 text-[12px] text-foreground/55">
            <Link to={EDTECH.routes.home} className="hover:text-foreground">
              KormoShikkha
            </Link>
            {" / "}
            <span className="text-foreground/75">Verify</span>
          </nav>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Certificate verification
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Verify a KormoShikkha certificate
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground">
            সার্টিফিকেট-এ ছাপা <strong>Verification ID</strong> লিখুন — আমরা সার্ভার
            থেকে যাচাই করে কোর্স ও শিক্ষার্থীর নাম প্রদর্শন করব।
          </p>
        </div>
      </section>

      <section className="bg-background pb-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm sm:p-8"
          >
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/55">
                Verification ID
              </span>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="KS-XXXX-XXXX"
                  maxLength={20}
                  aria-label="Verification ID"
                  className="flex-1 rounded-xl border border-border/60 bg-background/60 px-4 py-3 font-mono text-base tracking-wider text-foreground placeholder:text-foreground/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={state.kind === "loading"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  {state.kind === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Search className="h-4 w-4" aria-hidden />
                  )}
                  {state.kind === "loading" ? "Verifying…" : "Verify"}
                </button>
              </div>
            </label>
            <p className="mt-3 text-[12px] leading-relaxed text-foreground/50">
              ID format: <span className="font-mono">KS-XXXX-XXXX</span> — সার্টিফিকেটের
              নিচে মুদ্রিত।
            </p>
          </form>

          {/* Result region — accessible live area */}
          <div className="mt-6" aria-live="polite" aria-busy={state.kind === "loading"}>
            {state.kind === "loading" && <LoadingCard />}
            {state.kind === "error" && <InvalidCard message={state.message} />}
            {state.kind === "result" && state.data.status === "valid" && (
              <ValidCard data={state.data} />
            )}
            {state.kind === "result" && state.data.status === "expired" && (
              <ExpiredCard data={state.data} />
            )}
            {state.kind === "result" && state.data.status === "revoked" && (
              <RevokedCard data={state.data} />
            )}
            {state.kind === "result" && state.data.status === "invalid" && (
              <InvalidCard message={state.data.message ?? "No certificate found with that ID."} />
            )}
          </div>
        </div>
      </section>
    </EdtechShell>
  );
};

const LoadingCard = () => (
  <div className="rounded-3xl border border-border/60 bg-card/30 p-8 text-center">
    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
    <p className="mt-4 text-sm text-foreground/70">Looking up certificate…</p>
  </div>
);

const ValidCard = ({ data }: { data: VerifyPayload }) => (
  <div
    role="status"
    className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 sm:p-8"
  >
    <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Valid certificate
    </p>
    <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
      {data.student_name}
    </h2>
    <p className="mt-2 text-[14px] text-muted-foreground">
      has successfully completed the course
    </p>
    <p className="mt-3 inline-flex items-center gap-2 text-[16px] font-semibold text-primary">
      <Award className="h-4 w-4" aria-hidden /> {data.course_title}
    </p>
    <dl className="mt-6 grid gap-3 text-[13px] sm:grid-cols-3">
      <Meta label="Verification ID" value={data.verification_id ?? "—"} mono />
      <Meta label="Issued" value={formatDate(data.issued_at)} />
      <Meta label="Expires" value={data.expires_at ? formatDate(data.expires_at) : "Never"} />
    </dl>
    {data.course_slug && (
      <Link
        to={EDTECH.routes.course(data.course_slug)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        View course details <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    )}
  </div>
);

const ExpiredCard = ({ data }: { data: VerifyPayload }) => (
  <div
    role="status"
    className="rounded-3xl border border-amber-500/30 bg-amber-500/[0.06] p-6 sm:p-8"
  >
    <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-amber-400">
      <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Expired
    </p>
    <h2 className="mt-4 font-display text-xl font-semibold text-foreground sm:text-2xl">
      Certificate expired on {formatDate(data.expires_at)}
    </h2>
    <p className="mt-2 text-[14px] text-muted-foreground">
      এই সার্টিফিকেট ইস্যু হয়েছিল <strong>{data.student_name}</strong>-এর নামে,
      কোর্স: <strong>{data.course_title}</strong>। বর্তমান validity শেষ —
      শিক্ষার্থীকে রিফ্রেশার নিতে অনুরোধ করুন।
    </p>
    <dl className="mt-6 grid gap-3 text-[13px] sm:grid-cols-2">
      <Meta label="Verification ID" value={data.verification_id ?? "—"} mono />
      <Meta label="Issued" value={formatDate(data.issued_at)} />
    </dl>
  </div>
);

const RevokedCard = ({ data }: { data: VerifyPayload }) => (
  <div
    role="alert"
    className="rounded-3xl border border-destructive/40 bg-destructive/[0.06] p-6 sm:p-8"
  >
    <p className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-destructive">
      <ShieldX className="h-3.5 w-3.5" aria-hidden /> Revoked
    </p>
    <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
      Certificate <span className="font-mono">{data.verification_id}</span> has been revoked
    </h2>
    <p className="mt-2 text-[14px] text-muted-foreground">
      এই সার্টিফিকেটটি ইস্যুকারী প্রতিষ্ঠান প্রত্যাহার করেছে এবং বর্তমানে গ্রহণযোগ্য নয়।
      বিস্তারিত জানতে{" "}
      <Link to="/contact" className="text-primary hover:underline">
        সাপোর্টে যোগাযোগ করুন
      </Link>
      ।
    </p>
  </div>
);

const InvalidCard = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="rounded-3xl border border-destructive/40 bg-destructive/[0.06] p-6 sm:p-8"
  >
    <p className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-destructive">
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Invalid ID
    </p>
    <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
      We couldn't verify this Verification ID
    </h2>
    <p className="mt-2 text-[14px] text-muted-foreground">{message}</p>
    <ul className="mt-4 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
      <li>সার্টিফিকেটে ছাপা ID হুবহু লিখুন (format: <span className="font-mono">KS-XXXX-XXXX</span>)।</li>
      <li>অতিরিক্ত space বা বিশেষ ক্যারেক্টার বাদ দিন।</li>
      <li>সমস্যা চললে issuing institution-এর সাথে যোগাযোগ করুন।</li>
    </ul>
  </div>
);

const Meta = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <dt className="text-[11px] uppercase tracking-[0.2em] text-foreground/55">{label}</dt>
    <dd className={`mt-1 text-foreground ${mono ? "font-mono tracking-wider" : ""}`}>
      {value}
    </dd>
  </div>
);

export default EdtechVerify;