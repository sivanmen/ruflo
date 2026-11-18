import { SITE, LANGS, PARTIAL_LANGS } from '../config/site.mjs';

/** Escape text for HTML attribute/text contexts. */
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Strip tags (for meta/alt/JSON-LD). */
export const plain = (s = '') => String(s).replace(/<[^>]+>/g, '');

/** Site-relative URL for a page in a language. */
export const href = (lang, path = '') => `/${lang}/${path ? `${path.replace(/^\/|\/$/g, '')}/` : ''}`;

/** Absolute URL. */
export const abs = (p) => `${SITE.domain}${p}`;

export const langMeta = (code) => LANGS.find((l) => l.code === code) || PARTIAL_LANGS.find((l) => l.code === code);

/** Responsive WebP image with lazy loading. */
export function img(name, alt, { cls = '', eager = false, sizes = '(max-width: 800px) 100vw, 50vw', attrs = '' } = {}) {
  const base = `/assets/img/${name}`;
  return `<img class="${cls}" src="${base}-1600.webp" srcset="${base}-800.webp 800w, ${base}-1600.webp 1600w" sizes="${sizes}" alt="${esc(plain(alt))}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1600" height="1067" ${attrs}>`;
}

export function formatDate(iso, lang) {
  const locale = langMeta(lang)?.locale.replace('_', '-') || 'en-GB';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
}

/** Inline SVG icons (stroke-based, 24px grid). */
const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8.4 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
export const icon = (name, cls = 'i') =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

/** Brand logo: dark ink version for light surfaces, white version for dark surfaces (CSS swaps them). */
export const logoImgs = (cls = '') =>
  `<img class="logo-img logo-on-light ${cls}" src="/assets/img/brand/logo-dark.webp" alt="Modera Group" width="900" height="189"><img class="logo-img logo-on-dark ${cls}" src="/assets/img/brand/logo-light.webp" alt="" aria-hidden="true" width="900" height="189">`;

export const logo = (lang) => `<a class="logo" href="${href(lang)}" aria-label="Modera Group">${logoImgs()}</a>`;
