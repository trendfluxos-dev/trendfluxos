
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_certificates_verification_id ON public.certificates(verification_id);

GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- No public client access. All reads/writes flow through edge functions
-- (verify-certificate, issue-certificate) using the service role.
CREATE POLICY "Admins can view certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
