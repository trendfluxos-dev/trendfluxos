# Deployment — Lovable → GitHub → Vercel → Production

This repository is a **Vite + React + TypeScript** SPA. It builds and runs
without Lovable; Lovable is only the authoring environment and the backend
(Supabase) host.

## Flow

```text
Lovable (edit)  →  GitHub (source of truth)  →  Vercel (build + host)  →  trendflux.digital
                        │
                        └── GitHub Actions: security gate, build parity, SEO, smoke
```

Lovable's two-way GitHub sync pushes every commit automatically. Vercel builds
on push to `main`; pull requests get preview deployments.

## Build pipeline

| Step        | Command                            | Purpose                                        |
| ----------- | ---------------------------------- | ---------------------------------------------- |
| `prebuild`  | `node scripts/generate-sitemap.mjs`| Regenerates `public/sitemap*.xml`               |
| `build`     | `vite build`                       | Bundles to `dist/`                              |
| `postbuild` | `node scripts/prerender-head.mjs`  | Writes static `<head>` for ~27 public routes    |

Vercel config lives in `vercel.json`: `npm ci` → `npm run build` → `dist`,
plus an SPA rewrite and security/caching headers. Static files (including the
prerendered `/<route>/index.html` files) win over the rewrite, so crawlers keep
receiving the per-route metadata.

## Environment variables (Vercel → Settings → Environment Variables)

Required for Production, Preview and Development:

| Variable                        | Required | Notes                                                  |
| ------------------------------- | -------- | ------------------------------------------------------ |
| `VITE_SUPABASE_URL`             | yes      | Backend project URL (public)                            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes      | Publishable/anon key (public — RLS protects data)       |
| `VITE_SUPABASE_PROJECT_ID`      | yes      | Used by the MCP client integration                      |
| `VITE_SENTRY_DSN`               | optional | Empty disables client error reporting                   |
| `VITE_SENTRY_ENV`               | optional | Defaults to the build mode                              |
| `VITE_BUILD_SHA`                | optional | Release tag for Sentry / web-vitals (`$VERCEL_GIT_COMMIT_SHA`) |

All `VITE_*` values are inlined into the browser bundle at build time — never
put a private key here. Server-side secrets (Telegram, n8n, XTTS, Lovable AI)
live on the Supabase Edge Function environment, not on Vercel.

## Backend (unchanged by Vercel)

Database, auth, storage and the `supabase/functions/*` Edge Functions stay on
the Supabase project. Vercel only serves the static frontend, which calls those
functions directly over HTTPS. Deploying to Vercel does **not** deploy
migrations or functions — those ship from Lovable / the Supabase CLI.

## Local clone (no Lovable required)

```bash
git clone <repo> && cd <repo>
cp .env.example .env      # fill in the three VITE_SUPABASE_* values
npm ci
npm run dev               # http://localhost:8080
npm run build && npm run preview
```

## CI/CD

GitHub Actions in `.github/workflows/`:

- `vercel-parity.yml` — `npm ci` + `npm run build`, exactly like Vercel.
- `build-warnings.yml` — bun build, fails on any Rollup/Vite warning.
- `security-release-gate.yml` — blocks release on RLS / SECURITY DEFINER / auth regressions.
- `db-security.yml`, `codeql.yml` — database linter baseline and code scanning.
- `smoke.yml`, `home-smoke.yml`, `smoke-homepage-401.yml` — post-deploy live checks
  (triggered by Vercel `deployment_status`).
- `lighthouse.yml`, `seo-validate.yml`, `visual-regression.yml`,
  `playwright.yml`, `e2e-desktop-gate.yml`, `audit-tokens.yml`,
  `token-compliance.yml`, `design-system-tests.yml` — quality gates.

Repository variables the workflows expect (Settings → Secrets and variables →
Actions → Variables): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PROJECT_ID`.

## Custom domain

`trendflux.digital` currently resolves through Lovable hosting. Moving it to
Vercel means repointing DNS (A/CNAME) at Vercel **after** the Vercel deployment
is green — otherwise the domain briefly serves nothing. Keep the Lovable
deployment live until the Vercel production URL passes `smoke.yml`.

---

## Environment variables — canonical list

### Vercel (Production + Preview + Development)

| Name | Value | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://fookbowhuffalpidskqq.supabase.co` | yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_bL7imOSTj8V1Y7I2PqsQvA_3HfREH26` | yes |
| `VITE_SUPABASE_PROJECT_ID` | `fookbowhuffalpidskqq` | yes |
| `VITE_SENTRY_DSN` | Sentry DSN | optional |
| `VITE_SENTRY_ENV` | `production` / `preview` | optional |
| `VITE_BUILD_SHA` | `$VERCEL_GIT_COMMIT_SHA` | optional |

All `VITE_*` values are publishable and ship in the browser bundle. No privileged
secret ever belongs here — those live in the Supabase Edge Function environment.

### GitHub Actions — repository **variables** (Settings → Secrets and variables → Actions → Variables)

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://fookbowhuffalpidskqq.supabase.co` |
| `SUPABASE_ANON_KEY` | publishable key (same as above) |
| `SUPABASE_PROJECT_ID` | `fookbowhuffalpidskqq` |

### GitHub Actions — repository **secrets**

| Name | Used by |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | `backend-deploy.yml` (Supabase CLI auth) |
| `SUPABASE_DB_PASSWORD` | `backend-deploy.yml` (`supabase db push`) |

## Backend deploy pipeline

`.github/workflows/backend-deploy.yml` runs on every push to `main` that touches
`supabase/migrations/**`, `supabase/functions/**`, or `supabase/config.toml`:

1. Links the project with the Supabase CLI.
2. Lists pending migrations, then applies them (`supabase db push --linked --include-all`).
3. Deploys every function in `supabase/functions/*` (skipping `_shared`).

It can also be triggered manually via **workflow_dispatch** with toggles for
migrations and functions independently.

## DNS repoint checklist (Lovable → Vercel)

Only repoint `trendflux.digital` **after** all of the following pass:

1. Vercel Production build is green.
2. `Production Smoke` workflow passes against the Vercel deployment URL
   (`workflow_dispatch` → target = the `*.vercel.app` production URL).
3. `Security Release Gate` passes.
4. Then add the domain in Vercel, set the A/CNAME records, and keep the Lovable
   deployment live until Vercel reports the domain as `Valid Configuration`.
