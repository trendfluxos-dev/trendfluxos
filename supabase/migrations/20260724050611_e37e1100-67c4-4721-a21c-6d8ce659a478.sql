
-- 1) Restrict voice_assets shared-read policy to owner or admin.
DROP POLICY IF EXISTS "Teachers and tutors can view voice assets" ON public.voice_assets;

CREATE POLICY "Users can view their own voice assets"
ON public.voice_assets
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Pin search_path on pgmq wrapper functions (mutable search_path warning).
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
