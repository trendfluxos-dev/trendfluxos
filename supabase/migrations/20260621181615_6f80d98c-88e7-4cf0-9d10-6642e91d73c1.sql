
CREATE TABLE public.telegram_test_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL CHECK (mode IN ('production','staging')),
  chat_id text,
  status integer,
  ok boolean NOT NULL DEFAULT false,
  description text,
  message_id bigint,
  tester_user_id uuid,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_test_logs_sent_at ON public.telegram_test_logs (sent_at DESC);
CREATE INDEX idx_telegram_test_logs_mode ON public.telegram_test_logs (mode);

GRANT SELECT ON public.telegram_test_logs TO authenticated;
GRANT ALL ON public.telegram_test_logs TO service_role;

ALTER TABLE public.telegram_test_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read telegram test logs"
  ON public.telegram_test_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
