ALTER VIEW public.site_profile_data_public SET (security_invoker = true);

DROP POLICY IF EXISTS "Public can read whitelisted profile row" ON public.site_profile_data;
CREATE POLICY "Public can read whitelisted profile row"
ON public.site_profile_data
FOR SELECT
TO anon, authenticated
USING (slug = 'bdjobs'::text);

GRANT SELECT ON public.site_profile_data_public TO anon, authenticated;
GRANT SELECT ON public.site_profile_data TO anon, authenticated;