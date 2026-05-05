
ALTER TABLE public.luxe_veil_requests
  ADD CONSTRAINT luxe_veil_requests_lengths CHECK (
    char_length(name) BETWEEN 2 AND 80
    AND char_length(email) BETWEEN 5 AND 160
    AND (reference IS NULL OR char_length(reference) <= 120)
    AND char_length(message) BETWEEN 10 AND 800
  );
