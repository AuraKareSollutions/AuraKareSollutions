CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  inquiry_type VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  news_updates TINYINT(1) NOT NULL DEFAULT 0,
  phone VARCHAR(255) NULL,
  work_volume VARCHAR(255) NULL,
  requirements TEXT NULL,
  work_frequency VARCHAR(255) NULL,
  start_date DATE NULL,
  outsourcing_stage VARCHAR(255) NULL,
  position VARCHAR(255) NULL,
  state VARCHAR(255) NULL,
  city VARCHAR(255) NULL,
  message TEXT NULL,
  country_region VARCHAR(255) NULL,
  support_type VARCHAR(64) NULL,
  payload_json JSON NOT NULL,
  INDEX idx_submissions_submitted_at (submitted_at),
  INDEX idx_submissions_email (email),
  INDEX idx_submissions_inquiry_type (inquiry_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submission_rate_limits (
  email_fingerprint CHAR(64) NOT NULL PRIMARY KEY,
  window_started_at TIMESTAMP NOT NULL,
  submission_count INT UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
