CREATE TABLE IF NOT EXISTS public.submissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  inquiry_type VARCHAR(64) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(320),
  payload_json JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at
  ON public.submissions (submitted_at);

CREATE INDEX IF NOT EXISTS idx_submissions_email
  ON public.submissions (email);

CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  email_fingerprint TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  submission_count INTEGER NOT NULL
);

ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.submission_rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_submission_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  email_key TEXT := md5(lower(btrim(NEW.email)));
  current_count INTEGER;
BEGIN
  INSERT INTO public.submission_rate_limits (
    email_fingerprint,
    window_started_at,
    submission_count
  )
  VALUES (email_key, statement_timestamp(), 1)
  ON CONFLICT (email_fingerprint) DO UPDATE
  SET window_started_at = CASE
        WHEN public.submission_rate_limits.window_started_at <= statement_timestamp() - INTERVAL '15 minutes'
          THEN statement_timestamp()
        ELSE public.submission_rate_limits.window_started_at
      END,
      submission_count = CASE
        WHEN public.submission_rate_limits.window_started_at <= statement_timestamp() - INTERVAL '15 minutes'
          THEN 1
        ELSE public.submission_rate_limits.submission_count + 1
      END
  RETURNING submission_count INTO current_count;

  IF current_count > 3 THEN
    RAISE EXCEPTION 'Enquiry limit reached. Please try again later.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_submission_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS limit_submission_rate ON public.submissions;
CREATE TRIGGER limit_submission_rate
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_submission_rate_limit();

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.submissions FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.submissions TO anon;
REVOKE ALL ON SEQUENCE public.submissions_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SEQUENCE public.submissions_id_seq TO anon;

DROP POLICY IF EXISTS "Allow website submissions" ON public.submissions;

CREATE POLICY "Allow website submissions"
  ON public.submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    inquiry_type IN ('request-a-meeting', 'careers', 'general-inquiries')
    AND name IS NOT NULL
    AND char_length(btrim(name)) BETWEEN 1 AND 255
    AND email IS NOT NULL
    AND char_length(email) <= 320
    AND email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
    AND payload_json IS NOT NULL
    AND jsonb_typeof(payload_json) = 'object'
    AND pg_column_size(payload_json) <= 12000
    AND (payload_json - ARRAY[
      'name', 'email', 'news-updates', 'phone', 'work-volume',
      'requirements', 'work-frequency', 'start-date', 'outsourcing-stage',
      'position', 'state', 'city', 'message', 'country-region'
    ]::TEXT[]) = '{}'::JSONB
    AND payload_json ->> 'name' = name
    AND payload_json ->> 'email' = email
    AND jsonb_typeof(payload_json -> 'news-updates') = 'boolean'
    AND char_length(COALESCE(payload_json ->> 'message', '')) <= 5000
    AND char_length(COALESCE(payload_json ->> 'requirements', '')) <= 5000
    AND char_length(COALESCE(payload_json ->> 'phone', '')) <= 64
    AND char_length(COALESCE(payload_json ->> 'work-volume', '')) <= 255
    AND char_length(COALESCE(payload_json ->> 'position', '')) <= 255
    AND char_length(COALESCE(payload_json ->> 'state', '')) <= 255
    AND char_length(COALESCE(payload_json ->> 'city', '')) <= 255
    AND char_length(COALESCE(payload_json ->> 'country-region', '')) <= 255
  );
