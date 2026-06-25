
-- 1. share_token on live_classes
ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

UPDATE public.live_classes
  SET share_token = encode(gen_random_bytes(12), 'hex')
  WHERE share_token IS NULL;

-- 2. class_materials
CREATE TABLE IF NOT EXISTS public.class_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pdf','image','video','doc','slide','link','audio')),
  title text NOT NULL,
  storage_path text,
  external_url text,
  mime text,
  size_bytes bigint,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_materials TO authenticated;
GRANT ALL ON public.class_materials TO service_role;
ALTER TABLE public.class_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher manages own materials"
  ON public.class_materials FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled students can read materials"
  ON public.class_materials FOR SELECT
  TO authenticated
  USING (public.has_confirmed_enrollment(auth.uid()));

CREATE TRIGGER class_materials_updated_at
  BEFORE UPDATE ON public.class_materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_class_materials_class ON public.class_materials(class_id, sort_order);

-- 3. teacher_notes
CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, teacher_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_notes TO authenticated;
GRANT ALL ON public.teacher_notes TO service_role;
ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher owns own notes"
  ON public.teacher_notes FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER teacher_notes_updated_at
  BEFORE UPDATE ON public.teacher_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. live_state
CREATE TABLE IF NOT EXISTS public.live_state (
  class_id uuid PRIMARY KEY REFERENCES public.live_classes(id) ON DELETE CASCADE,
  active_source_type text NOT NULL DEFAULT 'none'
    CHECK (active_source_type IN ('none','material','whiteboard','web','video')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_live_visible boolean NOT NULL DEFAULT false,
  whiteboard_snapshot jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_state TO authenticated;
GRANT ALL ON public.live_state TO service_role;
ALTER TABLE public.live_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class teacher manages live_state"
  ON public.live_state FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.live_classes c WHERE c.id = class_id AND c.created_by = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.live_classes c WHERE c.id = class_id AND c.created_by = auth.uid())
  );

CREATE TRIGGER live_state_updated_at
  BEFORE UPDATE ON public.live_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NOTE: live_state intentionally NOT in supabase_realtime publication.
-- Students receive updates via broadcast channel "class:<id>" → live_changed.

-- 5. RPC: token-based no-account join
CREATE OR REPLACE FUNCTION public.get_class_by_share_token(_token text)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  starts_at timestamptz,
  status text,
  active_source_type text,
  payload jsonb,
  is_live_visible boolean,
  whiteboard_snapshot jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.title, c.description, c.starts_at, c.status,
         COALESCE(s.active_source_type, 'none'),
         COALESCE(s.payload, '{}'::jsonb),
         COALESCE(s.is_live_visible, false),
         s.whiteboard_snapshot
  FROM public.live_classes c
  LEFT JOIN public.live_state s ON s.class_id = c.id
  WHERE c.share_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_class_by_share_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_class_by_share_token(text) TO anon, authenticated;
