<?php
/**
 * King Solomon · lead endpoint.
 * Validates the enquiry form and e-mails a designed, bilingual (visitor language + English) lead card
 * from support@kingsolomoncrete.com to the sales inbox, with a copy to the owner. Optional CRM webhook.
 * Configure via environment variables or api/config.local.php (never commit secrets):
 *   KS_LEAD_TO       recipient(s), comma separated   (default support@kingsolomoncrete.com)
 *   KS_LEAD_CC       copy recipient(s)               (default sivanmen@gmail.com)
 *   KS_LEAD_FROM     sender address on the domain    (default support@kingsolomoncrete.com)
 *   KS_LEAD_WEBHOOK  optional HTTPS URL receiving each lead as JSON
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$cfg = [
  'to' => getenv('KS_LEAD_TO') ?: 'support@kingsolomoncrete.com',
  'cc' => getenv('KS_LEAD_CC') ?: 'sivanmen@gmail.com',
  'from' => getenv('KS_LEAD_FROM') ?: 'support@kingsolomoncrete.com',
  'webhook' => getenv('KS_LEAD_WEBHOOK') ?: '',
  'site' => 'https://www.kingsolomoncrete.com',
  'allowed_origins' => ['https://www.kingsolomoncrete.com', 'https://kingsolomoncrete.com'],
];
if (is_file(__DIR__ . '/config.local.php')) { $cfg = array_merge($cfg, (array) require __DIR__ . '/config.local.php'); }

function out(int $code, array $body): void { http_response_code($code); echo json_encode($body); exit; }
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $cfg['allowed_origins'], true) && !preg_match('~^https?://(localhost|127\.0\.0\.1)(:\d+)?$~', $origin)) {
  out(403, ['ok' => false, 'error' => 'origin']);
}
if (!empty($_POST['website'])) out(200, ['ok' => true]); // honeypot

// Rate limit: 5 submissions per IP per 10 minutes (IP stored only as a salted hash).
$dir = __DIR__ . '/storage';
if (!is_dir($dir)) { @mkdir($dir, 0750, true); @file_put_contents($dir . '/.htaccess', "Require all denied\n"); }
$rl = $dir . '/rl_' . substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__), 0, 24);
$hits = array_filter(is_file($rl) ? (array) json_decode((string) file_get_contents($rl), true) : [], fn($t) => $t > time() - 600);
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = time();
@file_put_contents($rl, json_encode(array_values($hits)), LOCK_EX);

$clean = static fn(string $k, int $max = 200): string => trim(mb_substr(strip_tags((string) ($_POST[$k] ?? '')), 0, $max));
$lead = [
  'name' => $clean('name', 120), 'phone' => $clean('phone', 40), 'email' => $clean('email', 160),
  'country' => $clean('country', 80), 'villa' => $clean('villa', 40), 'budget' => $clean('budget', 4),
  'pref' => $clean('pref', 20), 'message' => $clean('message', 2000), 'lang' => $clean('lang', 5),
  'source' => $clean('source', 40), 'page' => $clean('page', 200),
  'utm' => json_decode($clean('utm', 1500), true) ?: [],
  'consent_privacy' => ($_POST['consent_privacy'] ?? '') === 'yes',
  'consent_marketing' => ($_POST['consent_marketing'] ?? '') === 'yes',
  'submitted_at' => gmdate('c'),
];
if ($lead['name'] === '' || $lead['phone'] === '' || !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'validation']);
if (!preg_match('/^[+()\d\s.\-]{6,}$/', $lead['phone'])) out(422, ['ok' => false, 'error' => 'phone']);
if (!$lead['consent_privacy']) out(422, ['ok' => false, 'error' => 'consent']);

// ---------- Translations -------------------------------------------------
$I = json_decode((string) @file_get_contents(__DIR__ . '/lead-i18n.json'), true) ?: [];
$lang = isset($I[$lead['lang']]) ? $lead['lang'] : 'en';
$EN = $I['en'] ?? [];

/** Field rows for one language: [label, value, isFreeText]. */
function rows(array $T, array $lead): array {
  $prefKeys = ['phone' => 0, 'whatsapp' => 1, 'email' => 2];
  $villa = $lead['villa'] === '' ? ($T['villaAny'] ?? '') : ($T['villa'][$lead['villa']] ?? $lead['villa']);
  $budget = ctype_digit($lead['budget']) ? ($T['budget'][(int) $lead['budget']] ?? '') : '';
  $pref = isset($prefKeys[$lead['pref']]) ? ($T['pref'][$prefKeys[$lead['pref']]] ?? $lead['pref']) : '';
  $L = $T['labels'] ?? [];
  $r = [
    [$L['name'] ?? 'Name', $lead['name'], true],
    [$L['phone'] ?? 'Phone', $lead['phone'], false],
    [$L['email'] ?? 'Email', $lead['email'], false],
    [$L['country'] ?? 'Country', $lead['country'], true],
    [$L['villa'] ?? 'Villa', $villa, false],
    [$L['budget'] ?? 'Budget', $budget, false],
    [$L['pref'] ?? 'Preferred contact', $pref, false],
    [$L['message'] ?? 'Message', $lead['message'], true],
  ];
  return array_values(array_filter($r, fn($x) => $x[1] !== ''));
}

