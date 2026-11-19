<?php
/**
 * Modera Group — contact form handler (self-hosted, no third-party processors).
 *
 * - Accepts JSON POST from the website's contact form (same origin only).
 * - Validates and minimises input; honeypot + time trap + per-IP rate limit (IP is only
 *   kept as a salted hash, for one hour).
 * - Stores each enquiry with a consent record OUTSIDE the public web root, and deletes
 *   enquiries older than the retention period (GDPR storage limitation).
 * - Emails the enquiry to the configured recipients (Reply-To = visitor).
 */
declare(strict_types=1);

const RECIPIENTS = __RECIPIENTS__;
const RETENTION_DAYS = __RETENTION_DAYS__;
const MAIL_FROM = '__MAIL_FROM__';
const MAIL_FROM_NAME = 'Modera Group';
const AUTOREPLY_TO = '__AUTOREPLY_TO__';
const SEND_CONFIRMATION = __SEND_CONFIRMATION__;
const RECAPTCHA_SECRET = __RECAPTCHA_SECRET__;
const RECAPTCHA_ACTION = '__RECAPTCHA_ACTION__';
const RECAPTCHA_MIN_SCORE = __RECAPTCHA_MIN_SCORE__;
const SITE_URL = 'https://modera-group.com';
const SITE_PHONE = '__PHONE__';
const SITE_PHONE_DISPLAY = '__PHONE_DISPLAY__';
define('MODERA_MAIL', true);
require __DIR__ . '/contact-mail.php';
const ALLOWED_HOSTS = ['modera-group.com', 'www.modera-group.com'];
const MAX_PER_HOUR = 5;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out(int $code, array $data): void { http_response_code($code); echo json_encode($data); exit; }
function clean(string $v, int $max): string {
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '');
    return mb_substr($v, 0, $max);
}

/**
 * Storage limitation, record by record: drop enquiries older than the retention period.
 * Marketing opt-ins live in a separate list (kept until withdrawn), so purging enquiries
 * never destroys proof of consent.
 */
function purge(string $store): int
{
    $cutoff = time() - RETENTION_DAYS * 86400;
    $removed = 0;
    foreach (glob("$store/leads-*.jsonl") ?: [] as $f) {
        $keep = [];
        foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $r = json_decode($line, true);
            if (is_array($r) && strtotime($r['received'] ?? '') >= $cutoff) $keep[] = $line; else $removed++;
        }
        if ($keep) file_put_contents($f, implode("\n", $keep) . "\n", LOCK_EX); else @unlink($f);
    }
    return $removed;
}
/**
 * Google reCAPTCHA v3 verification (score-based).
 * rejected  → low score, wrong action/host or invalid token: the enquiry is refused.
 * passed    → human-like score.
 * no-token / unavailable / misconfigured / disabled → accepted but flagged in the
 *   enquiry (visitors who block Google can still reach us; honeypot, time trap and
 *   rate limit still apply).
 */
function recaptcha_check(string $token): array
{
    if (RECAPTCHA_SECRET === '') return ['status' => 'disabled'];
    if ($token === '') return ['status' => 'no-token'];
    $body = http_build_query(['secret' => RECAPTCHA_SECRET, 'response' => $token]);
    $raw = false;
    if (function_exists('curl_init')) {
        $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6]);
        $raw = curl_exec($ch);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => $body, 'timeout' => 6]]);
        $raw = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $ctx);
    }
    $r = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($r)) return ['status' => 'unavailable'];
    $errors = $r['error-codes'] ?? [];
    if (in_array('invalid-input-secret', $errors, true) || in_array('missing-input-secret', $errors, true)) return ['status' => 'misconfigured', 'errors' => $errors];
    $score = isset($r['score']) ? (float) $r['score'] : null;
    $host = strtolower((string) ($r['hostname'] ?? ''));
    $ok = !empty($r['success'])
        && ($r['action'] ?? RECAPTCHA_ACTION) === RECAPTCHA_ACTION
        && ($host === '' || in_array($host, ALLOWED_HOSTS, true))
        && ($score === null || $score >= RECAPTCHA_MIN_SCORE);
    return ['status' => $ok ? 'passed' : 'rejected', 'score' => $score, 'action' => $r['action'] ?? null, 'hostname' => $host, 'errors' => $errors];
}

function store_dir(): string
{
    $home = dirname(__DIR__);
    return is_writable($home) ? $home . '/.modera-leads' : __DIR__ . '/.deploy/leads';
}

// Scheduled maintenance (cPanel cron, monthly): php /home/<user>/modera-group.com/contact.php --purge
if (PHP_SAPI === 'cli') {
    if (($argv[1] ?? '') === '--purge') { echo 'Purged ' . purge(store_dir()) . " expired enquiries\n"; exit(0); }
    exit(1);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// Same-origin check (CSRF protection for a cookieless endpoint).
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_HOST);
if (!$origin || !in_array(strtolower($origin), ALLOWED_HOSTS, true)) out(403, ['ok' => false, 'error' => 'origin']);

