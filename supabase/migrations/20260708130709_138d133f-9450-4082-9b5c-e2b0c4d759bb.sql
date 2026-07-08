
CREATE TABLE public.strategy_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  goal text,
  session_type text NOT NULL CHECK (session_type IN ('video','audio')),
  requested_slot_iso timestamptz NOT NULL,
  confirmed_slot_iso timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  gcal_event_id text,
  meet_url text,
  confirm_token text NOT NULL DEFAULT replace(gen_random_uuid()::text,'-',''),
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategy_bookings TO authenticated;
GRANT ALL ON public.strategy_bookings TO service_role;

ALTER TABLE public.strategy_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage strategy bookings"
  ON public.strategy_bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER strategy_bookings_updated_at
  BEFORE UPDATE ON public.strategy_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX strategy_bookings_status_idx ON public.strategy_bookings(status);
CREATE INDEX strategy_bookings_confirm_token_idx ON public.strategy_bookings(confirm_token);
