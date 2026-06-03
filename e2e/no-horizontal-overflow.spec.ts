import { expect, test, type Page, type TestInfo } from "@playwright/test";

/**
 * On any overflow-assertion failure, attach a forensic bundle to the report:
 *   1. full-page screenshot at the exact failure moment
 *   2. HTML DOM snapshot
 *   3. JSON snapshot of viewport + the offending element chain
 * The Playwright trace is already retained via playwright.config.ts.
 */
async function attachOverflowForensics(
  page: Page,
  testInfo: TestInfo,
  label: string,
  scrollWidth: number,
  clientWidth: number,
) {
  const safe = label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  try {
    const png = await page.screenshot({ fullPage: true });
    await testInfo.attach(`overflow-${safe}.png`, {
      body: png,
      contentType: "image/png",
    });
  } catch {
    /* screenshot is best-effort */
  }

  try {
    const html = await page.content();
    await testInfo.attach(`dom-${safe}.html`, {
      body: html,
      contentType: "text/html",
    });
  } catch {
    /* ignore */
  }

  try {
    const offenders = await page.evaluate((vw) => {
      const wide: Array<{
        tag: string;
        id: string;
        className: string;
        rectRight: number;
        scrollWidth: number;
        outerHTMLHead: string;
      }> = [];
      document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 || el.scrollWidth > vw + 1) {
          wide.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || "",
            className:
              typeof el.className === "string" ? el.className.slice(0, 200) : "",
            rectRight: Math.round(r.right),
            scrollWidth: el.scrollWidth,
            outerHTMLHead: el.outerHTML.slice(0, 240),
          });
        }
      });
      return wide.slice(0, 25);
    }, clientWidth);

    await testInfo.attach(`offenders-${safe}.json`, {
      body: Buffer.from(
        JSON.stringify(
          {
            label,
            viewport: page.viewportSize(),
            documentScrollWidth: scrollWidth,
            documentClientWidth: clientWidth,
            url: page.url(),
            userAgent: await page.evaluate(() => navigator.userAgent),
            overflowingElements: offenders,
          },
          null,
          2,
        ),
      ),
      contentType: "application/json",
    });
  } catch {
    /* ignore */
  }
}

function makeMeasure(page: Page, testInfo: TestInfo) {
  return async (label: string) => {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (scrollWidth > clientWidth + 1) {
      await attachOverflowForensics(
        page,
        testInfo,
        label,
        scrollWidth,
        clientWidth,
      );
    }
    expect(
      scrollWidth,
      `${label}: scrollWidth ${scrollWidth}px exceeds viewport ${clientWidth}px`,
    ).toBeLessThanOrEqual(clientWidth + 1);
  };
}

test.describe("no horizontal overflow on mobile Safari", () => {
  test("home page stays within viewport during sticky-bar interaction", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(viewportWidth).toBeGreaterThan(0);

    const measure = makeMeasure(page, testInfo);


    await measure("initial paint");

    // Scroll until the sticky filter bar is pinned.
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(150);
    await measure("after sticky pin");

    // Interact with the filter bar — focus search, type, then a select dropdown.
    const search = page.getByRole("searchbox", { name: /search case studies/i }).first();
    if (await search.count()) {
      await search.scrollIntoViewIfNeeded();
      await search.tap();
      await search.fill("ai automation funnel growth");
      await measure("after typing in search");
    }

    const serviceSelect = page.getByLabel(/growth service/i).first();
    if (await serviceSelect.count()) {
      await serviceSelect.scrollIntoViewIfNeeded();
      await serviceSelect.selectOption({ index: 1 }).catch(() => {});
      await measure("after selecting filter option");
    }

    // Scroll to the bottom and re-check — late-loading content must not overflow.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);
    await measure("at page bottom");
  });

  test("repeated sticky-bar taps + scrolling during map animation keep viewport stable", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const measure = makeMeasure(page, testInfo);


    await measure("initial paint");

    // Pin the sticky filter bar.
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(150);
    await measure("after sticky pin");

    // Try to bring the map animation into view in parallel with the filter bar.
    const map = page
      .locator(
        '[data-testid*="map" i], [class*="map" i], canvas, svg[class*="map" i]',
      )
      .first();
    const mapVisible = await map.count().then((c) => c > 0);
    if (mapVisible) {
      await map.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(200);
      await measure("after map enters viewport");
      // Scroll back so the sticky bar is pinned but the map is still animating.
      await page.evaluate(() => window.scrollTo(0, 700));
      await page.waitForTimeout(150);
    }

    const search = page
      .getByRole("searchbox", { name: /search case studies/i })
      .first();
    const serviceSelect = page.getByLabel(/growth service/i).first();
    const hasSearch = (await search.count()) > 0;
    const hasSelect = (await serviceSelect.count()) > 0;

    // Repeatedly tap + scroll while the map animation runs.
    for (let i = 0; i < 6; i++) {
      if (hasSearch) {
        await search.scrollIntoViewIfNeeded().catch(() => {});
        await search.tap().catch(() => {});
        await search.fill(`query ${i}`).catch(() => {});
        await measure(`iter ${i}: after tap+type search`);
      }

      if (hasSelect) {
        await serviceSelect.scrollIntoViewIfNeeded().catch(() => {});
        await serviceSelect
          .selectOption({ index: (i % 2) + 1 })
          .catch(() => {});
        await measure(`iter ${i}: after select change`);
      }

      // Alternate scroll positions to keep sticky/map interaction active.
      const y = i % 2 === 0 ? 900 : 500;
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(120);
      await measure(`iter ${i}: after scroll to ${y}`);

      // Small horizontal swipe attempt — must not produce overflow.
      await page.mouse.wheel(40, 0);
      await page.waitForTimeout(60);
      await measure(`iter ${i}: after horizontal wheel`);
    }

    if (hasSearch) {
      await search.fill("").catch(() => {});
      await measure("after clearing search");
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);
    await measure("final: page bottom");
  });
});
