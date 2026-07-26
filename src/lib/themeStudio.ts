/**
 * Theme Studio — live global visual customizer.
 *
 * Writes a small set of CSS custom-property overrides onto <html> so every
 * component that reads semantic tokens (`bg-primary`, `text-gold`,
 * `rounded-[--radius]`, `font-display`, …) re-themes instantly without a
 * rebuild. Nothing here hardcodes a colour inside a component: the studio
 * only ever mutates the token layer defined in `src/index.css`.
 *
 * Persistence: a single JSON blob in localStorage, replayed by
 * `bootstrapThemeStudio()` before React mounts so there is no flash of the
 * default palette on reload.
 */

export type ThemeMode = "dark" | "light";

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export interface FontPair {
  id: string;
  label: string;
  /** Display / heading stack. */
  display: string;
  /** Body stack. */
  sans: string;
  note: string;
}

export interface ThemeConfig {
  /** Primary brand colour in HSL. */
  primary: Hsl;
  /** Corner radius in rem. */
  radius: number;
  /** Font pair id from `FONT_PAIRS`. */
  fontPairId: string;
  /** Colour scheme. */
  mode: ThemeMode;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
  /** Two dots rendered in the preset card. */
  dots: [string, string];
}

export const THEME_STORAGE_KEY = "tf-theme-studio";
const MODE_STORAGE_KEY = "tf-theme";

export const FONT_PAIRS: FontPair[] = [
  {
    id: "grotesk-inter",
    label: "Space Grotesk · Inter",
    display: "'Space Grotesk'",
    sans: "Inter",
    note: "Default technical-luxury pairing",
  },
  {
    id: "serif-inter",
    label: "Instrument Serif · Inter",
    display: "'Instrument Serif'",
    sans: "Inter",
    note: "Editorial, magazine-grade headlines",
  },
  {
    id: "inter-inter",
    label: "Inter · Inter",
    display: "Inter",
    sans: "Inter",
    note: "Neutral, product-first system look",
  },
  {
    id: "siliguri",
    label: "Hind Siliguri · Inter",
    display: "'Hind Siliguri'",
    sans: "Inter",
    note: "Bangla-first headings for local surfaces",
  },
  {
    id: "mono-inter",
    label: "JetBrains Mono · Inter",
    display: "'JetBrains Mono'",
    sans: "Inter",
    note: "Console aesthetic for internal tooling",
  },
];

export const COLOR_SWATCHES: { label: string; hsl: Hsl }[] = [
  { label: "Crimson Red", hsl: { h: 0, s: 72, l: 45 } },
  { label: "Electric Indigo", hsl: { h: 245, s: 75, l: 55 } },
  { label: "Emerald Growth", hsl: { h: 158, s: 70, l: 38 } },
  { label: "Cyber Violet", hsl: { h: 270, s: 76, l: 60 } },
  { label: "Luxe Amber", hsl: { h: 32, s: 92, l: 45 } },
  { label: "Teal Signal", hsl: { h: 184, s: 70, l: 36 } },
  { label: "Rose Quartz", hsl: { h: 340, s: 78, l: 52 } },
  { label: "Azure Ops", hsl: { h: 214, s: 84, l: 48 } },
  { label: "Graphite", hsl: { h: 220, s: 9, l: 24 } },
];

export const DEFAULT_THEME: ThemeConfig = {
  primary: { h: 0, s: 72, l: 45 },
  radius: 1,
  fontPairId: "grotesk-inter",
  mode: "dark",
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "trendflux-crimson",
    name: "TrendFlux Crimson",
    description: "Default high-contrast red & charcoal luxury theme",
    config: { primary: { h: 0, s: 72, l: 45 }, radius: 1, fontPairId: "grotesk-inter", mode: "dark" },
    dots: ["hsl(0 72% 45%)", "hsl(24 95% 53%)"],
  },
  {
    id: "enterprise-azure",
    name: "Enterprise Azure",
    description: "Calm corporate blue for boardroom and SaaS surfaces",
    config: { primary: { h: 214, s: 84, l: 48 }, radius: 0.625, fontPairId: "inter-inter", mode: "light" },
    dots: ["hsl(214 84% 48%)", "hsl(184 70% 36%)"],
  },
  {
    id: "growth-emerald",
    name: "Growth Emerald",
    description: "Analytics-forward green with tight geometry",
    config: { primary: { h: 158, s: 70, l: 38 }, radius: 0.5, fontPairId: "grotesk-inter", mode: "dark" },
    dots: ["hsl(158 70% 38%)", "hsl(184 70% 36%)"],
  },
  {
    id: "editorial-ivory",
    name: "Editorial Ivory",
    description: "Serif headlines on light paper — long-form reading",
    config: { primary: { h: 340, s: 78, l: 45 }, radius: 0.25, fontPairId: "serif-inter", mode: "light" },
    dots: ["hsl(340 78% 45%)", "hsl(32 92% 45%)"],
  },
  {
    id: "operator-console",
    name: "Operator Console",
    description: "Mono-typed dark console for internal dashboards",
    config: { primary: { h: 184, s: 70, l: 40 }, radius: 0.375, fontPairId: "mono-inter", mode: "dark" },
    dots: ["hsl(184 70% 40%)", "hsl(158 70% 38%)"],
  },
  {
    id: "luxe-amber",
    name: "Luxe Amber",
    description: "Warm hospitality gold with generous rounding",
    config: { primary: { h: 32, s: 92, l: 42 }, radius: 1.5, fontPairId: "serif-inter", mode: "dark" },
    dots: ["hsl(32 92% 42%)", "hsl(0 72% 45%)"],
  },
];

