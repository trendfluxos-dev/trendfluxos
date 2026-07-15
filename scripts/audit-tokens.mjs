#!/usr/bin/env node
/**
 * Design-system token audit (report-only).
 *
 * Scans src/pages and src/components for hardcoded colors that should
 * instead reference design tokens. Not wired into CI — run manually:
 *
 *   node scripts/audit-tokens.mjs
 *   node scripts/audit-tokens.mjs src/pages/Founder.tsx
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["src/pages", "src/components"];

// Skip generated / vendored / design-system infrastructure files.
const SKIP = [
  "src/components/ui/", // shadcn primitives — token bindings live here intentionally
  "src/integrations/",
  ".test.",
  ".spec.",
];

const PATTERNS = [
  { re: /#[0-9a-fA-F]{3,8}\b/g, label: "hex color" },
  { re: /\bbg-white\b/g, label: "bg-white" },
  { re: /\bbg-black\b/g, label: "bg-black" },
  { re: /\btext-white\b/g, label: "text-white" },
  { re: /\btext-black\b/g, label: "text-black" },
  { re: /\b(?:bg|text|border)-gray-\d{2,3}\b/g, label: "gray-* utility" },
  { re: /\b(?:bg|text|border)-slate-\d{2,3}\b/g, label: "slate-* utility" },
  { re: /\b(?:bg|text|border)-zinc-\d{2,3}\b/g, label: "zinc-* utility" },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|css)$/.test(entry)) out.push(p);
  }
  return out;
}

function collect(target) {
  const s = statSync(target);
  return s.isDirectory() ? walk(target) : [target];
}

let total = 0;
const findings = [];

for (const t of TARGETS) {
  const files = collect(join(ROOT, t));
  for (const file of files) {
    const rel = relative(ROOT, file);
    if (SKIP.some((s) => rel.includes(s))) continue;
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const { re, label } of PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          // Ignore hex inside CSS files' known token blocks — audit is aimed
          // at components. index.css is expected to hold hex references.
          if (rel.endsWith("index.css")) continue;
          findings.push({ file: rel, line: i + 1, match: m[0], label });
          total++;
        }
      }
    }
  }
}

if (!total) {
  console.log("✔ No hardcoded color findings.");
  process.exit(0);
}

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

for (const [file, rows] of byFile) {
  console.log(`\n${file}  (${rows.length})`);
  for (const r of rows) {
    console.log(`  ${String(r.line).padStart(4)}  ${r.label.padEnd(18)}  ${r.match}`);
  }
}
console.log(`\n${total} finding${total === 1 ? "" : "s"} across ${byFile.size} file${byFile.size === 1 ? "" : "s"}.`);
process.exit(0);