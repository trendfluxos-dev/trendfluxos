
ALTER TABLE public.module_enrollments
  ADD COLUMN IF NOT EXISTS sender_phone TEXT,
  ADD COLUMN IF NOT EXISTS submission_note TEXT,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decided_via TEXT;

CREATE POLICY "Users insert own pending enrollment"
  ON public.module_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND module_index BETWEEN 1 AND 8
    AND amount_bdt = 2000
    AND char_length(coalesce(bkash_trx_id,'')) BETWEEN 4 AND 40
    AND char_length(coalesce(sender_phone,'')) BETWEEN 6 AND 20
  );