// WhatsApp-ready international number
$digits = preg_replace('/\D+/', '', $lead['phone']);
if (str_starts_with($digits, '00')) $digits = substr($digits, 2);
elseif (str_starts_with($digits, '0')) $digits = ($lang === 'el' ? '30' : '972') . substr($digits, 1);
$tel = '+' . $digits;
$waText = rawurlencode('King Solomon · ' . $lead['name']);
$wa = 'https://wa.me/' . $digits . '?text=' . $waText;

// ---------- HTML e-mail --------------------------------------------------
function section(array $T, array $lead, string $heading): string {
  $dir = ($T['dir'] ?? 'ltr') === 'rtl' ? 'rtl' : 'ltr';
  $align = $dir === 'rtl' ? 'right' : 'left';
  $html = '<tr><td dir="' . $dir . '" style="padding:28px 36px 8px;text-align:' . $align . ';">'
    . '<p style="margin:0 0 14px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#86652A;">' . h($heading) . '</p>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">';
  $translate = !empty($T['_translate']);
  foreach (rows($T, $lead) as [$label, $value, $free]) {
    $tr = ($translate && $free && preg_match('/[^\x00-\x7F]/u', $value))
      ? '<br><a href="https://translate.google.com/?sl=auto&tl=en&op=translate&text=' . rawurlencode($value) . '" style="font:12px/1.6 Arial,sans-serif;color:#86652A;">Translate to English →</a>' : '';
    $html .= '<tr><td style="padding:10px 0;border-bottom:1px solid #ECE6DA;width:38%;vertical-align:top;font:13px/1.5 Arial,sans-serif;color:#716B60;text-align:' . $align . ';">' . h($label) . '</td>'
      . '<td style="padding:10px 0;border-bottom:1px solid #ECE6DA;vertical-align:top;font:15px/1.5 Arial,sans-serif;color:#1C1A16;text-align:' . $align . ';"><span dir="' . ($free ? 'auto' : 'ltr') . '">' . nl2br(h($value)) . '</span>' . $tr . '</td></tr>';
  }
  $E = $T['email'] ?? [];
  $html .= '<tr><td style="padding:10px 0;font:13px/1.5 Arial,sans-serif;color:#716B60;text-align:' . $align . ';">' . h($E['marketing'] ?? 'Marketing consent') . '</td>'
    . '<td style="padding:10px 0;font:15px/1.5 Arial,sans-serif;color:#1C1A16;text-align:' . $align . ';">' . h($lead['consent_marketing'] ? ($E['yes'] ?? 'Yes') : ($E['no'] ?? 'No')) . '</td></tr>';
  return $html . '</table></td></tr>';
}

$Tl = $I[$lang] ?? $EN; $El = $Tl['email'] ?? [];
$Ee = $EN['email'] ?? [];
$dirL = ($Tl['dir'] ?? 'ltr') === 'rtl' ? 'rtl' : 'ltr';
$btn = static fn(string $href, string $label, string $bg, string $fg) =>
  '<a href="' . h($href) . '" style="display:inline-block;margin:4px 4px;padding:12px 22px;border-radius:999px;background:' . $bg . ';color:' . $fg . ';font:600 14px/1 Arial,sans-serif;text-decoration:none;">' . h($label) . '</a>';
$buttons = $btn('tel:' . $tel, ($El['call'] ?? 'Call') . ' ' . $lead['phone'], '#C6A15C', '#1C1A16')
  . $btn($wa, $El['whatsapp'] ?? 'WhatsApp', '#25D366', '#ffffff')
  . $btn('mailto:' . $lead['email'], $El['reply'] ?? 'Reply', '#1C1A16', '#ffffff');
$utm = $lead['utm'] ? implode(' · ', array_map(fn($k, $v) => "$k=$v", array_keys($lead['utm']), $lead['utm'])) : '';
$meta = h($Ee['received'] ?? 'Received') . ': ' . h(gmdate('d.m.Y H:i')) . ' UTC · ' . h($Ee['language'] ?? 'Language') . ': ' . h($Tl['langName'] ?? $lang)
  . ' · ' . h($Ee['source'] ?? 'Form') . ': ' . h($lead['source']) . '<br>' . h($Ee['page'] ?? 'Page') . ': ' . h($cfg['site'] . $lead['page'])
  . ($utm !== '' ? '<br>' . h($Ee['campaign'] ?? 'Campaign') . ': ' . h($utm) : '');

