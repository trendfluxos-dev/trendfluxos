
-- 1. class_recordings table
CREATE TABLE public.class_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.live_classes(id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  storage_path text NOT NULL,
  mime_type text NOT NULL DEFAULT 'video/webm',
  duration_sec integer,
  size_bytes bigint,
  visibility text NOT NULL DEFAULT 'attendees' CHECK (visibility IN ('private','attendees','public')),
  public_token text UNIQUE,
  attached_module_id uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
  attached_lesson_index integer,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX class_recordings_teacher_idx ON public.class_recordings(teacher_id);
CREATE INDEX class_recordings_class_idx ON public.class_recordings(class_id);
CREATE INDEX class_recordings_public_token_idx ON public.class_recordings(public_token) WHERE public_token IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_recordings TO authenticated;
GRANT ALL ON public.class_recordings TO service_role;

ALTER TABLE public.class_recordings ENABLE ROW LEVEL SECURITY;

-- Teacher full access on own rows
CREATE POLICY "Teacher manages own recordings"
ON public.class_recordings FOR ALL
TO authenticated
USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Students who RSVPd / joined that class can SELECT (visibility != private)
CREATE POLICY "Attendees can view recordings"
ON public.class_recordings FOR SELECT
TO authenticated
USING (
  visibility IN ('attendees','public')
  AND class_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.live_class_rsvps r
    WHERE r.class_id = class_recordings.class_id AND r.user_id = auth.uid()
  )
);

-- updated_at trigger
CREATE TRIGGER class_recordings_updated_at
BEFORE UPDATE ON public.class_recordings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Publish / unpublish RPCs
CREATE OR REPLACE FUNCTION public.publish_recording_public(_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_token text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth required' USING ERRCODE='42501'; END IF;
  SELECT teacher_id INTO v_owner FROM public.class_recordings WHERE id = _id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'not found' USING ERRCODE='P0002'; END IF;
  IF v_owner <> v_uid AND NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE='42501';
  END IF;
  v_token := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
  UPDATE public.class_recordings
     SET public_token = v_token, visibility = 'public', updated_at = now()
   WHERE id = _id;
  RETURN v_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.unpublish_recording_public(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth required' USING ERRCODE='42501'; END IF;
  SELECT teacher_id INTO v_owner FROM public.class_recordings WHERE id = _id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'not found' USING ERRCODE='P0002'; END IF;
  IF v_owner <> v_uid AND NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE='42501';
  END IF;
  UPDATE public.class_recordings
     SET public_token = NULL, visibility = 'attendees', updated_at = now()
   WHERE id = _id;
END;
$$;

-- 3. Fetch recording by public token (no auth needed)
CREATE OR REPLACE FUNCTION public.get_recording_by_token(_token text)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  storage_path text,
  mime_type text,
  duration_sec integer,
  recorded_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, title, description, storage_path, mime_type, duration_sec, recorded_at
    FROM public.class_recordings
   WHERE public_token = _token AND visibility = 'public'
   LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_recording_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_recording_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_recording_public(uuid) TO authenticated;

-- 4. Storage policies on class-recordings bucket
-- Owner: teacher (uid is first folder segment) ; admins full
CREATE POLICY "Teacher writes own recording objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'class-recordings'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'::app_role))
);

CREATE POLICY "Teacher updates own recording objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'class-recordings'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'::app_role))
);

CREATE POLICY "Teacher deletes own recording objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'class-recordings'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'::app_role))
);

CREATE POLICY "Teacher reads own recording objects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'class-recordings'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'::app_role))
);

-- Note: students & public viewers fetch via signed URL generated by an edge function
-- that checks entitlement before signing. We will add `get-recording-signed-url`.
