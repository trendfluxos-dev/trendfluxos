# TrendFlux Deployment Playbook

Live today: <https://trendfluxdigital-bd.lovable.app> (Lovable hosting)
Target: <https://trendflux.digital> served by Vercel, code synced from GitHub, edits authored in Lovable.

Architecture after migration:

```
Lovable (editor)  ──auto-push──▶  GitHub  ──auto-build──▶  Vercel  ──serves──▶  trendflux.digital
                                                                │
                          Lovable Cloud (Supabase) ◀── API calls ┘
                          (database, auth, edge functions, secrets — unchanged)
```

---

## 1. Connect GitHub

In Lovable: **+ menu (bottom-left of chat) → GitHub → Connect project → Create Repository**.

Result: a new repo on your GitHub account with the full codebase. Bidirectional sync — every edit in Lovable pushes a commit; every push to `main` syncs back to Lovable.

## 2. Import to Vercel

1. <https://vercel.com/new> → **Import Git Repository** → select the new repo.
2. Framework preset: **Vite** (auto-detected).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm install`
6. **Environment Variables** (copy values from your local `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SENTRY_DSN` *(optional)*
7. Click **Deploy**. You get a `*.vercel.app` URL in ~1 minute — test every route, auth flow, and the bKash payment submission before touching DNS.

## 3. Add custom domain in Vercel

Vercel project → **Settings → Domains** → add BOTH:

- `trendflux.digital`
- `www.trendflux.digital`

Set `trendflux.digital` as **Primary**; `www` will 308-redirect to it.

## 4. Repoint Hostinger DNS

Hostinger panel → **DNS / Nameservers → Manage DNS records** for `trendflux.digital`.

**Delete these old Lovable records:**

| Type | Name | Value |
|------|------|-------|
| A    | `@`  | `185.158.133.1` |
| A    | `www`| `185.158.133.1` |
| TXT  | `_lovable` | `lovable_verify=…` |

**Add these Vercel records:**

| Type  | Name  | Value                  | TTL  |
|-------|-------|------------------------|------|
| A     | `@`   | `76.76.21.21`          | 3600 |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 |

**Do NOT touch** any existing `MX`, `TXT (SPF)`, `DKIM`, `DMARC`, or other email-related records — email keeps working untouched.

## 5. Wait for DNS + SSL

- Propagation: usually <1 hour, max 72 hours. Check at <https://dnschecker.org>.
- Vercel auto-provisions Let's Encrypt SSL once DNS resolves — domain status flips to **Valid Configuration** in Vercel.
- Both `https://trendflux.digital` and `https://www.trendflux.digital` will resolve.

## 6. Disconnect the domain from Lovable

Once Vercel is serving the domain successfully:

Lovable → **Project Settings → Domains** → **⋯ → Remove** for both `trendflux.digital` entries.

Your `trendfluxdigital-bd.lovable.app` staging URL keeps working — useful as a backup preview.

## 7. Post-migration smoke test

- [ ] `https://trendflux.digital` loads with valid HTTPS padlock
- [ ] `https://www.trendflux.digital` redirects to apex
- [ ] SPA refresh works on `/about`, `/services`, `/ecosystem`, `/masterclass`, `/contact`
- [ ] Google sign-in works
- [ ] Email/password sign-up works
- [ ] Course payment submit + admin approval flow works
- [ ] Telegram notification fires on submit/approval
- [ ] `https://trendflux.digital/sitemap.xml` returns valid XML
- [ ] `https://trendflux.digital/robots.txt` returns valid robots
- [ ] Google Search Console verification still passes (meta tag is in `index.html`)
- [ ] Lighthouse mobile ≥ 90 (Performance, SEO, Accessibility, Best Practices)

---

## What stays on Lovable Cloud

The entire backend — **do not migrate**:

- Supabase database (Postgres + RLS)
- Auth (email/password + Google)
- Edge functions (`course-payment-submit`, `course-payment-decision`, `secrets-health`, `telegram-test`, `verify-invite`)
- Secrets (Telegram tokens, invite codes)
- Storage (none currently)

All edge function URLs use `https://<project-ref>.supabase.co/functions/v1/…` and keep working unchanged from a Vercel-hosted frontend.

## Ongoing workflow after migration

1. Edit in Lovable as usual.
2. Each Lovable edit auto-commits to GitHub `main`.
3. Vercel detects the push and rebuilds — live in ~60s.
4. Preview deployments: Vercel auto-creates one per branch/PR (so create a branch in GitHub for risky changes).

## Rollback plan

If anything breaks during cutover:

1. In Hostinger DNS, restore the old A records (`@` and `www` → `185.158.133.1`) and the `_lovable` TXT record.
2. Wait for propagation (~10 min for most resolvers).
3. The domain serves from Lovable again.

Keep a screenshot of the old Hostinger DNS records BEFORE you change anything.