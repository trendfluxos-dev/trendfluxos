-- Lock down SECURITY DEFINER functions so they cannot be invoked by clients
-- through PostgREST. They remain callable from RLS policies, triggers, and
-- service_role contexts (SECURITY DEFINER executes as the owner regardless
-- of EXECUTE grants when called internally via the SQL planner).

-- bootstrap_first_admin is trigger-only; no client should ever call it.
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;

-- handle_new_user is trigger-only.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- set_updated_at is trigger-only.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role / current_user_has_role are used by RLS policies. RLS calls them
-- through the SQL planner (not via the Data API), so revoking EXECUTE from
-- anon/authenticated does NOT break policies — it only prevents clients from
-- probing roles directly via PostgREST RPC.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_has_role(app_role) FROM PUBLIC, anon;
-- current_user_has_role may be called by the client to gate UI; keep authenticated.
GRANT EXECUTE ON FUNCTION public.current_user_has_role(app_role) TO authenticated;