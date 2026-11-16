// Villas overview (availability) and collection detail pages.
import { esc } from '../lib/util.mjs';
import { project, picture, images } from '../lib/context.mjs';
import { icon } from '../lib/icons.mjs';
import { collectionNode, breadcrumbNode } from '../lib/seo.mjs';
import {
  pageHero, sectionHead, collectionGrid, collectionCard, collectionStats, availabilityLabel,
  includedList, enquireSection, kicker,
} from '../lib/sections.mjs';

const bedLabel = (ctx, n) => ctx.t(n > 1 ? 'common.labels.bedroomsN' : 'common.labels.bedroomN', { n });
const sqm = (ctx, v) => `${typeof v === 'number' ? ctx.num(v) : esc(String(v).replace(/\d+(?:\.\d+)?/g, (n) => ctx.num(+n)))}&nbsp;${ctx.t('common.labels.sqm')}`;

function villaRow(ctx, v) {
  const plans = `<a class="plink" href="${ctx.url('contact', 'enquire')}" data-enquire data-request="plans" data-villa="villa-${v.no}">${icon('mail')}${ctx.t('common.buttons.requestPlans')}</a>`;
  const enquire = v.status === 'sold' ? '' : `<a class="btn btn--line btn--xs" href="${ctx.url('contact', 'enquire')}" data-enquire data-villa="villa-${v.no}">${ctx.t('common.buttons.enquire')}</a>`;
  return `<tr id="villa-${v.no}" data-bed="${v.bedrooms}" data-status="${v.status}">
<th scope="row"><span class="vno">${v.no}</span></th>
<td data-l="${ctx.t('common.labels.bedrooms')}">${bedLabel(ctx, v.bedrooms)}</td>
<td data-l="${ctx.t('common.labels.level')}">${ctx.t(`common.labels.${v.level}`)}</td>
<td data-l="${ctx.t('common.labels.interior')}" dir="ltr">${sqm(ctx, v.interior)}</td>
<td data-l="${ctx.t('common.labels.outdoor')}" dir="ltr">${sqm(ctx, v.outdoor)}</td>
<td data-l="${ctx.t('common.labels.pool')}" dir="ltr">${sqm(ctx, v.pool)}</td>
<td data-l="${ctx.t('common.labels.status')}"><span class="st st--${v.status}">${ctx.t(`common.labels.${v.status}`)}</span></td>
<td class="vt__act"><div class="vt__actin"><span class="plinks">${plans}</span>${enquire}</div></td></tr>`;
}

export function villaTable(ctx, villas, { filters = true } = {}) {
  const beds = [...new Set(villas.map((v) => v.bedrooms))].sort();
  const fbtn = (group, val, label, on) => `<button type="button" class="chip${on ? ' is-on' : ''}" data-filter="${group}" data-val="${val}" aria-pressed="${on}">${label}</button>`;
  const filterUI = filters
    ? `<div class="vfilters rv" role="group"><div class="vfilters__g"><span>${ctx.t('villas.availability.filterBedrooms')}</span>${fbtn('bed', 'all', ctx.t('villas.availability.all'), true)}${beds.map((b) => fbtn('bed', b, ctx.t(`common.collections.${b}-bedroom.short`), false)).join('')}</div>
<div class="vfilters__g"><span>${ctx.t('villas.availability.filterStatus')}</span>${fbtn('status', 'all', ctx.t('villas.availability.all'), true)}${['available', 'reserved', 'sold'].map((s) => fbtn('status', s, ctx.t(`common.labels.${s}`), false)).join('')}</div></div>`
    : '';
  return `<div class="vtable" data-vtable>${filterUI}
<div class="vt__wrap"><table class="vt"><thead><tr><th scope="col">${ctx.t('common.labels.villa')}</th><th scope="col">${ctx.t('common.labels.bedrooms')}</th><th scope="col">${ctx.t('common.labels.level')}</th><th scope="col">${ctx.t('common.labels.interior')}</th><th scope="col">${ctx.t('common.labels.outdoor')}</th><th scope="col">${ctx.t('common.labels.pool')}</th><th scope="col">${ctx.t('common.labels.status')}</th><th scope="col"><span class="sr">${ctx.t('common.labels.plans')}</span></th></tr></thead>
<tbody>${villas.map((v) => villaRow(ctx, v)).join('')}</tbody></table><p class="vt__none" data-vnone hidden>${ctx.t('villas.availability.noResults')}</p></div>
<p class="fine">${ctx.t('villas.availability.note')}</p></div>`;
}

