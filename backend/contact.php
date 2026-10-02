<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed.']);
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '', true);
if (!is_array($payload)) {
    respond(400, ['error' => 'Invalid JSON request.']);
}

$inquiryType = trim((string)($payload['inquiry_type'] ?? ''));
$name = trim((string)($payload['name'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
$formPayload = $payload['payload_json'] ?? null;

$allowedInquiryTypes = ['request-a-meeting', 'careers', 'general-inquiries'];
if (!in_array($inquiryType, $allowedInquiryTypes, true)) {
    respond(422, ['error' => 'Invalid enquiry type.']);
}
if ($name === '' || strlen($name) > 255) {
    respond(422, ['error' => 'Please provide a valid name.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 320) {
    respond(422, ['error' => 'Please provide a valid email address.']);
}
if (!is_array($formPayload)) {
    respond(422, ['error' => 'Invalid form payload.']);
}
if (strlen(json_encode($formPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) > 12000) {
    respond(422, ['error' => 'The submitted information is too large.']);
}

$allowedFields = [
    'name', 'email', 'news-updates', 'phone', 'work-volume', 'requirements',
    'work-frequency', 'start-date', 'outsourcing-stage', 'position', 'state',
    'city', 'message', 'country-region'
];
foreach (array_keys($formPayload) as $field) {
    if (!in_array((string)$field, $allowedFields, true)) {
        respond(422, ['error' => 'The form contains an unsupported field.']);
    }
}
if (($formPayload['name'] ?? null) !== $name || ($formPayload['email'] ?? null) !== $email) {
    respond(422, ['error' => 'Form identity fields do not match.']);
}
if (!isset($formPayload['news-updates']) || !is_bool($formPayload['news-updates'])) {
    respond(422, ['error' => 'Invalid newsletter preference.']);
}
foreach (['message', 'requirements'] as $field) {
    if (strlen((string)($formPayload[$field] ?? '')) > 5000) {
        respond(422, ['error' => 'One of the form fields is too long.']);
    }
}
foreach (['phone', 'work-volume', 'position', 'state', 'city', 'country-region'] as $field) {
    if (strlen((string)($formPayload[$field] ?? '')) > 255) {
        respond(422, ['error' => 'One of the form fields is too long.']);
    }
}

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASSWORD,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $pdo->beginTransaction();
    $fingerprint = hash('sha256', strtolower($email));
    $limit = $pdo->prepare(
        'SELECT window_started_at, submission_count
         FROM submission_rate_limits
         WHERE email_fingerprint = ?
         FOR UPDATE'
    );
    $limit->execute([$fingerprint]);
    $rate = $limit->fetch();
    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $windowStart = $rate ? new DateTimeImmutable($rate['window_started_at'], new DateTimeZone('UTC')) : null;
    $count = ($windowStart && $windowStart > $now->modify('-15 minutes')) ? ((int)$rate['submission_count'] + 1) : 1;

    if ($count > 3) {
        $pdo->rollBack();
        respond(429, ['error' => 'Enquiry limit reached. Please try again later.']);
    }

    if ($rate) {
        $update = $pdo->prepare(
            'UPDATE submission_rate_limits
             SET window_started_at = ?, submission_count = ?
             WHERE email_fingerprint = ?'
        );
        $update->execute([
            ($windowStart && $windowStart > $now->modify('-15 minutes')) ? $rate['window_started_at'] : $now->format('Y-m-d H:i:s'),
            $count,
            $fingerprint,
        ]);
    } else {
        $insertLimit = $pdo->prepare(
            'INSERT INTO submission_rate_limits (email_fingerprint, window_started_at, submission_count)
             VALUES (?, ?, ?)'
        );
        $insertLimit->execute([$fingerprint, $now->format('Y-m-d H:i:s'), 1]);
    }

    $insert = $pdo->prepare(
        'INSERT INTO submissions (inquiry_type, name, email, payload_json)
         VALUES (?, ?, ?, ?)'
    );
    $jsonPayload = json_encode($formPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $insert->execute([$inquiryType, $name, $email, $jsonPayload]);
    $pdo->commit();

    sendNotification($inquiryType, $name, $email, $formPayload);
    respond(201, ['success' => true, 'message' => 'Your enquiry has been received.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Website form submission failed: ' . $error->getMessage());
    respond(500, ['error' => 'Unable to save your enquiry right now. Please try again later.']);
}

function sendNotification(string $inquiryType, string $name, string $email, array $payload): void
{
    $subject = 'New AuraKare website enquiry: ' . $inquiryType;
    $lines = [
        'A new enquiry was submitted on aurakaresollutions.com.',
        '',
        'Type: ' . $inquiryType,
        'Name: ' . $name,
        'Email: ' . $email,
        '',
        'Submitted fields:',
    ];
    foreach ($payload as $key => $value) {
        if ($key === 'email' || $key === 'name') {
            continue;
        }
        $lines[] = $key . ': ' . (is_bool($value) ? ($value ? 'Yes' : 'No') : (string)$value);
    }
    $headers = [
        'From: ' . MAIL_FROM,
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
    ];
    @mail(MAIL_TO, $subject, implode("\n", $lines), implode("\r\n", $headers));
}

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
