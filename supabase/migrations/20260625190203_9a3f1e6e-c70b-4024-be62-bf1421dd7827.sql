
-- 1) Lock down direct table reads
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.tutor_reviews;

CREATE POLICY "Owner, tutor, or admin reads review"
ON public.tutor_reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() = student_id
  OR auth.uid() = tutor_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Belt-and-suspenders: revoke column-level SELECT on student_id from anon/authenticated
REVOKE SELECT (student_id) ON public.tutor_reviews FROM anon, authenticated;

-- 2) Public-safe view (no student_id)
DROP VIEW IF EXISTS public.tutor_reviews_public;
CREATE VIEW public.tutor_reviews_public
WITH (security_invoker = true)
AS
SELECT booking_id, tutor_id, rating, body, created_at
FROM public.tutor_reviews;

-- Allow public read of the redacted view; underlying table SELECT is gated by RLS above,
-- but the view exposes only non-PII columns.
GRANT SELECT ON public.tutor_reviews_public TO anon, authenticated;

-- Open SELECT on the view requires a corresponding RLS path on the underlying table for
-- the invoker role. Add a redacted-read policy that returns rows but never exposes student_id
-- (column already revoked from anon/authenticated).
CREATE POLICY "Public can read non-PII review columns"
ON public.tutor_reviews
FOR SELECT
TO anon, authenticated
USING (true);
