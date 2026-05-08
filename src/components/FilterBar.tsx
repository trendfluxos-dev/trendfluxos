import { Search, X } from "lucide-react";

export type CaseFilters = {
  service: string;
  industry: string;
  stack: string;
  stage: string;
  query: string;
};

export const EMPTY_FILTERS: CaseFilters = {
  service: "",
  industry: "",
  stack: "",
  stage: "",
  query: "",
};

const groups: { key: keyof Omit<CaseFilters, "query">; label: string; options: string[] }[] = [
  { key: "service", label: "Growth Service", options: ["AI Automation", "Paid Media", "Funnels", "Branding"] },
  { key: "industry", label: "Industry Sector", options: ["Education", "Retail", "SaaS", "Personal Brand"] },
  { key: "stack", label: "Tech Stack", options: ["Meta Ads", "GoHighLevel", "WhatsApp", "CRM"] },
  { key: "stage", label: "Business Stage", options: ["Startup", "Growth", "Scale", "Enterprise"] },
];

type Props = {
  value: CaseFilters;
  onChange: (next: CaseFilters) => void;
  resultCount?: number;
};

const FilterBar = ({ value, onChange, resultCount }: Props) => {
  const hasActive =
    value.service || value.industry || value.stack || value.stage || value.query.trim();

  return (
    <div className="sticky top-20 z-30 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto glass-strong rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-6">
          {groups.map((g) => (
            <select
              key={g.key}
              value={value[g.key]}
              onChange={(e) => onChange({ ...value, [g.key]: e.target.value })}
              className={`appearance-none bg-white border rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-all hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                value[g.key]
                  ? "border-primary/60 bg-[hsl(0_86%_98%)] text-primary"
                  : "border-border text-foreground/80"
              }`}
              aria-label={g.label}
            >
              <option value="">{g.label}</option>
              {g.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          <div className="relative col-span-2 md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
            <input
              type="search"
              value={value.query}
              onChange={(e) => onChange({ ...value, query: e.target.value })}
              placeholder="Search…"
              maxLength={80}
              className="w-full rounded-xl border border-border bg-white pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-all hover:border-primary/60 focus:ring-2 focus:ring-primary/40 focus:border-primary"
              aria-label="Search case studies"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            disabled={!hasActive}
            className={`rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              hasActive
                ? "border border-primary bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-glow))] shadow-[0_6px_18px_-8px_hsl(var(--primary)/0.55)]"
                : "border border-border bg-white text-foreground/60"
            }`}
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        {typeof resultCount === "number" && (
          <p className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground/55">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-0.5 font-semibold text-brand-green">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
