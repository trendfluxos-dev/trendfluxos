
-- 1) Tighten tutor_availability read policy: scope to relevant contexts
--    instead of every authenticated user.
DROP POLICY IF EXISTS "Authenticated users can view tutor availability"
  ON public.tutor_availability;

CREATE POLICY "Tutor, admins, and booked students can view availability"
ON public.tutor_availability
FOR SELECT
TO authenticated
USING (
  auth.uid() = tutor_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'editor'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.tutor_bookings b
    WHERE b.tutor_id = tutor_availability.tutor_id
      AND b.student_id = auth.uid()
  )
);

-- 2) Revoke anon EXECUTE on public.has_role. It's used inside RLS policies
--    by authenticated queries; anon should not be able to invoke it at all.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
