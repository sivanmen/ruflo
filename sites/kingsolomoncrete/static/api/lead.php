<?php
/**
 * King Solomon · lead endpoint.
 * Receives enquiry forms, validates them, e-mails the sales team and optionally forwards to a CRM webhook.
 * Configure via environment variables (recommended) or api/config.local.php (never commit secrets):
 *   KS_LEAD_TO       recipient(s), comma separated
 *   KS_LEAD_CC       copy recipient(s), comma separated
 *   KS_LEAD_FROM     sender address on your domain, e.g. no-reply@kingsolomoncrete.com
 *   KS_LEAD_WEBHOOK  optional HTTPS URL (Make, Zapier, HubSpot, Monday…) receiving JSON
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$cfg = [
  'to' => getenv('KS_LEAD_TO') ?: 'support@sivaninvestgroup.com',
  'cc' => getenv('KS_LEAD_CC') ?: 'sivanmen@gmail.com',
  'from' => getenv('KS_LEAD_FROM') ?: 'no-reply@kingsolomoncrete.com',
  'webhook' => getenv('KS_LEAD_WEBHOOK') ?: '',
  'allowed_origins' => ['https://www.kingsolomoncrete.com', 'https://kingsolomoncrete.com'],
];
if (is_file(__DIR__ . '/config.local.php')) { $cfg = array_merge($cfg, (array) require __DIR__ . '/config.local.php'); }

function out(int $code, array $body): void { http_response_code($code); echo json_encode($body); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// Same-origin check (CSRF mitigation for a public form).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $cfg['allowed_origins'], true) && !preg_match('~^https?://(localhost|127\.0\.0\.1)(:\d+)?$~', $origin)) {
  out(403, ['ok' => false, 'error' => 'origin']);
}

// Honeypot: bots fill the hidden "website" field.
if (!empty($_POST['website'])) out(200, ['ok' => true]);

// Simple rate limit: 5 submissions per IP per 10 minutes (IP stored only as a salted hash).
$dir = __DIR__ . '/storage';
if (!is_dir($dir)) { @mkdir($dir, 0750, true); @file_put_contents($dir . '/.htaccess', "Require all denied\n"); }
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$rl = $dir . '/rl_' . substr($ipHash, 0, 24);
$hits = array_filter(is_file($rl) ? (array) json_decode((string) file_get_contents($rl), true) : [], fn($t) => $t > time() - 600);
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = time();
@file_put_contents($rl, json_encode(array_values($hits)), LOCK_EX);

$clean = static fn(string $k, int $max = 200): string => trim(mb_substr(strip_tags((string) ($_POST[$k] ?? '')), 0, $max));
$lead = [
  'name' => $clean('name', 120),
  'phone' => $clean('phone', 40),
  'email' => $clean('email', 160),
  'country' => $clean('country', 80),
  'villa' => $clean('villa', 40),
  'budget' => $clean('budget', 60),
  'pref' => $clean('pref', 20),
  'message' => $clean('message', 2000),
  'lang' => $clean('lang', 5),
  'source' => $clean('source', 40),
  'page' => $clean('page', 200),
  'utm' => json_decode($clean('utm', 1500), true) ?: [],
  'consent_privacy' => ($_POST['consent_privacy'] ?? '') === 'yes',
  'consent_marketing' => ($_POST['consent_marketing'] ?? '') === 'yes',
  'submitted_at' => gmdate('c'),
];

if ($lead['name'] === '' || $lead['phone'] === '' || !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'validation']);
if (!preg_match('/^[+()\d\s.\-]{6,}$/', $lead['phone'])) out(422, ['ok' => false, 'error' => 'phone']);
if (!$lead['consent_privacy']) out(422, ['ok' => false, 'error' => 'consent']);

// Strip header-injection characters from anything used in mail headers.
$safe = static fn(string $s): string => str_replace(["\r", "\n", '%0a', '%0d'], ' ', $s);

$lines = [];
foreach ($lead as $k => $v) { $lines[] = str_pad($k, 18) . ': ' . (is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (is_bool($v) ? ($v ? 'yes' : 'no') : $v)); }
$subject = '=?UTF-8?B?' . base64_encode('King Solomon lead · ' . $safe($lead['name']) . ' · ' . strtoupper($lead['lang'])) . '?=';
$headers = [
  'From: King Solomon Website <' . $safe($cfg['from']) . '>',
  'Reply-To: ' . $safe($lead['email']),
  'Cc: ' . $safe($cfg['cc']),
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
];
$mailed = @mail($cfg['to'], $subject, implode("\n", $lines), implode("\r\n", $headers));

$forwarded = false;
if ($cfg['webhook'] !== '' && str_starts_with($cfg['webhook'], 'https://')) {
  $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode($lead, JSON_UNESCAPED_UNICODE), 'timeout' => 6]]);
  $forwarded = @file_get_contents($cfg['webhook'], false, $ctx) !== false;
}

if (!$mailed && !$forwarded) {
  // Keep the lead rather than lose it; storage/ is not web-accessible.
  @file_put_contents($dir . '/leads-fallback.jsonl', json_encode($lead, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
  out(502, ['ok' => false, 'error' => 'delivery']);
}
out(200, ['ok' => true]);
