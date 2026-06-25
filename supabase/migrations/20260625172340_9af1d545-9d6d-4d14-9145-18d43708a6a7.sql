
-- 1. Extend app_role enum (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tutor' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'tutor';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'finance' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'finance';
  END IF;
END $$;

-- 2. teacher_profiles
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline text,
  bio text,
  expertise text[] DEFAULT '{}',
  languages text[] DEFAULT '{bn,en}',
  hourly_rate numeric(10,2),
  currency text DEFAULT 'BDT',
  calendar_connected_at timestamptz,
  drive_folder_url text,
  share_link_copied_at timestamptz,
  onboarded_at timestamptz,
  verified_at timestamptz,
  payout_method text,
  avg_rating numeric(3,2) DEFAULT 0,
  response_sla_minutes int DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.teacher_profiles TO authenticated;
GRANT SELECT ON public.teacher_profiles TO anon;
GRANT ALL ON public.teacher_profiles TO service_role;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teacher profiles"
  ON public.teacher_profiles FOR SELECT USING (true);
CREATE POLICY "Teachers manage own profile"
  ON public.teacher_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers update own profile"
  ON public.teacher_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all teacher profiles"
  ON public.teacher_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER teacher_profiles_set_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. tutor_availability
CREATE TABLE IF NOT EXISTS public.tutor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Dhaka',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_availability TO authenticated;
GRANT SELECT ON public.tutor_availability TO anon;
GRANT ALL ON public.tutor_availability TO service_role;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability"
  ON public.tutor_availability FOR SELECT USING (true);
CREATE POLICY "Tutors manage own availability"
  ON public.tutor_availability FOR ALL TO authenticated
  USING (auth.uid() = tutor_id) WITH CHECK (auth.uid() = tutor_id);

-- 4. tutor_bookings
CREATE TABLE IF NOT EXISTS public.tutor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  notes text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','accepted','declined','confirmed','live','completed','cancelled','expired')),
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  meeting_url text,
  livekit_room text,
  responded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.tutor_bookings TO authenticated;
GRANT ALL ON public.tutor_bookings TO service_role;
ALTER TABLE public.tutor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutor or student sees own bookings"
  ON public.tutor_bookings FOR SELECT TO authenticated
  USING (auth.uid() = tutor_id OR auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Students create bookings"
  ON public.tutor_bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Tutor or student updates own booking"
  ON public.tutor_bookings FOR UPDATE TO authenticated
  USING (auth.uid() = tutor_id OR auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = tutor_id OR auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER tutor_bookings_set_updated_at
  BEFORE UPDATE ON public.tutor_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS tutor_bookings_tutor_idx ON public.tutor_bookings(tutor_id, starts_at);
CREATE INDEX IF NOT EXISTS tutor_bookings_student_idx ON public.tutor_bookings(student_id, starts_at);

-- 5. tutor_reviews
CREATE TABLE IF NOT EXISTS public.tutor_reviews (
  booking_id uuid PRIMARY KEY REFERENCES public.tutor_bookings(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.tutor_reviews TO authenticated;
GRANT SELECT ON public.tutor_reviews TO anon;
GRANT ALL ON public.tutor_reviews TO service_role;
ALTER TABLE public.tutor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON public.tutor_reviews FOR SELECT USING (true);
CREATE POLICY "Students post review for own completed booking"
  ON public.tutor_reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.tutor_bookings b
      WHERE b.id = booking_id
        AND b.student_id = auth.uid()
        AND b.status = 'completed'
    )
  );

-- 6. live_classes additions
ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS audience_mode text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS calendar_event_id text,
  ADD COLUMN IF NOT EXISTS first_started_at timestamptz;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'live_classes_audience_mode_check'
  ) THEN
    ALTER TABLE public.live_classes
      ADD CONSTRAINT live_classes_audience_mode_check
      CHECK (audience_mode IN ('open','enrolled'));
  END IF;
END $$;

-- 7. Helper: confirmed-enrollment check (MVP: any paid module = enrolled)
CREATE OR REPLACE FUNCTION public.has_confirmed_enrollment(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.module_enrollments
    WHERE user_id = _user_id AND status = 'confirmed'
  );
$$;

-- 8. Update meeting URL gate to honor audience_mode
CREATE OR REPLACE FUNCTION public.get_live_class_meeting_url(_class_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_mode text;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  IF public.has_role(v_uid, 'admin'::app_role) THEN
    SELECT meeting_url INTO v_url FROM public.live_classes WHERE id = _class_id;
    RETURN v_url;
  END IF;

  SELECT meeting_url, audience_mode
    INTO v_url, v_mode
  FROM public.live_classes WHERE id = _class_id;

  IF v_mode = 'enrolled' THEN
    IF NOT public.has_confirmed_enrollment(v_uid) THEN
      RETURN NULL;
    END IF;
    RETURN v_url;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.live_class_rsvps
    WHERE class_id = _class_id AND user_id = v_uid
  ) THEN
    RETURN NULL;
  END IF;

  RETURN v_url;
END;
$$;
