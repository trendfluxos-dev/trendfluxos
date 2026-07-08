-- 1) Fix Security Definer View finding: make live_classes_public run as invoker (RLS applies to caller).
ALTER VIEW public.live_classes_public SET (security_invoker = true);

-- 2) Curriculum trigger now needs to authenticate against generate-curriculum (which requires JWT).
--    Send the service-role bearer stored in Vault so internal trigger-initiated calls still work.
CREATE OR REPLACE FUNCTION public.live_classes_autogen_curriculum()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_key text;
BEGIN
  IF NEW.curriculum IS NULL THEN
    BEGIN
      SELECT decrypted_secret INTO v_key
        FROM vault.decrypted_secrets
       WHERE name = 'email_queue_service_role_key'
       LIMIT 1;

      PERFORM net.http_post(
        url := 'https://dnodqhwwzdqfqlndwhsf.supabase.co/functions/v1/generate-curriculum',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Lovable-Context', 'trigger',
          'Authorization', 'Bearer ' || COALESCE(v_key, '')
        ),
        body := jsonb_build_object('class_id', NEW.id, 'auto', true)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'autogen curriculum dispatch failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$function$;