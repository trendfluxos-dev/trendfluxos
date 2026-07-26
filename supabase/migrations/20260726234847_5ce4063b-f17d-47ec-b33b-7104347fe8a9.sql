CREATE TABLE public.facebook_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  message text NOT NULL,
  link_url text,
  image_url text,
  scheduled_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'queued',
  attempts integer NOT NULL DEFAULT 0,
  fb_post_id text,
  last_error text,
  last_error_code text,
  published_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT facebook_posts_status_chk CHECK (status IN ('queued','publishing','published','failed','cancelled'))
);

CREATE UNIQUE INDEX facebook_posts_source_uniq
  ON public.facebook_posts (source, source_id)
  WHERE source_id IS NOT NULL;

CREATE INDEX facebook_posts_due_idx
  ON public.facebook_posts (status, scheduled_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.facebook_posts TO authenticated;
GRANT ALL ON public.facebook_posts TO service_role;

ALTER TABLE public.facebook_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and editors can read the facebook queue"
  ON public.facebook_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can queue facebook posts"
  ON public.facebook_posts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can update the facebook queue"
  ON public.facebook_posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete facebook queue items"
  ON public.facebook_posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER facebook_posts_set_updated_at
  BEFORE UPDATE ON public.facebook_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();