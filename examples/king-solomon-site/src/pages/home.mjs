// Home: the scroll-scrubbed film (same engine as the approved hero), then the project story.
import { TYPES, typeStats, euro } from '../../data/villas.mjs';
import { esc, img, full, url, btn, eyebrow, section, icon } from '../ui.mjs';

const svg = (s, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ARROW_R = (s) => svg(s, '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>');

/** The approved scroll scene (#ksp), with the project nav instead of the template nav. */
function heroScene(t) {
  const h = t.hero;
  // The approved scene was tuned for a pale fog film; the renders are brighter and busier, so light type on a scrim.
  const tone = `<style>#ksp .k-overlay{background:linear-gradient(180deg,rgba(12,22,34,.38) 0%,rgba(12,22,34,.18) 38%,rgba(12,22,34,.42) 100%)}
#ksp .k-h1,#ksp .k-h2a{color:#fff;text-shadow:0 2px 24px rgba(8,16,26,.45)}#ksp .k-sub{color:rgba(255,255,255,.88);text-shadow:0 1px 14px rgba(8,16,26,.5)}
#ksp .k-h2a .k-a80{color:rgba(255,255,255,.85)}#ksp .k-h2a .k-a50{color:rgba(255,255,255,.7)}
#ksp .k-down{border-color:rgba(255,255,255,.5);color:#fff}#ksp .k-up{border-color:rgba(255,255,255,.4);color:rgba(255,255,255,.8)}
#ksp .k-dots span{background-color:rgba(255,255,255,.45)}#ksp .k-dots span.is-active{background-color:#fff}</style>`;
  return `${tone}<div id="ksp" lang="${t.lang}" dir="${t.dir}" data-film="${full('ks-hero-film')}">
<div class="k-track" data-k="track"><div class="k-sticky">
<video class="k-media" data-k="video" src="${full('ks-hero-film')}" muted playsinline preload="auto"></video>
<canvas class="k-media k-canvas" data-k="canvas" width="1920" height="1080"></canvas>
<div class="k-overlay">
<section class="k-s k-s1" data-k="s1">
<div class="k-st" style="--d:0ms"><h1 class="k-h1">${esc(h.h1)}</h1></div>
<div class="k-st" style="--d:150ms"><p class="k-sub">${esc(h.sub)}</p></div>
<div class="k-st k-s1-btn" style="--d:300ms"><button type="button" class="k-circle k-c48 k-next k-pe k-flip" data-ks="next" aria-label="${esc(t.c.next)}">${ARROW_R(18)}</button></div>
</section>
<section class="k-s k-s2" data-k="s2">
<div class="k-s2-inner"><div class="k-st" style="--d:0ms"><h2 class="k-h2a">${esc(h.s2Lead)}<span class="k-a80">${esc(h.s2Mid)}</span> <span class="k-a50">${esc(h.s2Tail)}</span></h2></div></div>
<div class="k-rail">
<div class="k-st" style="--d:200ms"><button type="button" class="k-circle k-c48 k-down k-pe" data-ks="next" aria-label="${esc(t.c.next)}">${svg(18, '<path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>')}</button></div>
<div class="k-st" style="--d:350ms"><div class="k-dots"><span class="is-active"></span><span></span><span></span></div></div>
<div class="k-st" style="--d:500ms"><button type="button" class="k-circle k-c40 k-up k-pe" data-ks="up" aria-label="${esc(t.c.back)}">${svg(16, '<path d="m18 15-6-6-6 6"></path>')}</button></div>
</div>
</section>
<section class="k-s k-s3" data-k="s3"><div class="k-s3-inner">
<div class="k-st" style="--d:0ms"><p class="k-eyebrow">${esc(h.eyebrow)}</p></div>
<div class="k-st" style="--d:150ms"><h2 class="k-h2b">${esc(h.l1)}<br>${esc(h.l2)}</h2></div>
<div class="k-st" style="--d:300ms"><a class="k-cta k-pe" href="${url(t, 'villas')}"><span class="k-cta-label">${esc(h.cta)}</span><span class="k-cta-btn k-flip">${ARROW_R(16)}</span></a></div>
</div></section>
</div></div></div></div>`;
}

function intro(t) {
  const s = t.home.intro;
  return section('', `<div class="ks-wrap ks-split">
<div class="ks-reveal">${eyebrow(s.eyebrow)}<h2 class="ks-h2">${s.title}</h2><p class="ks-p">${esc(s.p1)}</p><p class="ks-p">${esc(s.p2)}</p>
<div class="ks-actions">${btn(url(t, 'project'), t.nav.project)}</div></div>
<div class="ks-pair"><figure class="ks-media is-tall ks-reveal">${img('ks-terrace-horizon', '', { sizes: '(min-width:960px) 30vw, 60vw' })}</figure>
<figure class="ks-media is-tall ks-reveal" style="--d:180ms">${img('ks-rooftop-sea', '', { sizes: '(min-width:960px) 24vw, 40vw' })}</figure></div>
</div>`);
}

function stats(t) {
  return section('is-sand is-tight', `<div class="ks-wrap"><div class="ks-stats">${t.home.stats.map((s, i) =>
    `<div class="ks-stat ks-reveal" style="--d:${i * 70}ms"><b><span data-count="${s.n}">${s.n}</span>${s.unit ? `<small>${esc(s.unit)}</small>` : ''}</b><span>${esc(s.label)}</span></div>`).join('')}</div></div>`);
}

function concept(t) {
  const s = t.home.concept;
  return section('is-ink', `<div class="ks-wrap">
<figure class="ks-media is-pano ks-reveal">${img('ks-aerial-terraces', 'King Solomon from above')}</figure>
<div class="ks-split" style="margin-top:clamp(48px,6vw,96px);align-items:start">
<h2 class="ks-h2 ks-reveal">${s.title}</h2>
<div class="ks-reveal" style="--d:150ms"><p class="ks-p">${esc(s.p1)}</p><p class="ks-p">${esc(s.p2)}</p></div></div>
<p class="ks-quote ks-reveal" style="margin-top:clamp(56px,7vw,110px)">${s.quote}</p>
</div>`);
}

function collection(t) {
  const s = t.home.collection;
  const cards = TYPES.map((ty, i) => {
    const st = typeStats(ty.beds), name = t.types[ty.beds].name;
    return `<a class="ks-card ks-reveal" style="--d:${i * 90}ms" href="${url(t, 'type', ty.beds)}">${img(ty.hero, name, { sizes: '(min-width:1180px) 25vw, 50vw' })}
<span class="ks-go">${icon.next}</span><div class="ks-card-body"><span class="ks-tag">${esc(t.types[ty.beds].tag)}</span><h3>${esc(name)}</h3>
<div class="ks-card-meta"><span>${esc(t.c.availableOf(st.available, st.count))}</span>${st.from ? `<span>${esc(t.c.from)} <b>${euro(st.from)}</b></span>` : ''}</div></div></a>`;
  }).join('');
  return section('', `<div class="ks-wrap"><div class="ks-head-row"><div class="ks-reveal"><h2 class="ks-h2">${s.title}</h2><p class="ks-lead">${esc(s.lead)}</p></div>
${btn(url(t, 'villas'), t.c.viewAll)}</div><div class="ks-cards is-4">${cards}</div></div>`);
}

function living(t) {
  const s = t.home.living;
  const col = (k, im, d) => `<div class="ks-reveal" style="--d:${d}ms"><figure class="ks-media is-wide">${img(im, s[k].name, { sizes: '(min-width:960px) 50vw, 100vw' })}</figure>
<h3 class="ks-h3" style="margin-top:28px">${esc(s[k].name)}</h3><p class="ks-p">${esc(s[k].text)}</p></div>`;
  return section('is-sand', `<div class="ks-wrap"><h2 class="ks-h2 ks-center ks-reveal" style="margin-bottom:clamp(40px,5vw,72px)">${s.title}</h2>
<div class="ks-grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">${col('top', 'ks-rooftop-lounge', 0)}${col('ground', 'ks-facade-gardens', 160)}</div></div>`);
}

function facilities(t) {
  const s = t.home.facilities;
  const items = s.items.map((f) => `<article class="ks-feature"><figure class="ks-media">${img(f.k, f.t, { sizes: '(min-width:720px) 30vw, 82vw' })}</figure>
<div class="ks-feature-body"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div></article>`).join('');
  return section('', `<div class="ks-wrap" data-rail><div class="ks-head-row"><h2 class="ks-h2 ks-reveal" style="margin:0;max-width:760px">${s.title}</h2>
<div class="ks-rail-nav"><button type="button" data-dir="-1" aria-label="${esc(t.c.prev)}">${icon.prev}</button><button type="button" data-dir="1" aria-label="${esc(t.c.next)}">${icon.next}</button></div></div>
<div class="ks-rail">${items}</div></div>`);
}

function location(t) {
  const s = t.home.location, max = Math.max(...s.dist.map((d) => d.v));
  const dist = s.dist.map((d) => `<li><span>${esc(d.t)}</span><b>${d.v} ${esc(s.unit)}</b><i style="--w:${Math.round((d.v / max) * 100)}%"></i></li>`).join('');
  return section('is-sand', `<div class="ks-wrap ks-split is-flip">
<figure class="ks-media is-tall ks-reveal">${img('ks-location-day', 'Kalyves, Crete', { sizes: '(min-width:960px) 45vw, 100vw' })}</figure>
<div class="ks-reveal"><h2 class="ks-h2">${s.title}</h2><p class="ks-p">${esc(s.p)}</p><ul class="ks-dist" style="margin-top:36px">${dist}</ul>
<p class="ks-note">${esc(s.flights)}</p></div></div>`);
}

function turnkey(t) {
  const s = t.home.turnkey;
  return section('', `<div class="ks-wrap ks-split">
<div class="ks-reveal"><h2 class="ks-h2">${s.title}</h2><p class="ks-lead">${esc(s.p)}</p><ul class="ks-checks">${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
<div class="ks-pair"><figure class="ks-media is-tall ks-reveal">${img('ks-living-room', '', { sizes: '(min-width:960px) 30vw, 60vw' })}</figure>
<figure class="ks-media is-tall ks-reveal" style="--d:180ms">${img('ks-interior-kitchen', '', { sizes: '(min-width:960px) 24vw, 40vw' })}</figure></div></div>`);
}

function managed(t) {
  const s = t.home.managed;
  return section('is-ink', `<div class="ks-wrap ks-split" style="align-items:start">
<div class="ks-reveal"><p class="ks-eyebrow">Sivan Management</p><h2 class="ks-h2">${s.title}</h2><p class="ks-p">${esc(s.p)}</p></div>
<ul class="ks-list ks-reveal" style="--d:150ms">${s.list.map(([a, b], i) => `<li><span>${i + 1}</span><span><b>${esc(a)}</b>${esc(b)}</span></li>`).join('')}</ul></div>`);
}

function galleryTeaser(t) {
  const s = t.home.gallery, keys = ['ks-infinity-pool', 'ks-terrace-dining', 'ks-aerial-pools', 'ks-villa-curves-2', 'ks-rooftop-pavilion', 'ks-location-dusk'];
  return section('', `<div class="ks-wrap"><div class="ks-head-row"><h2 class="ks-h2 ks-reveal" style="margin:0">${s.title}</h2>${btn(url(t, 'gallery'), s.cta)}</div>
<div class="ks-gallery">${keys.map((k) => `<a href="${full(k)}" data-lb="home" class="ks-reveal">${img(k, '', { sizes: '(min-width:1100px) 33vw, 50vw' })}</a>`).join('')}</div></div>`);
}

function downloads(t) {
  const s = t.home.downloads, g = t.gallery;
  return section('is-sand is-tight', `<div class="ks-wrap ks-split" style="align-items:start">
<div class="ks-reveal"><h2 class="ks-h2">${esc(s.title)}</h2><p class="ks-p">${esc(s.lead)}</p></div>
<div class="ks-downloads ks-reveal">
<a class="ks-dl" href="${full('king-solomon-investor-brochure')}" target="_blank" rel="noopener"><span><b>${esc(g.brochure[0])}</b><small>${esc(g.brochure[1])}</small></span>${icon.down}</a>
<a class="ks-dl" href="${url(t, 'gallery')}#downloads"><span><b>${esc(g.plansGroup)}</b><small>PDF · 21 ${esc(t.c.villas)}</small></span>${icon.down}</a></div></div>`);
}

export default function home(t) {
  return {
    title: t.titles.home,
    blocks: [
      { kind: 'scene', html: heroScene(t) },
      { kind: 'html', html: intro(t) }, { kind: 'html', html: stats(t) }, { kind: 'html', html: concept(t) },
      { kind: 'html', html: collection(t) }, { kind: 'html', html: living(t) }, { kind: 'html', html: facilities(t) },
      { kind: 'html', html: location(t) }, { kind: 'html', html: turnkey(t) }, { kind: 'html', html: managed(t) },
      { kind: 'html', html: galleryTeaser(t) }, { kind: 'html', html: downloads(t) },
      { kind: 'contact', title: t.home.contact.title, lead: t.home.contact.lead }
    ],
    altimeter: true
  };
}
