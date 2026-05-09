DROP POLICY IF EXISTS "Anyone can submit a demo request" ON public.enterprise_demo_requests;

CREATE POLICY "Anyone can submit a valid demo request"
  ON public.enterprise_demo_requests
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 2 AND 100
    AND char_length(btrim(email)) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(btrim(company)) BETWEEN 2 AND 150
    AND char_length(btrim(role)) BETWEEN 2 AND 80
    AND team_size IN ('1-10', '11-50', '51-200', '200+')
    AND (message IS NULL OR char_length(message) <= 1000)
    AND status = 'new'
    AND source IN ('enterprise_page', 'client_login', 'home_hero', 'footer', 'navbar')
  );