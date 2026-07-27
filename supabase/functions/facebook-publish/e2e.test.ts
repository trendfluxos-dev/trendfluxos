/**
 * Production-like end-to-end test for the Newsroom → queue → Facebook pipeline.
 *
 * Drives the deployed `facebook-publish` function in `e2e` mode, which:
 *   1. reads the live Nagarik Barta 24 feed,
 *   2. enqueues a synthetic item in public.facebook_posts,
 *   3. publishes it through the real Graph API,
 *   4. asserts the returned Facebook Post ID,
 *   5. deletes the post and the queue row again (nothing is left on the Page).
 *
 * Requires FACEBOOK_CRON_SECRET (same value the scheduler uses) in the env.
 * Without it the test is skipped rather than failing, so CI stays green on
 * forks and preview environments that don't hold production credentials.
 */
import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
// `export: true` merges .env into Deno.env; no examplePath so optional vars
// listed in .env.example (e.g. VITE_SENTRY_DSN) don't hard-fail the run.
loadSync({ export: true, allowEmptyValues: true });
import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const CRON_SECRET = Deno.env.get("FACEBOOK_CRON_SECRET") ?? "";
const FN_URL = `${SUPABASE_URL}/functions/v1/facebook-publish`;

type Stage = { stage: string; status: "PASS" | "FAIL" | "SKIP"; detail: string };
type Report = { ok: boolean; mode: string; fb_post_id: string | null; stages: Stage[] };

const call = async (body: Record<string, unknown>): Promise<Report> => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Cron-Secret": CRON_SECRET },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as Report;
  } catch {
    throw new Error(`non-JSON response [${res.status}]: ${text.slice(0, 500)}`);
  }
};

const ready = Boolean(SUPABASE_URL && CRON_SECRET);
const stageOf = (r: Report, name: string) => r.stages.find((s) => s.stage === name);

Deno.test({
  name: "diagnose reports a healthy Page token and reachable queue",
  ignore: !ready,
  async fn() {
    const report = await call({ mode: "diagnose" });
    const failures = report.stages.filter((s) => s.status === "FAIL");
    assertEquals(failures, [], `diagnose failures: ${JSON.stringify(failures, null, 2)}`);
  },
});

Deno.test({
  name: "full Newsroom → queue → Facebook publish flow returns a valid Post ID",
  ignore: !ready,
  async fn() {
    const report = await call({ mode: "e2e" });

    const failures = report.stages.filter((s) => s.status === "FAIL");
    assertEquals(failures, [], `pipeline failures: ${JSON.stringify(failures, null, 2)}`);

    // Every stage of the pipeline must have run.
    for (const stage of [
      "newsroom:feed",
      "queue:enqueue",
      "graph:publish",
      "graph:post id shape",
      "queue:row published",
      "cleanup:delete fb post",
    ]) {
      assert(stageOf(report, stage), `missing pipeline stage: ${stage}`);
    }

    // The asserted contract: Graph returns "<page_id>_<post_id>".
    assert(report.fb_post_id, "no Facebook Post ID returned");
    assertMatch(report.fb_post_id!, /^\d+_\d+$/);
    assertEquals(report.ok, true);
  },
});
