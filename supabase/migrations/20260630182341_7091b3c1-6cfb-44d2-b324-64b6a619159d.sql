-- Students with an RSVP can read class-materials objects
CREATE POLICY "class-materials RSVP students read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'class-materials'
  AND EXISTS (
    SELECT 1
      FROM public.class_materials cm
      JOIN public.live_class_rsvps r
        ON r.class_id = cm.class_id
     WHERE cm.storage_path = storage.objects.name
       AND r.user_id = auth.uid()
  )
);

-- Students with an RSVP can read class-recordings objects when the recording
-- is shared with attendees or made public.
CREATE POLICY "class-recordings RSVP students read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'class-recordings'
  AND EXISTS (
    SELECT 1
      FROM public.class_recordings cr
      JOIN public.live_class_rsvps r
        ON r.class_id = cr.class_id
     WHERE cr.storage_path = storage.objects.name
       AND r.user_id = auth.uid()
       AND cr.visibility IN ('attendees', 'public')
  )
);

-- Lock down recording publish/unpublish RPCs from anonymous callers. Both
-- already raise inside the function when auth.uid() is null, but revoking
-- EXECUTE removes the attack surface entirely.
REVOKE EXECUTE ON FUNCTION public.publish_recording_public(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.unpublish_recording_public(uuid) FROM anon;