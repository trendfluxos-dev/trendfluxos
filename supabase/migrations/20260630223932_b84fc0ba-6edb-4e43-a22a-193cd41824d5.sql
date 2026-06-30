-- Lead lifecycle automation columns
ALTER TABLE public.growth_leads
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS sequence_step int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sequence_name text,
  ADD COLUMN IF NOT EXISTS outreach_channel text,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS prospect_score int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifecycle_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS n8n_run_id text;

-- Constrain lifecycle_status to known values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'growth_leads_lifecycle_status_check'
  ) THEN
    ALTER TABLE public.growth_leads
      ADD CONSTRAINT growth_leads_lifecycle_status_check
      CHECK (lifecycle_status IN ('new','prospected','contacted','replied','qualified','proposal_sent','won','lost','nurture'));
  END IF;
END $$;

-- Indexes for sweeper + dashboard queries
CREATE INDEX IF NOT EXISTS idx_growth_leads_next_followup
  ON public.growth_leads (next_followup_at)
  WHERE next_followup_at IS NOT NULL AND lifecycle_status NOT IN ('won','lost');

CREATE INDEX IF NOT EXISTS idx_growth_leads_lifecycle_status
  ON public.growth_leads (lifecycle_status);