-- Run once in phpMyAdmin on aurakare1_aurakare_forms.
-- This keeps payload_json as an audit copy and adds clean export columns.
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS news_updates TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS work_volume VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS requirements TEXT NULL,
  ADD COLUMN IF NOT EXISTS work_frequency VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS start_date DATE NULL,
  ADD COLUMN IF NOT EXISTS outsourcing_stage VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS position VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS state VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS city VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS message TEXT NULL,
  ADD COLUMN IF NOT EXISTS country_region VARCHAR(255) NULL;

UPDATE submissions
SET
  news_updates = IFNULL(JSON_EXTRACT(payload_json, '$."news-updates"') + 0, 0),
  phone = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.phone')), ''),
  work_volume = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$."work-volume"')), ''),
  requirements = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.requirements')), ''),
  work_frequency = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$."work-frequency"')), ''),
  start_date = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$."start-date"')), ''),
  outsourcing_stage = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$."outsourcing-stage"')), ''),
  position = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.position')), ''),
  state = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.state')), ''),
  city = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.city')), ''),
  message = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.message')), ''),
  country_region = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$."country-region"')), '');

CREATE INDEX IF NOT EXISTS idx_submissions_inquiry_type ON submissions (inquiry_type);
