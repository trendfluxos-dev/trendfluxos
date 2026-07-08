
-- Tighten INSERT policies to prevent students from self-approving payments
-- or fabricating completed tutoring sessions.

DROP POLICY IF EXISTS "Students can insert own booking payments" ON public.booking_payments;
CREATE POLICY "Students can insert own booking payments"
ON public.booking_payments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.tutor_bookings b
    WHERE b.id = booking_payments.booking_id
      AND b.student_id = auth.uid()
  )
  -- Students may only submit payments in the unreviewed 'submitted' state.
  AND status = 'submitted'
  AND reviewed_by IS NULL
  AND reviewed_at IS NULL
);

DROP POLICY IF EXISTS "Students create bookings" ON public.tutor_bookings;
CREATE POLICY "Students create bookings"
ON public.tutor_bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  -- Students may only create bookings in the initial 'requested' state; only
  -- tutors/admins can transition to confirmed/completed/etc. via UPDATE.
  AND status = 'requested'
);
