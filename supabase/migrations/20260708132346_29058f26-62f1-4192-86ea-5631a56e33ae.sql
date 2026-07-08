ALTER TABLE public.strategy_bookings
  ADD COLUMN IF NOT EXISTS reminder_morning_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_15min_sent_at   timestamptz;

CREATE INDEX IF NOT EXISTS idx_strategy_bookings_status_slot
  ON public.strategy_bookings (status, confirmed_slot_iso)
  WHERE status = 'confirmed';