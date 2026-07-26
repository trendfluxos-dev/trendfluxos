import { useCallback, useState } from "react";
import { BookmarkPlus, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { contrastRatio, hslCss, type Hsl, type ThemeMode } from "@/lib/themeStudio";

export interface PaletteSuggestion {
  name: string;
  rationale: string;
  primary: Hsl;
  contrast: number;
  adjusted: boolean;
}

interface Props {
  mode: ThemeMode;
  activePrimary: Hsl;
  onApply: (primary: Hsl) => void;
  onSave: (name: string, primary: Hsl) => void;
}

/**
 * AI palette suggestions. The model proposes brand-matching colours; the edge
 * function guarantees each one clears WCAG AA against the current surface
 * before it ever reaches this list.
 */
export default function AiPaletteSuggester({ mode, activePrimary, onApply }: Props) {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PaletteSuggestion[]>([]);

  const suggest = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("theme-palette-ai", {
        body: { brief, mode },
      });

      if (error) {
        const detail = await readInvokeError(error);
        toast.error(detail);
        return;
      }

      const list = (data as { palettes?: PaletteSuggestion[] } | null)?.palettes ?? [];
      if (list.length === 0) {
        toast.error("No palette came back — try a more specific brief.");
        return;
      }
      setSuggestions(list);
      toast.success(`${list.length} accessible palettes ready`);
    } catch (err) {
      toast.error((err as Error).message || "Palette suggestion failed");
    } finally {
      setLoading(false);
    }
  }, [brief, mode]);

  const surface: Hsl = mode === "dark" ? { h: 240, s: 20, l: 4 } : { h: 0, s: 0, l: 100 };

  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
          AI palette suggestions
        </p>
      </div>
      <p className="mb-3 text-[11px] leading-snug text-foreground/60">
        Describe the brand feeling. Every suggestion is contrast-checked against the {mode} surface
        before it is offered.
      </p>

      <label className="sr-only" htmlFor="tfx-palette-brief">
        Brand brief for AI palette suggestions
      </label>
      <input
        id="tfx-palette-brief"
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !loading) suggest();
        }}
        maxLength={200}
        placeholder="e.g. fintech, trustworthy, deep blue-green"
        className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-[12px] text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <button
        type="button"
        onClick={suggest}
        disabled={loading}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? "Generating palettes…" : "Suggest palettes with AI"}
      </button>

      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {suggestions.map((item) => {
            const active =
              item.primary.h === activePrimary.h &&
              item.primary.s === activePrimary.s &&
              item.primary.l === activePrimary.l;
            const ratio = contrastRatio(item.primary, surface);
            return (
              <li key={`${item.name}-${item.primary.h}-${item.primary.l}`}>
                <button
                  type="button"
                  onClick={() => {
                    onApply(item.primary);
                    toast.success(`${item.name} applied`);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    active ? "border-primary bg-primary/10" : "border-border/60 hover:bg-card/70",
                  )}
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10"
                    style={{ background: hslCss(item.primary) }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold">{item.name}</span>
                    {item.rationale && (
                      <span className="block truncate text-[10px] text-foreground/55">
                        {item.rationale}
                      </span>
                    )}
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-foreground/60">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      {ratio.toFixed(2)}:1 · AA
                      {item.adjusted ? " (auto-tuned)" : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

async function readInvokeError(error: unknown): Promise<string> {
  const context = (error as { context?: { text?: () => Promise<string> } }).context;
  if (context?.text) {
    try {
      const raw = await context.text();
      const parsed = JSON.parse(raw) as { message?: string; error?: string };
      return parsed.message ?? parsed.error ?? raw.slice(0, 160);
    } catch {
      /* fall through to the generic message */
    }
  }
  return (error as Error).message || "Palette suggestion failed";
}
