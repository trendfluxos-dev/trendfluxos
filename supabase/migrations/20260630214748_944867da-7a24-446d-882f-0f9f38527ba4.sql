
CREATE TABLE IF NOT EXISTS public.creator_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  content_type text NOT NULL DEFAULT 'post'
    CHECK (content_type IN ('post','reel','email','lesson','thread','newsletter')),
  channel text NOT NULL DEFAULT 'instagram'
    CHECK (channel IN ('instagram','facebook','linkedin','x','youtube','email','edtech','blog')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','queued','published','failed')),
  asset_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  n8n_pushed boolean NOT NULL DEFAULT false,
  n8n_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_content TO authenticated;
GRANT ALL ON public.creator_content TO service_role;

ALTER TABLE public.creator_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or admin can read creator content"
ON public.creator_content
FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owner can insert their own creator content"
ON public.creator_content
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'editor'::app_role)
    OR public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'tutor'::app_role)
  )
);

CREATE POLICY "Owner or admin can update creator content"
ON public.creator_content
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owner or admin can delete creator content"
ON public.creator_content
FOR DELETE
TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER creator_content_set_updated_at
BEFORE UPDATE ON public.creator_content
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
