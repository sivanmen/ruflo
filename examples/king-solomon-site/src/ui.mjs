// Shared markup: icons, image helpers, navigation, footer. All output lives inside .ks wrappers.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MEDIA = JSON.parse(readFileSync(fileURLToPath(new URL('../data/media.json', import.meta.url)), 'utf8'));

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const media = (key) => { const m = MEDIA[key]; if (!m) throw new Error(`missing media ${key}`); return m; };
export const full = (key) => media(key).url;
export const md = (key) => (MEDIA[key + '-md'] || MEDIA[key]).url;

/** <img> with the 1200px variant as default and the full file for wide screens. */
export function img(key, alt = '', { eager = false, sizes = '100vw' } = {}) {
  const m = media(key), s = MEDIA[key + '-md'];
  const srcset = s ? ` srcset="${s.url} 1200w, ${m.url} ${m.w || 2400}w" sizes="${sizes}"` : '';
  return `<img src="${s ? s.url : m.url}"${srcset} alt="${esc(alt)}" width="${m.w || 1200}" height="${m.h || 800}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

export const PAGES = ['project', 'villas', 'gallery', 'developer', 'contact'];
export const SLUG = { home: '', project: 'the-project', villas: 'villas', gallery: 'gallery', developer: 'developer', contact: 'contact' };
export const typeSlug = (beds) => `${beds}-bedroom`;

export function url(t, page, sub) {
  const path = page === 'home' ? '' : page === 'type' ? `villas/${typeSlug(sub)}/` : `${SLUG[page]}/`;
  return `${t.base}/${path}`;
}
export function otherUrl(t, page, sub) {
  return url({ base: t.otherBase }, page, sub);
}

export const icon = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M20 12H4"/><path d="m10 6-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v13"/><path d="m6 12 6 6 6-6"/><path d="M5 21h14"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
};

export const btn = (href, label, cls = '') => `<a class="ks-btn ${cls}" href="${href}">${esc(label)}${icon.arrow}</a>`;
export const eyebrow = (s) => `<p class="ks-eyebrow">${esc(s)}</p>`;

/** Wraps one Elementor HTML widget's content. Every widget carries its own .ks root. */
export const section = (cls, inner, attrs = '') => `<section class="ks ks-sec ${cls}"${attrs}>${inner}</section>`;

export function nav(t, current) {
  const links = PAGES.map((p, i) => `<a href="${url(t, p)}"${p === current ? ' class="is-current"' : ''} style="--i:${i}">${esc(t.nav[p])}</a>`).join('');
  return `<div class="ks">
<header class="ks-nav" role="banner"><div class="ks-nav-in">
<a class="ks-brand" href="${url(t, 'home')}" aria-label="King Solomon"><img src="${full('ks-crown')}" alt="" width="34" height="24"><span>King Solomon<small>Kalyves · Creta</small></span></a>
<nav class="ks-menu" aria-label="King Solomon">${links}</nav>
<div class="ks-nav-end"><a class="ks-lang" href="${otherUrl(t, current === 'type' ? 'villas' : current)}" hreflang="${t.lang === 'he' ? 'en' : 'he'}">${t.otherLabel}</a><a class="ks-wa" href="https://wa.me/972524518134" target="_blank" rel="noopener" aria-label="WhatsApp">${icon.phone}</a>${btn(url(t, 'contact'), t.nav.cta)}
<button class="ks-burger" type="button" data-ks="open-menu" aria-label="${esc(t.nav.menu)}"><i></i><i></i><i></i></button></div>
</div></header>
<div class="ks-drawer" aria-hidden="true"><div class="ks-drawer-top"><a class="ks-brand" href="${url(t, 'home')}"><img src="${full('ks-crown')}" alt="" width="34" height="24"><span>King Solomon</span></a>
<button class="ks-drawer-close" type="button" data-ks="close-menu" aria-label="${esc(t.nav.close)}">${icon.x}</button></div>
<nav>${`<a href="${url(t, 'home')}" style="--i:0">King Solomon</a>` + PAGES.map((p, i) => `<a href="${url(t, p)}" style="--i:${i + 1}">${esc(t.nav[p])}</a>`).join('')}</nav>
<div class="ks-drawer-foot"><a href="tel:${t.contact.details.phones[0].replace(/\s/g, '')}">${t.contact.details.phones[0]}</a><a href="mailto:${t.contact.details.email}">${t.contact.details.email}</a><a href="${otherUrl(t, 'home')}">${t.otherLabel}</a></div>
</div>
<div class="ks-lb" role="dialog" aria-modal="true"><img alt=""><button class="ks-lb-x" type="button" aria-label="${esc(t.nav.close)}">${icon.x}</button>
<button class="ks-lb-prev" type="button" aria-label="${esc(t.c.prev)}">${icon.prev}</button><button class="ks-lb-next" type="button" aria-label="${esc(t.c.next)}">${icon.next}</button><p class="ks-lb-cap"></p></div>
</div>`;
}

export function footer(t) {
  const d = t.contact.details;
  return `<footer class="ks ks-foot"><div class="ks-wrap">
<div class="ks-foot-top">
<div class="ks-foot-brand"><img src="${full('ks-crown')}" alt="King Solomon" width="54" height="38"><p>${esc(t.footer.tagline)}</p></div>
<div><h4>${esc(t.footer.explore)}</h4><ul>${['home', ...PAGES].map((p) => `<li><a href="${url(t, p)}">${p === 'home' ? 'King Solomon' : esc(t.nav[p])}</a></li>`).join('')}</ul></div>
<div><h4>${esc(t.footer.contact)}</h4><ul>${d.phones.map((p) => `<li><a href="tel:${p.replace(/\s/g, '')}" dir="ltr">${p}</a></li>`).join('')}<li><a href="mailto:${d.email}">${d.email}</a></li><li>${esc(d.address)}</li></ul></div>
<div><h4>${esc(t.footer.follow)}</h4><ul><li><a href="${full('king-solomon-investor-brochure')}" target="_blank" rel="noopener">${esc(t.gallery.brochure[0])}</a></li><li><a href="${url(t, 'gallery')}#downloads">${esc(t.gallery.plansGroup)}</a></li><li><a href="${otherUrl(t, 'home')}">${t.lang === 'he' ? 'English' : 'עברית'}</a></li></ul></div>
</div>
<div class="ks-foot-bottom"><span>${esc(t.footer.rights)}</span><span>${esc(t.footer.developed)}</span></div>
<p class="ks-foot-legal">${esc(t.footer.legal)}</p>
</div></footer>`;
}

/** Inner page hero: full-bleed render, crumbs, title. */
export function pageHero(t, key, title, lead, crumbs = []) {
  const trail = [[url(t, 'home'), 'King Solomon'], ...crumbs].map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join('<span>/</span>');
  return `<section class="ks ks-hero">${img(key, title, { eager: true })}<div class="ks-wrap">
<p class="ks-crumbs">${trail}</p><h1>${title}</h1>${lead ? `<p class="ks-lead">${esc(lead)}</p>` : ''}</div></section>`;
}
