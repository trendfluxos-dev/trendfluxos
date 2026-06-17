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
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const BASELINE_PATH = resolve(".security/lint-baseline.json");
const HTML_REPORT_PATH = resolve(
  process.env.SUPABASE_LINT_HTML_REPORT ?? "reports/supabase-lint.html",
);

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
const acceptedByName = new Map(
  baseline.accepted.map((entry) => [entry.name, entry]),
);
const acceptedNames = new Set(acceptedByName.keys());

const inputPath = process.argv[2];
const raw = inputPath ? readFileSync(inputPath, "utf8") : await readStdin();
const findings = parseFindings(raw);

const offenders = findings.filter((f) => !acceptedNames.has(f.name));
const matched = findings.filter((f) => acceptedNames.has(f.name));

writeHtmlReport({ findings, offenders, matched });

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

// ---------------------------------------------------------------------------
// HTML report
// ---------------------------------------------------------------------------
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFinding(f, { accepted } = {}) {
  const level = (f.level ?? "warn").toLowerCase();
  const reason = accepted ? acceptedByName.get(f.name)?.reason : null;
  return `
    <article class="finding finding--${escapeHtml(level)} ${accepted ? "finding--accepted" : "finding--new"}">
      <header>
        <span class="badge badge--${escapeHtml(level)}">${escapeHtml(level)}</span>
        <span class="badge badge--${accepted ? "accepted" : "new"}">${accepted ? "baseline match" : "NEW"}</span>
        <code class="rule">${escapeHtml(f.name ?? "unknown")}</code>
      </header>
      ${f.title ? `<h3>${escapeHtml(f.title)}</h3>` : ""}
      ${f.detail ? `<p class="detail">${escapeHtml(f.detail)}</p>` : ""}
      ${f.remediation ? `<p class="remediation"><strong>Fix:</strong> ${escapeHtml(f.remediation)}</p>` : ""}
      ${reason ? `<p class="reason"><strong>Accepted because:</strong> ${escapeHtml(reason)}</p>` : ""}
    </article>
  `;
}

function writeHtmlReport({ findings, offenders, matched }) {
  const status = offenders.length === 0 ? "PASS" : "FAIL";
  const generatedAt = new Date().toISOString();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Supabase Security Lint Report — ${status}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; margin: 0; padding: 32px; max-width: 960px; margin-inline: auto; color: #0f172a; background: #f8fafc; }
  @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background: #0f172a; } .finding { background: #1e293b; border-color: #334155; } .summary { background: #1e293b; } code, .rule { background: #0f172a; } }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; border-radius: 12px; background: #fff; border: 1px solid #e2e8f0; margin-bottom: 24px; }
  .summary div { text-align: center; }
  .summary strong { display: block; font-size: 24px; }
  .status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-weight: 600; font-size: 12px; letter-spacing: 0.05em; }
  .status--PASS { background: #dcfce7; color: #166534; }
  .status--FAIL { background: #fee2e2; color: #991b1b; }
  section { margin-bottom: 32px; }
  section > h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 0 0 12px; }
  .finding { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; background: #fff; }
  .finding--new { border-left: 4px solid #dc2626; }
  .finding--accepted { border-left: 4px solid #16a34a; }
  .finding header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
  .finding h3 { margin: 4px 0; font-size: 15px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
  .badge--error { background: #fecaca; color: #7f1d1d; }
  .badge--warn { background: #fef3c7; color: #78350f; }
  .badge--info { background: #dbeafe; color: #1e3a8a; }
  .badge--new { background: #fee2e2; color: #991b1b; }
  .badge--accepted { background: #dcfce7; color: #166534; }
  code, .rule { font: 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  .empty { color: #64748b; font-style: italic; }
  .reason { color: #166534; }
  .remediation { color: #7f1d1d; }
</style>
</head>
<body>
  <h1>Supabase Security Lint Report <span class="status status--${status}">${status}</span></h1>
  <p class="meta">Generated ${escapeHtml(generatedAt)} · commit <code>${escapeHtml(process.env.GITHUB_SHA ?? "local")}</code></p>

  <div class="summary">
    <div><strong>${findings.length}</strong>Total findings</div>
    <div><strong style="color:#dc2626">${offenders.length}</strong>New / unaccepted</div>
    <div><strong style="color:#16a34a">${matched.length}</strong>Baseline matches</div>
  </div>

  <section>
    <h2>New findings (fail the build)</h2>
    ${offenders.length === 0
      ? `<p class="empty">None — no unaccepted findings.</p>`
      : offenders.map((f) => renderFinding(f, { accepted: false })).join("")}
  </section>

  <section>
    <h2>Baseline matches (intentionally accepted)</h2>
    ${matched.length === 0
      ? `<p class="empty">No accepted findings were emitted on this run.</p>`
      : matched.map((f) => renderFinding(f, { accepted: true })).join("")}
  </section>

  <p class="meta">Baseline lives at <code>.security/lint-baseline.json</code>. Any new finding must either be fixed or appended to the baseline with a written reason and a security-memory update.</p>
</body>
</html>`;
  mkdirSync(dirname(HTML_REPORT_PATH), { recursive: true });
  writeFileSync(HTML_REPORT_PATH, html, "utf8");
  console.log(`[supabase-lint-gate] HTML report written to ${HTML_REPORT_PATH}`);
}