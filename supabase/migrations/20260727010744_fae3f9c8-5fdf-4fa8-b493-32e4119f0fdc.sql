-- current_user_has_role: readable via the user's own RLS policy on user_roles,
-- so elevated privileges are unnecessary.
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  );
$function$;

-- get_audit_retention_days: only admins consume it and site_settings RLS
-- already restricts the row, so run as the caller.
CREATE OR REPLACE FUNCTION public.get_audit_retention_days()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT (value)::text::integer FROM public.site_settings
      WHERE key = 'audit_log_retention_days'),
    30
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.current_user_has_role(app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_audit_retention_days() FROM anon;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_retention_days() TO authenticated;