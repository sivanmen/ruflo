// Document shell: <head>, header, footer, consent banner, accessibility menu.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, esc } from './util.mjs';
import { config, project } from './context.mjs';
import { metaTags, jsonLd, baseGraph } from './seo.mjs';
import { icon, sprite } from './icons.mjs';

const fontCSS = {};
const fontCss = (group) =>
  (fontCSS[group] ??= fs.readFileSync(path.join(ROOT, 'dist/assets/fonts', `${group}.css`), 'utf8').replace(/\s+/g, ' '));

const FONT_PRELOAD = {
  latin: ['Inter-normal-300-600-latin.woff2', 'CormorantGaramond-normal-300-latin.woff2'],
  greek: ['Inter-normal-300-600-greek.woff2', 'NotoSerifDisplay-normal-300-greek.woff2'],
  hebrew: ['Heebo-normal-300-600-hebrew.woff2', 'FrankRuhlLibre-normal-300-hebrew.woff2'],
  arabic: ['IBMPlexSansArabic-normal-300-arabic.woff2', 'Amiri-normal-400-arabic.woff2'],
  cyrillic: ['Inter-normal-300-600-cyrillic.woff2', 'CormorantGaramond-normal-300-cyrillic.woff2'],
  cjk: [],
};

export const NAV = ['project', 'villas', 'gallery', 'developer', 'contact'];

const waLink = (ctx) => `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(ctx.tr('common.whatsappText'))}`;
export const tel = (n) => `tel:${n.replace(/[^+\d]/g, '')}`;

const LANG_SUGGEST = Object.fromEntries(config.languages.map((l) => {
  const p = path.join(ROOT, 'content', l.code, 'common.json');
  const c = JSON.parse(fs.readFileSync(p, 'utf8')).langSuggest;
  return [l.code, [c.text, c.go, c.dismiss]];
}));
// Google Consent Mode v2: everything denied until the visitor opts in.
export const CONSENT_JS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',personalization_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);window.KS=${JSON.stringify({ tracking: config.tracking, form: config.form.endpoint, langs: LANG_SUGGEST })};document.documentElement.classList.add('js');`;
const consentBootstrap = () => `<script>${CONSENT_JS}</script>`;

function langSwitcher(ctx, pageKey) {
  const items = config.languages
    .map((l) => `<li><a href="${ctx.urlFor(l.code, pageKey)}" hreflang="${l.hreflang}" lang="${l.hreflang}"${l.code === ctx.lang ? ' aria-current="true"' : ''} data-lang="${l.code}"><span>${l.short}</span>${esc(langName(l.code))}</a></li>`)
    .join('');
  return `<div class="lang" data-lang-switch><button class="lang__btn" aria-expanded="false" aria-haspopup="true" aria-label="${ctx.t('common.nav.language')}">${icon('globe')}<span>${ctx.L.short}</span></button><ul class="lang__list" role="list">${items}</ul></div>`;
}

const NAMES = {};
function langName(code) {
  if (!NAMES[code]) {
    const p = path.join(ROOT, 'content', code, 'common.json');
    NAMES[code] = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).langName : code;
  }
  return NAMES[code];
}

export const logo = (ctx, variant = 'gold') =>
  `<a class="logo" href="${ctx.url('home')}" aria-label="King Solomon · ${ctx.t('common.nav.home')}"><img src="/assets/brand/crown-${variant}.svg" width="46" height="26" alt=""><span class="logo__word"><span class="logo__name">King Solomon</span><span class="logo__place">Kalyves | Crete</span></span></a>`;

function header(ctx, page) {
  const links = NAV.map((k) => `<li><a href="${ctx.url(k)}"${page.section === k ? ' aria-current="page"' : ''}>${ctx.t(`common.nav.${k === 'villas' ? 'villasShort' : k}`)}</a></li>`).join('');
  const mobile = ['home', ...NAV].map((k, i) => `<li style="--i:${i}"><a href="${ctx.url(k)}">${ctx.t(`common.nav.${k}`)}</a></li>`).join('');
  return `<header class="hdr${page.heroDark ? ' hdr--over' : ''}" data-header>
<div class="hdr__in">${logo(ctx)}
<nav class="hdr__nav" aria-label="Main"><ul role="list">${links}</ul></nav>
<div class="hdr__tools">${langSwitcher(ctx, page.key)}<a class="btn btn--gold btn--sm hdr__cta" href="${ctx.url('contact', 'enquire')}" data-enquire>${ctx.t('common.nav.ctaShort')}</a>
<button type="button" class="hdr__a11y" data-a11y-open aria-expanded="false" aria-controls="a11y-p" aria-label="${ctx.t('common.a11y.open')}">${icon('a11y')}</button><button class="hdr__burger" aria-expanded="false" aria-controls="mnav" aria-label="${ctx.t('common.nav.menu')}" data-burger><span></span><span></span></button></div></div>
<div class="mnav" id="mnav" hidden><nav aria-label="Mobile"><ul role="list">${mobile}</ul></nav>
<div class="mnav__foot"><a class="btn btn--gold" href="${ctx.url('contact', 'enquire')}">${ctx.t('common.nav.cta')}</a><a class="mnav__wa" href="${waLink(ctx)}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a></div></div>
</header>`;
}

