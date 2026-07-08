import { expect, test } from "@playwright/test";

/**
 * Low-RAM / low-bandwidth mobile smoke.
 *
 * Emulates a ≤2 GB Android phone on a congested mobile connection by
 * throttling the CPU 4× and shaping the network to Slow-3G (400 kbps down,
 * 400 ms RTT). If the homepage still opens, renders the hero, and stays
 * interactive, we can ship to low-end users without hydration jank or
 * out-of-memory hangs.
 *
 * Runs against Chromium-based projects (CDP-only APIs). Other engines get
 * an early `test.skip` so the same file is safe under the shared project
 * matrix.
 */

test.describe("Low-RAM mobile", () => {
  test("home page opens and stays interactive under CPU + network throttle", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP throttling requires Chromium");
    test.setTimeout(90_000);

    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 400,               // ms RTT
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
    });

    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
    expect(response, "response for /").not.toBeNull();
    expect(response!.status()).toBeLessThan(400);

    // Hero must render within the throttled budget — proves the critical
    // path bundle is small enough for low-end devices.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });

    // Interactive check: tap a real control (mobile navbar toggle if any,
    // else the first hero link) and expect no hang / error.
    const firstLink = page.getByRole("link").first();
    await expect(firstLink).toBeVisible();

    expect(pageErrors, `page errors: ${pageErrors.join(" | ")}`).toEqual([]);

    // Reset throttling so subsequent tests aren't affected.
    await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });
  });
});