import { useEffect, useState, useMemo } from "react";

// HSL "h s% l%" -> {h,s,l}
function parseHsl(value: string) {
  const m = value.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!m) return null;
  return { h: +m[1], s: +m[2], l: +m[3] };
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)] as const;
}

function relLum([r, g, b]: readonly [number, number, number]) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrastRatio(a: readonly [number, number, number], b: readonly [number, number, number]) {
  const L1 = relLum(a);
  const L2 = relLum(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const TOKENS = [
  "background", "foreground", "card", "card-foreground", "primary",
  "primary-foreground", "secondary", "secondary-foreground", "muted",
  "muted-foreground", "accent", "accent-foreground", "border", "input",
  "ring", "gold", "gold-foreground", "brand-green", "brand-orange",
];

const PAIRS: { label: string; fg: string; bg: string; min: number }[] = [
  { label: "Body text", fg: "foreground", bg: "background", min: 4.5 },
  { label: "Muted text", fg: "muted-foreground", bg: "background", min: 4.5 },
  { label: "Primary CTA", fg: "primary-foreground", bg: "primary", min: 4.5 },
  { label: "Card text", fg: "card-foreground", bg: "card", min: 4.5 },
  { label: "Border vs bg", fg: "border", bg: "background", min: 3 },
  { label: "Live · green pill", fg: "brand-green", bg: "background", min: 4.5 },
  { label: "Live · orange pill", fg: "brand-orange", bg: "background", min: 4.5 },
  { label: "Live · red pill", fg: "primary", bg: "background", min: 4.5 },
];

const ThemeDebugPanel = () => {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setOpen((o) => !o);
        setTick((t) => t + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const data = useMemo(() => {
    if (!open) return { tokens: [], pairs: [] };
    const styles = getComputedStyle(document.documentElement);
    const tokens = TOKENS.map((name) => {
      const raw = styles.getPropertyValue(`--${name}`).trim();
      const hsl = parseHsl(raw);
      const rgb = hsl ? hslToRgb(hsl.h, hsl.s, hsl.l) : null;
      const hex = rgb
        ? `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase()
        : "—";
      return { name, raw, hex };
    });
    const get = (n: string): readonly [number, number, number] | null => {
      const t = tokens.find((x) => x.name === n);
      if (!t) return null;
      const hsl = parseHsl(t.raw);
      if (!hsl) return null;
      const [r, g, b] = hslToRgb(hsl.h, hsl.s, hsl.l);
      return [r, g, b] as const;
    };
    const pairs = PAIRS.map((p) => {
      const a = get(p.fg);
      const b = get(p.bg);
      const ratio = a && b ? contrastRatio(a, b) : 0;
      return { ...p, ratio, pass: ratio >= p.min };
    });
    return { tokens, pairs };
  }, [open, tick]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Theme debug panel"
      className="fixed bottom-4 right-4 z-[9999] w-[360px] max-h-[80vh] overflow-y-auto rounded-2xl border border-black/10 bg-white text-[#111] shadow-2xl text-xs"
    >
      <header className="sticky top-0 flex items-center justify-between gap-2 border-b border-black/10 bg-white/95 backdrop-blur px-4 py-2.5">
        <div>
          <p className="font-bold tracking-wide">Theme Debug</p>
          <p className="text-[10px] text-black/50">Ctrl+Shift+T to toggle</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-black/15 px-2 py-1 text-[10px] hover:bg-black/5"
        >
          Close
        </button>
      </header>

      <section className="px-4 py-3">
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          WCAG contrast
        </h4>
        <ul className="space-y-1.5">
          {data.pairs.map((p) => (
            <li
              key={p.label}
              className="flex items-center justify-between gap-2 rounded-lg border border-black/10 px-2.5 py-1.5"
              title={`${p.fg} on ${p.bg} (min ${p.min}:1)`}
            >
              <span className="truncate">{p.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  p.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {p.ratio.toFixed(2)}:1 {p.pass ? "PASS" : "FAIL"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 pb-4">
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          Active tokens
        </h4>
        <ul className="grid grid-cols-1 gap-1">
          {data.tokens.map((t) => (
            <li
              key={t.name}
              className="group flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-black/[0.04]"
              title={`--${t.name}: hsl(${t.raw}) ${t.hex}`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded border border-black/15"
                style={{ background: t.raw ? `hsl(${t.raw})` : "transparent" }}
              />
              <span className="font-mono text-[10.5px] text-black/80">--{t.name}</span>
              <span className="ml-auto font-mono text-[10px] text-black/50 opacity-0 group-hover:opacity-100 transition">
                {t.hex}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ThemeDebugPanel;
