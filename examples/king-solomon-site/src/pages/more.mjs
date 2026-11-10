// The Project, Gallery & Downloads, The Developer, Contact.
import { VILLAS } from '../../data/villas.mjs';
import { esc, img, full, url, btn, section, icon, pageHero, eyebrow } from '../ui.mjs';

export function projectPage(t) {
  const s = t.project, h = t.home;
  const steps = s.arrival.steps.map(([a, b], i) => `<li class="ks-reveal" style="--d:${i * 90}ms"><span>${i + 1}</span><span><b>${esc(a)}</b>${esc(b)}</span></li>`).join('');
  const facilities = h.facilities.items.map((f) => `<article class="ks-feature"><figure class="ks-media">${img(f.k, f.t, { sizes: '(min-width:720px) 30vw, 82vw' })}</figure>
<div class="ks-feature-body"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div></article>`).join('');
  const places = [['ks-chania-harbour', 0], ['ks-balos', 1], ['ks-samaria', 2], ['ks-white-mountains', 3]];
  return {
    title: t.titles.project,
    blocks: [
      { kind: 'html', html: pageHero(t, 'ks-cliff-sea', esc(s.heroTitle), s.heroLead, [[url(t, 'project'), t.nav.project]]) },
      { kind: 'html', html: section('', `<div class="ks-wrap ks-split">
<div class="ks-reveal"><h2 class="ks-h2">${s.architecture.title}</h2><p class="ks-p">${esc(s.architecture.p1)}</p><p class="ks-p">${esc(s.architecture.p2)}</p></div>
<figure class="ks-media is-tall ks-reveal">${img('ks-villa-curves', '', { sizes: '(min-width:960px) 45vw, 100vw' })}</figure></div>`) },
      { kind: 'html', html: section('is-ink', `<div class="ks-wrap ks-split" style="align-items:start">
<div class="ks-reveal"><h2 class="ks-h2">${esc(s.arrival.title)}</h2><figure class="ks-media is-wide" style="margin-top:32px">${img('ks-entrance', '', { sizes: '50vw' })}</figure></div>
<ul class="ks-list">${steps}</ul></div>`) },
      { kind: 'html', html: section('', `<div class="ks-wrap" data-rail><div class="ks-head-row"><h2 class="ks-h2" style="margin:0;max-width:760px">${h.facilities.title}</h2>
<div class="ks-rail-nav"><button type="button" data-dir="-1" aria-label="${esc(t.c.prev)}">${icon.prev}</button><button type="button" data-dir="1" aria-label="${esc(t.c.next)}">${icon.next}</button></div></div>
<div class="ks-rail">${facilities}</div></div>`) },
      { kind: 'html', html: section('is-sand', `<div class="ks-wrap ks-split is-flip">
<div class="ks-pair"><figure class="ks-media is-tall ks-reveal">${img('ks-living-room', '', { sizes: '30vw' })}</figure><figure class="ks-media is-tall ks-reveal" style="--d:180ms">${img('ks-interior-bedroom', '', { sizes: '24vw' })}</figure></div>
<div class="ks-reveal"><h2 class="ks-h2">${s.interior.title}</h2><p class="ks-lead">${esc(s.interior.p)}</p></div></div>`) },
      { kind: 'accordion', title: s.specsTitle, lead: s.specsLead, items: s.specs, note: s.disclaimer },
      { kind: 'html', html: section('is-sand', `<div class="ks-wrap ks-split">
<div class="ks-reveal"><h2 class="ks-h2">${h.location.title}</h2><p class="ks-p">${esc(h.location.p)}</p>
<ul class="ks-dist" style="margin-top:36px">${h.location.dist.map((d) => `<li><span>${esc(d.t)}</span><b>${d.v} ${esc(h.location.unit)}</b><i style="--w:${Math.round(d.v / 22 * 100)}%"></i></li>`).join('')}</ul><p class="ks-note">${esc(h.location.flights)}</p></div>
<a href="${full('ks-greece-map')}" data-lb="map"><figure class="ks-media is-tall ks-reveal">${img('ks-location-dusk', 'Kalyves', { sizes: '45vw' })}</figure></a></div>`) },
      { kind: 'html', html: section('', `<div class="ks-wrap"><div class="ks-head-row"><div class="ks-reveal"><h2 class="ks-h2">${s.crete.title}</h2><p class="ks-lead">${esc(s.crete.p)}</p></div></div>
<div class="ks-cards is-4">${places.map(([k, i]) => `<a class="ks-card ks-reveal" href="${full(k)}" data-lb="crete" data-caption="${esc(s.crete.places[i])}" style="--d:${i * 90}ms;min-height:420px">${img(k, s.crete.places[i], { sizes: '25vw' })}<div class="ks-card-body"><h3>${esc(s.crete.places[i])}</h3></div></a>`).join('')}</div></div>`) },
      { kind: 'contact', title: h.contact.title, lead: h.contact.lead }
    ]
  };
}

