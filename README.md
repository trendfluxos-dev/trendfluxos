# TrendFlux DIGITAL — Enterprise Workspace

Production web platform for TrendFlux DIGITAL: marketing site, EdTech workspace,
brand/portfolio systems, admin consoles and the Nagarik Barta 24 newsroom.

**Stack:** Vite 5 · React 18 · TypeScript · Tailwind CSS · shadcn/ui · Supabase
(database, auth, storage, Edge Functions).

## Quick start

```bash
npm ci
cp .env.example .env   # fill the VITE_SUPABASE_* values
npm run dev            # http://localhost:8080
```

## Common scripts

| Script                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Dev server                                    |
| `npm run build`         | Sitemap → Vite build → head prerender         |
| `npm run preview`       | Serve the production build locally            |
| `npm run lint`          | ESLint                                        |
| `npm test`              | Vitest unit / component tests                 |
| `npm run test:e2e`      | Playwright end-to-end                         |
| `npm run audit:a11y`    | Runtime contrast + Bangla typography audit    |
| `npm run validate:seo`  | Sitemap / robots / metadata validation        |

## Layout

```text
src/            app code (pages, components, hooks, lib, integrations)
supabase/       migrations + Edge Functions (backend)
scripts/        build, SEO, audit and security-gate tooling
e2e/            Playwright specs
docs/           deployment, design system and runbooks
.github/        CI workflows
.security/      security gate policy + linter baseline
```

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Lovable → GitHub → Vercel →
`trendflux.digital`, including the full environment-variable list and CI gates.

## Security

Vulnerability reporting and hardening notes: [`SECURITY.md`](SECURITY.md).
Row Level Security is enforced on all user data; `VITE_*` values are public by
design and every privileged secret lives in the Edge Function environment.
