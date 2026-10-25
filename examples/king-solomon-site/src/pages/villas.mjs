// Villas overview + availability explorer, and the four collection pages.
import { VILLAS, TYPES, typeStats, villasOf, euro, sqm } from '../../data/villas.mjs';
import { esc, img, full, md, url, btn, section, icon, pageHero } from '../ui.mjs';

const statusLabel = (t, s) => t.c[s];

function villaRow(t, v) {
  const plans = v.plans.map((p, i) => `<a class="ks-mini" href="${full(p)}" target="_blank" rel="noopener">${esc(t.c.plan)}${v.plans.length > 1 ? ' ' + (i + 1) : ''}</a>`).join('');
  const outdoor = (v.balc || 0) + (v.garden || 0);
  return `<tr data-no="${v.no}" data-beds="${v.beds}" data-status="${v.status}">
<td class="ks-no">${v.no}</td><td>${esc(t.c.bedrooms(v.beds))}</td><td>${esc(t.c[v.level])}</td>
<td>${sqm(v.net)} ${t.c.sqm}${v.base ? ` <small>+ ${sqm(v.base)}</small>` : ''}</td><td>${outdoor ? sqm(outdoor) + ' ' + t.c.sqm : '–'}</td><td>${sqm(v.total)} ${t.c.sqm}</td><td>${sqm(v.pool)} ${t.c.sqm}</td>
<td><span class="ks-status" data-s="${v.status}">${esc(statusLabel(t, v.status))}</span></td>
<td>${plans}${v.status !== 'sold' ? `<a class="ks-mini" href="${url(t, 'contact')}?villa=${v.no}&beds=${v.beds}">${esc(t.c.enquire)}</a>` : ''}</td></tr>`;
}

export function explorer(t, list = VILLAS, { filters = true } = {}) {
  const s = t.villas;
  const tiles = (lvl) => list.filter((v) => v.level === lvl).sort((a, b) => a.no - b.no)
    .map((v) => `<button type="button" class="ks-tile" data-no="${v.no}" data-beds="${v.beds}" data-status="${v.status}" title="${esc(`${t.c.villa} ${v.no} · ${t.c.bedrooms(v.beds)} · ${statusLabel(t, v.status)}`)}">${v.no}</button>`).join('');
  const chip = (k, v, label, on) => `<button type="button" class="ks-chip${on ? ' is-on' : ''}" data-filter="${k}" data-value="${v}">${esc(label)}</button>`;
  const levels = ['top', 'ground'].filter((l) => list.some((v) => v.level === l))
    .map((l) => `<div class="ks-level"><p class="ks-level-name">${esc(s.levels[l][0])}<small>${esc(s.levels[l][1])}</small></p><div class="ks-tiles">${tiles(l)}</div></div>`).join('');
  const head = [t.c.villa, t.c.bedrooms(2).replace(/^2\s*/, ''), t.c.level, t.c.interior, t.c.outdoor, t.c.total, t.c.pool, t.c.status, ''].map((h) => `<th>${esc(h)}</th>`).join('');
  return `<div data-explorer>
${filters ? `<div class="ks-filters">${chip('beds', 'all', `${t.c.all} · ${s.filterBeds}`, true)}${[1, 2, 3, 5].map((b) => chip('beds', String(b), t.c.bedrooms(b))).join('')}</div>
<div class="ks-filters">${chip('status', 'all', `${t.c.all} · ${s.filterStatus}`, true)}${['available', 'reserved', 'sold'].map((x) => chip('status', x, t.c[x])).join('')}</div>` : ''}
<div class="ks-stack">${levels}<div class="ks-legend">${['available', 'reserved', 'sold'].map((x) => `<span><i style="--c:${x === 'available' ? '#3E8E6E' : x === 'reserved' ? '#C6A15B' : '#B7B0A6'}"></i>${esc(t.c[x])}</span>`).join('')}</div></div>
<div class="ks-table-wrap"><table class="ks-table"><thead><tr>${head}</tr></thead><tbody>${[...list].sort((a, b) => a.no - b.no).map((v) => villaRow(t, v)).join('')}</tbody></table></div>
<p class="ks-note">${esc(s.note)}</p></div>`;
}

function typeCards(t, except) {
  return `<div class="ks-cards ${except ? 'is-3' : 'is-4'}">${TYPES.filter((ty) => ty.beds !== except).map((ty, i) => {
    const st = typeStats(ty.beds), n = t.types[ty.beds].name;
    return `<a class="ks-card ks-reveal" style="--d:${i * 90}ms;min-height:440px" href="${url(t, 'type', ty.beds)}">${img(ty.hero, n, { sizes: '(min-width:1180px) 25vw, 50vw' })}<span class="ks-go">${icon.next}</span>
<div class="ks-card-body"><span class="ks-tag">${esc(t.types[ty.beds].tag)}</span><h3>${esc(n)}</h3><div class="ks-card-meta"><span>${esc(t.c.availableOf(st.available, st.count))}</span>${st.from ? `<span>${esc(t.c.from)} <b>${euro(st.from)}</b></span>` : ''}</div></div></a>`;
  }).join('')}</div>`;
}

