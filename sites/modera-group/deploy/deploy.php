<?php
/**
 * Modera Group — secure deploy endpoint (cPanel / Jet Server).
 *
 * Lives in the document root of modera-group.com. Lets the build pipeline push a new
 * version of the static site as a ZIP (in chunks, to stay under PHP upload limits),
 * keeps backups of the previous version, and can roll back.
 *
 * Auth: header "X-Deploy-Token: <token>". Only the SHA-256 of the token is stored here.
 * Requests are refused unless they arrive over HTTPS.
 *
 * Actions (all POST, ?action=...):
 *   status                      -> current version info, PHP capabilities
 *   chunk&id=<id>&n=<index>     -> raw body = bytes of chunk <index> of upload <id>
 *   finalize&id=<id>&n=<count>&sha256=<hex> -> assemble, verify, extract, publish
 *   rollback                    -> restore the most recent backup
 */

declare(strict_types=1);

const TOKEN_SHA256 = '__TOKEN_SHA256__';
const MAX_CHUNK_BYTES = 8 * 1024 * 1024;
const KEEP_BACKUPS = 3;
// Never touched by deploys (server configuration and this endpoint).
const KEEP_NAMES = ['deploy.php', '.htaccess', '.user.ini', 'php.ini', '.well-known', '.deploy', 'cgi-bin', 'error_log', '_modera.htaccess'];

$ROOT = __DIR__;
// Keep backups/uploads outside the public web root when possible (e.g. /home/<user>/.modera-deploy).
$outside = dirname($ROOT) . '/.modera-deploy';
$WORK = (is_dir($outside) || @mkdir($outside, 0750, true)) && is_writable($outside) ? $outside : $ROOT . '/.deploy';

function respond(int $code, array $data): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
}

function rrmdir(string $dir): void
{
    if (!is_dir($dir)) return;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($it as $f) { $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname()); }
    @rmdir($dir);
}

/** Relative paths of all files under $dir (excluding protected top-level names). */
function list_files(string $dir): array
{
    $out = [];
    if (!is_dir($dir)) return $out;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $f) {
        if (!$f->isFile()) continue;
        $rel = ltrim(str_replace('\\', '/', substr($f->getPathname(), strlen($dir))), '/');
        if (in_array(explode('/', $rel)[0], KEEP_NAMES, true)) continue;
        $out[] = $rel;
    }
    sort($out);
    return $out;
}

function safe_rel(string $rel): bool
{
    return $rel !== '' && strpos($rel, '..') === false && $rel[0] !== '/' && strpos($rel, "\0") === false;
}

function extract_zip(string $zipFile, string $dest): void
{
    if (class_exists('ZipArchive')) {
        $z = new ZipArchive();
        if ($z->open($zipFile) !== true) throw new RuntimeException('Cannot open ZIP');
        for ($i = 0; $i < $z->numFiles; $i++) {
            $name = $z->getNameIndex($i);
            if (!safe_rel($name)) throw new RuntimeException("Unsafe path in ZIP: $name");
        }
        if (!$z->extractTo($dest)) throw new RuntimeException('Extract failed');
        $z->close();
        return;
    }
    $p = new PharData($zipFile);
    $p->extractTo($dest, null, true);
}

/** Insert or replace the "# BEGIN Modera ... # END Modera" block in .htaccess. */
function merge_htaccess(string $root, string $block): void
{
    $file = $root . '/.htaccess';
    $current = is_file($file) ? (string) file_get_contents($file) : '';
    $block = trim($block) . "\n";
    $re = '/# BEGIN Modera.*?# END Modera\s*/s';
    $next = preg_match($re, $current) ? preg_replace($re, $block, $current) : rtrim($block) . "\n\n" . $current;
    if ($next !== $current) {
        if ($current !== '') @copy($file, $file . '.modera-bak');
        file_put_contents($file, $next, LOCK_EX);
    }
}

function backup_current(string $root, string $work, array $files): ?string
{
    if (!$files || !class_exists('ZipArchive')) return null;
    @mkdir($work . '/backups', 0750, true);
    $name = $work . '/backups/' . gmdate('Ymd-His') . '.zip';
    $z = new ZipArchive();
    if ($z->open($name, ZipArchive::CREATE) !== true) return null;
    foreach ($files as $rel) { if (is_file("$root/$rel")) $z->addFile("$root/$rel", $rel); }
    $z->close();
    $all = glob($work . '/backups/*.zip') ?: [];
    sort($all);
    while (count($all) > KEEP_BACKUPS) { @unlink(array_shift($all)); }
    return basename($name);
}

/** Copy staged files into place, then remove files that were deployed before but no longer exist. */
function publish(string $root, string $stage, array $oldFiles): array
{
    $newFiles = list_files($stage);
    foreach ($newFiles as $rel) {
        $dst = "$root/$rel";
        @mkdir(dirname($dst), 0755, true);
        if (!@rename("$stage/$rel", $dst) && !@copy("$stage/$rel", $dst)) throw new RuntimeException("Cannot write $rel");
        @chmod($dst, 0644);
    }
    $removed = 0;
    foreach (array_diff($oldFiles, $newFiles) as $rel) {
        if (safe_rel($rel) && is_file("$root/$rel") && @unlink("$root/$rel")) $removed++;
    }
    // Prune empty directories left behind.
    $dirs = [];
    foreach (array_diff($oldFiles, $newFiles) as $rel) { for ($d = dirname($rel); $d !== '.' && $d !== ''; $d = dirname($d)) $dirs[$d] = true; }
    krsort($dirs);
    foreach (array_keys($dirs) as $d) { @rmdir("$root/$d"); }
    return [$newFiles, $removed];
}

function read_manifest(string $work): array
{
    $f = $work . '/manifest.json';
    return is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
}

