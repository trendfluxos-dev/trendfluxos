-- Idempotency: only one approved/rejected row per enrollment
CREATE UNIQUE INDEX IF NOT EXISTS enrollment_events_decision_unique
  ON public.enrollment_events (enrollment_id, event_type)
  WHERE event_type IN ('approved', 'rejected');

-- Idempotency: only one unlocked event per (user, module)
CREATE UNIQUE INDEX IF NOT EXISTS enrollment_events_unlocked_unique
  ON public.enrollment_events (user_id, module_index)
  WHERE event_type = 'unlocked';

-- Faster admin dashboard timeline lookups
CREATE INDEX IF NOT EXISTS enrollment_events_user_created_idx
  ON public.enrollment_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS module_enrollments_user_module_idx
  ON public.module_enrollments (user_id, module_index, status);