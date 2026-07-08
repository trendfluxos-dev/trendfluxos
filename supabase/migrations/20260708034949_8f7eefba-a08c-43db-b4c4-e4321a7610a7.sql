-- 1. Talent application status enum
DO $$ BEGIN
  CREATE TYPE public.talent_application_status AS ENUM ('new','reviewing','shortlisted','rejected','hired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Table
CREATE TABLE public.talent_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL,
  portfolio_url text,
  linkedin_url text,
  skills text[] NOT NULL DEFAULT '{}',
  experience_years integer,
  cover_letter text,
  source text NOT NULL DEFAULT 'trendflux_talent_page',
  status public.talent_application_status NOT NULL DEFAULT 'new',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Grants (anon may INSERT only; admin/editor manage via policies)
GRANT INSERT ON public.talent_applications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.talent_applications TO authenticated;
GRANT ALL ON public.talent_applications TO service_role;

-- 4. RLS
ALTER TABLE public.talent_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a talent application"
  ON public.talent_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and editors can view talent applications"
  ON public.talent_applications
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  );

CREATE POLICY "Admins and editors can update talent applications"
  ON public.talent_applications
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  );

-- 5. updated_at trigger
CREATE TRIGGER trg_talent_applications_updated_at
  BEFORE UPDATE ON public.talent_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Indexes
CREATE INDEX idx_talent_applications_status_created ON public.talent_applications (status, created_at DESC);
CREATE INDEX idx_talent_applications_email ON public.talent_applications (email);