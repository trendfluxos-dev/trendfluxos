CREATE TABLE IF NOT EXISTS public.voice_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engine text NOT NULL,
  voice_id text NOT NULL,
  audio_path text NOT NULL,
  char_count integer NOT NULL DEFAULT 0,
  byte_size integer NOT NULL DEFAULT 0,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS voice_cache_user_idx ON public.voice_cache(user_id);
CREATE INDEX IF NOT EXISTS voice_cache_last_used_idx ON public.voice_cache(last_used_at DESC);
GRANT SELECT ON public.voice_cache TO authenticated;
GRANT ALL ON public.voice_cache TO service_role;
ALTER TABLE public.voice_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own voice cache"
  ON public.voice_cache FOR SELECT TO authenticated
  USING (auth.uid() = user_id);