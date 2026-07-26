-- Token-based lookups bypass RLS by design; they must not be callable
-- directly from the exposed API. They are now server-only (service_role),
-- and the public share page reaches them through an edge function.
REVOKE ALL ON FUNCTION public.get_class_by_share_token(text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.get_recording_by_token(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.get_class_by_share_token(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_recording_by_token(text) TO service_role;

-- Internal-only SECURITY DEFINER helpers: never callable from the API.
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.log_access_audit(text, text, text, text, text, jsonb) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.enforce_tutor_booking_update() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.live_classes_autogen_curriculum() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.student_cancel_booking(uuid) FROM anon, public;

-- RLS-policy helpers must remain executable by signed-in users, otherwise
-- every policy that calls them fails closed for legitimate users.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_confirmed_enrollment(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_confirmed_enrollment(uuid) FROM anon;