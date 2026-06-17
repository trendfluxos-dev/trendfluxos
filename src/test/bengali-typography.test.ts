import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (rel: string) =>
  fs.readFileSync(path.resolve(__dirname, "../..", rel), "utf8");

describe("Global Bengali / Unicode typography", () => {
  const css = read("src/index.css");
  const html = read("index.html");

  it("ships Bengali web fonts in index.html", () => {
    expect(html).toMatch(/Noto\+Sans\+Bengali/);
    expect(html).toMatch(/Hind\+Siliguri/);
  });

  it("applies safer global wrapping defaults to body", () => {
    expect(css).toMatch(/body\s*\{[^}]*overflow-wrap:\s*break-word/s);
    expect(css).toMatch(/body\s*\{[^}]*hyphens:\s*none/s);
  });

  it("defines [lang=\"bn\"] rules that prevent mid-word breaks", () => {
    const block = css.match(/\[lang="bn"\][^{]*\{[^}]+\}/s)?.[0] ?? "";
    expect(block).toMatch(/word-break:\s*keep-all/);
    expect(block).toMatch(/overflow-wrap:\s*normal/);
    expect(block).toMatch(/line-break:\s*strict/);
    expect(block).toMatch(/hyphens:\s*none/);
    expect(block).toMatch(/Noto Sans Bengali/);
  });

  it("keeps long URLs / code wrapping so they can never overflow", () => {
    expect(css).toMatch(/a\[href\][^{]*,\s*code[^{]*,\s*pre[^{]*\{[^}]*overflow-wrap:\s*anywhere/s);
  });
});

describe("Per-page Bengali lang attribute usage", () => {
  it("Marriage page tags <main> with the active language", () => {
    const src = read("src/pages/Marriage.tsx");
    expect(src).toMatch(/lang=\{bangla\s*\?\s*"bn"\s*:\s*"en"\}/);
  });

  it("Index page tags Bengali text blocks with lang=\"bn\"", () => {
    const src = read("src/pages/Index.tsx");
    // The Stand cover and Quiet Positions heading carry lang="bn"
    const matches = src.match(/lang="bn"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Detection of Bengali strings in dynamic content", () => {
  const isBn = (s: string) => /[\u0980-\u09FF]/.test(s);

  it.each([
    "সত্যের পক্ষে দাঁড়ানো",
    "একটা অবস্থান, সারা দেশের আলোচনায়",
    "সাহসের গল্প, হেডলাইনে সত্য",
    "চুপ না থেকে হেডলাইনে",
  ])("flags Bengali string %#", (s) => {
    expect(isBn(s)).toBe(true);
  });

  it.each([
    "From Stand to Spotlight",
    "Integrity Under Fire",
    "Stand. Speak. Spotlight.",
    "TrendFlux Digital",
  ])("does not flag English string %#", (s) => {
    expect(isBn(s)).toBe(false);
  });

  it("flags mixed Bangla + English strings", () => {
    expect(isBn("সত্যের পক্ষে দাঁড়ানো — National Spotlight")).toBe(true);
  });
});
