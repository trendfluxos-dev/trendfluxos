import { X } from "lucide-react";

export type FacetKey = "industry" | "service" | "tech";

export type FacetState = Record<FacetKey, Set<string>>;

type FacetGroup = {
  key: FacetKey;
  label: string;
  options: readonly string[];
};

type Props = {
  groups: FacetGroup[];
  state: FacetState;
  onToggle: (key: FacetKey, value: string) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
};

const ShowcaseFilters = ({
  groups,
  state,
  onToggle,
  onClear,
  resultCount,
  totalCount,
}: Props) => {
  const activeCount =
    state.industry.size + state.service.size + state.tech.size;

  return (
    <section
      aria-label="Project filters"
      className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/70">
            Filter projects
          </h2>
          <span
            className="text-xs text-muted-foreground"
            aria-live="polite"
          >
            {resultCount} of {totalCount}
          </span>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden />
            Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((g) => (
          <fieldset key={g.key} className="space-y-2">
            <legend className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              {g.label}
            </legend>
            <div role="group" aria-label={g.label} className="flex flex-wrap gap-1.5">
              {g.options.map((opt) => {
                const active = state[g.key].has(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    role="switch"
                    aria-checked={active}
                    onClick={() => onToggle(g.key, opt)}
                    className={[
                      "text-xs px-3 py-1.5 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border/50 bg-background/30 text-foreground/60 hover:text-foreground hover:border-foreground/30",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
};

export default ShowcaseFilters;