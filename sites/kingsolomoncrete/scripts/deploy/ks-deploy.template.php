<?php
/**
 * King Solomon · one-time deploy receiver.
 * Upload this file to the domain's document root, run the deploy, and it deletes itself.
 * Protected by a secret token (only its SHA-256 hash is stored here) and an expiry time.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

const TOKEN_SHA256 = '__TOKEN_SHA256__';
const EXPIRES_AT   = __EXPIRES_AT__;   // unix time; after this the script refuses and deletes itself
const TMP          = __DIR__ . '/.ks-deploy-tmp';
const KEEP_FILE    = __KEEP__;      // true: stay installed for future updates (token-protected, expires)

function out(int $code, array $b): void { http_response_code($code); echo json_encode($b); exit; }

if (time() > EXPIRES_AT) { @unlink(__FILE__); out(410, ['ok' => false, 'error' => 'expired']); }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(404); exit; }
$tok = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($tok === '' || !hash_equals(TOKEN_SHA256, hash('sha256', $tok))) { usleep(800000); out(403, ['ok' => false, 'error' => 'auth']); }

if (!is_dir(TMP)) { mkdir(TMP, 0700, true); file_put_contents(TMP . '/.htaccess', "Require all denied\n"); }
$action = $_GET['action'] ?? '';

if ($action === 'ping') {
  out(200, ['ok' => true, 'php' => PHP_VERSION, 'zip' => class_exists('ZipArchive'), 'docroot' => __DIR__,
    'writable' => is_writable(__DIR__), 'upload_max' => ini_get('upload_max_filesize'), 'post_max' => ini_get('post_max_size'),
    'mail' => function_exists('mail'), 'free_mb' => (int) (@disk_free_space(__DIR__) / 1048576),
    'existing' => array_values(array_diff(scandir(__DIR__), ['.', '..']))]);
}

if ($action === 'chunk') {
  $i = (int) ($_GET['i'] ?? -1);
  if ($i < 0 || $i > 9999 || empty($_FILES['c']) || $_FILES['c']['error'] !== UPLOAD_ERR_OK) out(400, ['ok' => false, 'error' => 'chunk']);
  move_uploaded_file($_FILES['c']['tmp_name'], sprintf('%s/part-%04d', TMP, $i)) || out(500, ['ok' => false, 'error' => 'move']);
  out(200, ['ok' => true, 'i' => $i, 'sha256' => hash_file('sha256', sprintf('%s/part-%04d', TMP, $i))]);
}

if ($action === 'finish') {
  $n = (int) ($_GET['n'] ?? 0);
  $want = strtolower((string) ($_GET['sha256'] ?? ''));
  $zipPath = TMP . '/site.zip';
  $o = fopen($zipPath, 'wb');
  for ($i = 0; $i < $n; $i++) {
    $p = sprintf('%s/part-%04d', TMP, $i);
    if (!is_file($p)) out(400, ['ok' => false, 'error' => "missing part $i"]);
    $in = fopen($p, 'rb'); stream_copy_to_stream($in, $o); fclose($in);
  }
  fclose($o);
  if (!hash_equals($want, hash_file('sha256', $zipPath))) out(400, ['ok' => false, 'error' => 'checksum']);
  $z = new ZipArchive();
  if ($z->open($zipPath) !== true) out(500, ['ok' => false, 'error' => 'zip open']);
  for ($k = 0; $k < $z->numFiles; $k++) {   // block path traversal
    $name = $z->getNameIndex($k);
    if ($name === false || str_contains($name, '..') || str_starts_with($name, '/') || str_contains($name, '\\')) out(400, ['ok' => false, 'error' => 'bad entry']);
  }
  $z->extractTo(__DIR__) || out(500, ['ok' => false, 'error' => 'extract']);
  $count = $z->numFiles; $z->close();
  foreach (glob(TMP . '/{,.}*', GLOB_BRACE) as $f) if (is_file($f)) unlink($f);
  @rmdir(TMP);
  if (!KEEP_FILE) @unlink(__FILE__);
  out(200, ['ok' => true, 'extracted' => $count, 'self_deleted' => !is_file(__FILE__)]);
}

if ($action === 'abort') {
  foreach (glob(TMP . '/{,.}*', GLOB_BRACE) as $f) if (is_file($f)) unlink($f);
  @rmdir(TMP); @unlink(__FILE__);
  out(200, ['ok' => true, 'removed' => true]);
}
out(400, ['ok' => false, 'error' => 'action']);
