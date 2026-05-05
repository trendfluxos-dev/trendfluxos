CREATE TABLE public.marriage_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marriage_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a marriage inquiry"
ON public.marriage_inquiries
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view marriage inquiries"
ON public.marriage_inquiries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));