#!/usr/bin/env node
/**
 * Pushes a fresh build to https://modera-group.com via deploy.php (chunked, checksummed).
 * Usage: MODERA_DEPLOY_TOKEN=... npm run deploy            (build + publish)
 *        MODERA_DEPLOY_TOKEN=... npm run deploy -- status
 *        MODERA_DEPLOY_TOKEN=... npm run deploy -- rollback
 */
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ENDPOINT = process.env.MODERA_DEPLOY_URL || 'https://modera-group.com/deploy.php';
const token = process.env.MODERA_DEPLOY_TOKEN || '';
if (!token) { console.error('Set MODERA_DEPLOY_TOKEN.'); process.exit(1); }
const CHUNK = 4 * 1024 * 1024;

async function call(action, params = {}, body) {
  const url = `${ENDPOINT}?${new URLSearchParams({ action, ...params })}`;
  const res = await fetch(url, { method: 'POST', headers: { 'X-Deploy-Token': token, 'Content-Type': 'application/octet-stream' }, body });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(`${action} → HTTP ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

const mode = process.argv[2] || 'publish';
if (mode === 'status' || mode === 'rollback') {
  console.log(await call(mode));
  process.exit(0);
}

execFileSync('node', ['build.mjs'], { cwd: ROOT, stdio: 'inherit' });
const tmp = join(ROOT, 'release', 'push');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
cpSync(join(ROOT, 'dist'), join(tmp, 'site'), { recursive: true });
cpSync(join(ROOT, 'deploy/modera.htaccess'), join(tmp, 'site', '_modera.htaccess'));
execFileSync('zip', ['-qr9X', '../bundle.zip', '.'], { cwd: join(tmp, 'site') });
const zip = readFileSync(join(tmp, 'bundle.zip'));
const sha256 = createHash('sha256').update(zip).digest('hex');
const id = randomBytes(8).toString('hex');
const n = Math.ceil(zip.length / CHUNK);
let version = new Date().toISOString();
try { version = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).toString().trim(); } catch { /* not a git checkout */ }

console.log(`Uploading ${(zip.length / 1e6).toFixed(1)} MB in ${n} chunk(s)…`);
for (let i = 0; i < n; i++) {
  await call('chunk', { id, n: String(i) }, zip.subarray(i * CHUNK, (i + 1) * CHUNK));
  process.stdout.write(`  ${i + 1}/${n}\r`);
}
console.log('\n', await call('finalize', { id, n: String(n), sha256, version }));
rmSync(tmp, { recursive: true, force: true });
