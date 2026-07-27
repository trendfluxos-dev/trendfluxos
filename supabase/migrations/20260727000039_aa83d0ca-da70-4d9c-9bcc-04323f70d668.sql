DROP INDEX IF EXISTS public.facebook_posts_source_uniq;
ALTER TABLE public.facebook_posts
  ADD CONSTRAINT facebook_posts_source_uniq UNIQUE (source, source_id);