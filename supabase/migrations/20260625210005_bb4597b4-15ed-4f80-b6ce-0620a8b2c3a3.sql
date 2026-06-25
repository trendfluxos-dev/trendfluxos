
-- 1. Tutor reviews: remove permissive policy exposing student_id
DROP POLICY IF EXISTS "Public can read non-PII review columns" ON public.tutor_reviews;

-- 2. Storage policies for private buckets (defense-in-depth on top of edge-function gating)

-- class-materials: teacher folder owner OR admin
DROP POLICY IF EXISTS "class-materials owner or admin read" ON storage.objects;
CREATE POLICY "class-materials owner or admin read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'class-materials'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "class-materials owner or admin write" ON storage.objects;
CREATE POLICY "class-materials owner or admin write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'class-materials'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "class-materials owner or admin update" ON storage.objects;
CREATE POLICY "class-materials owner or admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'class-materials'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "class-materials owner or admin delete" ON storage.objects;
CREATE POLICY "class-materials owner or admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'class-materials'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- lesson-pdfs: admin-only direct storage; students get content via signed-URL edge function
DROP POLICY IF EXISTS "lesson-pdfs admin all" ON storage.objects;
CREATE POLICY "lesson-pdfs admin all"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'lesson-pdfs'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'lesson-pdfs'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Lock down SECURITY DEFINER helpers from anon/authenticated direct EXECUTE.
--    Trigger function — only the table owner needs it for trigger firing.
REVOKE EXECUTE ON FUNCTION public.enforce_tutor_booking_update() FROM PUBLIC, anon, authenticated;

--    Share-token lookup: keep callable from anon, since it's the public join surface.
--    (No change — explicitly retained for /class/:token flow.)
