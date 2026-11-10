// Reusable page sections shared across templates.
import { esc } from './util.mjs';
import { config, project, picture } from './context.mjs';
import { icon } from './icons.mjs';
import { tel, waLink } from './layout.mjs';

export const kicker = (txt) => `<p class="kicker rv">${txt}</p>`;

export function sectionHead(ctx, { k, title, text, center = false, h = 'h2', id }) {
  return `<header class="shead${center ? ' shead--c' : ''}">${k ? kicker(k) : ''}<${h} class="h-xl rv"${id ? ` id="${id}"` : ''}>${title}</${h}>${text ? `<p class="lead rv">${text}</p>` : ''}</header>`;
}

/** Full-bleed cinematic page hero with parallax image. */
export function pageHero(ctx, { img, k, title, sub, crumbs, cta }) {
  return `<section class="phero" data-parallax-root>
<div class="phero__media" data-parallax="0.25">${picture(img, { eager: true, priority: true, alt: '' })}</div>
<div class="phero__shade"></div>
<div class="phero__in wrap">${crumbs ? breadcrumbs(ctx, crumbs) : ''}
<p class="kicker kicker--light rv">${k}</p><h1 class="h-hero rv">${title}</h1>${sub ? `<p class="phero__sub rv">${sub}</p>` : ''}${cta || ''}</div>
<a class="phero__scroll" href="#content" aria-label="${ctx.t('common.buttons.scroll')}"><span></span></a>
</section><div id="content"></div>`;
}

export function breadcrumbs(ctx, trail) {
  return `<nav class="crumbs rv" aria-label="Breadcrumb"><ol>${trail
    .map((b, i) => (i < trail.length - 1 ? `<li><a href="${b.url}">${ctx.fe(b.name)}</a></li>` : `<li aria-current="page">${ctx.fe(b.name)}</li>`))
    .join('')}</ol></nav>`;
}

export const collectionStats = (c) => {
  const vs = project.villas.filter((v) => v.bedrooms === c.bedrooms);
  return { total: vs.length, available: vs.filter((v) => v.status === 'available').length, vs };
};

export function availabilityLabel(ctx, c) {
  const { total, available } = collectionStats(c);
  if (!available) return ctx.t('common.labels.soldOut');
  if (available === 1) return ctx.t('common.labels.lastOne');
  return ctx.t('common.labels.availableOf', { a: available, t: total });
}

export function collectionCard(ctx, c, i = 0) {
  const { available } = collectionStats(c);
  return `<article class="ccard rv" style="--d:${i * 90}ms"><a href="${ctx.url(c.slug)}" class="ccard__link">
<div class="ccard__media">${picture(c.image, { sizes: '(min-width:1100px) 25vw, (min-width:700px) 50vw, 100vw', alt: ctx.tr(`common.collections.${c.slug}.name`) })}<span class="badge${available ? '' : ' badge--muted'}">${availabilityLabel(ctx, c)}</span></div>
<div class="ccard__body"><p class="ccard__k">${ctx.t(`common.collections.${c.slug}.kicker`)}</p><h3 class="ccard__t">${ctx.t(`common.collections.${c.slug}.name`)}</h3><p class="ccard__x">${ctx.t(`common.collections.${c.slug}.teaser`)}</p>
<p class="ccard__p"><strong class="ccard__req">${ctx.t('common.labels.priceOnRequest')}</strong></p><span class="ccard__go">${icon('arrow')}</span></div></a></article>`;
}

export const collectionGrid = (ctx, list = project.collections) =>
  `<div class="cgrid">${list.map((c, i) => collectionCard(ctx, c, i)).join('')}</div>`;

export function statsBand(ctx) {
  const s = project.stats;
  const items = [
    ['villas', s.villas, ''], ['elevation', s.elevation, 'm'], ['seaDistance', s.seaDistance, 'm'],
    ['view', s.view, '°'], ['chania', s.chania, '′'], ['airport', s.airport, '′'],
  ];
  return `<section class="stats" aria-label="Key facts"><div class="wrap"><ul class="stats__list" role="list">${items
    .map(([k, v, u], i) => `<li class="stat rv" style="--d:${i * 70}ms"><span class="stat__v"><span data-count="${v}">${v}</span><small>${u}</small></span><span class="stat__l">${ctx.t(`common.stats.${k}`)}</span></li>`)
    .join('')}</ul></div></section>`;
}

