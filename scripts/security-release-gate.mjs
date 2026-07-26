#!/usr/bin/env node
/**
 * Release security gate.
 *
 * Runs on every deploy and blocks the release when a previously-fixed finding
 * regresses. Three independent phases, all evaluated against
 * `.security/release-gate.json`:
 *
 *   1. structure — consumes the JSON emitted by scripts/security-invariants.sql
 *      (anon-executable SECURITY DEFINER functions, missing search_path,
 *      RLS gaps, user_roles writability).
 *   2. live-auth — probes the deployed PostgREST API with the *publishable*
 *      anon key and asserts that sensitive tables return no rows and
 *      privileged RPCs are not callable.
 *   3. routes   — asserts the deployed site still serves its public routes,
 *      so a hard-locked database can't quietly 500 the site into "secure".
 *
 * Phases are skipped when their input is absent, and a skipped phase is
 * reported as such rather than silently passing.
 *
 * Usage:
 *   node scripts/security-release-gate.mjs \
 *     --invariants reports/invariants.json \
 *     --base-url https://trendflux.digital
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_ANON_KEY  — enable the live-auth phase.
 *   SECURITY_GATE_SOFT_FAIL=1        — report but exit 0 (for dry runs only).
 *
 * Exit: 0 when every executed phase passes, 1 otherwise.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const POLICY_PATH = resolve(".security/release-gate.json");
const policy = JSON.parse(readFileSync(POLICY_PATH, "utf8"));

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const invariantsPath = arg("--invariants");
const baseUrl = (arg("--base-url") ?? process.env.SECURITY_GATE_BASE_URL ?? "").replace(/\/$/, "");
const supabaseUrl = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
const softFail = process.env.SECURITY_GATE_SOFT_FAIL === "1";
const reportPath = resolve(process.env.SECURITY_GATE_REPORT ?? "reports/security-release-gate.json");

/** @type {{phase:string,check:string,subject:string,detail:string}[]} */
const failures = [];
/** @type {{phase:string,reason:string}[]} */
const skipped = [];
const passed = [];

function fail(phase, check, subject, detail) {
  failures.push({ phase, check, subject, detail });
}

// ---------------------------------------------------------------------------
// phase 1 — structural invariants
// ---------------------------------------------------------------------------
function phaseStructure() {
  if (!invariantsPath || !existsSync(invariantsPath)) {
    skipped.push({
      phase: "structure",
      reason: "no --invariants report supplied (local Supabase stack unavailable)",
    });
    return;
  }

  const raw = readFileSync(invariantsPath, "utf8").trim();
  if (!raw) {
    fail("structure", "invariants_empty", invariantsPath, "invariant query produced no output");
    return;
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    fail("structure", "invariants_unparseable", invariantsPath, String(err));
    return;
  }

  const allowedAnon = new Set(policy.anonExecutableFunctions?.allow ?? []);
  const exemptRls = new Set(policy.tablesRequiringRls?.exempt ?? []);
  const requireSearchPath = policy.requireSearchPathOnDefiner !== false;

  for (const v of doc.violations ?? []) {
    // An allow-list entry may name the bare function or the full signature.
    const bareName = String(v.subject).replace(/\(.*$/, "");

    if (v.check === "anon_executable_definer_function") {
      if (allowedAnon.has(bareName) || allowedAnon.has(v.subject)) continue;
    }
    if (v.check === "definer_function_missing_search_path" && !requireSearchPath) continue;
    if (v.check === "table_rls_disabled" && exemptRls.has(v.subject)) continue;

    fail("structure", v.check, v.subject, v.detail);
  }

  if (!failures.some((f) => f.phase === "structure")) {
    passed.push(`structure — ${(doc.violations ?? []).length} raw finding(s), all within policy`);
  }
}

// ---------------------------------------------------------------------------
// phase 2 — live auth checks
// ---------------------------------------------------------------------------
async function phaseLiveAuth() {
  if (!supabaseUrl || !anonKey) {
    skipped.push({
      phase: "live-auth",
      reason: "SUPABASE_URL / SUPABASE_ANON_KEY not set",
    });
    return;
  }

  const headers = { apikey: anonKey, Accept: "application/json" };
  const checks = policy.criticalAuthChecks ?? {};
  let ok = 0;

  for (const table of checks.anonMustNotRead ?? []) {
    const url = `${supabaseUrl}/rest/v1/${encodeURIComponent(table)}?select=*&limit=1`;
    let res;
    try {
      res = await fetch(url, { headers });
    } catch (err) {
      fail("live-auth", "probe_failed", table, `request error: ${String(err)}`);
      continue;
    }
    const body = await res.text();

    if (res.status === 200) {
      let rows;
      try {
        rows = JSON.parse(body);
      } catch {
        rows = null;
      }
      if (Array.isArray(rows) && rows.length > 0) {
        fail(
          "live-auth",
          "anon_can_read_sensitive_table",
          table,
          `unauthenticated SELECT returned ${rows.length} row(s) — RLS regression`,
        );
        continue;
      }
    }
    ok += 1;
  }

  for (const fn of checks.anonMustNotExecute ?? []) {
    const url = `${supabaseUrl}/rest/v1/rpc/${encodeURIComponent(fn)}`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: "{}",
      });
    } catch (err) {
      fail("live-auth", "probe_failed", fn, `request error: ${String(err)}`);
      continue;
    }
    // 400 = reached the function but arguments were wrong → still executable.
    if (res.status === 200 || res.status === 400) {
      fail(
        "live-auth",
        "anon_can_execute_privileged_rpc",
        fn,
        `unauthenticated POST /rpc/${fn} returned ${res.status} — EXECUTE has been re-granted to anon`,
      );
      continue;
    }
    ok += 1;
  }

  if (!failures.some((f) => f.phase === "live-auth")) {
    passed.push(`live-auth — ${ok} probe(s) correctly denied`);
  }
}

