# Lead Lifecycle Automation (n8n ↔ Supabase)

End-to-end loop for prospecting, outreach sequences, and status sync back into `public.growth_leads`.

## Endpoints

All under `https://dnodqhwwzdqfqlndwhsf.supabase.co/functions/v1/`.

| Function | Direction | Auth | Purpose |
| --- | --- | --- | --- |
| `growth-os-lead` | Site → n8n | public | New lead capture (already wired). Forwards `growth_os.lead.created`. |
| `lead-outreach-start` | Admin UI → n8n | admin session | Push a lead into a sequence. Forwards `growth_os.lead.outreach_start`. |
| `lead-followup-sweeper` | Cron → n8n | `x-n8n-secret` | Fires `growth_os.lead.followup_due` for every lead whose `next_followup_at <= now`. |
| `lead-lifecycle-webhook` | n8n → Supabase | `x-n8n-secret` | n8n calls this after each step to update lifecycle/stage/notes. |

`x-n8n-secret` must equal the `N8N_CALLBACK_SECRET` stored in Supabase secrets.

## Lifecycle states
`new → prospected → contacted → replied → qualified → proposal_sent → won | lost | nurture`

## Callback payload (n8n → `lead-lifecycle-webhook`)
```json
{
  "lead_id": "uuid",
  "event": "sent | opened | replied | bounced | qualified | update",
  "lifecycle_status": "contacted",
  "sequence_name": "cold-email-v1",
  "sequence_step": 2,
  "outreach_channel": "email",
  "prospect_score": 65,
  "next_followup_at": "2026-07-03T09:00:00Z",
  "stage": "contacted",
  "owner_notes": "Replied positive, asked for pricing",
  "n8n_run_id": "{{$execution.id}}",
  "note": "Day 2 follow-up sent"
}
```
Returns `{ ok: true, lead }`. Every call appends to `lifecycle_history` (capped at 200 entries).

## Suggested n8n workflows

### 1. `Growth OS – New Lead` (trigger: webhook from `growth-os-lead`)
1. **Webhook** (POST) — body has `event=growth_os.lead.created`, `lead`.
2. **IF** `lead.monthly_revenue` ≥ threshold → branch "high-intent".
3. **HTTP Request** → enrich (Clearbit / Apollo).
4. **Wait 5 min**.
5. **Send Email** (Gmail / SES / Resend) with personalized template.
6. **HTTP Request** → `lead-lifecycle-webhook` with `event:"sent"`, `lifecycle_status:"contacted"`, `sequence_step:1`, `next_followup_at` = +2 days.

### 2. `Growth OS – Follow-up Cadence` (trigger: webhook `lead.followup_due`)
1. **Webhook** — body has `lead`, current `sequence_step`.
2. **Switch** on `sequence_step` (1→2→3→break).
3. **Send Email** for the next step.
4. **Callback** → `lead-lifecycle-webhook` with bumped `sequence_step` and the next `next_followup_at`. After the last step, set `lifecycle_status:"nurture"` and clear `next_followup_at`.

### 3. `Growth OS – Reply Detection` (trigger: Gmail "message received")
1. **Gmail trigger**.
2. **Code** node → extract sender email, classify (positive / negative / OOO) with Lovable AI or OpenAI.
3. **HTTP Request** → `lead-lifecycle-webhook` with `email`, `event:"replied"`, `lifecycle_status:"replied"`, `stage:"replied"`, `owner_notes:"<classification + snippet>"`.
4. Notify Telegram / Slack for hot replies.

## Schedule the sweeper
Use n8n's **Schedule Trigger** every 15 min calling `lead-followup-sweeper` with header `x-n8n-secret: <secret>`. The sweeper batches up to 50 due leads, fires each one to your n8n webhook, then clears `next_followup_at` (your cadence workflow will set the next one).

## Secrets used
- `N8N_WEBHOOK_URL` — n8n Production webhook URL.
- `N8N_WEBHOOK_AUTH` — optional `Bearer …` / `Basic …` header.
- `N8N_CALLBACK_SECRET` — shared secret for n8n → Supabase callbacks.

## Manual test
```bash
curl -X POST https://dnodqhwwzdqfqlndwhsf.supabase.co/functions/v1/lead-lifecycle-webhook \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: $N8N_CALLBACK_SECRET" \
  -d '{"lead_id":"<uuid>","event":"sent","lifecycle_status":"contacted","sequence_step":1,"next_followup_at":"2026-07-03T09:00:00Z"}'
```