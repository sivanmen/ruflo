#!/usr/bin/env node
/**
 * Uploads the King Solomon web assets to the WordPress media library (new attachments only;
 * nothing existing is modified). Re-runs skip files already uploaded (matched by slug).
 *
 *   WP_USER=.. WP_APP_PASSWORD=".." node upload-media.mjs <dir> [<dir> ...] > media.json
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://sivaninvestgroup.com';
const AUTH = 'Basic ' + Buffer.from(`${process.env.WP_USER}:${(process.env.WP_APP_PASSWORD || '').replace(/\s+/g, '')}`).toString('base64');
const TYPES = { '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };

async function api(method, route, body, headers = {}) {
  const res = await fetch(`${SITE}/wp-json${route}`, { method, headers: { Authorization: AUTH, ...headers }, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${json.message || ''}`);
  return json;
}

const out = {};
for (const dir of process.argv.slice(2)) {
  for (const f of (await readdir(dir)).sort()) {
    const ext = path.extname(f).toLowerCase();
    if (!TYPES[ext] || !f.startsWith('ks-') && !f.startsWith('King-Solomon')) continue;
    const slug = path.basename(f, ext).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const found = await api('GET', `/wp/v2/media?slug=${slug}&_fields=id,source_url,media_details`);
    let m = found[0];
    if (!m) {
      m = await api('POST', '/wp/v2/media', await readFile(path.join(dir, f)), {
        'Content-Type': TYPES[ext],
        'Content-Disposition': `attachment; filename="${slug}${ext}"`
      });
      await api('POST', `/wp/v2/media/${m.id}`, JSON.stringify({ title: slug.replace(/^ks-/, 'King Solomon – ').replace(/-/g, ' '), alt_text: 'King Solomon Luxury Villas, Kalyves Crete' }), { 'Content-Type': 'application/json' });
      process.stderr.write(`uploaded ${f} -> ${m.id}\n`);
    } else {
      process.stderr.write(`exists   ${f} -> ${m.id}\n`);
    }
    const sizes = m.media_details?.sizes || {};
    out[slug] = { id: m.id, url: m.source_url, w: m.media_details?.width, h: m.media_details?.height,
      large: sizes['1536x1536']?.source_url || sizes.large?.source_url || m.source_url,
      medium: sizes.medium_large?.source_url || sizes.large?.source_url || m.source_url };
  }
}
console.log(JSON.stringify(out, null, 1));
