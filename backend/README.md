# MilesWeb PHP backend

`contact.php` accepts same-origin JSON POST requests from the contact and guide-download forms, validates the fields, stores submissions in MySQL, applies a three-submissions-per-email 15-minute rate limit, and emails notifications to `hello@aurakaresollutions.com`.

The deployment workflow generates `config.php` from GitHub Actions secrets. Do not commit real database credentials.
