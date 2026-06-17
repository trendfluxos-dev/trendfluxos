#!/usr/bin/env node
/**
 * CI security gate: run the Supabase database linter and fail the build if
 * any finding is not explicitly accepted in `.security/lint-baseline.json`.
 *
 * Why a baseline file (not just `--level error`)?
 *   The linter emits some `warn`-level findings that are intentional design
 *   choices (e.g. SECURITY DEFINER helpers that must be callable by
 *   authenticated users). We want those warnings silenced one-by-one with a
 *   recorded reason, and *every other* finding — new or pre-existing — to
 *   fail the gate so it can't be ignored by accident.
 *
 * Inputs:
 *   - Pipe `supabase db lint --output json` stdout into this script, OR
 *     pass a path to a JSON file as the first argument.
 *   - Baseline lives at `.security/lint-baseline.json`.
 *
 * Exit: 0 when every finding is accepted, 1 otherwise.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASELINE_PATH = resolve(".security/lint-baseline.json");

function readStdin() {
  return new Promise((resolveStdin) => {
    let data = "";
    if (process.stdin.isTTY) return resolveStdin("");
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolveStdin(data));
  });
}

function parseFindings(raw) {
  const text = raw.trim();
  if (!text) return [];
  // Supabase CLI emits either a top-level array of findings or an object
  // with `{ findings: [...] }` depending on version. Handle both.
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.findings)) return parsed.findings;
  return [];
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const acceptedNames = new Set(baseline.accepted.map((entry) => entry.name));

const inputPath = process.argv[2];
const raw = inputPath ? readFileSync(inputPath, "utf8") : await readStdin();
const findings = parseFindings(raw);

const offenders = findings.filter((f) => !acceptedNames.has(f.name));

console.log(
  `[supabase-lint-gate] ${findings.length} findings total, ${
    findings.length - offenders.length
  } accepted, ${offenders.length} new.`,
);

if (offenders.length === 0) {
  console.log("[supabase-lint-gate] OK — no unaccepted findings.");
  process.exit(0);
}

console.error("\n[supabase-lint-gate] FAIL — new or unaccepted Supabase linter findings:\n");
for (const f of offenders) {
  console.error(`  ${f.level?.toUpperCase() ?? "WARN"}  ${f.name}`);
  if (f.title) console.error(`         ${f.title}`);
  if (f.detail) console.error(`         ${f.detail}`);
  if (f.remediation) console.error(`         fix: ${f.remediation}`);
  console.error("");
}
console.error(
  "If a finding above is an intentional design choice, append it to\n" +
    "`.security/lint-baseline.json` with a written reason and update\n" +
    "@security-memory accordingly. Otherwise, fix the underlying issue.",
);
process.exit(1);