$sections = section($Tl, $lead, ($lang === 'en' ? ($Ee['details'] ?? 'Details') : ($El['inLang'] ?? 'As submitted') . ' · ' . ($Tl['langName'] ?? '')));
if ($lang !== 'en' && $EN) $sections .= section($EN + ['_translate' => true], $lead, ($Ee['inEnglish'] ?? 'In English'));

$html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>King Solomon</title></head>'
  . '<body style="margin:0;padding:0;background:#F3EFE7;">'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EFE7;"><tr><td align="center" style="padding:28px 12px;">'
  . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FAF8F4;border:1px solid #E4DCCB;border-radius:18px;overflow:hidden;">'
  . '<tr><td align="center" style="background:#0E0E0D;padding:30px 24px 26px;">'
  . '<img src="' . $cfg['site'] . '/assets/brand/email-crown.png" width="96" height="55" alt="King Solomon" style="display:block;margin:0 auto 14px;border:0;">'
  . '<div style="font:400 22px/1.2 Georgia,\'Times New Roman\',serif;letter-spacing:5px;color:#F6F2EA;">KING SOLOMON</div>'
  . '<div style="font:11px/1.6 Arial,sans-serif;letter-spacing:4px;color:#D9BC85;margin-top:6px;">KALYVES | CRETE</div></td></tr>'
  . '<tr><td dir="' . $dirL . '" align="center" style="padding:30px 36px 6px;">'
  . '<div style="font:400 28px/1.25 Georgia,\'Times New Roman\',serif;color:#1C1A16;">' . h($El['title'] ?? 'New enquiry') . '</div>'
  . ($lang !== 'en' ? '<div style="font:400 16px/1.4 Georgia,serif;color:#86652A;margin-top:6px;">' . h($Ee['title'] ?? '') . '</div>' : '')
  . '<p style="margin:14px 0 0;font:14px/1.6 Arial,sans-serif;color:#4A463E;">' . h($El['intro'] ?? '') . '</p>'
  . '<div style="font:400 30px/1.2 Georgia,serif;color:#1C1A16;margin:22px 0 4px;" dir="auto">' . h($lead['name']) . '</div>'
  . '<div style="margin:16px 0 4px;">' . $buttons . '</div></td></tr>'
  . $sections
  . '<tr><td style="padding:22px 36px 30px;"><p style="margin:0;font:12px/1.7 Arial,sans-serif;color:#716B60;border-top:1px solid #ECE6DA;padding-top:16px;">' . $meta
  . '<br>' . h($Ee['note'] ?? '') . '</p></td></tr>'
  . '</table><p style="font:11px/1.6 Arial,sans-serif;color:#9A9385;margin:14px 0 0;">www.kingsolomoncrete.com</p></td></tr></table></body></html>';

// Plain-text alternative
$txt = ($El['title'] ?? 'New enquiry') . "\n\n";
foreach (rows($Tl, $lead) as [$l, $v]) $txt .= "$l: $v\n";
if ($lang !== 'en' && $EN) { $txt .= "\n-- English --\n"; foreach (rows($EN, $lead) as [$l, $v]) $txt .= "$l: $v\n"; }
$txt .= "\nCall: $tel\nWhatsApp: $wa\nPage: {$cfg['site']}{$lead['page']}\n";

// ---------- Send ---------------------------------------------------------
$safe = static fn(string $s): string => str_replace(["\r", "\n", '%0a', '%0d'], ' ', $s);
$boundary = 'ks_' . bin2hex(random_bytes(12));
$subject = '=?UTF-8?B?' . base64_encode('King Solomon · ' . ($Ee['subject'] ?? 'New enquiry') . ' · ' . $safe($lead['name']) . ' · ' . strtoupper($lang)) . '?=';
$fromName = '=?UTF-8?B?' . base64_encode('King Solomon Website') . '?=';
$headers = [
  'From: ' . $fromName . ' <' . $safe($cfg['from']) . '>',
  'Reply-To: ' . $safe($lead['email']),
  'Cc: ' . $safe($cfg['cc']),
  'MIME-Version: 1.0',
  'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
  'X-Mailer: KingSolomon-Lead',
];
$body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($txt))
  . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
  . "--$boundary--\r\n";
$mailed = @mail($cfg['to'], $subject, $body, implode("\r\n", $headers), '-f' . $safe($cfg['from']));

$forwarded = false;
if ($cfg['webhook'] !== '' && str_starts_with($cfg['webhook'], 'https://')) {
  $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode($lead, JSON_UNESCAPED_UNICODE), 'timeout' => 6]]);
  $forwarded = @file_get_contents($cfg['webhook'], false, $ctx) !== false;
}
// Always keep a private copy of the lead (storage/ is not web-accessible).
@file_put_contents($dir . '/leads.jsonl', json_encode($lead, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

if (!$mailed && !$forwarded) out(502, ['ok' => false, 'error' => 'delivery']);
out(200, ['ok' => true]);
