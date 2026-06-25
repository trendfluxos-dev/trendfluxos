
CREATE OR REPLACE FUNCTION public.preview_purge_access_audit_logs(_days integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days integer;
  v_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
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

  SELECT COUNT(*) INTO v_count
    FROM public.access_audit_logs
   WHERE created_at < now() - make_interval(days => v_days);

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.preview_purge_access_audit_logs(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_purge_access_audit_logs(integer) TO authenticated;
