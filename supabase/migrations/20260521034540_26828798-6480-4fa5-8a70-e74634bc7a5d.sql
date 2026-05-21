
CREATE TABLE public.web_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  rating TEXT,
  navigation_type TEXT,
  path TEXT,
  user_agent TEXT,
  release TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_web_vitals_metric_created ON public.web_vitals(metric, created_at DESC);
CREATE INDEX idx_web_vitals_created ON public.web_vitals(created_at DESC);

ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert web vitals"
  ON public.web_vitals FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    metric IN ('LCP','INP','CLS','FCP','TTFB')
    AND value >= 0
    AND value < 1000000
    AND char_length(coalesce(path,'')) <= 500
    AND char_length(coalesce(user_agent,'')) <= 500
    AND char_length(coalesce(release,'')) <= 100
  );

CREATE POLICY "Admins can view web vitals"
  ON public.web_vitals FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete web vitals"
  ON public.web_vitals FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