export function villaMap(ctx, villas) {
  const row = (level) => {
    const list = villas.filter((v) => v.level === level);
    if (!list.length) return '';
    return `<div class="vmap__row"><div class="vmap__h"><strong>${ctx.t(`villas.availability.${level}Row`)}</strong><span>${ctx.t(`villas.availability.${level}RowSub`)}</span></div><ul role="list">${list
      .map((v) => `<li><a href="#villa-${v.no}" class="vdot vdot--${v.status}" data-vjump="${v.no}" aria-label="${ctx.t('common.labels.villa')} ${v.no} · ${ctx.t(`common.labels.${v.status}`)}">${v.no}</a></li>`)
      .join('')}</ul></div>`;
  };
  return `<div class="vmap rv">${row('rooftop')}${row('garden')}<ul class="legend" role="list">${['available', 'reserved', 'sold'].map((s) => `<li><span class="vdot vdot--${s} vdot--sm"></span>${ctx.t(`common.labels.${s}`)}</li>`).join('')}</ul></div>`;
}

function levelsSection(ctx) {
  const lv = project.levels || [];
  const tabs = lv.map((l, i) => `<button type="button" role="tab" class="tab${i ? '' : ' is-on'}" id="tab-lv-${l.key}" aria-controls="pane-lv-${l.key}" aria-selected="${!i}" tabindex="${i ? -1 : 0}" data-tab>${ctx.t(`villas.levels.${l.key}`)}</button>`).join('');
  const panes = lv.map((l, i) => `<div class="pane" role="tabpanel" id="pane-lv-${l.key}" aria-labelledby="tab-lv-${l.key}"${i ? ' hidden' : ''}>
<button type="button" class="pane__plan pane__plan--dark" data-lb="${l.plan}" data-lb-w="${images[l.plan].w}" aria-label="${ctx.t('common.buttons.viewPlan')} · ${ctx.t(`villas.levels.${l.key}`)}">${picture(l.plan, { sizes: '(min-width:900px) 62vw, 100vw', alt: `${ctx.tr('villas.levels.kicker')} · ${ctx.tr(`villas.levels.${l.key}`)}` })}<span class="mplan__zoom">${icon('expand')}</span></button>
<div class="pane__info"><h3 class="h-md">${ctx.t(`villas.levels.${l.key}`)}</h3><p class="pane__lvl">${ctx.t('villas.levels.villasLabel')}</p>
<ul class="vmap__dots" role="list">${l.villas.map((n) => { const v = project.villas.find((x) => x.no === n); return `<li><a href="#villa-${n}" class="vdot vdot--${v.status}" data-vjump="${n}" aria-label="${ctx.t('common.labels.villa')} ${n} · ${ctx.t(`common.labels.${v.status}`)}">${n}</a></li>`; }).join('')}</ul></div></div>`).join('');
  return `<section class="sec sec--line" id="levels"><div class="wrap">${sectionHead(ctx, { k: ctx.t('villas.levels.kicker'), title: ctx.t('villas.levels.title'), text: ctx.t('villas.levels.text') })}<div class="tabs" data-tabs><div class="tabs__list" role="tablist">${tabs}</div>${panes}</div></div></section>`;
}

