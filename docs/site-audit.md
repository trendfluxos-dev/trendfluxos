# Trendflux OS — Pre-Publish Site Audit

**Last updated:** 2026-07-08
**Domain:** [trendflux.digital](https://trendflux.digital) (also `www.trendflux.digital`, `trendfluxos.lovable.app`)
**Founder:** ZAHID HASAN EMON
**Stack:** React 18 + Vite 5 + TypeScript + Tailwind v3 + Lovable Cloud (Supabase-backed)

---

## 1. Scale at a glance

| Layer | Count |
|---|---|
| React Router routes | **91** |
| Edge functions | **44** |
| Database tables (RLS enabled) | **44** |
| Storage buckets | **5** |
| Runtime secrets | 23 |
| Sub-brands | 6 (Trendflux, Marriage, Luxe Veil, BrandToki, Enterprise, EdTech) |

---

## 2. Routes / URLs (91 total)

### 2.1 Public marketing (35)
| Path | Purpose |
|---|---|
| `/` | Home / Ecosystem landing |
| `/ecosystem` | Ecosystem overview |
| `/brands` | Sub-brand grid |
| `/services` | Services catalog |
| `/about` | About the company |
| `/contact` | Contact & inquiry form |
| `/explore` | Sitemap browser (all pages) |
| `/project-lead` | Lead capture / project inquiry |
| `/showcase`, `/showcase/:id` | Case-study gallery |
| `/research/:slug`, `/implementations/:slug` | Research & implementations |
| `/portfolio` | ZAHID HASAN EMON portfolio |
| `/founder` | Founder page |
| `/bdjobs-profile` | Live Bdjobs CV mirror |
| `/marriage` | Marriage sub-brand |
| `/luxe-veil` | Luxe Veil (invite-only wedding) |
| `/brandtoki` | Studio BrandToki |
| `/enterprise` | Enterprise Control portal |
| `/toolkit` | Growth Operator Toolkit |
| `/ebooks` | E-book library (EPUB / AZW3 / PDF / Print PDF) |
| `/course/trendflux` | Trendflux course landing |
| `/masterclass` | Advanced AI Masterclass |
| `/growth-os`, `/growth-os/hub` | Growth-OS |
| `/trendflux-talent` | Careers |
| `/quiet-positions`, `/brand-open` | Talent slots |
| `/the-stand`, `/the-stand/share` | Whistleblower / integrity story |
| `/stories/ai-expert-emon` | Audio story (Bangla) |
| `/justice-appeal`, `/media-reports`, `/share-kit` | Justice appeal + press |
| `/press/:id`, `/case-studies/:slug` | Press & case detail |
| `/privacy` | Privacy policy |

### 2.2 EdTech platform (26)
Student, teacher, tutor, and live-class flows under `/edtech/*`:
courses, enrollment, learning player, live studio/watch/recap, certificates & verification, tutor marketplace + bookings, voice notes / voice studio, plus the tokenised routes `/class/:token`, `/class-recording/:token`, `/edtech/certificate/:slug`.

### 2.3 Admin (22 — all role-gated by `has_role('admin')`)
`/admin`, `/admin/luxe-veil`, `/admin/conversions`, `/admin/enterprise-demos`, `/admin/talent`, `/admin/talent/emails`, `/admin/course-enrollments`, `/admin/uptime`, `/admin/errors`, `/admin/web-vitals`, `/admin/ga4-check`, `/admin/secrets-health`, `/admin/telegram-tests`, `/admin/security-audit`, `/admin/publish-gate`, `/admin/edtech/live`, `/admin/growth-console`, `/admin/lead-lifecycle`, `/admin/outreach-logs`, `/admin/creator-studio`, `/admin/task-queue`, `/admin/class-analytics`.

### 2.4 Account / utility (8)
`/auth`, `/dashboard`, `/settings`, `/voice-clone`, `/voice-clone/deploy`, plus 404 wildcard.

---

## 3. Roles & authentication

- **Providers:** Email/password + Google OAuth (via Lovable Cloud native auth).
- **Roles table:** `public.user_roles` (enum: `admin`, `teacher`, `tutor`, `student`, `editor`, `user`) — enforced via `public.has_role()` + `public.current_user_has_role()` SECURITY DEFINER wrappers.
- **Bootstrap:** first signup → `bootstrap_first_admin` trigger promotes to admin.
- **Signup metadata:** `intended_role` from `raw_user_meta_data` is mapped in `handle_new_user`.
- **Profiles:** `public.profiles` (linked to `auth.users.id`), populated on signup.

---

## 4. Edge functions (44) — grouped by domain

### 4.1 Auth & session
`access-decision`, `access-request`, `verify-invite`

### 4.2 Email
`auth-email-hook`, `send-resend-email` (admin-only), `process-email-queue`

### 4.3 EdTech — enrollment & payments
`course-payment-submit`, `course-payment-decision`, `tutor-booking-payment-submit`, `tutor-booking-payment-decision`, `talent-apply`, `issue-certificate`, `verify-certificate`

### 4.4 EdTech — live & content
`generate-curriculum` (admin/service-role only), `get-signed-url`, `get-class-recording-url`, `extract-study-sheet`, `transcribe-lecture`, `voice-generate`, `xtts-deploy`, `xtts-proxy`, `creator-publish`, `studio-ai`

### 4.5 Growth & leads
`growth-os-lead`, `lead-outreach-start`, `lead-followup-sweeper`, `lead-lifecycle-webhook`, `strategy-booking-submit`, `strategy-booking-action`, `enterprise-demo-notify`, `get-marriage-inquiry`, `generate-share-caption`

### 4.6 Ops & monitoring
`site-status`, `uptime-monitor`, `secrets-health`, `ga4-checker`, `verify-press-urls`, `booking-reminder-tick`, `alert-postgres-error`

### 4.7 Telegram
`telegram-submit`, `telegram-webhook`, `telegram-test`, `register-telegram-webhooks`

### 4.8 Assist
`chat-assist`

---

## 5. Database tables (44)

**User & access:** `profiles`, `user_roles`, `access_audit_logs`, `access_requests`, `site_settings`
**EdTech:** `course_modules`, `module_enrollments`, `enrollment_events`, `certificates`, `live_classes`, `live_class_rsvps`, `live_state`, `class_recordings`, `class_materials`, `teacher_profiles`, `teacher_notes`, `tutor_availability`, `tutor_bookings`, `tutor_reviews`, `booking_payments`
**Voice/AI:** `voice_assets`, `voice_profiles`, `voice_cache`, `voice_lectures`, `voice_lecture_materials`
**Leads/growth:** `growth_leads`, `strategy_bookings`, `enterprise_demo_requests`, `luxe_veil_requests`, `marriage_inquiries`, `talent_applications`, `outreach_execution_logs`, `creator_content`, `press_items`
**Email pipeline:** `email_send_log`, `email_send_state`, `suppressed_emails`, `email_unsubscribe_tokens`
**Ops/telemetry:** `client_errors`, `web_vitals`, `uptime_checks`, `telegram_error_logs`, `telegram_support_sessions`, `telegram_test_logs`

All tables have RLS enabled. Public read only where the domain requires it (e.g. `press_items`, `creator_content`).

---

## 6. Storage buckets (5, all private)

| Bucket | Purpose | Access path |
|---|---|---|
| `lesson-pdfs` | Course lesson PDFs | signed URLs via `get-signed-url` (admin only via storage; students via edge fn) |
| `class-recordings` | Recorded live classes | signed URLs via `get-class-recording-url` or public token |
| `class-materials` | Live class handouts | RLS: attendees/RSVP read |
| `voice-samples` | Voice cloning reference audio | admin/creator only |
| `voice-lectures` | Voice-generated lectures | signed URLs |

---

## 7. Integrations & external services

| Service | Purpose | Key/Secret |
|---|---|---|
| **Resend** (connector) | Transactional email | `RESEND_API_KEY` (connector-managed) |
| **Google Calendar** (connector) | Strategy booking calendar events | `GOOGLE_CALENDAR_API_KEY` |
| **Lovable AI Gateway** | Curriculum, chat, TTS, image | `LOVABLE_API_KEY` |
| **Telegram Bot** | Ops alerts (prod + staging) | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| **n8n webhook** | Curriculum & lead automation forwarding | `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_AUTH`, `N8N_CALLBACK_SECRET` |
| **WhatsApp (Twilio, in `booking-reminder-tick`)** | Booking reminders | `PROJECT_LEAD_WHATSAPP_TO` |

---

## 8. Publish-readiness ✅

- Auth (Email + Google), RLS on all tables, role-gated admin
- Lovable Cloud edge functions all deployed (44)
- Sitemap: `sitemap.xml` (index) + `sitemap-pages.xml`
- Custom domain live: `trendflux.digital`
- Email pipeline: pgmq + `process-email-queue` + Resend
- Telegram ops alerts wired
- E-book downloads (EPUB Standard, EPUB Phone with QR, Kindle AZW3, Print Grayscale PDF), email lead-gate, reading progress bar
- 3 critical security errors fixed on 2026-07-08 (email relay auth, curriculum auth, security-definer view)

---

## 9. Remaining gaps (non-blocking, publish-safe)

### 9.1 Product gaps
- **Contact page needs live business phone + BrandPlug email** — currently form-only. User to provide.
- **Payment gateway not enabled** — course & masterclass enrollment is manual submit. Stripe/Paddle/bKash to be added when the user decides on a provider.
- **Per-page OG images** — hosting auto-generates; per-page custom images can be added for higher CTR.
- **WhatsApp CTA button** — `PROJECT_LEAD_WHATSAPP_TO` secret set but not consistently exposed on public pages.

### 9.2 Security warnings (fix in next round — none block publish)
| # | Finding | File | Recommended fix |
|---|---|---|---|
| 1 | `get-signed-url` doesn't check module_index | `supabase/functions/get-signed-url/index.ts` | Match enrollment.module_index to first path segment |
| 2 | `booking-reminder-tick` unauthenticated | `supabase/functions/booking-reminder-tick/index.ts` | Require `x-cron-secret` header |
| 3 | `alert-postgres-error` unauthenticated | `supabase/functions/alert-postgres-error/index.ts` | Require `x-alert-secret` header |
| 4 | Raw DB errors leaked in `growth-os-lead`, `strategy-booking-submit` | those files | Strip `detail` fields, log server-side |
| 5 | `lesson-pdfs` storage: no student SELECT policy | Supabase policy | Not required (signed-URL flow works) |
| 6 | Supabase linter: `SECURITY DEFINER` fns callable by anon/authenticated | Multiple RPCs | Review per-function EXECUTE grants |
| 7 | Function search_path mutable warnings | Multiple RPCs | Add `SET search_path = public` |
| 8 | RLS policy `USING (true)` on some tables | Review each | Tighten where appropriate |

---

## 10. Next actions

1. **Publish → Update** (green now — no critical blockers).
2. Provide business **phone + BrandPlug email** → will land in `/contact` + footer + JSON-LD.
3. Choose a **payment provider** to unlock course purchases.
4. Batch-fix the 8 warnings above in a dedicated hardening pass.
