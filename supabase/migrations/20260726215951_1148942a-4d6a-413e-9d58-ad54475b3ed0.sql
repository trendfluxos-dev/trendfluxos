-- These two helpers must stay executable by signed-in users because RLS
-- policies call them. Harden the bodies so a signed-in caller can only ask
-- about themselves (admins may ask about anyone). Internal/service_role
-- callers (auth.uid() IS NULL) keep full behaviour.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL
      OR _user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
      )
    THEN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
    ELSE false
  END
$$;

CREATE OR REPLACE FUNCTION public.has_confirmed_enrollment(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL
      OR _user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
      )
    THEN EXISTS (
      SELECT 1 FROM public.module_enrollments
      WHERE user_id = _user_id AND status IN ('paid', 'confirmed')
    )
    ELSE false
  END
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.has_confirmed_enrollment(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_confirmed_enrollment(uuid) TO authenticated, service_role;