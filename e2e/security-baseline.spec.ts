import { expect, test } from "@playwright/test";

/**
 * Security baseline smoke — runs on every configured browser project.
 *
 * Fails when the homepage triggers any of the browser's built-in security
 * guardrails: mixed content, CSP violations, blocked-by-security network
 * requests, insecure form actions, or uncaught JS errors during hydration.
 *
 * The goal is that a low-end phone opening the site never sees a browser
 * security prompt / warning banner and never lands on a broken shell.
 */

const SECURITY_ERROR_PATTERNS = [
  /mixed content/i,
  /content security policy/i,
  /blocked by CORS/i,
  /blocked:csp/i,
  /net::ERR_CERT/i,
  /net::ERR_BLOCKED_BY_/i,
  /refused to (load|execute|apply|connect)/i,
  /insecure (form|request|response)/i,
  /this request has been blocked/i,
];

test.describe("Security baseline", () => {
  test("home page renders without security warnings or blocked requests", async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const blockedRequests: string[] = [];

    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (SECURITY_ERROR_PATTERNS.some((rx) => rx.test(text))) {
        consoleErrors.push(text);
      }
    });
    page.on("requestfailed", (req) => {
      const reason = req.failure()?.errorText ?? "";
      if (/BLOCKED|CERT|MIXED|CSP|CORS/i.test(reason)) {
        blockedRequests.push(`${req.url()} — ${reason}`);
      }
    });

    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response, "response for /").not.toBeNull();
    expect(response!.status()).toBeLessThan(400);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // No insecure form actions (http:// posts from an https:// page trigger a
    // browser warning banner on submit).
    const insecureForms = await page.$$eval("form[action^='http://']", (nodes) =>
      nodes.map((n) => (n as HTMLFormElement).action),
    );
    expect(insecureForms, "insecure http:// form actions").toEqual([]);

    expect(pageErrors, `page errors: ${pageErrors.join(" | ")}`).toEqual([]);
    expect(consoleErrors, `security console errors: ${consoleErrors.join(" | ")}`).toEqual([]);
    expect(blockedRequests, `blocked requests: ${blockedRequests.join(" | ")}`).toEqual([]);
  });
});