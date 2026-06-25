
-- 1) class_materials: class-scoped student read
DROP POLICY IF EXISTS "Enrolled students can read materials" ON public.class_materials;
CREATE POLICY "Students read materials for their classes"
  ON public.class_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_class_rsvps r
      WHERE r.class_id = class_materials.class_id
        AND r.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.live_classes lc
      WHERE lc.id = class_materials.class_id
        AND lc.audience_mode = 'enrolled'
        AND public.has_confirmed_enrollment(auth.uid())
    )
  );

-- 2) tutor_bookings: remove student UPDATE; provide narrow cancel RPC
DROP POLICY IF EXISTS "Tutor or student updates own booking" ON public.tutor_bookings;
CREATE POLICY "Tutor or admin updates booking"
  ON public.tutor_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = tutor_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = tutor_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.student_cancel_booking(_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_status text;
  v_student uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required' USING ERRCODE = '42501';
  END IF;
  SELECT status, student_id INTO v_status, v_student
    FROM public.tutor_bookings WHERE id = _booking_id;
  IF v_student IS NULL THEN
    RAISE EXCEPTION 'not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_student <> v_uid THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'only pending bookings can be cancelled by student';
  END IF;
  UPDATE public.tutor_bookings
     SET status = 'cancelled', updated_at = now()
   WHERE id = _booking_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.student_cancel_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.student_cancel_booking(uuid) TO authenticated;

-- 3) live_classes: re-assert meeting_url is not column-readable by anon/public
REVOKE SELECT (meeting_url, calendar_event_id) ON public.live_classes FROM PUBLIC;
REVOKE SELECT (meeting_url, calendar_event_id) ON public.live_classes FROM anon;
REVOKE SELECT (meeting_url, calendar_event_id) ON public.live_classes FROM authenticated;
-- Narrow the public SELECT policy roles to remove anon implicit access via `public`.
DROP POLICY IF EXISTS "Live classes are public" ON public.live_classes;
CREATE POLICY "Live classes are listable"
  ON public.live_classes FOR SELECT
  TO anon, authenticated
  USING (true);
