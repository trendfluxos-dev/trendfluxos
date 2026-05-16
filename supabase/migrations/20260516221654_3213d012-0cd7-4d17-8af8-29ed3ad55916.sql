
CREATE TABLE public.enrollment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.module_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_index INT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'approved', 'rejected', 'unlocked')),
  message TEXT,
  actor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_user_created ON public.enrollment_events(user_id, created_at DESC);

ALTER TABLE public.enrollment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own events"
  ON public.enrollment_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all events"
  ON public.enrollment_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
