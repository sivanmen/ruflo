<?php
/** One-time: delete files/folders that are no longer part of the site (e.g. gated plan PDFs). Token-protected, self-deletes. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
const TOKEN_SHA256 = '__TOKEN_SHA256__';
const EXPIRES_AT = __EXPIRES_AT__;
const REMOVE = ['assets/docs'];
function out(int $c, array $b): void { http_response_code($c); echo json_encode($b); exit; }
if (time() > EXPIRES_AT) { @unlink(__FILE__); out(410, ['ok' => false]); }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(404); exit; }
$tok = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($tok === '' || !hash_equals(TOKEN_SHA256, hash('sha256', $tok))) out(403, ['ok' => false]);
function rmrf(string $p): int { if (is_file($p) || is_link($p)) return (int) @unlink($p); $n = 0; if (is_dir($p)) { foreach (array_diff(scandir($p), ['.', '..']) as $f) $n += rmrf("$p/$f"); @rmdir($p); } return $n; }
$done = [];
foreach (REMOVE as $rel) { $p = __DIR__ . '/' . $rel; if (str_contains($rel, '..')) continue; $done[$rel] = rmrf($p); }
@unlink(__FILE__);
out(200, ['ok' => true, 'removed' => $done]);
