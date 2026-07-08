-- Scope public read access on site_profile_data to an explicit slug allowlist
-- so future rows (e.g. non-public profiles) can't be leaked by the same
-- permissive policy. Also add an admin SELECT policy so the admin edit page
-- can still read any slug for editing.

DROP POLICY IF EXISTS "site_profile_data public read" ON public.site_profile_data;

CREATE POLICY "site_profile_data public read whitelisted slug"
  ON public.site_profile_data
  FOR SELECT
  TO anon, authenticated
  USING (slug IN ('bdjobs'));

CREATE POLICY "site_profile_data admin read"
  ON public.site_profile_data
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));