export function villasPage(t) {
  const s = t.villas;
  return {
    title: t.titles.villas,
    blocks: [
      { kind: 'html', html: pageHero(t, 'ks-resort-front-2', esc(s.heroTitle), s.heroLead, [[url(t, 'villas'), t.nav.villas]]) },
      { kind: 'html', html: section('', `<div class="ks-wrap">${typeCards(t)}</div>`) },
      { kind: 'html', html: section('is-sand', `<div class="ks-wrap"><div class="ks-head-row"><div><h2 class="ks-h2">${esc(s.explorerTitle)}</h2><p class="ks-lead">${esc(s.explorerLead)}</p></div></div>${explorer(t)}</div>`) },
      { kind: 'html', html: section('', `<div class="ks-wrap"><div class="ks-head-row"><div><h2 class="ks-h2">${esc(s.masterTitle)}</h2><p class="ks-lead">${esc(s.masterLead)}</p></div></div>
<a href="${full('ks-masterplan-numbers')}" data-lb="master" data-caption="${esc(s.masterTitle)}"><figure class="ks-media is-wide ks-reveal">${img('ks-masterplan-numbers', s.masterTitle)}</figure></a>
<div class="ks-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));margin-top:16px">${['ks-aerial-plan', 'ks-aerial-2'].map((k) => `<a href="${full(k)}" data-lb="master"><figure class="ks-media is-wide">${img(k, '', { sizes: '50vw' })}</figure></a>`).join('')}</div></div>`) },
      { kind: 'contact', title: t.home.contact.title, lead: t.home.contact.lead }
    ]
  };
}

export function typePage(t, ty) {
  const T = t.types, s = T[ty.beds], st = typeStats(ty.beds), list = villasOf(ty.beds);
  const facts = [[t.c.villas, st.count], [t.c.interior, `${sqm(st.net[0])}${st.net[0] !== st.net[1] ? '–' + sqm(st.net[1]) : ''} ${t.c.sqm}`],
    [t.c.total, `${sqm(st.total[0])}–${sqm(st.total[1])} ${t.c.sqm}`], [t.c.pool, `${sqm(st.pool[0])}–${sqm(st.pool[1])} ${t.c.sqm}`],
    [t.c.from, st.from ? euro(st.from) : t.c.onRequest]];
  const TL = t.lang === 'he' ? 'טיפוס' : 'Type';
  const tabs = ty.layouts.map((l, i) => `<button type="button" class="ks-tab${i ? '' : ' is-on'}" aria-selected="${!i}">${TL} ${l.code}</button>`).join('');
  const panels = ty.layouts.map((l, i) => `<div class="ks-panel${i ? '' : ' is-on'}">
<a class="ks-plan" href="${full(l.plan)}" data-lb="plans-${ty.beds}" data-caption="${TL} ${l.code}">${img(l.plan, `${TL} ${l.code}`, { sizes: '(min-width:1000px) 60vw, 100vw' })}</a>
<div><h3 class="ks-h3">${TL} ${esc(l.code)}</h3><p class="ks-p">${esc(T.floor[l.floor])} · ${esc(t.c.bedrooms(ty.beds))}</p>
<div class="ks-areas">${Object.entries(l.areas).map(([k, v]) => `<div><span>${esc(T.areaLabels[k])}</span><b>${sqm(v)} ${t.c.sqm}</b></div>`).join('')}</div>
${btn(`${url(t, 'contact')}?beds=${ty.beds}`, t.c.enquire, 'is-solid')}</div></div>`).join('');
  return {
    title: t.titles.type(ty.beds),
    blocks: [
      { kind: 'html', html: pageHero(t, ty.hero, esc(s.name), null, [[url(t, 'villas'), t.nav.villas], [url(t, 'type', ty.beds), s.name]]) },
      { kind: 'html', html: section('', `<div class="ks-wrap ks-split" style="align-items:start">
<div class="ks-reveal"><p class="ks-eyebrow">${esc(s.tag)}</p><h2 class="ks-h2">${s.title}</h2><p class="ks-lead">${esc(s.p)}</p></div>
<div class="ks-areas ks-reveal" style="--d:150ms;margin:0">${facts.map(([a, b]) => `<div><span>${esc(a)}</span><b>${esc(String(b))}</b></div>`).join('')}</div></div>`) },
      { kind: 'html', html: section('is-tight', `<div class="ks-wrap"><div class="ks-gallery">${ty.images.map((k) => `<a href="${full(k)}" data-lb="type-${ty.beds}" class="ks-reveal">${img(k, s.name, { sizes: '(min-width:1100px) 33vw, 50vw' })}</a>`).join('')}</div></div>`) },
      { kind: 'html', html: section('is-sand', `<div class="ks-wrap"><h2 class="ks-h2">${esc(T.layoutsTitle)}</h2><div data-tabs><div class="ks-tabs-nav" role="tablist">${tabs}</div>${panels}</div></div>`) },
      { kind: 'html', html: section('', `<div class="ks-wrap"><h2 class="ks-h2">${esc(T.villasTitle)}</h2>${explorer(t, list, { filters: false })}</div>`) },
      { kind: 'html', html: section('is-ink', `<div class="ks-wrap ks-split"><div><h2 class="ks-h2">${esc(T.included)}</h2><ul class="ks-checks">${t.home.turnkey.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
<figure class="ks-media is-wide">${img('ks-interior-bedroom', '', { sizes: '50vw' })}</figure></div>`) },
      { kind: 'html', html: section('', `<div class="ks-wrap"><h2 class="ks-h2">${esc(T.others)}</h2>${typeCards(t, ty.beds)}</div>`) },
      { kind: 'contact', title: t.home.contact.title, lead: t.home.contact.lead, beds: ty.beds }
    ]
  };
}

export { md };
