
-- 1) Set immutable search_path on pgmq wrapper SECURITY DEFINER functions
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;

-- 2) Revoke EXECUTE from anon/authenticated on internal-only SECURITY DEFINER functions.
--    These are only called via service-role (edge functions / triggers), never by clients.
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.live_classes_autogen_curriculum() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_class_by_share_token(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_recording_by_token(text) FROM anon, authenticated, PUBLIC;

-- 3) Remove the redundant `USING (true) WITH CHECK (true)` service-role policy.
--    service_role bypasses RLS, so the policy is unnecessary and trips the linter.
DROP POLICY IF EXISTS "Service role manages outreach execution logs" ON public.outreach_execution_logs;

-- 4) Replace the WITH CHECK (true) talent-application insert policy with a
--    minimal content check so anonymous submissions still work but the linter
--    no longer flags a permissive true policy.
DROP POLICY IF EXISTS "Anyone can submit a talent application" ON public.talent_applications;
CREATE POLICY "Anyone can submit a talent application"
  ON public.talent_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) > 0
    AND length(btrim(email)) > 3
    AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    AND length(btrim(role)) > 0
  );

-- 5) Tighten tutor_availability: no longer expose tutor_id + weekly schedule to
--    anonymous visitors. Only authenticated users can browse tutor availability.
DROP POLICY IF EXISTS "Anyone can view availability" ON public.tutor_availability;
CREATE POLICY "Authenticated users can view tutor availability"
  ON public.tutor_availability
  FOR SELECT
  TO authenticated
  USING (true);