function footer(ctx) {
  const c = config.contact;
  const col = (title, items) => `<div class="ftr__col"><h2 class="ftr__h">${title}</h2><ul role="list">${items.join('')}</ul></div>`;
  const li = (href, label, extra = '') => `<li><a href="${href}"${extra}>${label}</a></li>`;
  return `<footer class="ftr" role="contentinfo">
<div class="wrap">
<div class="ftr__top"><img class="ftr__crown" src="/assets/brand/crown-gold.svg" width="90" height="52" alt="" loading="lazy"><p class="ftr__statement">${ctx.t('common.footer.statement')}</p></div>
<div class="ftr__grid">
${col(ctx.t('common.footer.explore'), NAV.map((k) => li(ctx.url(k), ctx.t(`common.nav.${k}`))))}
${col(ctx.t('common.footer.collections'), project.collections.map((x) => li(ctx.url(x.slug), ctx.t(`common.collections.${x.slug}.name`))))}
${col(ctx.t('common.footer.downloads'), [li(ctx.url('contact', 'enquire'), ctx.t('common.footer.brochure'), ' data-enquire data-request="brochure"'), li(ctx.url('contact', 'enquire'), ctx.t('common.footer.plans'), ' data-enquire data-request="plans"'), li(ctx.url('landing'), ctx.t('common.footer.offer'))])}
${col(ctx.t('common.footer.legal'), [li(ctx.url('privacy'), ctx.t('common.footer.privacy')), li(ctx.url('cookies'), ctx.t('common.footer.cookies')), li(ctx.url('terms'), ctx.t('common.footer.terms')), li(ctx.url('accessibility'), ctx.t('common.footer.accessibility')), `<li><button type="button" class="linklike" data-consent-open>${ctx.t('common.footer.cookieSettings')}</button></li>`])}
<div class="ftr__col ftr__contact"><h2 class="ftr__h">${ctx.t('common.nav.contact')}</h2><ul role="list">
<li><a href="${tel(c.phoneGreece)}" dir="ltr">${c.phoneGreece}</a></li><li><a href="${tel(c.phoneIsrael)}" dir="ltr">${c.phoneIsrael}</a></li>
<li><a href="mailto:${c.email}">${c.email}</a></li><li><span dir="auto">${esc(c.officeGreece)}</span></li></ul></div>
</div>
<div class="ftr__langs"><ul role="list">${config.languages.map((l) => `<li><a href="${ctx.urlFor(l.code, ctx.pageKey)}" hreflang="${l.hreflang}" lang="${l.hreflang}">${esc(langName(l.code))}</a></li>`).join('')}</ul></div>
<p class="ftr__disc">${ctx.t('common.footer.disclaimer')}</p>
<div class="ftr__bottom"><p>${ctx.t('common.footer.rights')}</p></div>
<p class="ftr__legal" dir="auto">${esc(config.legal.company)} · ${ctx.t('common.companyInfo.vat')} <span dir="ltr">${esc(config.legal.vat)}</span> · <span dir="ltr">${esc(config.legal.companyAddress)}</span> · <a href="${tel(config.contact.phoneGreece)}" dir="ltr">${config.contact.phoneGreece}</a> · <a href="mailto:${config.contact.email}">${config.contact.email}</a></p>
</div></footer>`;
}

function consentUI(ctx) {
  const cats = ['necessary', 'preferences', 'analytics', 'marketing']
    .map((k) => `<div class="cc__cat"><div class="cc__cathead"><h3>${ctx.t(`common.cookies.categories.${k}.name`)}</h3>${k === 'necessary' ? `<span class="cc__on">${ctx.t('common.cookies.alwaysOn')}</span>` : `<label class="switch"><input type="checkbox" name="${k}" data-cc-cat><span class="switch__ui" aria-hidden="true"></span><span class="sr">${ctx.t(`common.cookies.categories.${k}.name`)}</span></label>`}</div><p>${ctx.t(`common.cookies.categories.${k}.desc`)}</p></div>`)
    .join('');
  return `<div class="cc" data-consent hidden role="dialog" aria-modal="false" aria-labelledby="cc-t" aria-describedby="cc-d">
<div class="cc__box"><h2 id="cc-t" class="cc__title">${ctx.t('common.cookies.title')}</h2><p id="cc-d">${ctx.t('common.cookies.text')} <a href="${ctx.url('cookies')}">${ctx.t('common.cookies.policy')}</a></p>
<div class="cc__panel" data-cc-panel hidden><h3 class="cc__ptitle">${ctx.t('common.cookies.panelTitle')}</h3>${cats}</div>
<div class="cc__actions"><button type="button" class="btn btn--line" data-cc="reject">${ctx.t('common.cookies.reject')}</button><button type="button" class="btn btn--line" data-cc="customize">${ctx.t('common.cookies.customize')}</button><button type="button" class="btn btn--line" data-cc="save" hidden>${ctx.t('common.cookies.save')}</button><button type="button" class="btn btn--gold" data-cc="accept">${ctx.t('common.cookies.accept')}</button></div></div></div>`;
}

