DROP POLICY IF EXISTS "Anyone can submit a marriage inquiry" ON public.marriage_inquiries;
CREATE POLICY "Anyone can submit a marriage inquiry"
ON public.marriage_inquiries
FOR INSERT
WITH CHECK (
  char_length(btrim(name)) BETWEEN 2 AND 120
  AND char_length(btrim(country_code)) BETWEEN 1 AND 10
  AND char_length(btrim(whatsapp)) BETWEEN 6 AND 30
  AND COALESCE(array_length(dress_colors, 1), 0) <= 10
);

DROP POLICY IF EXISTS "Anyone can submit a request" ON public.luxe_veil_requests;
CREATE POLICY "Anyone can submit a request"
ON public.luxe_veil_requests
FOR INSERT
WITH CHECK (
  char_length(btrim(name)) BETWEEN 2 AND 120
  AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  AND char_length(btrim(email)) <= 255
  AND char_length(message) <= 2000
  AND (reference IS NULL OR char_length(reference) <= 200)
);