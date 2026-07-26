/**
 * In-page contrast and accessibility audit.
 *
 * Runs against a live (same-origin) document — including the Theme Studio's
 * preview iframes — so palette edits can be checked for unreadable text and
 * icon colours before the theme is saved.
 *
 * Deliberately dependency-free and synchronous: it only reads computed styles
 * and geometry from an already-painted document.
 */

export type A11ySeverity = "critical" | "warning";

export interface A11yIssue {
  id: string;
  severity: A11ySeverity;
  /** Short machine-ish rule name, e.g. "text-contrast". */
  rule: string;
  message: string;
  /** Trimmed text or selector-ish hint so the user can find the element. */
  context: string;
  ratio?: number;
  required?: number;
}

export interface A11yReport {
  mode: "light" | "dark";
  device: string;
  checked: number;
  issues: A11yIssue[];
}

/* ── colour helpers ─────────────────────────────────────────── */

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(value: string): Rgba | null {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);
  const [r, g, b, a] = parts;
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a: Number.isNaN(a) || a === undefined ? 1 : a };
}

function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a,
  };
}

function relativeLuminance({ r, g, b }: Rgba): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function ratio(a: Rgba, b: Rgba): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

/** Walks ancestors to resolve the effective (opaque) background behind an element. */
function effectiveBackground(el: Element, win: Window): Rgba {
  let layer: Rgba | null = null;
  let node: Element | null = el;

  while (node) {
    const style = win.getComputedStyle(node);
    // An image/gradient background makes the result unreliable — bail out.
    if (style.backgroundImage && style.backgroundImage !== "none") return { ...WHITE, a: 0 };
    const bg = parseColor(style.backgroundColor);
    if (bg && bg.a > 0) {
      layer = layer ? composite(layer, bg) : bg;
      if (layer.a >= 0.999) return layer;
    }
    node = node.parentElement;
  }
  const base = parseColor(win.getComputedStyle(el.ownerDocument.body).backgroundColor) ?? WHITE;
  return layer ? composite(layer, base.a > 0 ? base : WHITE) : base.a > 0 ? base : WHITE;
}

function isVisible(el: Element, win: Window): boolean {
  const style = win.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number(style.opacity) < 0.05) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  // Only audit what is inside (or just below) the rendered viewport.
  return rect.top < win.innerHeight * 2 && rect.bottom > -win.innerHeight;
}

function accessibleName(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria?.trim()) return aria.trim();
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const target = el.ownerDocument.getElementById(labelledBy.split(/\s+/)[0]);
    if (target?.textContent?.trim()) return target.textContent.trim();
  }
  const title = el.getAttribute("title");
  if (title?.trim()) return title.trim();
  return (el.textContent ?? "").trim();
}

function truncate(value: string, max = 64): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

/* ── the audit ──────────────────────────────────────────────── */

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "HEAD", "META", "LINK", "TITLE"]);

/**
 * Audits a same-origin document for WCAG contrast failures plus the
 * accessibility gaps that a palette change can hide (unnamed icon buttons,
 * missing alt text, invisible focus rings).
 */