export function renderVillas(ctx) {
  const crumbs = [{ name: ctx.tr('common.nav.breadcrumbHome'), url: ctx.url('home') }, { name: ctx.tr('common.nav.villas'), url: ctx.url('villas') }];
  const body = `${pageHero(ctx, { img: 'hillside-2', k: ctx.t('villas.hero.kicker'), title: ctx.t('villas.hero.title'), sub: ctx.t('villas.hero.subtitle'), crumbs })}
<section class="sec"><div class="wrap">${collectionGrid(ctx)}</div></section>
<section class="sec sec--line" id="availability"><div class="wrap">${sectionHead(ctx, { k: ctx.t('villas.availability.kicker'), title: ctx.t('villas.availability.title'), text: ctx.t('villas.availability.text') })}
${villaMap(ctx, project.villas)}${villaTable(ctx, project.villas)}</div></section>
${levelsSection(ctx)}
<section class="sec mplan"><div class="wrap">${sectionHead(ctx, { k: ctx.t('villas.masterplan.kicker'), title: ctx.t('villas.masterplan.title'), text: ctx.t('villas.masterplan.text') })}
<button type="button" class="mplan__img rv" data-lb="masterplan-numbers" data-lb-w="${images['masterplan-numbers'].w}" aria-label="${ctx.t('villas.masterplan.title')}">${picture('masterplan-numbers', { alt: ctx.tr('villas.masterplan.title') })}<span class="mplan__zoom">${icon('expand')}</span></button></div></section>
${includedList(ctx)}
${enquireSection(ctx, { source: 'villas' })}`;
  return {
    key: 'villas', section: 'villas', heroDark: true,
    title: ctx.tr('villas.meta.title'), description: ctx.tr('villas.meta.description'), ogImage: 'hillside-2',
    schema: [breadcrumbNode(ctx, crumbs), ...project.collections.map((c) => collectionNode(ctx, c))],
    body,
  };
}

function layoutTabs(ctx, c) {
  const tabs = c.layouts.map((l, i) => `<button type="button" role="tab" class="tab${i ? '' : ' is-on'}" id="tab-${l.code}" aria-controls="pane-${l.code}" aria-selected="${!i}" tabindex="${i ? -1 : 0}" data-tab>${ctx.t('common.labels.type', { code: l.code })}</button>`).join('');
  const lvl = { firstRoof: 'levelFirstRoof', first: 'levelFirst', ground: 'levelGround', groundLower: 'levelGroundLower' };
  const panes = c.layouts
    .map((l, i) => `<div class="pane" role="tabpanel" id="pane-${l.code}" aria-labelledby="tab-${l.code}"${i ? ' hidden' : ''}>
<a class="pane__plan pane__plan--locked" href="${ctx.url('contact', 'enquire')}" data-enquire data-request="plans" data-villa="${c.slug}">${picture(l.plan, { sizes: '(min-width:900px) 40vw, 60vw', alt: '' })}<span class="lock"><span class="lock__ico">${icon('key')}</span><span class="lock__t">${ctx.t('villas.collectionPage.plansLocked')}</span><span class="btn btn--gold btn--sm">${ctx.t('common.buttons.requestPlansLong')} ${icon('arrow')}</span></span></a>
<div class="pane__info"><h3 class="h-md">${ctx.t('common.labels.type', { code: l.code })}</h3><p class="pane__lvl">${ctx.t(`common.labels.${lvl[l.levelKey]}`)} · ${bedLabel(ctx, l.bedrooms)}</p>
<dl class="areas">${Object.entries(l.areas).map(([k, v]) => `<div><dt>${ctx.t(`common.labels.${k}`)}</dt><dd dir="ltr">${sqm(ctx, v)}</dd></div>`).join('')}</dl>
<a class="btn btn--gold" href="${ctx.url('contact', 'enquire')}" data-enquire data-villa="${c.slug}">${ctx.t('common.buttons.enquire')} ${icon('arrow')}</a></div></div>`)
    .join('');
  return `<div class="tabs" data-tabs><div class="tabs__list" role="tablist">${tabs}</div>${panes}</div>`;
}

