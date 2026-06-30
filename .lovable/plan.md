## Growth OS — Phase 2 build

You picked all four scopes, all four queue sources, both curriculum triggers, and your n8n webhook URL is now saved. Here's exactly what I'll ship.

### 1. Unified B2B Hub — `/growth-os/hub`
A single premium command surface (admin/teacher gated) that frames every existing module as one product.
- Top: KPI strip (leads today, pending tasks, classes this week, drafts awaiting publish).
- Module tiles (with status dot + last-updated): **Live Class Studio** (`/edtech/live`), **Growth Console** (`/admin/growth-console`), **Creator Studio** (`/admin/creator-studio`), **Portfolio Showcase** (`/portfolio`), **Smart Task Queue** (below), **Class Analytics** (below).
- Quick-action bar: "New Lead", "Draft Post", "Schedule Class", "Generate Curriculum" — each opens the right module pre-focused.

### 2. Smart Task Queue — `/admin/task-queue`
One auto-prioritized feed pulling from all four sources you picked. No new tables — derives tasks from existing rows.

```text
Source            → Task type                  → Priority signal
growth_leads      → "Follow up: <name>"        → stage=new + age > 24h
creator_content   → "Review draft: <title>"    → status=draft + scheduled_at within 48h
live_classes      → "Prep class: <title>"      → starts_at within 72h AND missing meeting_url OR curriculum
telegram alerts   → "Acknowledge alert"        → unresolved telegram_error_logs (last 24h)
```

Each row has: title, source badge, due/age, owner, **quick actions** (Open, Snooze, Mark done, Assign). Auto-refresh every 30s via Supabase realtime on the four source tables.

### 3. AI Curriculum + Class Data Viz
- **DB:** add `live_classes.curriculum jsonb` + `curriculum_generated_at` (single migration with grants).
- **Edge function `generate-curriculum`** — uses Lovable AI (`google/gemini-3-flash-preview`) with structured output (Zod): `{ summary, learning_objectives[], outline[{title, minutes, talking_points[]}], homework[], resources[] }`. Stores on the row.
- **Auto trigger:** DB trigger calls `pg_net` → `generate-curriculum` on `INSERT` (best-effort, non-blocking).
- **Manual trigger:** "Generate / Regenerate curriculum" button in `EdtechLiveStudio` teacher panel + on the new hub.
- **Class Analytics panel** (on the hub + a `/admin/class-analytics` page): line chart of RSVPs over time, bar of attendance per class, table of recording views — all from existing `live_class_rsvps`, `class_recordings`, `access_audit_logs` rows. Reuses `recharts` (already code-split).

### 4. Polish pass on existing surfaces
- **Growth Console:** add quick-action row (Add lead, Push to n8n, Export CSV), skeleton loaders, empty states.
- **Creator Studio:** add status pills, "Publish now" confirmation, last-n8n-response inline.
- **Live Studio:** standardize teacher quick-action button set with the hub.
- **Portfolio Showcase:** tighten card spacing + ensure Space/Spectrum cards open in new tabs (already verified, just visual polish).

### 5. n8n forwarding — live test
Now that `N8N_WEBHOOK_URL` is set, I'll:
1. Insert a test row through `growth-os-lead` (`event: growth_os.lead.created`).
2. Read back `growth_leads.n8n_response` and confirm 2xx.
3. Wire `creator-publish` and the new curriculum function to use the same `N8N_WEBHOOK_URL` envelope (`event: creator.published` / `class.curriculum.generated`).

### Technical notes (for reference)

- **Routes added:** `/growth-os/hub`, `/admin/task-queue`, `/admin/class-analytics`. Gated to `admin` + `teacher` (hub/curriculum), `admin` only (task queue, analytics, console).
- **No new tables.** One migration: `ALTER TABLE live_classes ADD curriculum jsonb, curriculum_generated_at timestamptz` + optional `AFTER INSERT` trigger using `pg_net` (idempotent guard).
- **Edge functions added:** `generate-curriculum`. Existing `growth-os-lead` and `creator-publish` keep their contracts; I'll only extend payloads, not break them.
- **Realtime:** subscribe to the four source tables on the task queue page; debounce list rebuild to 500ms.
- **No design-token violations** — all colors via existing semantic tokens.
- **No business-logic changes** to live class WebRTC, auth, or RLS beyond the new `curriculum` columns (admin/teacher write, public-safe via existing `live_classes_public` view — curriculum will NOT be added to the public view to keep payloads small; expose only to authenticated viewers of the class).

Approve and I'll build it end-to-end in this order: migration → edge function → hub + queue + analytics pages → polish → live n8n test.