import { Target } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";
import { OPERATED_BRANDS, type OperatedBrand } from "@/data/home";

const BrandCard = ({ b }: { b: OperatedBrand }) => (
  <TfCard className="flex h-full flex-col items-center text-center">
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background ring-1 ring-border">
      <img
        src={b.logo}
        alt={`${b.name} logo`}
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain p-1.5"
      />
    </div>
    <h3 className="mt-3 font-display text-[13.5px] font-semibold leading-tight text-foreground">{b.name}</h3>
    <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{b.role}</p>
    {b.impact && (
      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
        <Target className="h-3 w-3" aria-hidden="true" />
        {b.impact}
      </div>
    )}
    {b.tagline && <p className="mt-2 text-[10.5px] leading-snug text-muted-foreground">{b.tagline}</p>}
    {b.paid && <span className="mt-2 text-[10px] font-medium text-primary/80">Client project</span>}
  </TfCard>
);

export const OperatedBrandsSection = () => (
  <TfSection
    eyebrow="Ecosystem"
    title="Communities, brands & pages operated by Zahid Hasan Emon"
    intro="A portfolio of platforms, civic initiatives, and education brands built and operated under the TrendFlux ecosystem — designed and engineered by Zahid Hasan Emon."
  >
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {OPERATED_BRANDS.map((b) =>
        b.href ? (
          <a
            key={b.name}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block transition hover:-translate-y-0.5"
            aria-label={`Visit ${b.name}`}
          >
            <BrandCard b={b} />
          </a>
        ) : (
          <div key={b.name}>
            <BrandCard b={b} />
          </div>
        ),
      )}
    </div>
    <p className="mt-8 text-center text-xs text-muted-foreground">
      Designed & engineered by <span className="text-foreground">Zahid Hasan Emon</span> ·{" "}
      <a href="https://trendflux.digital" className="text-primary hover:underline">trendflux.digital</a> ·{" "}
      <a href="https://www.facebook.com/trendfluxdigital/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        fb/trendflux.digital
      </a>
    </p>
  </TfSection>
);