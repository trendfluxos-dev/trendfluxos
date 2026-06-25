ALTER TABLE public.voice_profiles ADD COLUMN IF NOT EXISTS elevenlabs_voice_id text;
CREATE INDEX IF NOT EXISTS voice_profiles_eleven_idx ON public.voice_profiles(elevenlabs_voice_id);