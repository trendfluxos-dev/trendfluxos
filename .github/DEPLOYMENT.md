# Continuous Deployment

`.github/workflows/deploy.yml` runs on every push to `main`:

1. **build** — installs deps, lints, tests, builds (`dist/`), uploads artifact.
2. **deploy-*** — one job runs based on the `DEPLOY_TARGET` repo variable.

## Setup

In GitHub → Settings:

### Variables (Settings → Secrets and variables → Actions → Variables)
- `DEPLOY_TARGET` — one of `vercel`, `netlify`, `cloudflare`
- `CLOUDFLARE_PROJECT_NAME` — only if using Cloudflare

### Secrets (Settings → Secrets and variables → Actions → Secrets)

Build (all targets):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Vercel:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

Netlify:
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

Cloudflare Pages:
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## Notes

- Lovable's own publish (`*.lovable.app`) still requires clicking **Publish → Update** in the editor — it's not automatable.
- This workflow targets self-hosted production (your custom domain on Vercel/Netlify/Cloudflare).
- Lovable Cloud backend (edge functions, migrations) keeps deploying automatically via Lovable's own sync — this workflow only handles the frontend.