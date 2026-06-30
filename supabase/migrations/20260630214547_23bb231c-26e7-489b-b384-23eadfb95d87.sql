
ALTER TABLE public.growth_leads
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS owner_notes text;

ALTER TABLE public.growth_leads
  DROP CONSTRAINT IF EXISTS growth_leads_stage_check;
ALTER TABLE public.growth_leads
  ADD CONSTRAINT growth_leads_stage_check
  CHECK (stage IN ('new','contacted','qualified','proposal','won','lost'));

DROP POLICY IF EXISTS "Admins can update growth leads" ON public.growth_leads;
CREATE POLICY "Admins can update growth leads"
ON public.growth_leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
