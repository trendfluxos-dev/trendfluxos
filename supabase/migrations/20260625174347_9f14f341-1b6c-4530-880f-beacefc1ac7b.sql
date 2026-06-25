-- voice-samples: owner-only
CREATE POLICY "Users read own voice samples"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own voice samples"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own voice samples"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own voice samples"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'voice-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

-- voice-lectures: owner-only
CREATE POLICY "Users read own lecture audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-lectures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own lecture audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-lectures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own lecture audio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'voice-lectures' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own lecture audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'voice-lectures' AND auth.uid()::text = (storage.foldername(name))[1]);
