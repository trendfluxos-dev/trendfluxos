ALTER TABLE public.strategy_bookings
  ADD COLUMN IF NOT EXISTS client_timezone text,
  ADD COLUMN IF NOT EXISTS organizer_timezone text NOT NULL DEFAULT 'Asia/Dhaka';