export function includedList(ctx) {
  const items = ctx.raw('common.included.items');
  return `<section class="sec sec--line"><div class="wrap incl"><h2 class="h-lg rv">${ctx.t('common.included.title')}</h2><ul class="incl__list" role="list">${items
    .map((x, i) => `<li class="rv" style="--d:${i * 50}ms">${icon('check')}<span>${ctx.fe(x)}</span></li>`)
    .join('')}</ul></div></section>`;
}

export function locationBlock(ctx, { img = 'location-dusk' } = {}) {
  const d = ctx.raw('common.location.distances');
  const f = ctx.raw('common.location.flights');
  return `<section class="sec loc" id="location"><div class="wrap loc__grid">
<div class="loc__media rv" data-tilt>${picture(img, { sizes: '(min-width:900px) 50vw, 100vw', alt: ctx.tr('common.location.title') })}</div>
<div class="loc__txt">${sectionHead(ctx, { k: ctx.t('common.location.kicker'), title: ctx.t('common.location.title'), text: ctx.t('common.location.text') })}
<ol class="dist" role="list">${d.map((x, i) => `<li class="rv" style="--d:${i * 80}ms"><span class="dist__t"><strong>${ctx.fe(x.time)}</strong> ${ctx.t('common.labels.min')}</span><span class="dist__p">${ctx.fe(x.place)}</span></li>`).join('')}</ol>
<a class="tlink rv" href="${config.contact.mapsUrl}" target="_blank" rel="noopener">${icon('pin')} ${ctx.t('common.location.mapCta')}</a></div></div>
<div class="wrap ferries rv"><p class="flights__t">${icon('waves')} ${ctx.t('common.location.ferriesTitle')}</p><p class="ferries__x">${ctx.t('common.location.ferriesText')}</p><ul class="ferries__list" role="list">${(ctx.raw('common.location.ferries') || []).map((x) => `<li><strong>${ctx.fe(x.port)}</strong><span>${ctx.fe(x.text)}</span></li>`).join('')}</ul></div>
<div class="wrap flights rv"><p class="flights__t">${icon('plane')} ${ctx.t('common.location.flightsTitle')}</p><div class="marquee" data-marquee><ul role="list">${f
    .map((x) => `<li><span>${ctx.fe(x.from)}</span><b dir="ltr">${ctx.fe(x.time)}</b></li>`)
    .join('')}</ul></div><p class="fine">${ctx.t('common.location.flightsNote')}</p></div></section>`;
}

export function faqBlock(ctx, items) {
  return `<section class="sec faq" id="faq"><div class="wrap faq__grid"><div>${sectionHead(ctx, { k: ctx.t('common.faqKicker'), title: ctx.t('common.faqTitle') })}</div>
<div class="faq__list">${items
    .map((f, i) => `<details class="faq__item rv" style="--d:${i * 60}ms"${i === 0 ? ' open' : ''}><summary><span>${ctx.fe(f.q)}</span>${icon('plus')}</summary><div class="faq__a"><p>${ctx.fe(f.a)}</p></div></details>`)
    .join('')}</div></div></section>`;
}

