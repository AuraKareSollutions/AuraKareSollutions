-- Run after database-schema.sql in Supabase SQL Editor.
-- Every test runs as anon inside a transaction that is rolled back.
BEGIN;
SET LOCAL ROLE anon;

DO $security_tests$
DECLARE
  valid_payload JSONB := jsonb_build_object(
    'name', 'Security Test',
    'email', 'security-test@example.com',
    'news-updates', false,
    'message', 'Temporary test submission; transaction will roll back.'
  );
BEGIN
  INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
  VALUES (
    'general-inquiries',
    'Security Test',
    'security-test@example.com',
    valid_payload
  );
  RAISE NOTICE 'PASS: valid anonymous form submission is allowed';

  BEGIN
    INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
    VALUES (
      'unexpected-type',
      'Security Test',
      'security-test@example.com',
      valid_payload
    );
    RAISE EXCEPTION 'SECURITY TEST FAILED: unexpected inquiry type was accepted';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      RAISE NOTICE 'PASS: unexpected inquiry type is rejected';
  END;

  BEGIN
    INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
    VALUES (
      'general-inquiries',
      'Security Test',
      'security-test@example.com',
      valid_payload || jsonb_build_object('admin', true)
    );
    RAISE EXCEPTION 'SECURITY TEST FAILED: unexpected payload field was accepted';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      RAISE NOTICE 'PASS: unexpected payload fields are rejected';
  END;

  BEGIN
    INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
    VALUES (
      'general-inquiries',
      'Security Test',
      'not-an-email',
      valid_payload || jsonb_build_object('email', 'not-an-email')
    );
    RAISE EXCEPTION 'SECURITY TEST FAILED: malformed email was accepted';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      RAISE NOTICE 'PASS: malformed email is rejected';
  END;

  BEGIN
    INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
    VALUES (
      'general-inquiries',
      'Security Test',
      'security-test@example.com',
      valid_payload || jsonb_build_object('message', repeat('x', 12001))
    );
    RAISE EXCEPTION 'SECURITY TEST FAILED: oversized payload was accepted';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      RAISE NOTICE 'PASS: oversized payload is rejected';
  END;

  BEGIN
    PERFORM 1 FROM public.submissions LIMIT 1;
    RAISE EXCEPTION 'SECURITY TEST FAILED: anon can read submissions';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot read submissions';
  END;

  BEGIN
    UPDATE public.submissions SET name = 'Changed' WHERE false;
    RAISE EXCEPTION 'SECURITY TEST FAILED: anon can update submissions';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot update submissions';
  END;

  BEGIN
    DELETE FROM public.submissions WHERE false;
    RAISE EXCEPTION 'SECURITY TEST FAILED: anon can delete submissions';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot delete submissions';
  END;

  INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
  VALUES ('general-inquiries', 'Security Test', 'security-test@example.com', valid_payload);

  INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
  VALUES ('general-inquiries', 'Security Test', 'security-test@example.com', valid_payload);

  BEGIN
    INSERT INTO public.submissions (inquiry_type, name, email, payload_json)
    VALUES ('general-inquiries', 'Security Test', 'security-test@example.com', valid_payload);
    RAISE EXCEPTION 'SECURITY TEST FAILED: fourth enquiry in the window was accepted'
      USING ERRCODE = 'P0002';
  EXCEPTION
    WHEN SQLSTATE 'P0001' THEN
      RAISE NOTICE 'PASS: fourth submission for one email in 15 minutes is rejected';
  END;
END
$security_tests$;

ROLLBACK;
