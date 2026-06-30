
-- 1. live_classes: tighten SELECT to owner/admin; expose a safe view for public browsing.
DROP POLICY IF EXISTS "Live classes public columns are listable" ON public.live_classes;

CREATE POLICY "Owners and admins can read live_classes"
  ON public.live_classes
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE OR REPLACE VIEW public.live_classes_public
WITH (security_invoker = false) AS
SELECT
  id, course_slug, title, description, host_name,
  starts_at, duration_min, status, created_by,
  created_at, updated_at, audience_mode
FROM public.live_classes;

REVOKE ALL ON public.live_classes_public FROM PUBLIC;
GRANT SELECT ON public.live_classes_public TO anon, authenticated;

-- 2. site_settings: restrict public SELECT to an allowlist of clearly-public keys.
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;

CREATE POLICY "Public can read whitelisted site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (key IN ('consent_banner_preview', 'consent_banner_live'));

-- (Admins manage policy already exists for full ALL access.)

-- 3. Revoke anonymous EXECUTE on internal SECURITY DEFINER helpers.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.publish_recording_public(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.unpublish_recording_public(uuid) FROM anon, PUBLIC;
