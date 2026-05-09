## What you'll get

1. **`/client-login`** — a dedicated short-link route that fires analytics and opens the Enterprise portal in a new tab.
2. **Request Demo form on `/enterprise`** — collects name, work email, company, role, team size, message; saves the lead to your backend; shows an inline confirmation screen; sends you a notification email.
3. **Enterprise** added to the home-page top nav (and mobile menu) next to Services / Brand Architect / Case Studies / Project Lead.

---

## 1. `/client-login` route

A tiny page that:
- Renders a branded "Opening Enterprise Control…" splash with the TrendFlux logo and a manual fallback button.
- On mount: `track("enterprise_portal_open", { location: "client_login_route" })`.
- Calls `window.open(ENTERPRISE.portalUrl, "_blank", "noopener,noreferrer")`.
- If popup is blocked, the fallback "Open Enterprise Portal" button stays visible.
- After 1.2s, redirects the current tab back to `/enterprise` (so the user keeps a branded page, not a blank screen).
- Registered in `src/lib/routes.ts` and `src/App.tsx`. Added to the command palette (`navigablePages`) with keywords `client login portal sign in workspace`.

This gives you a memorable URL (`trendflux.digital/client-login`) you can share on cards, emails, signatures.

---

## 2. Request Demo form on `/enterprise`

### Backend (Lovable Cloud)

New table `enterprise_demo_requests`:

```text
id              uuid (pk)
name            text
email           text
company         text
role            text                  (e.g. CEO, COO, Ops Lead)
team_size       text                  (1-10, 11-50, 51-200, 200+)
message         text  (optional, ≤ 1000)
source          text                  ("enterprise_page" by default)
created_at      timestamptz
status          text default 'new'    (new / contacted / closed)
```

RLS:
- **Insert**: anyone (including unauthenticated visitors) can submit a demo request.
- **Select / update / delete**: only users with `admin` role (uses your existing `has_role()` function and `user_roles` table).

A `set_updated_at` trigger is added so admin status changes are timestamped.

### Edge function — `enterprise-demo-notify`

Lightweight function that:
- Validates payload again with zod.
- Inserts the row using the service role.
- Sends you a notification email via Lovable's built-in email infrastructure (no third-party API key needed) to a configurable `ADMIN_EMAIL` (defaulting to `trendflux.digital@gmail.com`).
- Returns `{ ok: true, id }`.

The form invokes this via `supabase.functions.invoke("enterprise-demo-notify", …)` so the client never needs the service role.

> Built-in email requires Lovable Emails / domain setup. If that's not yet configured we'll still record the lead in the database — the admin email is a "nice to have" and the form succeeds either way. We can wire the domain in a follow-up step.

### Frontend UX (replaces today's "Request Demo" button anchor)

A new section on `/enterprise` titled **"Request a private demo"** with:

- Fields: Name, Work email, Company, Role, Team size (select), Message (optional).
- Client-side validation with `zod` (length limits, email format, required fields).
- Submit button shows a spinner while invoking the edge function.
- On success → swap the form for a **success card**:
  - Headline: "Demo request received."
  - Subtext: "We've logged your request and emailed our team. You'll hear from us within one business day."
  - Two CTAs: **Open Enterprise Portal** (new tab, tracked) and **Back to TrendFlux** (links `/`).
  - A short copy-summary panel showing the email + company submitted, so the user knows what we received.
- On failure → inline error toast, form stays editable, no data lost.

### Analytics (extends your existing `analytics.ts`)

Three new events:

- `enterprise_demo_submit_attempt` — when the user clicks Submit.
- `enterprise_demo_submit_success` — fired after the edge function returns ok. Includes `lead_id`, `team_size`, `role`.
- `enterprise_demo_submit_error` — includes the error code/message.

These flow into `dataLayer`, GA4, Meta Pixel (mapped to "Lead"), and your local Conversion Dashboard exactly like the existing TrendFlux Talent flow.

---

## 3. Enterprise on the home page nav

The home page (`src/pages/Index.tsx`) has its own inline navbar (not the shared `Navbar.tsx`). I'll update both the desktop link group and the mobile drawer:

- Desktop nav order: **Services · Brand Architect · Case Studies · Enterprise · Project Lead**
- Mobile menu mirrors the same order.
- "Enterprise" links to `/enterprise` (internal) — same gold underline animation as the other items.
- A small "New" gold dot is added next to the label for the first 30 days so visitors notice it.

The shared `Navbar.tsx` (used on `/enterprise`, `/portfolio`, etc.) is already updated from the previous step.

---

## Technical notes

- `src/config/enterprise.ts` already centralises `portalUrl` — both the new `/client-login` and the success screen use that constant.
- New files:
  - `src/pages/ClientLogin.tsx`
  - `src/components/EnterpriseDemoForm.tsx`
  - `supabase/functions/enterprise-demo-notify/index.ts`
- New table + RLS via one migration. No existing data is touched.
- All form data is validated client-side AND server-side (zod in both places). `encodeURIComponent` is used for any URL parameters.
- No secrets needed beyond what's already configured. If admin email delivery is required, we can wire Lovable's transactional email infra in a follow-up after the lead capture is live.

---

## Out of scope (for this plan)

- An admin dashboard to triage leads (you already have `/admin` patterns; can be added later).
- Sales-handoff webhook (HubSpot / Slack) — easy to add once you confirm the destination.
- Custom subdomain `enterprise.trendflux.digital` — DNS work, separate task.
