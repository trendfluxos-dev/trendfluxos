
CREATE TABLE public.outreach_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success','failure','partial')),
  triggered_by TEXT NOT NULL DEFAULT 'unknown',
  actor_id UUID NULL,
  lead_id UUID NULL,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NULL,
  http_status INTEGER NULL,
  error TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_logs_function_time ON public.outreach_execution_logs (function_name, created_at DESC);
CREATE INDEX idx_outreach_logs_status_time ON public.outreach_execution_logs (status, created_at DESC);
CREATE INDEX idx_outreach_logs_created_at ON public.outreach_execution_logs (created_at DESC);

GRANT SELECT ON public.outreach_execution_logs TO authenticated;
GRANT ALL ON public.outreach_execution_logs TO service_role;

ALTER TABLE public.outreach_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read outreach execution logs"
  ON public.outreach_execution_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages outreach execution logs"
  ON public.outreach_execution_logs
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