// ---------------------------------------------------------------------------

if (TOKEN_SHA256 === '__TOKEN_SHA256__' || strlen(TOKEN_SHA256) !== 64) respond(503, ['error' => 'Deploy endpoint not configured']);
$token = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';
if ($token === '' || !hash_equals(TOKEN_SHA256, hash('sha256', $token))) respond(404, ['error' => 'Not found']);
if (!is_https()) respond(403, ['error' => 'HTTPS required']);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(405, ['error' => 'POST required']);

@set_time_limit(300);
@mkdir($WORK, 0750, true);
if (!is_file("$WORK/.htaccess")) file_put_contents("$WORK/.htaccess", "Require all denied\nDeny from all\n");

// First run after a manual cPanel extract: adopt the shipped .htaccess block.
if (is_file("$ROOT/_modera.htaccess")) {
    merge_htaccess($ROOT, (string) file_get_contents("$ROOT/_modera.htaccess"));
    @unlink("$ROOT/_modera.htaccess");
}

$action = $_GET['action'] ?? 'status';
$id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($_GET['id'] ?? ''));

try {
    switch ($action) {
        case 'status':
            $m = read_manifest($WORK);
            respond(200, [
                'ok' => true,
                'version' => $m['version'] ?? null,
                'deployedAt' => $m['deployedAt'] ?? null,
                'files' => isset($m['files']) ? count($m['files']) : count(list_files($ROOT)),
                'backups' => array_map('basename', glob("$WORK/backups/*.zip") ?: []),
                'php' => PHP_VERSION,
                'zip' => class_exists('ZipArchive'),
                'post_max_size' => ini_get('post_max_size'),
            ]);

        case 'chunk':
            $n = (int) ($_GET['n'] ?? -1);
            if ($id === '' || $n < 0 || $n > 999) respond(400, ['error' => 'Bad chunk parameters']);
            $data = file_get_contents('php://input');
            if ($data === false || $data === '' || strlen($data) > MAX_CHUNK_BYTES) respond(400, ['error' => 'Empty or oversized chunk']);
            @mkdir("$WORK/uploads/$id", 0750, true);
            file_put_contents(sprintf('%s/uploads/%s/%04d.part', $WORK, $id, $n), $data, LOCK_EX);
            respond(200, ['ok' => true, 'chunk' => $n, 'bytes' => strlen($data)]);

        case 'finalize':
            $count = (int) ($_GET['n'] ?? 0);
            $sha = strtolower((string) ($_GET['sha256'] ?? ''));
            $version = substr(preg_replace('/[^a-zA-Z0-9._-]/', '', (string) ($_GET['version'] ?? '')), 0, 64);
            if ($id === '' || $count < 1 || !preg_match('/^[a-f0-9]{64}$/', $sha)) respond(400, ['error' => 'Bad finalize parameters']);
            $zipFile = "$WORK/uploads/$id.zip";
            $out = fopen($zipFile, 'wb');
            for ($i = 0; $i < $count; $i++) {
                $part = sprintf('%s/uploads/%s/%04d.part', $WORK, $id, $i);
                if (!is_file($part)) { fclose($out); respond(400, ['error' => "Missing chunk $i"]); }
                fwrite($out, (string) file_get_contents($part));
            }
            fclose($out);
            rrmdir("$WORK/uploads/$id");
            if (!hash_equals($sha, hash_file('sha256', $zipFile))) { @unlink($zipFile); respond(400, ['error' => 'Checksum mismatch']); }

            $stage = "$WORK/stage";
            rrmdir($stage);
            @mkdir($stage, 0750, true);
            extract_zip($zipFile, $stage);
            @unlink($zipFile);
            if (!is_file("$stage/index.html")) { rrmdir($stage); respond(400, ['error' => 'Bundle has no index.html']); }

            $block = is_file("$stage/_modera.htaccess") ? (string) file_get_contents("$stage/_modera.htaccess") : '';
            @unlink("$stage/_modera.htaccess");
            @unlink("$stage/deploy.php");

            $manifest = read_manifest($WORK);
            $oldFiles = $manifest['files'] ?? list_files($ROOT);
            $backup = backup_current($ROOT, $WORK, $oldFiles);
            [$files, $removed] = publish($ROOT, $stage, $oldFiles);
            rrmdir($stage);
            if ($block !== '') merge_htaccess($ROOT, $block);

            $manifest = ['version' => $version ?: gmdate('c'), 'deployedAt' => gmdate('c'), 'files' => $files];
            file_put_contents("$WORK/manifest.json", json_encode($manifest, JSON_UNESCAPED_SLASHES), LOCK_EX);
            respond(200, ['ok' => true, 'version' => $manifest['version'], 'published' => count($files), 'removed' => $removed, 'backup' => $backup]);

        case 'rollback':
            $all = glob("$WORK/backups/*.zip") ?: [];
            sort($all);
            $last = end($all);
            if (!$last) respond(404, ['error' => 'No backup available']);
            $stage = "$WORK/stage";
            rrmdir($stage);
            @mkdir($stage, 0750, true);
            extract_zip($last, $stage);
            $manifest = read_manifest($WORK);
            [$files, $removed] = publish($ROOT, $stage, $manifest['files'] ?? []);
            rrmdir($stage);
            @unlink($last);
            file_put_contents("$WORK/manifest.json", json_encode(['version' => 'rollback:' . basename($last), 'deployedAt' => gmdate('c'), 'files' => $files], JSON_UNESCAPED_SLASHES), LOCK_EX);
            respond(200, ['ok' => true, 'restored' => basename($last), 'files' => count($files), 'removed' => $removed]);

        default:
            respond(400, ['error' => 'Unknown action']);
    }
} catch (Throwable $e) {
    respond(500, ['error' => $e->getMessage()]);
}
