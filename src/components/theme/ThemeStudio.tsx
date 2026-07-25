import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Palette, RotateCcw, Sparkles, Type as TypeIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  COLOR_SWATCHES,
  DEFAULT_THEME,
  FONT_PAIRS,
  THEME_PRESETS,
  applyTheme,
  clearTheme,
  contrastRatio,
  currentTheme,
  exportThemeCss,
  getFontPair,
  hslCss,
  onOpenThemeStudio,
  persistTheme,
  type ThemeConfig,
  type ThemeMode,
} from "@/lib/themeStudio";

const RADIUS_STEPS = [
  { label: "None", value: 0 },
  { label: "Subtle", value: 0.375 },
  { label: "Soft", value: 0.625 },
  { label: "Rounded", value: 1 },
  { label: "Pill", value: 1.5 },
];

/**
 * ThemeStudio — a global design customizer. Opens from the floating launcher
 * or Alt+Shift+T, mutates only semantic tokens, and persists per browser.
 */
export default function ThemeStudio() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfig(currentTheme());
  }, []);

  useEffect(() => onOpenThemeStudio(() => setOpen(true)), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commit = useCallback((next: ThemeConfig) => {
    setConfig(next);
    applyTheme(next);
    persistTheme(next);
  }, []);

  const update = useCallback(
    (patch: Partial<ThemeConfig>) => commit({ ...config, ...patch }),
    [commit, config],
  );

  const reset = useCallback(() => {
    clearTheme();
    const fallback: ThemeConfig = { ...DEFAULT_THEME, mode: config.mode };
    setConfig(fallback);
    document.documentElement.classList.toggle("dark", fallback.mode === "dark");
    toast.success("Theme reset to TrendFlux defaults");
  }, [config.mode]);

  const css = useMemo(() => exportThemeCss(config), [config]);
  const pair = getFontPair(config.fontPairId);

  const surface = config.mode === "dark" ? { h: 240, s: 20, l: 4 } : { h: 0, s: 0, l: 100 };
  const ratio = contrastRatio(config.primary, surface);

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Clipboard unavailable — select and copy manually");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Theme Studio (Alt+Shift+T)"
        title="Theme Studio · Alt+Shift+T"
        className="fixed bottom-24 left-6 z-40 hidden h-11 items-center gap-2 rounded-full border border-border/60 bg-card/85 px-4 text-[12px] font-semibold text-foreground/80 shadow-elegant backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
      >
        <Palette className="h-4 w-4 text-primary" />
        Theme
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border/60 px-6 py-5 text-left">
            <SheetTitle className="flex items-center gap-2 font-display text-lg">
              <Sparkles className="h-4 w-4 text-primary" /> Theme Studio
            </SheetTitle>
            <SheetDescription>
              Live-tune the design system. Changes apply site-wide instantly and stay on this
              browser.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-5">
            <div className="mb-5 flex items-center gap-2">
              {(["dark", "light"] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update({ mode })}
                  className={cn(
                    "flex-1 rounded-full border px-3 py-2 text-[12px] font-semibold capitalize transition-colors",
                    config.mode === mode
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/60 text-foreground/60 hover:text-foreground",
                  )}
                  aria-pressed={config.mode === mode}
                >
                  {mode} mode
                </button>
              ))}
            </div>

            <Tabs defaultValue="presets">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="type">Type</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="mt-5 space-y-2">
                {THEME_PRESETS.map((preset) => {
                  const active =
                    preset.config.primary.h === config.primary.h &&
                    preset.config.fontPairId === config.fontPairId &&
                    preset.config.radius === config.radius;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => commit(preset.config)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-card/40 hover:bg-card/70",
                      )}
                      aria-pressed={active}
                    >
                      <span className="flex shrink-0 items-center">
                        {preset.dots.map((dot, i) => (
                          <span
                            key={dot}
                            style={{ background: dot }}
                            className={cn(
                              "h-6 w-6 rounded-full ring-2 ring-background",
                              i === 1 && "-ml-2",
                            )}
                          />
                        ))}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-display text-[13px] font-semibold">
                          {preset.name}
                        </span>
                        <span className="block text-[11px] leading-snug text-foreground/60">
                          {preset.description}
                        </span>
                      </span>
                      {active && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </TabsContent>

              <TabsContent value="color" className="mt-5 space-y-6">
                <section>
                  <SectionLabel>Brand color</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_SWATCHES.map((swatch) => {
                      const active = swatch.hsl.h === config.primary.h;
                      return (
                        <button
                          key={swatch.label}
                          type="button"
                          onClick={() => update({ primary: swatch.hsl })}
                          aria-label={swatch.label}
                          aria-pressed={active}
                          className={cn(
                            "group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-colors",
                            active ? "border-primary bg-primary/10" : "border-border/60 hover:bg-card/60",
                          )}
                        >
                          <span
                            className="h-7 w-7 rounded-full ring-1 ring-inset ring-foreground/10"
                            style={{ background: hslCss(swatch.hsl) }}
                          />
                          <span className="text-[10px] leading-tight text-foreground/60">
                            {swatch.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <SliderRow
                  label="Hue"
                  value={config.primary.h}
                  min={0}
                  max={360}
                  step={1}
                  suffix="°"
                  onChange={(h) => update({ primary: { ...config.primary, h } })}
                />
                <SliderRow
                  label="Saturation"
                  value={config.primary.s}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  onChange={(s) => update({ primary: { ...config.primary, s } })}
                />
                <SliderRow
                  label="Lightness"
                  value={config.primary.l}
                  min={10}
                  max={80}
                  step={1}
                  suffix="%"
                  onChange={(l) => update({ primary: { ...config.primary, l } })}
                />

                <p
                  className={cn(
                    "rounded-xl border px-3 py-2 text-[11px]",
                    ratio >= 4.5
                      ? "border-border/60 text-foreground/60"
                      : "border-primary/40 bg-primary/5 text-foreground/80",
                  )}
                >
                  Contrast vs page background: <strong>{ratio.toFixed(2)}:1</strong>{" "}
                  {ratio >= 4.5 ? "· passes WCAG AA for text" : "· use for large text or fills only"}
                </p>
              </TabsContent>

              <TabsContent value="type" className="mt-5 space-y-6">
                <section>
                  <SectionLabel>Typography</SectionLabel>
                  <div className="space-y-2">
                    {FONT_PAIRS.map((font) => {
                      const active = font.id === config.fontPairId;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => update({ fontPairId: font.id })}
                          aria-pressed={active}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                            active
                              ? "border-primary bg-primary/10"
                              : "border-border/60 bg-card/40 hover:bg-card/70",
                          )}
                        >
                          <TypeIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="min-w-0">
                            <span
                              className="block truncate text-[15px] font-semibold"
                              style={{ fontFamily: `${font.display}, Inter, sans-serif` }}
                            >
                              {font.label}
                            </span>
                            <span className="block text-[11px] text-foreground/60">{font.note}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <SectionLabel>Corner radius</SectionLabel>
                  <div className="grid grid-cols-5 gap-2">
                    {RADIUS_STEPS.map((step) => (
                      <button
                        key={step.label}
                        type="button"
                        onClick={() => update({ radius: step.value })}
                        aria-pressed={config.radius === step.value}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border px-1 py-2 text-[10px] transition-colors",
                          config.radius === step.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/60 text-foreground/60 hover:text-foreground",
                        )}
                      >
                        <span
                          className="h-6 w-6 border border-primary/60 bg-primary/20"
                          style={{ borderRadius: `${Math.min(step.value, 0.75)}rem` }}
                        />
                        {step.label}
                      </button>
                    ))}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="export" className="mt-5 space-y-3">
                <SectionLabel>CSS tokens</SectionLabel>
                <p className="text-[11px] text-foreground/60">
                  Paste into <code className="font-mono">src/index.css</code> to make this the
                  permanent default for every visitor.
                </p>
                <pre className="max-h-72 overflow-auto rounded-xl border border-border/60 bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-foreground/80">
                  {css}
                </pre>
                <button
                  type="button"
                  onClick={copyCss}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy CSS"}
                </button>
              </TabsContent>
            </Tabs>

            {/* Live preview — reads the same tokens every page uses. */}
            <section className="mt-7 rounded-2xl border border-border/60 bg-card/40 p-4">
              <SectionLabel>Live preview</SectionLabel>
              <h3 className="font-display text-lg font-semibold">Growth Execution OS</h3>
              <p className="mt-1 text-[12px] text-foreground/60" style={{ fontFamily: `${pair.sans}, sans-serif` }}>
                One connected system for automation, CRM, media and analytics.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-[--radius] bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
                  Primary CTA
                </span>
                <span className="inline-flex items-center rounded-[--radius] border border-border px-3 py-1.5 text-[12px] font-semibold">
                  Secondary
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  Badge
                </span>
              </div>
            </section>

            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-foreground/60 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
    {children}
  </p>
);

const SliderRow = ({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-[11px]">
      <span className="font-semibold uppercase tracking-[0.16em] text-foreground/50">{label}</span>
      <span className="font-mono text-foreground/70">
        {Math.round(value)}
        {suffix}
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      onValueChange={(next) => onChange(next[0])}
    />
  </div>
);
