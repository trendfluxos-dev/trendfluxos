
-- Restrict meeting_url column on live_classes to gated callers only
REVOKE SELECT (meeting_url) ON public.live_classes FROM anon, authenticated;

-- Secure RPC: returns the meeting URL only to admins or RSVPed users
CREATE OR REPLACE FUNCTION public.get_live_class_meeting_url(_class_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  -- Admins always get the URL
  IF public.has_role(v_uid, 'admin'::app_role) THEN
    SELECT meeting_url INTO v_url FROM public.live_classes WHERE id = _class_id;
    RETURN v_url;
  END IF;

  -- Non-admins must have RSVPed to this class
  IF NOT EXISTS (
    SELECT 1 FROM public.live_class_rsvps
    WHERE class_id = _class_id AND user_id = v_uid
  ) THEN
    RETURN NULL;
  END IF;

  SELECT meeting_url INTO v_url FROM public.live_classes WHERE id = _class_id;
  RETURN v_url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_live_class_meeting_url(uuid) TO authenticated;

-- Admin-only listing RPC that includes the protected meeting_url
CREATE OR REPLACE FUNCTION public.admin_list_live_classes()
RETURNS SETOF public.live_classes
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.live_classes ORDER BY starts_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_live_classes() TO authenticated;