// ---------------------------------------------------------------------------
// phase 3 — deployment is still serving traffic
//
// Reachability only: the SPA fallback answers 200 for any path, so this cannot
// prove a route renders. Its job is to catch the failure mode where a security
// change locks the app down so hard the site itself breaks — a "secure" deploy
// that serves 5xx must not pass as green.
// ---------------------------------------------------------------------------
async function phaseRoutes() {
  const urls = policy.routesMustResolve?.urls ?? [];
  if (!baseUrl || urls.length === 0) {
    skipped.push({ phase: "reachability", reason: "no --base-url supplied" });
    return;
  }

  let ok = 0;
  for (const route of urls) {
    const url = `${baseUrl}${route}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        fail("reachability", "endpoint_unavailable", route, `${url} returned HTTP ${res.status}`);
        continue;
      }
      ok += 1;
    } catch (err) {
      fail("reachability", "endpoint_unavailable", route, `${url} — ${String(err)}`);
    }
  }

  if (!failures.some((f) => f.phase === "reachability")) {
    passed.push(`reachability — ${ok} endpoint(s) serving traffic`);
  }
}


// ---------------------------------------------------------------------------
// reporting
// ---------------------------------------------------------------------------
function writeReport(status) {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        status,
        generated_at: new Date().toISOString(),
        commit: process.env.GITHUB_SHA ?? "local",
        passed,
        skipped,
        failures,
      },
      null,
      2,
    ),
    "utf8",
  );
}

function writeStepSummary(status) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const lines = [`## Security release gate — ${status}`, ""];

  for (const p of passed) lines.push(`- ✅ ${p}`);
  for (const s of skipped) lines.push(`- ⏭️ **${s.phase}** skipped — ${s.reason}`);

  if (failures.length > 0) {
    lines.push("", "### ❌ Blocking regressions", "", "| Phase | Check | Subject | Detail |", "| --- | --- | --- | --- |");
    const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
    for (const f of failures) {
      lines.push(`| ${cell(f.phase)} | \`${cell(f.check)}\` | \`${cell(f.subject)}\` | ${cell(f.detail)} |`);
    }
  }
  lines.push("", `Policy: \`.security/release-gate.json\``);
  appendFileSync(summaryPath, lines.join("\n") + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
phaseStructure();
await phaseLiveAuth();
await phaseRoutes();

for (const p of passed) console.log(`[security-gate] PASS  ${p}`);
for (const s of skipped) console.log(`[security-gate] SKIP  ${s.phase} — ${s.reason}`);

const status = failures.length === 0 ? "PASS" : "FAIL";
writeReport(status);
writeStepSummary(status);

if (failures.length === 0) {
  if (skipped.length === (policy.$phases ?? 3)) {
    console.error("[security-gate] FAIL — every phase was skipped; the gate verified nothing.");
    process.exit(1);
  }
  console.log("[security-gate] OK — no security regressions detected.");
  process.exit(0);
}

console.error(`\n[security-gate] FAIL — ${failures.length} blocking security regression(s):\n`);
for (const f of failures) {
  console.error(`::error title=Security gate (${f.phase}): ${f.check}::${f.subject} — ${f.detail}`);
  console.error(`  [${f.phase}] ${f.check}  ${f.subject}\n      ${f.detail}`);
}
console.error(
  "\nRelease blocked. Either fix the regression, or — if this is a deliberate\n" +
    "change — update `.security/release-gate.json` with a written reason and\n" +
    "refresh @security-memory in the same commit.",
);

process.exit(softFail ? 0 : 1);
