
CREATE TABLE public.client_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  source TEXT,
  url TEXT,
  user_agent TEXT,
  release TEXT,
  severity TEXT NOT NULL DEFAULT 'error',
  user_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_errors_created_at ON public.client_errors (created_at DESC);

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert client errors"
ON public.client_errors
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view client errors"
ON public.client_errors
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete client errors"
ON public.client_errors
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
