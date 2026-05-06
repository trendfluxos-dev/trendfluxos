import { describe, it, expect, beforeAll } from "vitest";
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
    expect(css).toMatch(/body\s*\{[^}]*overflow-wrap:\s*anywhere/s);
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

  it("Index page tags Bengali headline blocks with lang=\"bn\"", () => {
    const src = read("src/pages/Index.tsx");
    // Timeline heading
    expect(src).toMatch(/lang=\{headline\.id === "satyer-pakshe" \? "bn" : undefined\}/);
    // Press tagline / variant button uses Unicode-range detection
    expect(src).toMatch(/\/\[\\u0980-\\u09FF\]\/\.test\(/);
    // Press card headline (always Bengali)
    expect(src).toMatch(/lang="bn"/);
  });
});

describe("CSS rule application in jsdom", () => {
  beforeAll(() => {
    const css = read("src/index.css")
      // strip @tailwind + @layer wrappers jsdom can't parse meaningfully
      .replace(/@tailwind[^;]+;/g, "")
      .replace(/@layer[^{]+\{/g, "")
      .replace(/^\s*\}\s*$/gm, "");
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  });

  it("applies word-break: keep-all to elements with lang=\"bn\"", () => {
    const el = document.createElement("p");
    el.setAttribute("lang", "bn");
    el.textContent = "সত্যের পক্ষে দাঁড়ানো";
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    // jsdom returns the literal value declared by the matching rule
    expect(cs.wordBreak).toBe("keep-all");
    expect(cs.overflowWrap).toBe("normal");
    expect(cs.hyphens).toBe("none");
  });

  it("does NOT force keep-all on plain English elements", () => {
    const el = document.createElement("p");
    el.textContent = "From Stand to Spotlight";
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    expect(cs.wordBreak).not.toBe("keep-all");
  });
});
