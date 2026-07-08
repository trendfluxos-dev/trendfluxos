-- Extend handle_new_user to also map intended role from signup metadata into user_roles.
-- Never assign 'admin' or 'finance' via self-signup — those are privileged and must be granted manually.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role_text text;
  v_role public.app_role;
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Map signup metadata role → user_roles (self-serve roles only).
  v_role_text := COALESCE(
    NEW.raw_user_meta_data->>'intended_role',
    NEW.raw_user_meta_data->>'role'
  );

  IF v_role_text IN ('student', 'teacher', 'tutor', 'editor', 'user') THEN
    BEGIN
      v_role := v_role_text::public.app_role;
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, v_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: role assignment failed for %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;