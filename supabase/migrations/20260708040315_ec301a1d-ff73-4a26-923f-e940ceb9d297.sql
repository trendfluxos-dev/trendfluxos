-- Allow RLS policies (which run as the calling role) to invoke has_role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- Ensure user_roles has explicit grants (RLS still enforces row scope).
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;