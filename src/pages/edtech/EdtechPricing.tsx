import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { EDTECH } from "@/config/edtech";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";

const formatBdt = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const TIERS = [
  {
    name: "Single course",
    price: "From ৳990",
    description: "Pick one course. Lifetime recordings. Direct support.",
    perks: ["Lifetime recording access", "Capstone review (cohort courses)", "Community channel"],
    ctaLabel: "Browse courses",
    ctaTo: EDTECH.routes.courses,
  },
  {
    name: "Operator bundle",
    price: "৳12,900",
    description: "AI Masterclass + Growth Operator Foundations together.",
    perks: ["Both flagship cohorts", "Save vs buying separately", "Priority cohort seat"],
    ctaLabel: "Talk to us",
    ctaTo: "/contact",
    featured: true,
  },
  {
    name: "Team & enterprise",
    price: "Custom",
    description: "Private cohorts and curriculum for your team or institution.",
    perks: ["Private cohort scheduling", "Custom curriculum slices", "Onboarding + reporting"],
    ctaLabel: "Request a call",
    ctaTo: "/enterprise",
  },
];

const EdtechPricing = () => {
  useSeo({
    title: "Pricing & cohorts — KormoShikkha",
    description: "Single courses, the operator bundle and private team cohorts.",
    canonical: `${BRAND.url}/edtech/pricing`,
  });
  return (
    <EdtechShell>
      <EdtechHeader />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">Pricing</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pay once. Keep the recordings.
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Early-bird pricing closes when a cohort fills. Bundles and team
              cohorts are available on request.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={[
                  "flex flex-col rounded-3xl border bg-card/40 p-6 backdrop-blur-sm",
                  t.featured ? "border-primary/50 shadow-[0_25px_70px_-35px_hsl(var(--primary)/0.5)]" : "border-border/60",
                ].join(" ")}
              >
                <h3 className="font-display text-xl font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">{t.price}</p>
                <p className="mt-2 text-sm text-foreground/70">{t.description}</p>
                <ul className="mt-5 space-y-2">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={t.ctaTo}
                  className={[
                    "mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                    t.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background text-foreground hover:bg-accent",
                  ].join(" ")}
                >
                  {t.ctaLabel}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              All courses & current prices
            </h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-card/40 text-[11px] uppercase tracking-wider text-foreground/55">
                  <tr>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Level</th>
                    <th className="px-4 py-3 text-right">Regular</th>
                    <th className="px-4 py-3 text-right">Early bird</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {EDTECH_COURSES.map((c) => (
                    <tr key={c.slug} className="bg-background/40">
                      <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                      <td className="px-4 py-3 text-foreground/65">{c.level}</td>
                      <td className="px-4 py-3 text-right text-foreground/70">৳{formatBdt(c.priceBdt)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {c.earlyBirdBdt != null ? `৳${formatBdt(c.earlyBirdBdt)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={EDTECH.routes.course(c.slug)}
                          className="text-[12px] font-semibold text-primary hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechPricing;