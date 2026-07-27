
CREATE OR REPLACE FUNCTION public.enforce_tutor_booking_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rate numeric;
  v_currency text;
  v_hours numeric;
BEGIN
  -- service_role / admin flows keep full control
  IF v_uid IS NULL OR public.has_role(v_uid, 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF v_uid = NEW.student_id AND v_uid <> NEW.tutor_id THEN
    -- Students can never supply meeting details or a self-chosen price.
    NEW.meeting_url := NULL;
    NEW.livekit_room := NULL;
    NEW.responded_at := NULL;

    IF NEW.ends_at <= NEW.starts_at THEN
      RAISE EXCEPTION 'Invalid booking time range' USING ERRCODE = '22023';
    END IF;

    SELECT hourly_rate, COALESCE(currency, 'BDT')
      INTO v_rate, v_currency
      FROM public.teacher_profiles
     WHERE user_id = NEW.tutor_id;

    v_hours := EXTRACT(EPOCH FROM (NEW.ends_at - NEW.starts_at)) / 3600.0;
    NEW.price := ROUND(COALESCE(v_rate, 0) * v_hours, 2);
    NEW.currency := COALESCE(v_currency, 'BDT');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_tutor_booking_insert ON public.tutor_bookings;
CREATE TRIGGER trg_enforce_tutor_booking_insert
BEFORE INSERT ON public.tutor_bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_tutor_booking_insert();

DROP TRIGGER IF EXISTS trg_enforce_tutor_booking_update ON public.tutor_bookings;
CREATE TRIGGER trg_enforce_tutor_booking_update
BEFORE UPDATE ON public.tutor_bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_tutor_booking_update();

CREATE OR REPLACE FUNCTION public.enforce_booking_payment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_price numeric;
  v_currency text;
BEGIN
  SELECT price, COALESCE(currency, 'BDT')
    INTO v_price, v_currency
    FROM public.tutor_bookings
   WHERE id = NEW.booking_id;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Booking not found' USING ERRCODE = 'P0002';
  END IF;

  -- Amount is always derived from the booking, never from the client.
  NEW.amount := v_price;
  NEW.currency := v_currency;
  NEW.reviewed_by := NULL;
  NEW.reviewed_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_booking_payment_insert ON public.booking_payments;
CREATE TRIGGER trg_enforce_booking_payment_insert
BEFORE INSERT ON public.booking_payments
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_payment_insert();
