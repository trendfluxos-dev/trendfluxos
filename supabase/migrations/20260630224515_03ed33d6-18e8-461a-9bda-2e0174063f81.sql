
DROP POLICY IF EXISTS "Anyone can submit a growth lead" ON public.growth_leads;

CREATE POLICY "Public can submit a growth lead"
ON public.growth_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 200
  AND char_length(btrim(email)) BETWEEN 3 AND 320
  AND position('@' in email) > 1
  AND char_length(COALESCE(company, '')) <= 200
  AND char_length(COALESCE(website, '')) <= 500
  AND char_length(COALESCE(message, '')) <= 5000
  AND array_length(services, 1) IS NULL OR array_length(services, 1) <= 25
  AND source IN ('growth-os-landing','growth-os-hub','trendflux-contact','fluxbeam-contact')
  AND stage = 'new'
  AND lifecycle_status = 'new'
  AND sequence_step = 0
  AND prospect_score = 0
  AND n8n_forwarded = false
  AND n8n_response IS NULL
  AND owner_notes IS NULL
  AND sequence_name IS NULL
  AND outreach_channel IS NULL
  AND last_contacted_at IS NULL
  AND next_followup_at IS NULL
  AND n8n_run_id IS NULL
  AND lifecycle_history = '[]'::jsonb
);