function a11yMenu(ctx) {
  const opt = (k, label) => `<button type="button" class="a11y__opt" data-a11y="${k}" aria-pressed="false">${label}</button>`;
  return `<div class="a11y" data-a11y-root><button type="button" class="a11y__btn" aria-expanded="false" aria-controls="a11y-p" aria-label="${ctx.t('common.a11y.open')}">${icon('a11y')}</button>
<div class="a11y__panel" id="a11y-p" hidden><p class="a11y__title">${ctx.t('common.a11y.title')}</p>
<div class="a11y__size"><span>${ctx.t('common.a11y.textSize')}</span><button type="button" data-a11y="smaller" aria-label="A-">A−</button><button type="button" data-a11y="bigger" aria-label="A+">A+</button></div>
${opt('contrast', ctx.t('common.a11y.contrast'))}${opt('motion', ctx.t('common.a11y.motion'))}${opt('links', ctx.t('common.a11y.links'))}${opt('font', ctx.t('common.a11y.font'))}
<div class="a11y__row"><button type="button" class="linklike" data-a11y="reset">${ctx.t('common.a11y.reset')}</button><a href="${ctx.url('accessibility')}">${ctx.t('common.a11y.statement')}</a></div></div></div>`;
}

function stickyBar(ctx) {
  const c = config.contact;
  return `<div class="sticky" data-sticky><a href="${waLink(ctx)}" target="_blank" rel="noopener" class="sticky__btn" data-track="whatsapp">${icon('whatsapp')}<span>${ctx.t('common.buttons.whatsapp')}</span></a><a href="${tel(c.phoneIsrael)}" class="sticky__btn" data-track="call">${icon('phone')}<span>${ctx.t('common.buttons.call')}</span></a><a href="${ctx.url('contact', 'enquire')}" class="sticky__btn sticky__btn--gold" data-enquire>${ctx.t('common.nav.ctaShort')}</a></div>`;
}

export function documentShell(ctx, page, body) {
  ctx.pageKey = page.key;
  const fonts = ctx.L.fonts;
  const graph = [...baseGraph(ctx), ...(page.schema || [])];
  const preloadImg = page.lcp ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${page.lcp}" imagesizes="100vw" fetchpriority="high">` : '';
  return `<!doctype html>
<html lang="${ctx.L.hreflang}" dir="${ctx.dir}" data-lang="${ctx.lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${metaTags(ctx, page)}
<meta name="theme-color" content="#FAF8F4">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
${FONT_PRELOAD[fonts].map((f) => `<link rel="preload" href="/assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('')}
${preloadImg}
${fonts === 'cjk' ? `<link rel="stylesheet" href="/assets/fonts/cjk.css?v=${ctx.version}">` : `<style>${fontCss(fonts)}</style>`}
<link rel="stylesheet" href="/assets/css/main.css?v=${ctx.version}">
${consentBootstrap()}
<script src="/assets/js/main.js?v=${ctx.version}" defer></script>
${jsonLd(graph)}
</head>
<body class="${page.bodyClass || ''}">
${sprite()}
<a class="skip" href="#main">${ctx.t('common.nav.skip')}</a>
${page.bare ? '' : header(ctx, page)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(ctx)}
${page.bare ? '' : stickyBar(ctx)}
${a11yMenu(ctx)}
${consentUI(ctx)}
<div class="lb" data-lightbox hidden role="dialog" aria-modal="true" aria-label="Gallery"><button class="lb__close" data-lb-close aria-label="${ctx.t('common.buttons.closeDialog')}">${icon('close')}</button><button class="lb__nav lb__prev" data-lb-prev aria-label="${ctx.t('common.buttons.prev')}">${icon('chevron')}</button><figure class="lb__fig"><img alt="" data-lb-img><figcaption data-lb-cap></figcaption></figure><button class="lb__nav lb__next" data-lb-next aria-label="${ctx.t('common.buttons.next')}">${icon('chevron')}</button><p class="lb__count" data-lb-count></p></div>
<noscript><style>.rv,.rv-l>*{opacity:1!important;transform:none!important}</style></noscript>
</body>
</html>`;
}

export { waLink };
