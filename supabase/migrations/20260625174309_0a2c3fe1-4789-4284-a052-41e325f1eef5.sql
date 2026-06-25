-- Extend role enum (idempotent)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';

-- voice_lectures
CREATE TABLE public.voice_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  source TEXT NOT NULL DEFAULT 'record' CHECK (source IN ('record','upload','synthesize')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','transcribing','ready','failed')),
  duration_sec INTEGER,
  audio_path TEXT,
  transcript TEXT,
  description TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_lectures TO authenticated;
GRANT ALL ON public.voice_lectures TO service_role;
ALTER TABLE public.voice_lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own lectures"
  ON public.voice_lectures FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_voice_lectures
  BEFORE UPDATE ON public.voice_lectures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX voice_lectures_user_created_idx
  ON public.voice_lectures (user_id, created_at DESC);

-- voice_lecture_materials
CREATE TABLE public.voice_lecture_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES public.voice_lectures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT,
  key_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
  flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lecture_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_lecture_materials TO authenticated;
GRANT ALL ON public.voice_lecture_materials TO service_role;
ALTER TABLE public.voice_lecture_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own lecture materials"
  ON public.voice_lecture_materials FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_voice_materials
  BEFORE UPDATE ON public.voice_lecture_materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- voice_profiles
CREATE TABLE public.voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'Non-binary' CHECK (gender IN ('Male','Female','Non-binary')),
  language TEXT NOT NULL DEFAULT 'Bangla & English',
  stability INTEGER NOT NULL DEFAULT 55 CHECK (stability BETWEEN 0 AND 100),
  similarity INTEGER NOT NULL DEFAULT 75 CHECK (similarity BETWEEN 0 AND 100),
  pitch INTEGER NOT NULL DEFAULT 0 CHECK (pitch BETWEEN -50 AND 50),
  sample_path TEXT,
  sample_filename TEXT,
  preview_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_profiles TO authenticated;
GRANT ALL ON public.voice_profiles TO service_role;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own voice profiles"
  ON public.voice_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Teachers and admins insert own voice profiles"
  ON public.voice_profiles FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (public.has_role(auth.uid(), 'admin'::app_role)
         OR public.has_role(auth.uid(), 'tutor'::app_role))
  );
CREATE POLICY "Update own voice profiles"
  ON public.voice_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own voice profiles"
  ON public.voice_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_voice_profiles
  BEFORE UPDATE ON public.voice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
