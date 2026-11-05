// QA: broken internal links/assets, SEO basics and accessibility basics for every built page.
// Usage: node scripts/check-site.mjs
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'dist');
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') && files.push(path.join(d, e.name))));
walk(DIST);
const problems = [];
const titles = new Map();
const resolve = (u) => {
  const clean = decodeURI(u.split('#')[0].split('?')[0]);
  if (!clean) return true;
  const p = path.join(DIST, clean);
  return fs.existsSync(clean.endsWith('/') ? path.join(p, 'index.html') : p);
};
for (const f of files) {
  const rel = '/' + path.relative(DIST, f).replace(/index\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
  const sets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]));
  for (const u of new Set([...refs, ...sets])) if (u.startsWith('/') && !u.startsWith('//') && !u.startsWith('/api/') && !resolve(u)) problems.push(`${rel}: missing ${u}`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) problems.push(`${rel}: no <title>`);
  if (!desc) problems.push(`${rel}: no meta description`);
  if (title && rel !== '/404.html') { if (titles.has(title)) problems.push(`${rel}: duplicate title with ${titles.get(title)}`); titles.set(title, rel); }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${rel}: ${h1} <h1>`);
  if (!/<html lang="[a-z]{2}"/.test(html)) problems.push(`${rel}: missing lang`);
  const imgsNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length;
  if (imgsNoAlt) problems.push(`${rel}: ${imgsNoAlt} <img> without alt`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) problems.push(`${rel}: duplicate ids ${[...new Set(dup)].join(',')}`);
  if (!html.includes('noindex') && (html.match(/hreflang=/g) || []).length < 8) problems.push(`${rel}: hreflang missing`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { problems.push(`${rel}: invalid JSON-LD`); } }
  if (/\{(no|n|a|t|v|year|privacy|site|company|email|date|code)\}/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) problems.push(`${rel}: unreplaced placeholder ${html.match(/\{(no|n|a|t|v|year|privacy|site|company|email|date|code)\}/)[0]}`);
}
console.log(`${files.length} pages checked, ${problems.length} problems`);
problems.slice(0, 80).forEach((p) => console.log(' -', p));
process.exitCode = problems.length ? 1 : 0;
