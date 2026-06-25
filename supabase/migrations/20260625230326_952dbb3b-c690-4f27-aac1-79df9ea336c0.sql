
CREATE TABLE public.access_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('granted','denied')),
  reason TEXT,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.access_audit_logs TO authenticated;
GRANT ALL ON public.access_audit_logs TO service_role;

ALTER TABLE public.access_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
ON public.access_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_access_audit_created_at ON public.access_audit_logs (created_at DESC);
CREATE INDEX idx_access_audit_user ON public.access_audit_logs (user_id, created_at DESC);
CREATE INDEX idx_access_audit_resource ON public.access_audit_logs (resource_type, resource_id, created_at DESC);

-- Logger helper (SECURITY DEFINER so the gated RPC can insert without
-- requiring an INSERT policy for end users).
CREATE OR REPLACE FUNCTION public.log_access_audit(
  _action TEXT,
  _resource_type TEXT,
  _resource_id TEXT,
  _outcome TEXT,
  _reason TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason, metadata)
  VALUES (auth.uid(), _action, _resource_type, _resource_id, _outcome, _reason, COALESCE(_metadata, '{}'::jsonb));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_access_audit(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_access_audit(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- Replace meeting URL retrieval to write audit rows.
CREATE OR REPLACE FUNCTION public.get_live_class_meeting_url(_class_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_url text;
  v_mode text;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason)
    VALUES (NULL, 'get_meeting_url', 'live_class', _class_id::text, 'denied', 'no_session');
    RETURN NULL;
  END IF;

  IF public.has_role(v_uid, 'admin'::app_role) THEN
    SELECT meeting_url INTO v_url FROM public.live_classes WHERE id = _class_id;
    INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason)
    VALUES (v_uid, 'get_meeting_url', 'live_class', _class_id::text, 'granted', 'admin');
    RETURN v_url;
  END IF;

  SELECT meeting_url, audience_mode
    INTO v_url, v_mode
  FROM public.live_classes WHERE id = _class_id;

  IF v_mode = 'enrolled' THEN
    IF NOT public.has_confirmed_enrollment(v_uid) THEN
      INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason)
      VALUES (v_uid, 'get_meeting_url', 'live_class', _class_id::text, 'denied', 'no_enrollment');
      RETURN NULL;
    END IF;
    INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason)
    VALUES (v_uid, 'get_meeting_url', 'live_class', _class_id::text, 'granted', 'enrolled');
    RETURN v_url;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.live_class_rsvps
    WHERE class_id = _class_id AND user_id = v_uid
  ) THEN
    INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason)
    VALUES (v_uid, 'get_meeting_url', 'live_class', _class_id::text, 'denied', 'no_rsvp');
    RETURN NULL;
  END IF;

  INSERT INTO public.access_audit_logs (user_id, action, resource_type, resource_id, outcome, reason)
  VALUES (v_uid, 'get_meeting_url', 'live_class', _class_id::text, 'granted', 'rsvp');
  RETURN v_url;
END;
$function$;
