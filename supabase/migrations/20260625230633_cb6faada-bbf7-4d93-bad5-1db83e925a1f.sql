
-- Seed default retention (idempotent)
INSERT INTO public.site_settings (key, value)
VALUES ('audit_log_retention_days', '30'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Purge function: admin-callable, also usable from cron via service_role.
CREATE OR REPLACE FUNCTION public.purge_access_audit_logs(_days integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days integer;
  v_deleted integer;
  v_uid uuid := auth.uid();
BEGIN
  -- Allow service_role (no auth.uid()) or admins only.
  IF v_uid IS NOT NULL AND NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  IF _days IS NULL THEN
    SELECT COALESCE((value)::text::integer, 30)
      INTO v_days
    FROM public.site_settings
    WHERE key = 'audit_log_retention_days';
    v_days := COALESCE(v_days, 30);
  ELSE
    v_days := _days;
  END IF;

  IF v_days < 1 THEN v_days := 1; END IF;

  DELETE FROM public.access_audit_logs
   WHERE created_at < now() - make_interval(days => v_days);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Self-audit so deletions are themselves visible.
  INSERT INTO public.access_audit_logs
    (user_id, action, resource_type, resource_id, outcome, reason, metadata)
  VALUES
    (v_uid, 'purge_audit_logs', 'access_audit_logs', NULL, 'granted',
     CASE WHEN v_uid IS NULL THEN 'cron' ELSE 'admin' END,
     jsonb_build_object('days', v_days, 'deleted', v_deleted));

  RETURN v_deleted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_access_audit_logs(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purge_access_audit_logs(integer) TO authenticated, service_role;

-- Admin RPC to update retention safely (validates range, admin-only).
CREATE OR REPLACE FUNCTION public.set_audit_retention_days(_days integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF _days < 1 OR _days > 3650 THEN
    RAISE EXCEPTION 'days must be between 1 and 3650';
  END IF;
  INSERT INTO public.site_settings (key, value)
  VALUES ('audit_log_retention_days', to_jsonb(_days))
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now();
  RETURN _days;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_audit_retention_days(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_audit_retention_days(integer) TO authenticated;

-- Public read of the retention setting (numeric value only, non-sensitive).
CREATE OR REPLACE FUNCTION public.get_audit_retention_days()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (value)::text::integer FROM public.site_settings
      WHERE key = 'audit_log_retention_days'),
    30
  );
$$;

REVOKE EXECUTE ON FUNCTION public.get_audit_retention_days() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_audit_retention_days() TO authenticated;

-- Daily cron at 03:15 UTC
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-access-audit-logs-daily') THEN
    PERFORM cron.unschedule('purge-access-audit-logs-daily');
  END IF;
  PERFORM cron.schedule(
    'purge-access-audit-logs-daily',
    '15 3 * * *',
    $cron$ SELECT public.purge_access_audit_logs(); $cron$
  );
END $$;
