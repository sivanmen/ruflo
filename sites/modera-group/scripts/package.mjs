#!/usr/bin/env node
/**
 * Builds the site and writes release/modera-site.zip — ready to upload to the
 * modera-group.com document root in cPanel and extract.
 *
 * The ZIP contains the static site, deploy.php (configured with the SHA-256 of
 * MODERA_DEPLOY_TOKEN) and _modera.htaccess (merged into .htaccess on first deploy call).
 * Usage: MODERA_DEPLOY_TOKEN=... npm run package
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const token = process.env.MODERA_DEPLOY_TOKEN || '';
if (token.length < 32) { console.error('Set MODERA_DEPLOY_TOKEN (32+ chars).'); process.exit(1); }

execFileSync('node', ['build.mjs'], { cwd: ROOT, stdio: 'inherit' });

const REL = join(ROOT, 'release');
const STAGE = join(REL, 'stage');
rmSync(REL, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });
cpSync(join(ROOT, 'dist'), STAGE, { recursive: true });

const sha = createHash('sha256').update(token).digest('hex');
const php = readFileSync(join(ROOT, 'deploy/deploy.php'), 'utf8').replace("'__TOKEN_SHA256__'", `'${sha}'`);
writeFileSync(join(STAGE, 'deploy.php'), php);
cpSync(join(ROOT, 'deploy/modera.htaccess'), join(STAGE, '_modera.htaccess'));

execFileSync('zip', ['-qr9X', '../modera-site.zip', '.'], { cwd: STAGE });
rmSync(STAGE, { recursive: true, force: true });
console.log(`✓ release/modera-site.zip`);
