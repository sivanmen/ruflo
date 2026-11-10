// Paid-media landing page (not in main navigation, linked from footer only) + legal pages + 404.
import { esc } from '../lib/util.mjs';
import { project, picture, images } from '../lib/context.mjs';
import { icon } from '../lib/icons.mjs';
import { logo, tel, waLink } from '../lib/layout.mjs';
import { leadForm, statsBand, collectionGrid, breadcrumbs } from '../lib/sections.mjs';
import { breadcrumbNode } from '../lib/seo.mjs';

const STRIP = ['rooftop-sea', 'infinity-pool', 'living-room', 'terrace-dining', 'aerial-terraces', 'interior-kitchen'];

export function renderLanding(ctx) {
  const L = (k) => ctx.raw(`pages.landing.${k}`);
  const avail = project.villas.filter((v) => v.status === 'available').length;
  const phone = ctx.config.contact.phoneIsrael;
  const time = (s) => esc(String(s).replace(/\s*min$/i, ` ${ctx.tr('common.labels.min')}`));
  const body = `<header class="lph"><div class="wrap lph__in">${logo(ctx, 'gold')}<a class="btn btn--line btn--sm" href="${tel(phone)}" dir="ltr">${icon('phone')} ${phone}</a></div></header>
<section class="lp-hero"><div class="lp-hero__bg" data-parallax="0.2">${picture('cliff-sea', { eager: true, priority: true, alt: '' })}</div><div class="lp-hero__shade"></div>
<div class="wrap lp-hero__grid"><div class="lp-hero__txt"><span class="badge badge--glass rv">${ctx.t('pages.landing.hero.badge')}</span>
<p class="lp-hero__price rv"><span>${ctx.t('pages.landing.hero.priceLead')}</span><strong>${avail}<small>/${project.villas.length}</small></strong></p>
<h1 class="h-hero rv">${ctx.t('pages.landing.hero.title')}</h1><p class="phero__sub rv">${ctx.t('pages.landing.hero.text')}</p>
<a class="btn btn--light rv lp-hero__cta" href="#lp-form">${ctx.t('pages.landing.hero.cta')} ${icon('arrow-down')}</a></div>
<div class="lp-hero__card rv" id="lp-form">${leadForm(ctx, { id: 'lpf', title: ctx.t('pages.landing.formTitle'), text: ctx.t('pages.landing.formText'), source: 'landing', compact: true })}</div></div></section>
${statsBand(ctx)}
<section class="sec"><div class="wrap lp-why"><div><h2 class="h-xl rv">${ctx.t('pages.landing.why.title')}</h2><p class="lead rv">${ctx.t('pages.landing.why.text')}</p></div>
<ul class="vals vals--2" role="list">${L('why.items').map((w, i) => `<li class="val rv" style="--d:${i * 80}ms"><span class="val__n">0${i + 1}</span><h3>${ctx.fe(w.title)}</h3><p>${ctx.fe(w.text)}</p></li>`).join('')}</ul></div></section>
<section class="strip" aria-label="Gallery"><div class="marquee marquee--img" data-marquee><ul role="list">${STRIP.map((n) => `<li><button type="button" data-lb="${n}" data-lb-w="${images[n].w}" aria-label="${ctx.t('common.buttons.openGallery')}">${picture(n, { sizes: '40vw', alt: '' })}</button></li>`).join('')}</ul></div></section>
<section class="sec"><div class="wrap">${collectionGrid(ctx)}</div></section>
<section class="sec dark"><div class="wrap lp-around"><h2 class="h-xl rv">${ctx.t('pages.landing.around.title')}</h2>
<ol class="dist dist--light" role="list">${L('around.items').map((a, i) => `<li class="rv" style="--d:${i * 80}ms"><span class="dist__t"><strong>${time(a.time)}</strong></span><span class="dist__p">${ctx.fe(a.text)}</span></li>`).join('')}</ol></div></section>
<section class="sec"><div class="wrap"><h2 class="h-xl rv">${ctx.t('pages.landing.trust.title')}</h2>
<ol class="trio trio--light" role="list">${L('trust.items').map((g, i) => `<li class="rv" style="--d:${i * 100}ms"><span class="trio__n">0${i + 1}</span><h3>${ctx.fe(g.title)}</h3><p>${ctx.fe(g.text)}</p></li>`).join('')}</ol></div></section>
<section class="sec enq"><div class="enq__bg" data-parallax="0.15">${picture('terrace-horizon', { alt: '' })}</div><div class="wrap wrap--form"><div class="enq__card rv">${leadForm(ctx, { id: 'lpf2', title: ctx.t('pages.landing.formTitle'), text: ctx.t('pages.landing.formText'), source: 'landing-bottom', compact: true })}</div></div></section>
<div class="sticky sticky--lp" data-sticky><a href="${waLink(ctx)}" target="_blank" rel="noopener" class="sticky__btn" data-track="whatsapp">${icon('whatsapp')}<span>WhatsApp</span></a><a href="${tel(phone)}" class="sticky__btn" data-track="call">${icon('phone')}<span>${ctx.t('common.buttons.call')}</span></a><a href="#lp-form" class="sticky__btn sticky__btn--gold">${ctx.t('pages.landing.hero.cta')}</a></div>`;
  return {
    key: 'landing', section: 'landing', bare: true, noindex: true, bodyClass: 'p-landing',
    title: ctx.tr('pages.landing.meta.title'), description: ctx.tr('pages.landing.meta.description'), ogImage: 'cliff-sea',
    body,
  };
}

