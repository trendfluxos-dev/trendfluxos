-- Enterprise demo requests table
CREATE TABLE public.enterprise_demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  team_size text NOT NULL,
  message text,
  source text NOT NULL DEFAULT 'enterprise_page',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_demo_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit
CREATE POLICY "Anyone can submit a demo request"
  ON public.enterprise_demo_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view
CREATE POLICY "Admins can view demo requests"
  ON public.enterprise_demo_requests
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update status
CREATE POLICY "Admins can update demo requests"
  ON public.enterprise_demo_requests
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at (reuses existing set_updated_at function)
CREATE TRIGGER set_enterprise_demo_requests_updated_at
  BEFORE UPDATE ON public.enterprise_demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_enterprise_demo_requests_created_at
  ON public.enterprise_demo_requests (created_at DESC);