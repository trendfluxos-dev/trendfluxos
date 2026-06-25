-- 1. CREATE TABLE
CREATE TABLE public.voice_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  vps_path text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  sample_size_bytes integer,
  language_hint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX voice_assets_user_idx ON public.voice_assets(user_id);
CREATE UNIQUE INDEX voice_assets_one_default_per_user
  ON public.voice_assets(user_id)
  WHERE is_default = true;

-- 2. GRANT (admin/founder via RLS; service_role for edge functions)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_assets TO authenticated;
GRANT ALL ON public.voice_assets TO service_role;

-- 3. ENABLE RLS
ALTER TABLE public.voice_assets ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES — founder-only (admin role) for Phase 2A.
--    Phase 2B will add per-user (auth.uid() = user_id) policies alongside these.
CREATE POLICY "Admins can view all voice assets"
  ON public.voice_assets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert voice assets"
  ON public.voice_assets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update voice assets"
  ON public.voice_assets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete voice assets"
  ON public.voice_assets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger (reuses existing public.set_updated_at)
CREATE TRIGGER voice_assets_set_updated_at
  BEFORE UPDATE ON public.voice_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();