export function leadForm(ctx, { id = 'enquire', title, text, source = 'website', compact = false } = {}) {
  const villas = project.villas.filter((v) => v.status !== 'sold');
  const opt = (v, l) => `<option value="${esc(v)}">${ctx.fe(l)}</option>`;
  const collectionsOpts = project.collections.map((c) => opt(c.slug, ctx.tr(`common.collections.${c.slug}.name`))).join('');
  const villaOpts = villas.map((v) => opt(`villa-${v.no}`, `${ctx.tr('common.labels.villa')} ${v.no} · ${ctx.tr(v.bedrooms > 1 ? 'common.labels.bedroomsN' : 'common.labels.bedroomN', { n: v.bedrooms })} · ${ctx.tr(`common.labels.${v.status}`)}`)).join('');
  const field = (name, type, label, attrs = '') => `<div class="fld"><input id="${id}-${name}" name="${name}" type="${type}" placeholder=" " ${attrs}><label for="${id}-${name}">${label}</label><p class="fld__err" aria-live="polite"></p></div>`;
  const privacy = `<a href="${ctx.url('privacy')}" target="_blank">${ctx.t('common.form.privacyLink')}</a>`;
  return `<form class="lform${compact ? ' lform--compact' : ''}" id="${id}" action="${config.form.endpoint}" method="post" novalidate data-lead data-source="${source}">
${title ? `<h2 class="h-lg">${title}</h2>` : ''}${text ? `<p class="lead__txt">${text}</p>` : ''}
<div class="lead__grid">
${field('name', 'text', ctx.t('common.form.name') + ' *', 'required autocomplete="name" maxlength="120"')}
${field('phone', 'tel', ctx.t('common.form.phone') + ' *', 'required autocomplete="tel" inputmode="tel" maxlength="40" dir="ltr"')}
${field('email', 'email', ctx.t('common.form.email') + ' *', 'required autocomplete="email" maxlength="160" dir="ltr"')}
<div class="fld fld--sel"><select id="${id}-villa" name="villa"><option value="">${ctx.t('common.form.villaAny')}</option><optgroup label="${ctx.t('common.nav.villasShort')}">${collectionsOpts}</optgroup><optgroup label="${ctx.t('common.labels.villas')}">${villaOpts}</optgroup></select><label for="${id}-villa">${ctx.t('common.form.villa')}</label></div>
${compact ? '' : `<fieldset class="fld fld--radio fld--wide"><legend>${ctx.t('common.form.contactPref')}</legend>${ctx.raw('common.form.contactPrefOptions').map((o, i) => `<label class="chip"><input type="radio" name="pref" value="${['phone', 'whatsapp', 'email'][i]}"${i === 0 ? ' checked' : ''}><span>${ctx.fe(o)}</span></label>`).join('')}</fieldset>`}
${compact ? '' : `<details class="lead__more fld--wide"><summary>${ctx.t('common.form.moreDetails')}</summary><div class="lead__grid">
${field('country', 'text', ctx.t('common.form.country'), 'autocomplete="country-name" maxlength="80"')}
<div class="fld fld--sel"><select id="${id}-budget" name="budget"><option value=""></option>${ctx.raw('common.form.budgetOptions').map((b, i) => opt(String(i), b)).join('')}</select><label for="${id}-budget">${ctx.t('common.form.budget')}</label></div>
<div class="fld fld--wide"><textarea id="${id}-message" name="message" rows="3" placeholder=" " maxlength="2000"></textarea><label for="${id}-message">${ctx.t('common.form.message')}</label></div>
</div></details>`}
</div>
<div class="lead__consent">
<label class="check"><input type="checkbox" name="consent_privacy" value="yes" required><span class="check__box" aria-hidden="true"></span><span>${ctx.t('common.form.consentPrivacy', { privacy })} *</span></label>
<label class="check"><input type="checkbox" name="consent_marketing" value="yes"><span class="check__box" aria-hidden="true"></span><span>${ctx.t('common.form.consentMarketing')}</span></label>
<p class="fld__err" data-consent-err aria-live="polite"></p></div>
<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="request" value=""><p class="lead__req" data-request-note hidden data-plans="${ctx.t('common.form.requestOptions.plans')}" data-brochure="${ctx.t('common.form.requestOptions.brochure')}"></p><input type="hidden" name="lang" value="${ctx.lang}"><input type="hidden" name="source" value="${source}"><input type="hidden" name="page" value=""><input type="hidden" name="utm" value="">
<div class="lead__foot"><button class="btn btn--gold btn--lg" type="submit" data-label="${ctx.t('common.buttons.send')}" data-sending="${ctx.t('common.buttons.sending')}">${ctx.t('common.buttons.send')} ${icon('arrow')}</button><p class="fine">${icon('shield')} ${ctx.t('common.form.secure')}</p></div>
<div class="lead__msg" data-msg hidden role="status" tabindex="-1"><div data-ok hidden><h3>${ctx.t('common.form.successTitle')}</h3><p>${ctx.t('common.form.successText')}</p></div><div data-fail hidden><h3>${ctx.t('common.form.errorTitle')}</h3><p>${ctx.t('common.form.errorText')}</p><p><a class="btn btn--line" href="${waLink(ctx)}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a></p></div></div>
<script type="application/json" data-i18n>${JSON.stringify({ required: ctx.tr('common.form.errorRequired'), email: ctx.tr('common.form.errorEmail'), phone: ctx.tr('common.form.errorPhone'), consent: ctx.tr('common.form.errorConsent') })}</script>
</form>`;
}