$raw = file_get_contents('php://input', false, null, 0, 20000);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) out(400, ['ok' => false, 'error' => 'payload']);

// Bots: honeypot filled or form submitted too fast (< 3 s). Pretend success.
if (!empty($in['_honey']) || (isset($in['_t']) && (time() * 1000 - (int) $in['_t']) < 3000)) out(200, ['ok' => true]);

$store = store_dir();
@mkdir($store, 0700, true);
if (!is_file("$store/.htaccess")) @file_put_contents("$store/.htaccess", "Require all denied\nDeny from all\n");

// Rate limit using a salted, hourly-rotating hash of the IP (no raw IP stored).
$saltFile = "$store/.salt";
if (!is_file($saltFile)) file_put_contents($saltFile, bin2hex(random_bytes(16)));
$hour = gmdate('YmdH');
$ipHash = hash('sha256', trim((string) file_get_contents($saltFile)) . ($_SERVER['REMOTE_ADDR'] ?? '') . $hour);
$rlFile = "$store/rate-$hour.json";
$rl = is_file($rlFile) ? (json_decode((string) file_get_contents($rlFile), true) ?: []) : [];
if (($rl[$ipHash] ?? 0) >= MAX_PER_HOUR) out(429, ['ok' => false, 'error' => 'rate']);
$rl[$ipHash] = ($rl[$ipHash] ?? 0) + 1;
file_put_contents($rlFile, json_encode($rl), LOCK_EX);
foreach (glob("$store/rate-*.json") ?: [] as $f) { if ($f !== $rlFile) @unlink($f); }

$lead = [
    'name'         => clean((string) ($in['name'] ?? ''), 120),
    'email'        => clean((string) ($in['email'] ?? ''), 160),
    'phone'        => clean((string) ($in['phone'] ?? ''), 40),
    'country'      => clean((string) ($in['country'] ?? ''), 80),
    'project_type' => clean((string) ($in['project_type'] ?? ''), 80),
    'service'      => clean((string) ($in['service'] ?? ''), 80),
    'budget'       => clean((string) ($in['budget'] ?? ''), 40),
    'stage'        => clean((string) ($in['stage'] ?? ''), 80),
    'message'      => clean((string) ($in['message'] ?? ''), 4000),
    'language'     => preg_replace('/[^a-z]/', '', (string) ($in['language'] ?? '')),
];
// Option labels in the visitor's language (used only in their confirmation email).
$labels = [];
foreach (['project_type', 'service', 'budget', 'stage'] as $k) { $labels[$k] = clean((string) ($in[$k . '_label'] ?? $lead[$k]), 80); }
if ($lead['name'] === '' || !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'fields']);
if (($in['consent'] ?? '') !== 'yes') out(422, ['ok' => false, 'error' => 'consent']);

$spam = recaptcha_check(clean((string) ($in['recaptcha_token'] ?? ''), 4000));
if ($spam['status'] === 'rejected') out(422, ['ok' => false, 'error' => 'spam']);

$record = $lead + [
    'spam_check' => $spam,
    'id'         => bin2hex(random_bytes(8)),
    'received'   => gmdate('c'),
    'consent'    => ['processing' => true, 'marketing' => ($in['marketing'] ?? '') === 'yes', 'notice_version' => clean((string) ($in['notice_version'] ?? ''), 20), 'page' => clean((string) ($in['page'] ?? ''), 200)],
];
// Send the branded notification to the team, then an optional confirmation to the client.
[$subject, $html, $text] = team_email($record);
$sent = [];
foreach (RECIPIENTS as $to) { $sent[$to] = send_mail($to, $subject, $html, $text, $record['email'], $record['name']); }
$record['mail'] = ['team' => $sent, 'confirmation' => null];
if (SEND_CONFIRMATION) {
    [$cs, $ch, $ct] = client_email($record + ['labels' => $labels]);
    $record['mail']['confirmation'] = send_mail($record['email'], $cs, $ch, $ct, AUTOREPLY_TO, 'Modera Group');
}

$file = "$store/leads-" . gmdate('Y-m') . '.jsonl';
file_put_contents($file, json_encode($record, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
@chmod($file, 0600);

// Marketing opt-in: separate consent register, retained until the person withdraws.
if ($record['consent']['marketing']) {
    $mk = "$store/marketing-consents.jsonl";
    file_put_contents($mk, json_encode(['email' => $record['email'], 'name' => $record['name'], 'language' => $record['language'], 'consented_at' => $record['received'], 'notice_version' => $record['consent']['notice_version'], 'source' => 'website-form', 'lead_id' => $record['id']], JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    @chmod($mk, 0600);
}

// Storage limitation (also runs monthly via cron, see top of file).
purge($store);

out(200, ['ok' => true]);
