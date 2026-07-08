
CREATE TABLE IF NOT EXISTS public.site_profile_data (
  slug TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

GRANT SELECT ON public.site_profile_data TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_profile_data TO authenticated;
GRANT ALL ON public.site_profile_data TO service_role;

ALTER TABLE public.site_profile_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_profile_data public read"
  ON public.site_profile_data
  FOR SELECT
  USING (true);

CREATE POLICY "site_profile_data admin insert"
  ON public.site_profile_data
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "site_profile_data admin update"
  ON public.site_profile_data
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "site_profile_data admin delete"
  ON public.site_profile_data
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.site_profile_data_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_profile_data_set_updated_at ON public.site_profile_data;
CREATE TRIGGER site_profile_data_set_updated_at
  BEFORE INSERT OR UPDATE ON public.site_profile_data
  FOR EACH ROW EXECUTE FUNCTION public.site_profile_data_touch();
