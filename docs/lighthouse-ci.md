# Lighthouse CI & Performance Budget

Every PR (and every push to `main`) runs Lighthouse CI against a freshly built
production bundle. If a change blows the perf budget or drops a category
score below threshold, the check fails and the PR is blocked.

## How it runs

- Workflow: `.github/workflows/lighthouse.yml`
- LHCI config: `lighthouserc.json`
- Resource & timing budget: `lighthouse-budget.json`

The job:
1. Installs deps with `bun install --frozen-lockfile`
2. Builds with `bun run build`
3. Runs `bunx @lhci/cli@0.14 autorun` — LHCI serves `dist/` on a local
   port, runs Lighthouse 3× on `/index.html`, and asserts against the
   thresholds below
4. Uploads the HTML report to LHCI temporary public storage and to a
   GitHub Actions artifact (`lighthouse-report`, kept 14 days)

## Category thresholds (assertions)

| Category        | Min score | Severity |
|-----------------|-----------|----------|
| Performance     | 0.85      | error    |
| Accessibility   | 0.90      | error    |
| Best Practices  | 0.90      | warn     |
| SEO             | 0.90      | error    |

## Web Vitals budgets

| Metric                    | Budget   |
|---------------------------|----------|
| First Contentful Paint    | 2000 ms  |
| Largest Contentful Paint  | 2500 ms  |
| Total Blocking Time       | 300 ms   |
| Cumulative Layout Shift   | 0.10     |
| Speed Index               | 3500 ms  |
| Time to Interactive       | 3800 ms  |

## Resource budgets (per page, KB)

| Type        | Budget |
|-------------|--------|
| script      | 700    |
| stylesheet  | 220    |
| image       | 500    |
| font        | 250    |
| third-party | 200    |
| total       | 2000   |

## Adjusting the budget

- Tightening (preferred): lower the values in both `lighthouserc.json`
  and `lighthouse-budget.json` so the regression bar keeps moving down.
- Loosening: raise the value AND add a one-line comment in the PR
  description explaining the trade-off so reviewers can push back.
- Adding a new page to check: extend `ci.collect.url` in
  `lighthouserc.json` (e.g. `http://localhost/portfolio/index.html` —
  LHCI rewrites `localhost` to its own served port).

## Optional: nicer PR comments

Create a Lighthouse CI GitHub App token and add it as the repo secret
`LHCI_GITHUB_APP_TOKEN`. The workflow already passes it through. With
the token, LHCI posts a status check with per-metric deltas straight
into the PR conversation. Without it, the run still works and the report
is available as an artifact.