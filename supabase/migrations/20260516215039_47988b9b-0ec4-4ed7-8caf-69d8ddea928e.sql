CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  decided_at timestamptz,
  decided_via text,
  decided_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_requests_status_chk CHECK (status IN ('pending','approved','rejected'))
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an access request"
  ON public.access_requests
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 2 AND 120
    AND char_length(btrim(email)) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(btrim(source)) BETWEEN 2 AND 80
    AND (phone IS NULL OR char_length(phone) <= 40)
    AND (message IS NULL OR char_length(message) <= 2000)
    AND status = 'pending'
  );

CREATE POLICY "Admins can view access requests"
  ON public.access_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER access_requests_set_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS access_requests_status_idx ON public.access_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS access_requests_source_idx ON public.access_requests(source, created_at DESC);