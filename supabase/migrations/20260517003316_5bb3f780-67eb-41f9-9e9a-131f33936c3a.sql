CREATE TABLE public.telegram_error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  api_method TEXT NOT NULL,
  http_status INTEGER,
  error_code TEXT,
  error_description TEXT,
  telegram_response JSONB,
  request_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view telegram error logs"
  ON public.telegram_error_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_telegram_error_logs_created_at
  ON public.telegram_error_logs (created_at DESC);

CREATE INDEX idx_telegram_error_logs_function
  ON public.telegram_error_logs (function_name, created_at DESC);