export function renderCollection(ctx, c) {
  const { vs } = collectionStats(c);
  const name = ctx.tr(`common.collections.${c.slug}.name`);
  const crumbs = [
    { name: ctx.tr('common.nav.breadcrumbHome'), url: ctx.url('home') },
    { name: ctx.tr('common.nav.villas'), url: ctx.url('villas') },
    { name, url: ctx.url(c.slug) },
  ];
  const facts = [
    [ctx.t('common.labels.villas'), vs.length],
    [ctx.t('common.labels.interior'), sqm(ctx, c.interior)],
    [ctx.t('common.labels.outdoor'), sqm(ctx, c.outdoor)],
    [ctx.t('common.labels.pool'), sqm(ctx, c.pool)],
  ];
  const hl = ctx.raw(`villas.${c.slug}.highlights`) || [];
  const others = project.collections.filter((x) => x.slug !== c.slug);
  const heroCta = `<div class="phero__price rv"><strong>${availabilityLabel(ctx, c)}</strong><em>${ctx.t('common.labels.priceOnRequest')}</em></div>`;
  const body = `${pageHero(ctx, { img: c.hero, k: ctx.t(`common.collections.${c.slug}.kicker`), title: esc(name), sub: ctx.t(`villas.${c.slug}.title`), crumbs, cta: heroCta })}
<section class="sec"><div class="wrap col-intro">
<div>${kicker(ctx.t(`villas.${c.slug}.lead`))}<h2 class="h-xl rv">${ctx.t(`villas.${c.slug}.title`)}</h2><p class="lead rv">${ctx.t(`villas.${c.slug}.text`)}</p>
<ul class="hl" role="list">${hl.map((h) => `<li class="rv">${icon('check')}${ctx.fe(h)}</li>`).join('')}</ul></div>
<aside class="facts rv" aria-label="${ctx.t('villas.collectionPage.keyFacts')}"><h3 class="facts__h">${ctx.t('villas.collectionPage.keyFacts')}</h3><dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd dir="ltr">${v}</dd></div>`).join('')}<div class="facts__price"><dt>${ctx.t('common.labels.priceOnRequest')}</dt></div></dl>
<p class="facts__av">${availabilityLabel(ctx, c)}</p><a class="btn btn--gold btn--block" href="#enquire" data-enquire data-villa="${c.slug}">${ctx.t('common.buttons.requestPrices')}</a><a class="btn btn--line btn--block" href="${ctx.url('contact', 'enquire')}" data-enquire data-villa="${c.slug}">${ctx.t('common.nav.cta')}</a></aside></div></section>
<section class="mosaic" aria-label="Gallery"><div class="wrap mosaic__grid">${c.gallery.map((g, i) => `<button type="button" class="mosaic__i mosaic__i--${i} rv" data-lb="${g}" data-lb-w="${images[g].w}" aria-label="${ctx.t('common.buttons.openGallery')}">${picture(g, { sizes: i ? '(min-width:900px) 33vw, 50vw' : '(min-width:900px) 66vw, 100vw', alt: '' })}</button>`).join('')}</div></section>
<section class="sec sec--line" id="layouts"><div class="wrap">${sectionHead(ctx, { k: ctx.t('villas.collectionPage.layouts'), title: ctx.t('villas.collectionPage.layoutsText') })}${layoutTabs(ctx, c)}<p class="fine">${ctx.t('villas.collectionPage.plansNote')}</p></div></section>
<section class="sec" id="availability"><div class="wrap">${sectionHead(ctx, { k: ctx.t('villas.availability.kicker'), title: ctx.t('villas.collectionPage.inCollection') })}${villaMap(ctx, vs)}${villaTable(ctx, vs, { filters: false })}</div></section>
${includedList(ctx)}
<section class="sec"><div class="wrap"><div class="shead-row">${sectionHead(ctx, { title: ctx.t('villas.collectionPage.others') })}<a class="tlink rv" href="${ctx.url('villas')}">${ctx.t('common.buttons.allCollections')} ${icon('arrow')}</a></div><div class="cgrid cgrid--3">${others.map((o, i) => collectionCard(ctx, o, i)).join('')}</div></div></section>
${enquireSection(ctx, { source: c.slug, img: c.image })}`;
  return {
    key: c.slug, section: 'villas', heroDark: true,
    title: ctx.tr(`villas.${c.slug}.meta.title`), description: ctx.tr(`villas.${c.slug}.meta.description`), ogImage: c.hero,
    schema: [breadcrumbNode(ctx, crumbs), collectionNode(ctx, c)],
    body,
  };
}
