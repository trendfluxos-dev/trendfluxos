
CREATE TABLE public.luxe_veil_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  reference TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.luxe_veil_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
ON public.luxe_veil_requests
FOR INSERT
WITH CHECK (true);
