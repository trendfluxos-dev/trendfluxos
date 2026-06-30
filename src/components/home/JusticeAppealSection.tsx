import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTfReveal } from "@/components/tf/useTfReveal";

export const JusticeAppealSection = () => {
  const ref = useTfReveal<HTMLDivElement>();
  return (
  <section className="relative overflow-hidden bg-[hsl(220,45%,8%)] py-16 sm:py-20 lg:py-24" aria-label="Pabna Accountability Project">
    {/* drifting crimson glow */}
    <div
      aria-hidden
      className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[680px] max-w-[120vw] -translate-x-1/2 rounded-full bg-[hsl(0,72%,45%)]/15 blur-[140px] tf-glow-pulse"
    />
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
      <div ref={ref} className="tf-reveal overflow-hidden rounded-2xl border border-[hsl(220,30%,20%)] bg-[hsl(220,40%,11%)] shadow-[0_30px_120px_-40px_hsl(0,72%,45%,0.35)]">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="min-w-0 p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[hsl(0,65%,55%)]" />
              <span className="font-serif text-[11px] tracking-[0.22em] text-white/80 break-words">
                PABNA ACCOUNTABILITY PROJECT
              </span>
            </div>
            <h2 className="mt-6 font-serif text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-4xl break-words">
              When fear replaces justice,{" "}
              <span className="italic text-slate-300">documentation becomes necessary.</span>
            </h2>
            <p className="mt-5 text-[14px] leading-relaxed text-slate-300 sm:text-[15px] break-words">
              Public Interest Documentation — একটি লিখিত অভিযোগ ও সংশ্লিষ্ট সংবাদ
              রেফারেন্সের ভিত্তিতে নির্মিত আর্কাইভ। নিরপেক্ষ তদন্ত, আইনগত সুরক্ষা ও
              প্রাতিষ্ঠানিক জবাবদিহিতার আবেদন। This is a dossier, not a campaign of attack.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/justice-appeal" className="inline-flex items-center gap-2 rounded-md bg-[hsl(0,65%,55%)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                Read Timeline <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/justice-appeal#complaint" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.06]">
                View Documents
              </Link>
            </div>
          </div>

          <div className="hidden min-w-0 border-l border-white/10 p-10 lg:flex lg:flex-col lg:justify-center">
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">দাখিল</div>
            <div className="mt-2 font-serif text-2xl text-white">২৯ আগস্ট ২০২৪</div>
            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-slate-500">অবস্থা</div>
            <div className="mt-2 text-sm text-slate-300">চলমান নিরাপত্তা শঙ্কা · নিরপেক্ষ তদন্তের আবেদন</div>
            <div className="mt-8 border-t border-white/10 pt-5 text-[11px] uppercase tracking-[0.25em] text-slate-500">
              ন্যায়বিচার · নিরাপত্তা · আইনি তদন্ত
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};