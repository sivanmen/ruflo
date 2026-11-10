<?php
/** One-time: install htaccess.ks as .htaccess, keeping any cPanel-generated PHP handler block. Self-deletes. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
const TOKEN_SHA256 = '__TOKEN_SHA256__';
const EXPIRES_AT = __EXPIRES_AT__;
function out(int $c, array $b): void { http_response_code($c); echo json_encode($b); exit; }
if (time() > EXPIRES_AT) { @unlink(__FILE__); out(410, ['ok' => false]); }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(404, ['ok' => false]);
$tok = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($tok === '' || !hash_equals(TOKEN_SHA256, hash('sha256', $tok))) out(403, ['ok' => false, 'error' => 'auth']);
$new = __DIR__ . '/htaccess.ks'; $cur = __DIR__ . '/.htaccess';
if (!is_file($new)) out(400, ['ok' => false, 'error' => 'no htaccess.ks']);
$old = is_file($cur) ? (string) file_get_contents($cur) : '';
$keep = '';
if (preg_match('/# php -- BEGIN cPanel-generated handler.*?# php -- END cPanel-generated handler[^\n]*\n?/s', $old, $m)) $keep = $m[0];
if ($old !== '') file_put_contents(__DIR__ . '/.htaccess.cpanel-backup', $old);
file_put_contents($cur, file_get_contents($new) . ($keep !== '' ? "\n" . $keep : ''));
unlink($new); @unlink(__FILE__);
out(200, ['ok' => true, 'kept_handler' => $keep !== '', 'old_bytes' => strlen($old), 'backup' => $old !== '']);
