import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";
import { SYSTEMS_HE_BUILT } from "@/data/home";

export const SystemsHeBuiltSection = () => (
  <TfSection
    id="systems-he-built"
    eyebrow="Systems He Built"
    title="The growth systems TrendFlux delivers, step by step."
    intro="Every engagement compounds into infrastructure. Here is the exact build order — five systems, deployed sequentially, owned by you on day 91."
  >
    <ol className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SYSTEMS_HE_BUILT.map((s) => (
        <li key={s.title} className="list-none">
          <TfCard>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <s.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {s.step}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80">{s.window}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.desc}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {s.outputs.map((o) => (
                <li key={o} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-foreground/80">
                  <CheckCircle2 className="h-3 w-3 text-primary" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </TfCard>
        </li>
      ))}
    </ol>
    <div className="mt-12 flex flex-col items-center gap-3 text-center">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
        See how the OS composes <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <p className="text-xs text-muted-foreground">90-day engagement · Founder-led · You own the stack</p>
    </div>
  </TfSection>
);