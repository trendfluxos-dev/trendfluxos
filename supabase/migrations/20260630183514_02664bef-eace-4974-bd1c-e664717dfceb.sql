
-- 1) live_classes: revoke broad SELECT and re-grant only non-sensitive columns
REVOKE SELECT ON public.live_classes FROM anon, authenticated;
GRANT SELECT (
  id, course_slug, title, description, host_name, starts_at, duration_min,
  status, created_by, created_at, updated_at, audience_mode,
  calendar_event_id, first_started_at
) ON public.live_classes TO anon, authenticated;
GRANT ALL ON public.live_classes TO service_role;

-- 2) voice_assets: allow teachers and tutors to read
CREATE POLICY "Teachers and tutors can view voice assets"
ON public.voice_assets
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher'::app_role)
  OR public.has_role(auth.uid(), 'tutor'::app_role)
);

-- 3) Fix mutable search_path on email queue helpers
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
