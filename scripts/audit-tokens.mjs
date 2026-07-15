#!/usr/bin/env node
/**
 * Design-system token audit (report-only).
 *
 * Scans src/pages and src/components for hardcoded colors that should
 * instead reference design tokens.
 *
 * Modes:
 *   node scripts/audit-tokens.mjs                      # report (exit 0)
 *   node scripts/audit-tokens.mjs src/pages/Foo.tsx    # report for path(s)
 *   node scripts/audit-tokens.mjs --baseline           # write baseline JSON
 *   node scripts/audit-tokens.mjs --check              # fail on regressions
 *
 * The --check mode is the CI gate. It compares the current per-file counts
 * against .audit-tokens-baseline.json (committed to the repo). A file's
 * count going UP fails the check; a new offender file fails the check.
 * Counts going DOWN are always allowed and never require a baseline bump.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const BASELINE_FILE = ".audit-tokens-baseline.json";

const args = process.argv.slice(2);
const mode = args.includes("--check")
  ? "check"
  : args.includes("--baseline")
    ? "baseline"
    : "report";
const pathArgs = args.filter((a) => !a.startsWith("--"));

// In check/baseline modes we always scan the full source tree so counts are
// comparable across runs. In report mode the user can narrow to specific
// paths for iterative work.
const TARGETS =
  mode === "report" && pathArgs.length
    ? pathArgs
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
    // Always use POSIX separators in output/baseline so keys are portable
    // between developer machines and CI runners.
    const rel = relative(ROOT, file).split(sep).join("/");
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

// Group findings by file for both reporting and baseline comparison.
const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

// Deterministic, sorted counts object for baseline writes and diffs.
function countsFrom(map) {
  const out = {};
  for (const k of [...map.keys()].sort()) out[k] = map.get(k).length;
  return out;
}

if (mode === "baseline") {
  const counts = countsFrom(byFile);
  writeFileSync(
    join(ROOT, BASELINE_FILE),
    JSON.stringify(counts, null, 2) + "\n",
  );
  const filesN = Object.keys(counts).length;
  console.log(
    `✔ Wrote ${BASELINE_FILE} — ${total} finding${total === 1 ? "" : "s"} across ${filesN} file${filesN === 1 ? "" : "s"}.`,
  );
  process.exit(0);
}

if (mode === "check") {
  const baselinePath = join(ROOT, BASELINE_FILE);
  if (!existsSync(baselinePath)) {
    console.error(
      `✖ ${BASELINE_FILE} missing. Run \`node scripts/audit-tokens.mjs --baseline\` first, then commit the file.`,
    );
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const current = countsFrom(byFile);

  const regressions = []; // count went up
  const newOffenders = []; // file not in baseline but has findings
  const improvements = []; // count went down (informational)

  for (const [file, count] of Object.entries(current)) {
    if (!(file in baseline)) {
      newOffenders.push({ file, count });
    } else if (count > baseline[file]) {
      regressions.push({ file, from: baseline[file], to: count });
    } else if (count < baseline[file]) {
      improvements.push({ file, from: baseline[file], to: count });
    }
  }

  if (improvements.length) {
    console.log("Improvements (baseline can be refreshed):");
    for (const i of improvements) {
      console.log(`  ↓ ${i.file}  ${i.from} → ${i.to}`);
    }
    console.log("");
  }

  if (!regressions.length && !newOffenders.length) {
    console.log(
      `✔ No hardcoded-color regressions. ${total} finding${total === 1 ? "" : "s"} (baseline).`,
    );
    process.exit(0);
  }

  console.error("✖ Hardcoded-color regression detected.\n");
  if (regressions.length) {
    console.error("Files whose count increased:");
    for (const r of regressions) {
      console.error(`  ↑ ${r.file}  ${r.from} → ${r.to}  (+${r.to - r.from})`);
    }
    console.error("");
  }
  if (newOffenders.length) {
    console.error("New files with hardcoded colors:");
    for (const n of newOffenders) {
      console.error(`  + ${n.file}  (${n.count})`);
    }
    console.error("");
  }
  console.error(
    "Fix by replacing hex/bg-white/text-white/bg-black with semantic tokens\n" +
      "(bg-background, text-foreground, bg-primary, bg-scrim, bg-paper, ...).\n" +
      "If the additions are intentional, run\n" +
      `  npm run audit:tokens:baseline\n` +
      "and commit the updated .audit-tokens-baseline.json.",
  );
  process.exit(1);
}

// Default: report mode.
if (!total) {
  console.log("✔ No hardcoded color findings.");
  process.exit(0);
}
for (const [file, rows] of byFile) {
  console.log(`\n${file}  (${rows.length})`);
  for (const r of rows) {
    console.log(`  ${String(r.line).padStart(4)}  ${r.label.padEnd(18)}  ${r.match}`);
  }
}
console.log(
  `\n${total} finding${total === 1 ? "" : "s"} across ${byFile.size} file${byFile.size === 1 ? "" : "s"}.`,
);
process.exit(0);