const GALLERY = [
  ['ks-cliff-sea', 'exterior'], ['ks-infinity-pool', 'pools'], ['ks-rooftop-lounge', 'rooftop'], ['ks-resort-front', 'exterior'], ['ks-living-room', 'interior'],
  ['ks-aerial-pools', 'pools'], ['ks-terrace-horizon', 'rooftop'], ['ks-facade-gardens', 'exterior'], ['ks-interior-kitchen', 'interior'], ['ks-location-day', 'location'],
  ['ks-rooftop-pergola', 'rooftop'], ['ks-villa-curves', 'exterior'], ['ks-resort-pool-2', 'pools'], ['ks-interior-bedroom', 'interior'], ['ks-terrace-dining', 'rooftop'],
  ['ks-hillside', 'exterior'], ['ks-aerial-terraces', 'pools'], ['ks-rooftop-sofa', 'rooftop'], ['ks-gym', 'interior'], ['ks-location-dusk', 'location'],
  ['ks-villa-sea', 'exterior'], ['ks-rooftop-pavilion', 'rooftop'], ['ks-aerial-2', 'pools'], ['ks-gym-2', 'interior'], ['ks-entrance', 'exterior'],
  ['ks-terrace-table', 'rooftop'], ['ks-resort-front-2', 'exterior'], ['ks-aerial-plan', 'pools'], ['ks-chania-harbour', 'location'], ['ks-rooftop-sea', 'rooftop'],
  ['ks-villa-curves-2', 'exterior'], ['ks-hillside-2', 'exterior'], ['ks-gym-pavilion', 'pools'], ['ks-location-sea-path', 'location'], ['ks-chania-old-city', 'location']
];

export function galleryPage(t) {
  const s = t.gallery;
  const chips = Object.entries(s.cats).map(([k, l], i) => `<button type="button" class="ks-chip${i ? '' : ' is-on'}" data-value="${k}">${esc(l)}</button>`).join('');
  const items = GALLERY.map(([k, c]) => `<a href="${full(k)}" data-lb="gallery" data-cat="${c}" data-caption="${esc(s.cats[c])}">${img(k, s.cats[c], { sizes: '(min-width:1100px) 33vw, 50vw' })}<span>${esc(s.cats[c])}</span></a>`).join('');
  const seen = new Set(), plans = [];
  VILLAS.forEach((v) => v.plans.forEach((p) => { if (!seen.has(p)) { seen.add(p); plans.push(p); } }));
  const planLabel = (p) => p.replace('ks-villa-', '').replace(/-plans?$/, '').replace(/-/g, ' ').replace(/^([\d ]+)/, (m) => `${t.c.villas} ${m.trim().replace(/ /g, ', ')} `)
    .replace('basement', t.c.basement).replace(/roof gardens?/, t.c.garden).trim();
  return {
    title: t.titles.gallery,
    blocks: [
      { kind: 'html', html: pageHero(t, 'ks-infinity-pool', esc(s.heroTitle), s.heroLead, [[url(t, 'gallery'), t.nav.gallery]]) },
      { kind: 'html', html: section('', `<div class="ks-wrap"><div class="ks-filters" data-gallery-filters>${chips}</div><div class="ks-gallery">${items}</div></div>`) },
      { kind: 'video', title: s.filmTitle, lead: s.filmLead, src: full('ks-hero-film'), id: 0 },
      { kind: 'html', html: section('is-sand', `<div class="ks-wrap ks-split" id="downloads" style="align-items:start">
<div><h2 class="ks-h2">${esc(s.dlTitle)}</h2><a class="ks-dl" href="${full('king-solomon-investor-brochure')}" target="_blank" rel="noopener"><span><b>${esc(s.brochure[0])}</b><small>${esc(s.brochure[1])}</small></span>${icon.down}</a>
<a class="ks-dl" href="${full('ks-masterplan-numbers')}" data-lb="dl"><span><b>${esc(s.masterplan)}</b><small>JPG</small></span>${icon.down}</a></div>
<div><p class="ks-eyebrow">${esc(s.plansGroup)}</p><div class="ks-downloads">${plans.map((p) => `<a class="ks-dl" href="${full(p)}" target="_blank" rel="noopener"><span><b>${esc(planLabel(p))}</b><small>PDF</small></span>${icon.down}</a>`).join('')}</div></div></div>`) },
      { kind: 'contact', title: t.home.contact.title, lead: t.home.contact.lead }
    ]
  };
}

