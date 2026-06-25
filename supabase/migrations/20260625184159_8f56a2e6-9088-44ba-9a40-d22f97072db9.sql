
-- 1) teacher_profiles: restrict SELECT to owner + admin, expose marketplace fields via view
DROP POLICY IF EXISTS "Anyone can view teacher profiles" ON public.teacher_profiles;

CREATE POLICY "Owner or admin reads teacher profile"
  ON public.teacher_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.teacher_profiles FROM anon;

-- Public-safe projection for the marketplace browse/profile pages.
CREATE OR REPLACE VIEW public.teacher_profiles_public
WITH (security_invoker = on) AS
SELECT
  user_id,
  headline,
  bio,
  expertise,
  languages,
  hourly_rate,
  currency,
  avg_rating,
  response_sla_minutes,
  verified_at,
  created_at
FROM public.teacher_profiles
WHERE verified_at IS NOT NULL;

GRANT SELECT ON public.teacher_profiles_public TO anon, authenticated;

-- 2) tutor_bookings: column-level guard via trigger
DROP POLICY IF EXISTS "Tutor or student updates own booking" ON public.tutor_bookings;

CREATE POLICY "Tutor or student updates own booking"
  ON public.tutor_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = tutor_id OR auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = tutor_id OR auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.enforce_tutor_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean := public.has_role(v_uid, 'admin'::app_role);
BEGIN
  IF v_is_admin OR v_uid IS NULL THEN
    -- service_role bypasses RLS; v_uid is null there. Admins unrestricted.
    RETURN NEW;
  END IF;

  -- Immutable fields for both parties
  IF NEW.tutor_id IS DISTINCT FROM OLD.tutor_id
     OR NEW.student_id IS DISTINCT FROM OLD.student_id
     OR NEW.price IS DISTINCT FROM OLD.price
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
     OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Not allowed to modify booking core fields' USING ERRCODE = '42501';
  END IF;

  IF v_uid = OLD.student_id AND v_uid <> OLD.tutor_id THEN
    -- Student can only edit notes; may cancel a pending booking.
    IF NEW.meeting_url IS DISTINCT FROM OLD.meeting_url
       OR NEW.livekit_room IS DISTINCT FROM OLD.livekit_room
       OR NEW.subject IS DISTINCT FROM OLD.subject
       OR NEW.responded_at IS DISTINCT FROM OLD.responded_at
       OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
      RAISE EXCEPTION 'Students cannot modify this field' USING ERRCODE = '42501';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (OLD.status = 'pending' AND NEW.status = 'cancelled') THEN
        RAISE EXCEPTION 'Students may only cancel a pending booking' USING ERRCODE = '42501';
      END IF;
    END IF;
  ELSIF v_uid = OLD.tutor_id THEN
    -- Tutor can manage status transitions + meeting links + notes; not price/parties.
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (
        (OLD.status = 'pending'   AND NEW.status IN ('confirmed','cancelled'))
        OR (OLD.status = 'confirmed' AND NEW.status IN ('completed','cancelled','no_show'))
      ) THEN
        RAISE EXCEPTION 'Invalid status transition for tutor' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tutor_bookings_enforce_update ON public.tutor_bookings;
CREATE TRIGGER tutor_bookings_enforce_update
  BEFORE UPDATE ON public.tutor_bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tutor_booking_update();

REVOKE EXECUTE ON FUNCTION public.enforce_tutor_booking_update() FROM anon, authenticated;

-- 3) Revoke anon EXECUTE on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_confirmed_enrollment(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.live_class_rsvp_count(uuid) FROM anon;