/* ── colour helpers ─────────────────────────────────────────── */

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: Hsl, b: Hsl): number {
  const la = relativeLuminance(hslToRgb(a));
  const lb = relativeLuminance(hslToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Picks white or near-black text so CTA labels stay WCAG-legible. */
export function readableForeground(bg: Hsl): Hsl {
  const white: Hsl = { h: 0, s: 0, l: 100 };
  const ink: Hsl = { h: 0, s: 0, l: 7 };
  return contrastRatio(bg, white) >= contrastRatio(bg, ink) ? white : ink;
}

export const hslString = ({ h, s, l }: Hsl) =>
  `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;

export const hslCss = (v: Hsl) => `hsl(${hslString(v)})`;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const shift = (v: Hsl, dl: number): Hsl => ({ ...v, l: clamp(v.l + dl, 4, 96) });

export function getFontPair(id: string): FontPair {
  return FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0];
}

/* ── token application ──────────────────────────────────────── */

/** The exact override map the studio writes. Also used by the Export tab. */
export function buildTokenOverrides(config: ThemeConfig): Record<string, string> {
  const { primary } = config;
  const fg = readableForeground(primary);
  const pair = getFontPair(config.fontPairId);
  const glow = shift(primary, config.mode === "dark" ? 8 : -7);

  return {
    "--primary": hslString(primary),
    "--primary-foreground": hslString(fg),
    "--primary-glow": hslString(glow),
    "--ring": hslString(primary),
    "--accent": hslString(primary),
    "--accent-foreground": hslString(fg),
    "--gold": hslString(primary),
    "--gold-foreground": hslString(fg),
    "--sidebar-primary": hslString(primary),
    "--sidebar-primary-foreground": hslString(fg),
    "--sidebar-ring": hslString(primary),
    "--radius": `${config.radius}rem`,
    "--tfx-font-display": pair.display,
    "--tfx-font-sans": pair.sans,
    "--gradient-cyan": `linear-gradient(135deg, hsl(${hslString(primary)}), hsl(${hslString(shift(primary, -8))}))`,
    "--gradient-gold": `linear-gradient(135deg, hsl(${hslString(primary)}), hsl(${hslString(shift(primary, 14))}))`,
    "--shadow-cyan": `0 10px 30px -12px hsl(${hslString(primary)} / 0.35)`,
    "--shadow-gold": `0 14px 40px -14px hsl(${hslString(primary)} / 0.35)`,
  };
}

export function applyTheme(config: ThemeConfig): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const overrides = buildTokenOverrides(config);
  for (const [key, value] of Object.entries(overrides)) {
    root.style.setProperty(key, value);
  }
  root.classList.toggle("dark", config.mode === "dark");
  root.dataset.tfxTheme = "custom";
}

export function clearTheme(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const key of Object.keys(buildTokenOverrides(DEFAULT_THEME))) {
    root.style.removeProperty(key);
  }
  delete root.dataset.tfxTheme;
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function isHsl(value: unknown): value is Hsl {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.h === "number" && typeof v.s === "number" && typeof v.l === "number"
  );
}

export function parseThemeConfig(raw: unknown): ThemeConfig | null {
  if (typeof raw !== "object" || raw === null) return null;
  const v = raw as Record<string, unknown>;
  if (!isHsl(v.primary)) return null;
  const mode: ThemeMode = v.mode === "light" ? "light" : "dark";
  return {
    primary: {
      h: clamp(v.primary.h, 0, 360),
      s: clamp(v.primary.s, 0, 100),
      l: clamp(v.primary.l, 0, 100),
    },
    radius: typeof v.radius === "number" ? clamp(v.radius, 0, 2) : DEFAULT_THEME.radius,
    fontPairId:
      typeof v.fontPairId === "string" && FONT_PAIRS.some((f) => f.id === v.fontPairId)
        ? v.fontPairId
        : DEFAULT_THEME.fontPairId,
    mode,
  };
}

export function readStoredTheme(): ThemeConfig | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    return parseThemeConfig(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function persistTheme(config: ThemeConfig): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    // Keep the standalone dark/light toggle and the index.html bootstrap in sync.
    localStorage.setItem(MODE_STORAGE_KEY, config.mode);
  } catch {
    /* storage unavailable */
  }
}

/** Replays the saved theme. Safe to call before React mounts. */
export function bootstrapThemeStudio(): void {
  const stored = readStoredTheme();
  if (stored) applyTheme(stored);
}

/** Reads the live theme, falling back to the default profile. */
export function currentTheme(): ThemeConfig {
  const stored = readStoredTheme();
  if (stored) return stored;
  const mode: ThemeMode =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  return { ...DEFAULT_THEME, mode };
}

/** CSS snippet for the Export tab — paste-ready for `index.css`. */
export function exportThemeCss(config: ThemeConfig): string {
  const entries = Object.entries(buildTokenOverrides(config))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const scope = config.mode === "dark" ? ".dark" : ":root";
  return `/* TrendFlux Theme Studio export */\n${scope} {\n${entries}\n}\n`;
}

/* ── saved palettes (per browser) ───────────────────────────── */

export interface SavedPalette {
  id: string;
  name: string;
  createdAt: number;
  config: ThemeConfig;
}

export const SAVED_PALETTES_KEY = "tf-theme-saved-palettes";
const SAVED_EVENT = "tfx:theme-saved-palettes";
const MAX_SAVED_PALETTES = 24;

function emitSavedChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SAVED_EVENT));
}

export function readSavedPalettes(): SavedPalette[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_PALETTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const v = entry as Record<string, unknown>;
      const config = parseThemeConfig(v.config);
      if (!config || typeof v.id !== "string") return [];
      return [
        {
          id: v.id,
          name: typeof v.name === "string" && v.name.trim() ? v.name.trim().slice(0, 48) : "Untitled palette",
          createdAt: typeof v.createdAt === "number" ? v.createdAt : Date.now(),
          config,
        } satisfies SavedPalette,
      ];
    });
  } catch {
    return [];
  }
}

function writeSavedPalettes(list: SavedPalette[]): SavedPalette[] {
  const trimmed = list.slice(0, MAX_SAVED_PALETTES);
  try {
    localStorage.setItem(SAVED_PALETTES_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage unavailable */
  }
  emitSavedChange();
  return trimmed;
}

/** Saves a palette (newest first). Returns the updated list. */
export function savePalette(name: string, config: ThemeConfig): SavedPalette[] {
  const entry: SavedPalette = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim().slice(0, 48) || "Untitled palette",
    createdAt: Date.now(),
    config,
  };
  return writeSavedPalettes([entry, ...readSavedPalettes()]);
}

export function deleteSavedPalette(id: string): SavedPalette[] {
  return writeSavedPalettes(readSavedPalettes().filter((p) => p.id !== id));
}

export function renameSavedPalette(id: string, name: string): SavedPalette[] {
  return writeSavedPalettes(
    readSavedPalettes().map((p) =>
      p.id === id ? { ...p, name: name.trim().slice(0, 48) || p.name } : p,
    ),
  );
}

/** Subscribes to saved-palette changes, including edits from other tabs. */
export function onSavedPalettesChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = () => handler();
  const storageListener = (event: StorageEvent) => {
    if (event.key === SAVED_PALETTES_KEY) handler();
  };
  window.addEventListener(SAVED_EVENT, listener);
  window.addEventListener("storage", storageListener);
  return () => {
    window.removeEventListener(SAVED_EVENT, listener);
    window.removeEventListener("storage", storageListener);
  };
}

/* ── open/close bus so any surface can launch the studio ────── */

const OPEN_EVENT = "tfx:theme-studio-open";

export function openThemeStudio(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function onOpenThemeStudio(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const listener = () => handler();
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}
