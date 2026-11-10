// Shared helpers for the static site generator (no dependencies).
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
export const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Replace {key} tokens. Values are inserted raw (callers escape when needed). */
export const fmt = (s, vars = {}) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

export const writeFile = (rel, content) => {
  const p = path.join(ROOT, 'dist', rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};

export const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};

/** Collapse whitespace between tags for smaller HTML. Keeps <pre>/<script> content intact. */
export const minifyHTML = (html) =>
  html
    .replace(/\n\s+/g, '\n')
    .replace(/>\s+</g, (m) => (m.includes('\n') ? '>\n<' : m))
    .trim();

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
