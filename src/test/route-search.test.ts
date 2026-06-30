import { describe, it, expect } from "vitest";
import { resolveRoute, KNOWN_ROUTES } from "@/lib/routeSearch";
import { SITE_LAYERS } from "@/config/siteLayers";

/**
 * Guarantees the navbar dropdown items + every curated alias used by the
 * root-domain search resolve instantly and to the correct page, and that
 * the resolver itself stays well under a 100ms budget per lookup.
 */

describe("root-domain search resolver", () => {
  it("every internal dropdown item is a known indexable route", () => {
    const dropdownInternal = SITE_LAYERS
      .filter((n) => !n.external && !n.noindex)
      .map((n) => n.path);
    for (const path of dropdownInternal) {
      const res = resolveRoute(path);
      expect(res, `dropdown item ${path} must resolve`).not.toBeNull();
      expect(res!.path, `dropdown item ${path} should resolve exactly`).toBe(path);
      expect(res!.reason).toBe("exact");
    }
  });

  it("common aliases redirect to a real KNOWN_ROUTE", () => {
    const cases: Array<[string, string]> = [
      ["/cv", "/portfolio"],
      ["/resume", "/portfolio"],
      ["/login", "/auth"],
      ["/signup", "/auth"],
      ["/courses", "/edtech/courses"],
      ["/pricing", "/edtech/pricing"],
      ["/tutor", "/edtech/tutors"],
      ["/webinar", "/edtech/live"],
      ["/biodata", "/marriage"],
      ["/marrige", "/marriage"], // typo
      ["/press", "/media-reports"],
      ["/brand", "/brands"],
    ];
    for (const [input, expected] of cases) {
      const res = resolveRoute(input);
      expect(res, `alias ${input}`).not.toBeNull();
      expect(res!.path).toBe(expected);
      expect(KNOWN_ROUTES).toContain(res!.path);
      expect(res!.score).toBeGreaterThanOrEqual(0.85);
    }
  });

  it("resolves 1000 lookups in under the 100ms budget (≤0.1ms each)", () => {
    const samples = [
      "/marrige", "/cv", "/login", "/edtech-pricing", "/tutors",
      "/contact", "/justic", "/edtech/live", "/randomgarbage", "/portfolio",
    ];
    const start = performance.now();
    for (let i = 0; i < 1000; i++) resolveRoute(samples[i % samples.length]);
    const elapsed = performance.now() - start;
    // 1000 calls < 100ms ⇒ < 0.1ms per call ⇒ redirect path << 100ms.
    expect(elapsed).toBeLessThan(100);
  });
});