const CAT = { necessary: 'common.cookies.categories.necessary.name', preferences: 'common.cookies.categories.preferences.name', analytics: 'common.cookies.categories.analytics.name', marketing: 'common.cookies.categories.marketing.name' };

export function renderLegal(ctx, key) {
  const d = ctx.raw(`legal.${key}`);
  const date = new Intl.DateTimeFormat(ctx.locale, { dateStyle: 'long' }).format(new Date(ctx.config.legal.updated));
  const crumbs = [{ name: ctx.tr('common.nav.breadcrumbHome'), url: ctx.url('home') }, { name: d.title, url: ctx.url(key) }];
  const sec = (s, i) => `<section id="s${i + 1}" class="legal__s"><h2>${ctx.fe(s.h, { date })}</h2>${(s.p || []).map((p) => `<p>${linkify(ctx.fe(p, { date }))}</p>`).join('')}${s.list ? `<ul>${s.list.map((x) => `<li>${linkify(ctx.fe(x, { date }))}</li>`).join('')}</ul>` : ''}${key === 'cookies' && i === 2 ? cookieTable(ctx) : ''}</section>`;
  const body = `<section class="legal"><div class="wrap legal__grid">
<aside class="legal__toc"><p class="kicker">${ctx.t('legal.tocLabel')}</p><ol>${d.sections.map((s, i) => `<li><a href="#s${i + 1}">${ctx.fe(s.h.replace(/^\d+\.\s*/, ''))}</a></li>`).join('')}</ol></aside>
<article class="legal__body">${breadcrumbs(ctx, crumbs)}<h1 class="h-xl">${ctx.fe(d.title)}</h1>${companyBox(ctx, key)}<p class="fine">${ctx.t('legal.updatedLabel', { date })}</p><p class="lead">${linkify(ctx.fe(d.intro, { date }))}</p>
${d.sections.map(sec).join('')}${key === 'cookies' ? `<p><button type="button" class="btn btn--gold" data-consent-open>${ctx.t('common.footer.cookieSettings')}</button></p>` : ''}</article></div></section>`;
  return {
    key, section: key, bodyClass: 'p-legal',
    title: ctx.tr(`legal.${key}.meta.title`), description: ctx.tr(`legal.${key}.meta.description`),
    schema: [breadcrumbNode(ctx, crumbs)],
    body,
  };
}

function cookieTable(ctx) {
  const h = ctx.raw('legal.cookies.table');
  const rows = ctx.raw('legal.cookies.rows');
  return `<div class="ctable"><table><thead><tr><th>${ctx.fe(h.name)}</th><th>${ctx.fe(h.provider)}</th><th>${ctx.fe(h.purpose)}</th><th>${ctx.fe(h.duration)}</th><th>${ctx.fe(h.category)}</th></tr></thead><tbody>${rows
    .map((r) => `<tr><td dir="ltr"><code>${ctx.fe(r.name)}</code></td><td>${ctx.fe(r.provider)}</td><td>${ctx.fe(r.purpose)}</td><td>${ctx.fe(r.duration)}</td><td>${ctx.t(CAT[r.category])}</td></tr>`)
    .join('')}</tbody></table></div>`;
}

function companyBox(ctx, key) {
  const c = ctx.config, I = (k) => ctx.t(`common.companyInfo.${k}`);
  const row = (k, v) => `<div><dt>${I(k)}</dt><dd>${v}</dd></div>`;
  return `<aside class="cbox" aria-label="${I('title')}"><p class="cbox__t">${key === 'privacy' ? I('controller') : I('title')}</p><dl>
${row('company', `<span dir="auto">${esc(c.legal.company)}</span>`)}${row('address', `<span dir="ltr">${esc(c.legal.companyAddress)}</span>`)}
${row('vat', `<span dir="ltr">${esc(c.legal.vat)}</span>`)}${row('phone', `<a href="${tel(c.contact.phoneGreece)}" dir="ltr">${c.contact.phoneGreece}</a>`)}
${row('email', `<a href="mailto:${c.contact.email}">${c.contact.email}</a>`)}</dl></aside>`;
}

const linkify = (s) =>
  s
    .replace(/(https?:\/\/[^\s<)]+[^\s<).,;])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(www\.[a-z0-9.-]+\.[a-z]{2,}[^\s<)]*[^\s<).,;])/gi, '$1<a href="https://$2" target="_blank" rel="noopener">$2</a>')
    .replace(/([\w.+-]+@[\w-]+\.[\w.]+[\w])/g, '<a href="mailto:$1">$1</a>');

export function render404(ctx) {
  const body = `<section class="nf">${picture('location-dusk', { eager: true, alt: '', cls: 'nf__bg' })}<div class="nf__in wrap"><img src="/assets/brand/crown-white.svg" width="88" height="50" alt=""><p class="kicker kicker--light">404</p><h1 class="h-hero">${ctx.t('common.notFound.title')}</h1><p class="phero__sub">${ctx.t('common.notFound.text')}</p><a class="btn btn--light" href="${ctx.url('home')}">${ctx.t('common.notFound.cta')} ${icon('arrow')}</a></div></section>`;
  return { key: 'home', section: '404', heroDark: true, noindex: true, title: ctx.tr('common.notFound.metaTitle'), description: ctx.tr('common.notFound.text'), body };
}
