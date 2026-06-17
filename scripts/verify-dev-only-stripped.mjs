#!/usr/bin/env node
/**
 * CI guard: assert that dev-only components and their internals are fully
 * eliminated from the production bundle.
 *
 * Both PerfMonitor and ThemeDebugPanel are wrapped in `import.meta.env.DEV`
 * branches and lazy-imported in src/App.tsx. Vite statically replaces that
 * expression with `false` in production builds, so Rollup tree-shakes the
 * modules out entirely. If a future refactor accidentally pulls them into
 * the prod graph (e.g. an unguarded top-level import, or a string-based
 * dynamic import that defeats analysis), the offending identifiers will
 * resurface in `dist/` and this script will fail the build.
 *
 * Usage:   node scripts/verify-dev-only-stripped.mjs [distDir] [reportPath]
 *          reportPath defaults to `dist/dev-strip-report.json`.
 * Output:  writes a concise JSON report (scanned files + any matches) and a
 *          companion `.txt` summary next to it for quick CI log inspection.
 * Exit:    0 on success, 1 when any forbidden marker is found.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DIST = resolve(process.argv[2] ?? "dist");
const REPORT_PATH = resolve(process.argv[3] ?? join(DIST, "dev-strip-report.json"));

// Unique identifiers from the dev-only modules. These names are minified-
// resistant: they are either string literals, exported component names that
// appear in JSX runtime metadata, or module-internal constants whose names
// happen to survive because they are referenced via object destructuring.
// If you rename any of these in the source, update this list too.
const FORBIDDEN_MARKERS = [
  "PerfMonitor",
  "ThemeDebugPanel",
  "JANK_MS",
  "CORRELATE_WINDOW_MS",
  "SHIFT_LOG_THRESHOLD",
];

/** Recursively collect every `.js` and `.mjs` file under `dir`. */
function collectJs(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...collectJs(full));
    else if (/\.(m?js)$/.test(entry)) out.push(full);
  }
  return out;
}

let distExists = true;
try {
  statSync(DIST);
} catch {
  distExists = false;
}
if (!distExists) {
  console.error(`[verify-dev-only-stripped] ERROR: dist directory not found at ${DIST}`);
  console.error("Run `bun run build` (or `npm run build`) before this guard.");
  process.exit(1);
}

const files = collectJs(DIST);
if (files.length === 0) {
  console.error(`[verify-dev-only-stripped] ERROR: no JS files found under ${DIST}`);
  process.exit(1);
}

const hits = [];
const scanned = [];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  const rel = file.replace(`${DIST}/`, "");
  scanned.push({ file: rel, bytes: source.length });
  for (const marker of FORBIDDEN_MARKERS) {
    if (source.includes(marker)) {
      hits.push({ file: rel, marker });
    }
  }
}

// Sort scanned list by size descending — the largest chunks are the most
// interesting line items in a CI report.
scanned.sort((a, b) => b.bytes - a.bytes);

const report = {
  generated_at: new Date().toISOString(),
  dist_dir: DIST,
  forbidden_markers: FORBIDDEN_MARKERS,
  scanned_count: scanned.length,
  total_bytes: scanned.reduce((n, f) => n + f.bytes, 0),
  hits,
  scanned,
  status: hits.length === 0 ? "pass" : "fail",
};

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

// Human-readable companion summary.
const txtPath = REPORT_PATH.replace(/\.json$/, ".txt");
const lines = [
  `dev-only strip report  —  ${report.generated_at}`,
  `dist:    ${DIST}`,
  `markers: ${FORBIDDEN_MARKERS.join(", ")}`,
  `status:  ${report.status.toUpperCase()}`,
  `files:   ${scanned.length}   total bytes: ${report.total_bytes}`,
  "",
  "Scanned files (largest first):",
  ...scanned.map((f) => `  ${String(f.bytes).padStart(9)}  ${f.file}`),
  "",
  hits.length === 0
    ? "Matches: none — dev-only code is fully stripped."
    : `Matches (${hits.length}):\n` + hits.map((h) => `  ${h.file}  ←  "${h.marker}"`).join("\n"),
  "",
];
writeFileSync(txtPath, lines.join("\n"));

if (hits.length > 0) {
  console.error("[verify-dev-only-stripped] FAIL — dev-only code leaked into the production bundle:\n");
  for (const { file, marker } of hits) {
    console.error(`  ${file}  ←  "${marker}"`);
  }
  console.error(
    "\nLikely cause: a static `import` of @/components/PerfMonitor or @/components/ThemeDebugPanel\n" +
      "outside an `import.meta.env.DEV` guard, or a new module that re-exports them.\n" +
      "Fix by lazy-importing inside a DEV branch (see src/App.tsx).",
  );
  console.error(`\nReport written to: ${REPORT_PATH}`);
  process.exit(1);
}

console.log(
  `[verify-dev-only-stripped] OK — scanned ${files.length} JS files, no dev-only markers found.`,
);
console.log(`Report: ${REPORT_PATH}`);
console.log(`Summary: ${txtPath}`);