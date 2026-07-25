-- 1. Fix enrollment status mismatch
CREATE OR REPLACE FUNCTION public.has_confirmed_enrollment(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.module_enrollments
    WHERE user_id = _user_id AND status IN ('paid', 'confirmed')
  );
$$;

-- 2. Lock down EXECUTE on SECURITY DEFINER functions
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

-- Public share-token lookups stay callable without a session.
GRANT EXECUTE ON FUNCTION public.get_class_by_share_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recording_by_token(text) TO anon, authenticated;

-- Signed-in-only helpers (each enforces its own auth.uid()/role checks,
-- and has_role must stay executable so RLS policies resolve).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_confirmed_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_live_classes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_retention_days() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_audit_retention_days(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.preview_purge_access_audit_logs(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purge_access_audit_logs(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_material_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_course_module_content_url(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_live_class_meeting_url(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.live_class_rsvp_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_access_audit(text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_cancel_booking(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_recording_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_recording_public(uuid) TO authenticated;

-- 3. site_profile_data: public reads move to a dedicated public-safe view
DROP POLICY IF EXISTS "site_profile_data public read whitelisted slug" ON public.site_profile_data;

CREATE OR REPLACE VIEW public.site_profile_data_public
WITH (security_invoker = false) AS
  SELECT slug, data, updated_at
  FROM public.site_profile_data
  WHERE slug = 'bdjobs';

REVOKE ALL ON public.site_profile_data_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.site_profile_data_public TO anon, authenticated;
GRANT ALL ON public.site_profile_data_public TO service_role;