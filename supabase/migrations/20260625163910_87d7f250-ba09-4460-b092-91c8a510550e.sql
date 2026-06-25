-- Live classes feature for KormoShikkha edtech platform
-- 1. live_classes: scheduled sessions (admin-managed)
-- 2. live_class_rsvps: student RSVPs per class

CREATE TABLE public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL,
  title text NOT NULL,
  description text,
  host_name text NOT NULL DEFAULT 'TrendFlux Faculty',
  starts_at timestamptz NOT NULL,
  duration_min integer NOT NULL DEFAULT 60 CHECK (duration_min > 0 AND duration_min <= 600),
  meeting_url text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','cancelled')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_classes_course_slug ON public.live_classes(course_slug);
CREATE INDEX idx_live_classes_starts_at ON public.live_classes(starts_at);

GRANT SELECT ON public.live_classes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.live_classes TO authenticated;
GRANT ALL ON public.live_classes TO service_role;

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Anyone can browse the schedule (course discovery)
CREATE POLICY "Live classes are public" ON public.live_classes
  FOR SELECT USING (true);

-- Only admins can create/edit/delete
CREATE POLICY "Admins can insert live classes" ON public.live_classes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update live classes" ON public.live_classes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete live classes" ON public.live_classes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_live_classes_updated_at
  BEFORE UPDATE ON public.live_classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RSVPs --------------------------------------------------------------
CREATE TABLE public.live_class_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_opt_in boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, user_id)
);

CREATE INDEX idx_live_class_rsvps_class ON public.live_class_rsvps(class_id);
CREATE INDEX idx_live_class_rsvps_user ON public.live_class_rsvps(user_id);

GRANT SELECT, INSERT, DELETE ON public.live_class_rsvps TO authenticated;
GRANT ALL ON public.live_class_rsvps TO service_role;

ALTER TABLE public.live_class_rsvps ENABLE ROW LEVEL SECURITY;

-- Users can see their own RSVPs; admins can see all
CREATE POLICY "Users view their RSVPs" ON public.live_class_rsvps
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create their RSVPs" ON public.live_class_rsvps
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel their RSVPs" ON public.live_class_rsvps
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Aggregate count helper (security definer so anyone can see attendee counts)
CREATE OR REPLACE FUNCTION public.live_class_rsvp_count(_class_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.live_class_rsvps WHERE class_id = _class_id;
$$;

GRANT EXECUTE ON FUNCTION public.live_class_rsvp_count(uuid) TO anon, authenticated;