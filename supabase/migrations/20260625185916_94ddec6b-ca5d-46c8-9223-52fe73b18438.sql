-- 1) Column-level lockdown of live_classes.meeting_url
REVOKE SELECT (meeting_url) ON public.live_classes FROM anon, authenticated, PUBLIC;
GRANT SELECT (meeting_url) ON public.live_classes TO service_role;

-- 2) Restrict SECURITY DEFINER helpers from anonymous callers
REVOKE EXECUTE ON FUNCTION public.current_user_has_role(app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_live_class_meeting_url(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.live_class_rsvp_count(uuid)   FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_live_classes()     FROM anon, PUBLIC;

-- 3) Internal-only helper: only the server (service_role / postgres) may call it.
--    RLS policies that reference it still work because policies execute under
--    the table owner, not the calling role.
REVOKE EXECUTE ON FUNCTION public.has_confirmed_enrollment(uuid)
  FROM anon, authenticated, PUBLIC;