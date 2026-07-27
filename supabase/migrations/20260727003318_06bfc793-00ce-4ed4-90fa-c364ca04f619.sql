CREATE TABLE public.inbound_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'hostinger',
  provider_message_id text,
  from_name text,
  from_email text NOT NULL,
  to_email text,
  cc_emails text[],
  reply_to text,
  subject text,
  text_body text,
  html_body text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  spam_score numeric,
  status text NOT NULL DEFAULT 'received',
  error_message text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inbound_emails_status_check CHECK (status IN ('received','processing','processed','failed','spam'))
);

CREATE UNIQUE INDEX inbound_emails_provider_message_uidx
  ON public.inbound_emails (provider, provider_message_id)
  WHERE provider_message_id IS NOT NULL;

CREATE INDEX inbound_emails_received_at_idx ON public.inbound_emails (received_at DESC);
CREATE INDEX inbound_emails_status_idx ON public.inbound_emails (status);

GRANT SELECT, UPDATE, DELETE ON public.inbound_emails TO authenticated;
GRANT ALL ON public.inbound_emails TO service_role;

ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read inbound emails"
  ON public.inbound_emails FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update inbound emails"
  ON public.inbound_emails FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete inbound emails"
  ON public.inbound_emails FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER inbound_emails_set_updated_at
  BEFORE UPDATE ON public.inbound_emails
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();