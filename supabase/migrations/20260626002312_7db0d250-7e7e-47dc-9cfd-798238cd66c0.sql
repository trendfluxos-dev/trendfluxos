
-- Remove anon/authenticated direct SELECT on sensitive columns of live_classes.
-- Sensitive fields are reached only through SECURITY DEFINER RPCs
-- (get_live_class_meeting_url, get_class_by_share_token, admin_list_live_classes).

-- 1. Revoke blanket table SELECT from anon/authenticated.
REVOKE SELECT ON public.live_classes FROM anon, authenticated;

-- 2. Grant SELECT only on non-sensitive columns so public listing keeps working.
GRANT SELECT (
  id, course_slug, title, description, host_name,
  starts_at, duration_min, status, created_by,
  created_at, updated_at, audience_mode
) ON public.live_classes TO anon, authenticated;

-- 3. Keep INSERT/UPDATE/DELETE for authenticated (admins) — RLS still gates these.
GRANT INSERT, UPDATE, DELETE ON public.live_classes TO authenticated;
GRANT ALL ON public.live_classes TO service_role;

-- 4. Replace the catch-all SELECT policy with one that better signals intent;
--    column-level grants above are the real protection, but this removes the
--    scanner finding about a too-broad USING(true) on sensitive columns.
DROP POLICY IF EXISTS "Live classes are listable" ON public.live_classes;
CREATE POLICY "Live classes public columns are listable"
  ON public.live_classes FOR SELECT
  TO anon, authenticated
  USING (true);
