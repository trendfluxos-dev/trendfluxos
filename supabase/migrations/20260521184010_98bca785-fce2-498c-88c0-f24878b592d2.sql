ALTER POLICY "Anyone can insert client errors" ON public.client_errors
  WITH CHECK (
    char_length(message) <= 2000
    AND char_length(COALESCE(stack, '')) <= 10000
    AND char_length(COALESCE(source, '')) <= 500
    AND char_length(COALESCE(url, '')) <= 2000
    AND char_length(COALESCE(user_agent, '')) <= 500
    AND char_length(COALESCE(release, '')) <= 100
    AND (severity IS NULL OR severity = ANY (ARRAY['error','warn','info']))
  );