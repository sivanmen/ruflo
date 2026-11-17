#!/usr/bin/env node
/** Post-build checks: internal links resolve, every page has title/description/canonical/hreflang, JSON-LD parses. */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); });
walk(DIST);
let errors = 0;
const fail = (m) => { errors++; console.error('✗', m); };
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const rel = p.slice(DIST.length);
  if (rel.endsWith('404.html') || rel === 'index.html') continue;
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(`${rel}: title`);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) fail(`${rel}: description`);
  if (!html.includes('rel="canonical"')) fail(`${rel}: canonical`);
  if ((html.match(/hreflang=/g) || []).length < 8) fail(`${rel}: hreflang`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { try { JSON.parse(m[1]); } catch { fail(`${rel}: JSON-LD`); } }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const target = join(DIST, m[1]);
    if (!existsSync(target) && !existsSync(join(target, 'index.html'))) fail(`${rel}: broken ${m[1]}`);
  }
}
console.log(`${pages.length} pages checked, ${errors} problem(s).`);
process.exit(errors ? 1 : 0);