export function contactDetails(ctx) {
  const c = config.contact;
  const row = (ic, label, value) => `<li class="cd__row rv">${icon(ic)}<div><span class="cd__l">${label}</span>${value}</div></li>`;
  return `<ul class="cd" role="list">
${row('pin', ctx.t('common.contactInfo.officeGreece'), `<span dir="auto">${ctx.fe(c.officeGreece)}</span>`)}
${row('phone', ctx.t('common.contactInfo.phoneGreece'), `<a href="${tel(c.phoneGreece)}" dir="ltr">${c.phoneGreece}</a>`)}
${row('pin', ctx.t('common.contactInfo.officeIsrael'), `<span dir="auto">${ctx.fe(c.officeIsrael)}</span>`)}
${row('phone', ctx.t('common.contactInfo.phoneIsrael'), `<a href="${tel(c.phoneIsrael)}" dir="ltr">${c.phoneIsrael}</a>`)}
${row('mail', ctx.t('common.contactInfo.email'), `<a href="mailto:${c.email}">${c.email}</a>`)}
${row('whatsapp', 'WhatsApp', `<a href="${waLink(ctx)}" target="_blank" rel="noopener" dir="ltr">${c.phoneIsrael}</a>`)}
</ul>`;
}

export function enquireSection(ctx, { img = 'terrace-horizon', source = 'website' } = {}) {
  return `<section class="sec enq" id="enquire-section"><div class="enq__bg" data-parallax="0.15">${picture(img, { alt: '' })}</div><div class="wrap enq__grid">
<div class="enq__intro">${kicker(ctx.t('common.form.kicker'))}<h2 class="h-xl rv">${ctx.t('common.form.title')}</h2><p class="lead rv">${ctx.t('common.form.text')}</p>${contactDetails(ctx)}</div>
<div class="enq__card rv">${leadForm(ctx, { source })}</div></div></section>`;
}

export function downloadsBlock(ctx) {
  return `<section class="sec dl"><div class="wrap dl__grid">${sectionHead(ctx, { k: ctx.t('home.downloads.kicker'), title: ctx.t('home.downloads.title'), text: ctx.t('home.downloads.text') })}
<div class="dl__cards"><a class="dlc rv" href="${ctx.url('contact', 'enquire')}" data-enquire data-request="brochure">${icon('mail')}<span class="dlc__t">${ctx.t('home.downloads.brochure')}</span><span class="dlc__m">${ctx.t('home.downloads.brochureMeta')}</span></a>
<a class="dlc rv" href="${ctx.url('contact', 'enquire')}" data-enquire data-request="plans">${icon('key')}<span class="dlc__t">${ctx.t('home.downloads.plans')}</span><span class="dlc__m">${ctx.t('home.downloads.plansMeta')}</span></a></div></div></section>`;
}

export function ctaBand(ctx, { title, btn, href, img = 'location-dusk' }) {
  return `<section class="band" data-parallax-root><div class="band__bg" data-parallax="0.3">${picture(img, { alt: '' })}</div><div class="wrap band__in"><p class="band__t rv">${title}</p><a class="btn btn--light rv" href="${href}">${btn} ${icon('arrow')}</a></div></section>`;
}