export function auditDocument(
  doc: Document,
  meta: { mode: "light" | "dark"; device: string },
): A11yReport {
  const win = doc.defaultView;
  const issues: A11yIssue[] = [];
  let checked = 0;
  if (!win) return { ...meta, checked, issues };

  const seen = new Set<string>();
  const push = (issue: A11yIssue) => {
    const key = `${issue.rule}|${issue.context}|${issue.message}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push(issue);
  };

  const elements = Array.from(doc.body.querySelectorAll<HTMLElement>("*"));

  for (const el of elements) {
    if (SKIP_TAGS.has(el.tagName)) continue;
    if (el.closest("[data-a11y-ignore]")) continue;
    if (!isVisible(el, win)) continue;

    const style = win.getComputedStyle(el);

    /* 1. Text contrast (own text nodes only, so we don't double-count wrappers). */
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent ?? "")
      .join(" ")
      .trim();

    if (ownText.length > 1) {
      const fg = parseColor(style.color);
      const bg = effectiveBackground(el, win);
      if (fg && bg.a > 0.5) {
        const resolved = composite({ ...fg, a: fg.a * Number(style.opacity || 1) }, bg);
        const size = parseFloat(style.fontSize) || 16;
        const weight = Number(style.fontWeight) || 400;
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const required = large ? 3 : 4.5;
        const r = ratio(resolved, bg);
        checked += 1;
        if (r < required) {
          push({
            id: `${meta.mode}-${meta.device}-text-${issues.length}`,
            severity: r < required - 1 ? "critical" : "warning",
            rule: "text-contrast",
            message: `Text contrast ${r.toFixed(2)}:1 is below the ${required}:1 minimum for ${large ? "large" : "body"} text.`,
            context: truncate(ownText),
            ratio: r,
            required,
          });
        }
      }
    }

    /* 2. Icon (SVG) contrast — icons carry meaning and often use faded tokens. */
    if (el.tagName === "svg") {
      const fg = parseColor(style.color);
      const bg = effectiveBackground(el, win);
      if (fg && bg.a > 0.5) {
        const resolved = composite({ ...fg, a: fg.a * Number(style.opacity || 1) }, bg);
        const r = ratio(resolved, bg);
        checked += 1;
        if (r < 3) {
          const owner = el.closest("button,a,[role=button]");
          push({
            id: `${meta.mode}-${meta.device}-icon-${issues.length}`,
            severity: r < 2 ? "critical" : "warning",
            rule: "icon-contrast",
            message: `Icon contrast ${r.toFixed(2)}:1 is below the 3:1 minimum for graphics.`,
            context: truncate(owner ? accessibleName(owner) || owner.tagName.toLowerCase() : "svg icon"),
            ratio: r,
            required: 3,
          });
        }
      }
    }

    /* 3. Icon-only controls without an accessible name. */
    if (el.matches("button,[role=button],a[href]")) {
      const name = accessibleName(el);
      if (!name && el.querySelector("svg,img")) {
        push({
          id: `${meta.mode}-${meta.device}-name-${issues.length}`,
          severity: "critical",
          rule: "control-name",
          message: "Icon-only control has no accessible name (add aria-label).",
          context: truncate(el.className || el.tagName.toLowerCase()),
        });
      }
    }

    /* 4. Images without alt text. */
    if (el.tagName === "IMG" && !el.hasAttribute("alt")) {
      push({
        id: `${meta.mode}-${meta.device}-alt-${issues.length}`,
        severity: "warning",
        rule: "image-alt",
        message: "Image is missing an alt attribute (use alt=\"\" if decorative).",
        context: truncate((el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src || "img"),
      });
    }

    /* 5. Focus outline removed without a visible replacement. */
    if (el.matches("button,a[href],input,select,textarea")) {
      if (style.outlineStyle === "none" && !el.className.toString().includes("focus-visible:")) {
        push({
          id: `${meta.mode}-${meta.device}-focus-${issues.length}`,
          severity: "warning",
          rule: "focus-visible",
          message: "Interactive element has no visible focus indicator.",
          context: truncate(accessibleName(el) || el.tagName.toLowerCase()),
        });
      }
    }
  }

  issues.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    return (a.ratio ?? 99) - (b.ratio ?? 99);
  });

  return { ...meta, checked, issues };
}

/**
 * Runs the audit in both colour modes by toggling the `dark` class on the
 * document root, then restores the original mode.
 */
export function auditBothModes(doc: Document, device: string): A11yReport[] {
  const root = doc.documentElement;
  const wasDark = root.classList.contains("dark");
  const reports: A11yReport[] = [];

  for (const mode of ["light", "dark"] as const) {
    root.classList.toggle("dark", mode === "dark");
    // Force a style flush before reading computed values.
    void root.offsetHeight;
    reports.push(auditDocument(doc, { mode, device }));
  }

  root.classList.toggle("dark", wasDark);
  void root.offsetHeight;
  return reports;
}
