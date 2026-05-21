# Continuous Deployment

`.github/workflows/deploy.yml` runs on every push to `main`:

1. **build** — installs deps, lints, tests, builds (`dist/`), uploads artifact.
2. **deploy-*** — one job runs based on the `DEPLOY_TARGET` repo variable.

## Setup

In GitHub → Settings:

### Variables (Settings → Secrets and variables → Actions → Variables)
- `DEPLOY_TARGET` — one of `vercel`, `netlify`

### Secrets (Settings → Secrets and variables → Actions → Secrets)

Build (all targets):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Vercel:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

Netlify:
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

## Notes

- Lovable's own publish (`*.lovable.app`) still requires clicking **Publish → Update** in the editor — it's not automatable.
- This workflow targets self-hosted production (your custom domain on Vercel/Netlify).
- Lovable Cloud backend (edge functions, migrations) keeps deploying automatically via Lovable's own sync — this workflow only handles the frontend.

## Custom Domain (direct registrar DNS, no Cloudflare proxy)

When pointing a custom domain at the Lovable-hosted site, configure DNS directly at your registrar (GoDaddy, Namecheap, Google Domains, Porkbun, etc.). Do **not** enable Cloudflare proxy ("orange cloud") — Lovable issues SSL directly and proxying breaks verification.

Add these records at your registrar:

| Type | Name  | Value           | TTL  |
|------|-------|-----------------|------|
| A    | `@`   | `185.158.133.1` | Auto |
| A    | `www` | `185.158.133.1` | Auto |
| TXT  | `_lovable` | (value shown in Project Settings → Domains) | Auto |

Then in Lovable: **Project Settings → Domains → Connect Domain**, enter both `yourdomain.com` and `www.yourdomain.com`, and wait for verification + SSL (usually minutes, up to 72h for DNS propagation).
