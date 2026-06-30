CREATE TABLE public.growth_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  website text,
  monthly_revenue text,
  current_ad_spend text,
  services text[] NOT NULL DEFAULT '{}',
  message text,
  source text NOT NULL DEFAULT 'growth-os-landing',
  n8n_forwarded boolean NOT NULL DEFAULT false,
  n8n_response jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.growth_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.growth_leads TO authenticated;
GRANT ALL ON public.growth_leads TO service_role;

ALTER TABLE public.growth_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a growth lead"
  ON public.growth_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view growth leads"
  ON public.growth_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update growth leads"
  ON public.growth_leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete growth leads"
  ON public.growth_leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER growth_leads_set_updated_at
  BEFORE UPDATE ON public.growth_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX growth_leads_created_at_idx ON public.growth_leads (created_at DESC);
CREATE INDEX growth_leads_email_idx ON public.growth_leads (email);