-- Add curriculum fields to live_classes
ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS curriculum jsonb,
  ADD COLUMN IF NOT EXISTS curriculum_generated_at timestamptz;

-- Trigger to auto-generate curriculum on insert (best-effort, non-blocking)
CREATE OR REPLACE FUNCTION public.live_classes_autogen_curriculum()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.curriculum IS NULL THEN
    BEGIN
      PERFORM net.http_post(
        url := 'https://dnodqhwwzdqfqlndwhsf.supabase.co/functions/v1/generate-curriculum',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Lovable-Context', 'trigger'
        ),
        body := jsonb_build_object('class_id', NEW.id, 'auto', true)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'autogen curriculum dispatch failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_live_classes_autogen_curriculum ON public.live_classes;
CREATE TRIGGER trg_live_classes_autogen_curriculum
AFTER INSERT ON public.live_classes
FOR EACH ROW
EXECUTE FUNCTION public.live_classes_autogen_curriculum();