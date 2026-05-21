-- Extensions needed for scheduled HTTP pings
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Probe history
CREATE TABLE public.uptime_checks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url          TEXT NOT NULL,
  ok           BOOLEAN NOT NULL,
  status_code  INTEGER,
  latency_ms   INTEGER,
  error        TEXT,
  checked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_uptime_checks_checked_at ON public.uptime_checks (checked_at DESC);
CREATE INDEX idx_uptime_checks_url_checked_at ON public.uptime_checks (url, checked_at DESC);

ALTER TABLE public.uptime_checks ENABLE ROW LEVEL SECURITY;

-- Admins only can read; writes happen via service role from the edge function.
CREATE POLICY "Admins can view uptime checks"
  ON public.uptime_checks
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));