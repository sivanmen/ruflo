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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// Same-origin check (CSRF protection for a cookieless endpoint).
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? ''), PHP_URL_HOST);
if (!$origin || !in_array(strtolower($origin), ALLOWED_HOSTS, true)) out(403, ['ok' => false, 'error' => 'origin']);

$raw = file_get_contents('php://input', false, null, 0, 20000);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) out(400, ['ok' => false, 'error' => 'payload']);

// Bots: honeypot filled or form submitted too fast (< 3 s). Pretend success.
if (!empty($in['_honey']) || (isset($in['_t']) && (time() * 1000 - (int) $in['_t']) < 3000)) out(200, ['ok' => true]);

$home = dirname(__DIR__);
$store = is_writable($home) ? $home . '/.modera-leads' : __DIR__ . '/.deploy/leads';
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
if ($lead['name'] === '' || !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'fields']);
if (($in['consent'] ?? '') !== 'yes') out(422, ['ok' => false, 'error' => 'consent']);

$record = $lead + [
    'id'         => bin2hex(random_bytes(8)),
    'received'   => gmdate('c'),
    'consent'    => ['processing' => true, 'marketing' => ($in['marketing'] ?? '') === 'yes', 'notice_version' => clean((string) ($in['notice_version'] ?? ''), 20), 'page' => clean((string) ($in['page'] ?? ''), 200)],
];
file_put_contents("$store/leads-" . gmdate('Y-m') . '.jsonl', json_encode($record, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
@chmod("$store/leads-" . gmdate('Y-m') . '.jsonl', 0600);

// Storage limitation: delete monthly files older than the retention period.
$cutoff = gmdate('Y-m', time() - RETENTION_DAYS * 86400);
foreach (glob("$store/leads-*.jsonl") ?: [] as $f) {
    if (preg_match('/leads-(\d{4}-\d{2})\.jsonl$/', $f, $m) && $m[1] < $cutoff) @unlink($f);
}

// Email notification.
$lines = [];
foreach ($lead as $k => $v) { if ($v !== '') $lines[] = str_pad(ucfirst(str_replace('_', ' ', $k)) . ':', 15) . $v; }
$lines[] = str_pad('Marketing:', 15) . ($record['consent']['marketing'] ? 'opted in' : 'no');
$lines[] = str_pad('Received:', 15) . $record['received'] . ' (ID ' . $record['id'] . ')';
$subject = '=?UTF-8?B?' . base64_encode('New enquiry — ' . $lead['name'] . ' (' . strtoupper($lead['language']) . ')') . '?=';
$replyName = '=?UTF-8?B?' . base64_encode($lead['name']) . '?=';
$headers = implode("\r\n", [
    'From: Modera Website <no-reply@modera-group.com>',
    'Reply-To: ' . $replyName . ' <' . $lead['email'] . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);
foreach (RECIPIENTS as $to) { @mail($to, $subject, implode("\n", $lines), $headers, '-fno-reply@modera-group.com'); }

out(200, ['ok' => true]);
