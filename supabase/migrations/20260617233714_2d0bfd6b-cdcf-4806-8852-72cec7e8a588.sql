-- Lock down SECURITY DEFINER functions: revoke EXECUTE from PUBLIC/anon/authenticated
-- on functions that are only used as triggers. RLS helpers (has_role,
-- current_user_has_role) must remain callable by authenticated because RLS
-- policies are evaluated under the calling role.

-- Trigger-only functions: only the table owner / service_role needs EXECUTE.
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at()         FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user()       TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at()        TO service_role;

-- RLS helpers: tighten — drop anon + PUBLIC, keep authenticated (required so
-- RLS policies that call these helpers can be evaluated for signed-in users).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)        TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO authenticated, service_role;