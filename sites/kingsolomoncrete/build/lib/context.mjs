// Per-language rendering context: translations, formatting, URLs and images.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJSON, esc, fmt } from './util.mjs';

export const config = readJSON('data/config.json');
export const project = readJSON('data/project.json');
export const images = readJSON('data/images.json');

export const ROUTES = {
  home: '',
  villas: 'villas/',
  '1-bedroom': 'villas/1-bedroom/',
  '2-bedroom': 'villas/2-bedroom/',
  '3-bedroom': 'villas/3-bedroom/',
  '5-bedroom': 'villas/5-bedroom/',
  project: 'the-project/',
  gallery: 'gallery/',
  developer: 'developer/',
  contact: 'contact/',
  landing: 'private-offer/',
  privacy: 'privacy-policy/',
  cookies: 'cookie-policy/',
  terms: 'terms/',
  accessibility: 'accessibility/',
};

const FILES = ['common', 'home', 'project', 'villas', 'pages', 'legal'];

function loadLang(code) {
  const out = {};
  for (const f of FILES) {
    const p = path.join(ROOT, 'content', code, `${f}.json`);
    out[f] = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  }
  return out;
}

const EN = loadLang('en');
const get = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function createContext(lang) {
  const L = config.languages.find((l) => l.code === lang);
  const data = loadLang(lang);
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : L.locale.replace('_', '-');
  const vars = { ...config.legal, ...config.contact, site: config.domain, year: new Date().getFullYear(), v: project.priceList };

  /** Raw value lookup with English fallback. */
  const raw = (key) => {
    const v = get(data, key);
    if (v === undefined || v === null || v === '') return get(EN, key);
    return v;
  };
  /** In RTL languages, isolate Latin runs (brand names, addresses, numbers) so punctuation stays in place. */
  const iso = L.dir === 'rtl'
    ? (s) => s.replace(/&#?\w+;|\{\w+\}|([A-Za-z0-9][A-Za-z0-9 .,'&@+\/:|-]*[A-Za-z0-9])/g, (m, g) => (g && /[A-Za-z]/.test(g) ? `\u2068${g}\u2069` : m))
    : (s) => s;
  /** Escaped, token-formatted string. */
  const t = (key, extra = {}) => fmt(iso(esc(raw(key) ?? key)), { ...vars, ...extra });
  /** Unescaped token-formatted string (for attribute values the caller escapes, or JSON). */
  const tr = (key, extra = {}) => fmt(raw(key) ?? key, { ...vars, ...extra });
  const fe = (s, extra = {}) => fmt(iso(esc(s)), { ...vars, ...extra });

  const price = (n) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const num = (n) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);
  const prefix = lang === config.defaultLang ? '/' : `/${lang}/`;
  const url = (key, hash = '') => prefix + (ROUTES[key] ?? key) + (hash ? `#${hash}` : '');
  const urlFor = (code, key) => (code === config.defaultLang ? '/' : `/${code}/`) + (ROUTES[key] ?? key);

  return { lang, L, dir: L.dir, iso, locale, data, raw, t, tr, fe, price, num, url, urlFor, vars, config, project };
}

/**
 * Responsive <picture> with AVIF/WebP sources and a JPEG fallback.
 * opts: { alt, sizes, cls, eager, priority, imgCls, attrs }
 */
export function picture(name, opts = {}) {
  const m = images[name];
  if (!m) throw new Error(`Unknown image: ${name}`);
  const base = `/assets/img/${name}`;
  const set = (ext) => m.widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  const sizes = opts.sizes || '100vw';
  const loading = opts.eager ? 'eager' : 'lazy';
  const prio = opts.priority ? ' fetchpriority="high"' : '';
  return `<picture class="${opts.cls || ''}" style="--ph:${m.color}">` +
    `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img src="${base}-${m.jpg}.jpg" width="${m.w}" height="${m.h}" alt="${esc(opts.alt || '')}" loading="${loading}" decoding="async"${prio}${opts.imgCls ? ` class="${opts.imgCls}"` : ''}${opts.attrs || ''}>` +
    `</picture>`;
}

export const imgSrc = (name, w = 1600) => {
  const m = images[name];
  const pick = m.widths.find((x) => x >= w) || m.widths[m.widths.length - 1];
  return `/assets/img/${name}-${pick}.webp`;
};
export const imgJpg = (name) => `/assets/img/${name}-${images[name].jpg}.jpg`;
