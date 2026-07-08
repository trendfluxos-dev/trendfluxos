-- 1. Expand tutor_bookings.status to include payment states
ALTER TABLE public.tutor_bookings DROP CONSTRAINT IF EXISTS tutor_bookings_status_check;
ALTER TABLE public.tutor_bookings ADD CONSTRAINT tutor_bookings_status_check CHECK (
  status = ANY (ARRAY[
    'requested'::text,
    'accepted'::text,
    'declined'::text,
    'awaiting_payment'::text,
    'payment_submitted'::text,
    'payment_rejected'::text,
    'confirmed'::text,
    'live'::text,
    'completed'::text,
    'cancelled'::text,
    'expired'::text,
    'no_show'::text
  ])
);

-- 2. Booking payments status enum
DO $$ BEGIN
  CREATE TYPE public.booking_payment_status AS ENUM ('submitted','approved','rejected','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Table
CREATE TABLE public.booking_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.tutor_bookings(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL DEFAULT 'bkash',
  trx_id text NOT NULL,
  sender_number text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BDT',
  status public.booking_payment_status NOT NULL DEFAULT 'submitted',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, trx_id)
);

-- 4. Grants
GRANT SELECT, INSERT ON public.booking_payments TO authenticated;
GRANT ALL ON public.booking_payments TO service_role;

-- 5. RLS
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can insert own booking payments"
  ON public.booking_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.tutor_bookings b
      WHERE b.id = booking_id AND b.student_id = auth.uid()
    )
  );

CREATE POLICY "Student, tutor and admin can view booking payments"
  ON public.booking_payments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.tutor_bookings b
      WHERE b.id = booking_id AND b.tutor_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  );

CREATE POLICY "Admins can update booking payments"
  ON public.booking_payments
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role)
  );

-- 6. updated_at trigger
CREATE TRIGGER trg_booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Indexes
CREATE INDEX idx_booking_payments_booking ON public.booking_payments (booking_id);
CREATE INDEX idx_booking_payments_status_created ON public.booking_payments (status, created_at DESC);