export function developerPage(t) {
  const s = t.developer;
  return {
    title: t.titles.developer,
    blocks: [
      { kind: 'html', html: pageHero(t, 'ks-terrace-horizon', esc(s.heroTitle), s.heroLead, [[url(t, 'developer'), t.nav.developer]]) },
      { kind: 'html', html: section('', `<div class="ks-wrap ks-split" style="align-items:start">
<div class="ks-reveal"><p class="ks-eyebrow">SivanInvest Group</p><h2 class="ks-h2">${s.story.title}</h2></div>
<div class="ks-reveal" style="--d:150ms"><p class="ks-lead">${esc(s.story.p1)}</p><p class="ks-p" style="margin-top:22px">${esc(s.story.p2)}</p></div></div>`) },
      { kind: 'html', html: section('is-sand is-tight', `<div class="ks-wrap"><div class="ks-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${s.values.map(([a, b], i) =>
        `<div class="ks-reveal" style="--d:${i * 80}ms;border-top:1px solid var(--gold);padding-top:24px"><h3 class="ks-h3">${esc(a)}</h3><p class="ks-p">${esc(b)}</p></div>`).join('')}</div></div>`) },
      { kind: 'html', html: section('is-ink', `<div class="ks-wrap"><h2 class="ks-h2">${s.group.title}</h2><ul class="ks-list" style="margin-top:40px">${s.group.items.map(([a, b], i) => `<li class="ks-reveal" style="--d:${i * 90}ms"><span>${i + 1}</span><span><b>${esc(a)}</b>${esc(b)}</span></li>`).join('')}</ul></div>`) },
      { kind: 'html', html: section('', `<div class="ks-wrap ks-split" style="align-items:start">
<div class="ks-reveal"><h2 class="ks-h2">${s.process.title}</h2><figure class="ks-media is-wide" style="margin-top:32px">${img('ks-aerial-2', '', { sizes: '50vw' })}</figure></div>
<ul class="ks-list">${s.process.steps.map(([a, b], i) => `<li class="ks-reveal" style="--d:${i * 70}ms"><span>${i + 1}</span><span><b>${esc(a)}</b>${esc(b)}</span></li>`).join('')}</ul></div>`) },
      { kind: 'html', html: section('is-sand', `<div class="ks-wrap ks-split is-flip"><figure class="ks-media is-wide ks-reveal">${img('ks-villa-curves-2', '314 Architects', { sizes: '50vw' })}</figure>
<div class="ks-reveal"><h2 class="ks-h2">${esc(s.architect.title)}</h2><p class="ks-lead">${esc(s.architect.p)}</p><div class="ks-actions">${btn(url(t, 'project'), t.nav.project)}</div></div></div>`) },
      { kind: 'contact', title: t.home.contact.title, lead: t.home.contact.lead }
    ]
  };
}

export function contactPage(t) {
  const s = t.contact, d = s.details;
  return {
    title: t.titles.contact,
    blocks: [
      { kind: 'html', html: pageHero(t, 'ks-location-dusk', esc(s.heroTitle), s.heroLead, [[url(t, 'contact'), t.nav.contact]]) },
      { kind: 'contact', title: s.formTitle, lead: s.formLead, details: true },
      { kind: 'map', address: 'Kalyves, Chania, Crete, Greece', title: d.site }
    ]
  };
}

export { eyebrow };
