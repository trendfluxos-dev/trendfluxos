ALTER TABLE public.module_enrollments REPLICA IDENTITY FULL;
ALTER TABLE public.enrollment_events REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.module_enrollments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_events; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;