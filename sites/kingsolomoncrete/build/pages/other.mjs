// Gallery, Developer and Contact page templates.
import { esc } from '../lib/util.mjs';
import { project, picture, images } from '../lib/context.mjs';
import { icon } from '../lib/icons.mjs';
import { breadcrumbNode } from '../lib/seo.mjs';
import { pageHero, sectionHead, kicker, leadForm, contactDetails, enquireSection, ctaBand } from '../lib/sections.mjs';

const crumbsFor = (ctx, key) => [{ name: ctx.tr('common.nav.breadcrumbHome'), url: ctx.url('home') }, { name: ctx.tr(`common.nav.${key}`), url: ctx.url(key) }];

export function renderGallery(ctx) {
  const crumbs = crumbsFor(ctx, 'gallery');
  const cats = ['all', 'exterior', 'interior', 'location'];
  const filters = `<div class="gfilters rv" role="group">${cats.map((c, i) => `<button type="button" class="chip${i ? '' : ' is-on'}" data-gfilter="${c}" aria-pressed="${!i}">${ctx.t(`pages.gallery.filters.${c}`)}</button>`).join('')}</div>`;
  const grid = `<div class="masonry" data-masonry>${project.gallery.map((g, i) => `<button type="button" class="masonry__i rv" data-cat="${g.cat}" data-lb="${g.img}" data-lb-w="${images[g.img].w}" data-lb-group="gallery" style="--d:${(i % 4) * 60}ms" aria-label="${ctx.t(`pages.gallery.filters.${g.cat}`)} · ${i + 1}">${picture(g.img, { sizes: '(min-width:1100px) 33vw, (min-width:700px) 50vw, 100vw', alt: `${ctx.tr(`pages.gallery.filters.${g.cat}`)} · King Solomon` })}</button>`).join('')}</div>`;
  const body = `${pageHero(ctx, { img: 'aerial-pools', k: ctx.t('pages.gallery.hero.kicker'), title: ctx.t('pages.gallery.hero.title'), sub: ctx.t('pages.gallery.hero.subtitle'), crumbs })}
<section class="sec"><div class="wrap">${filters}${grid}</div></section>
<section class="sec dark film" id="film"><div class="wrap">${sectionHead(ctx, { k: ctx.t('pages.gallery.film.kicker'), title: ctx.t('pages.gallery.film.title'), text: ctx.t('pages.gallery.film.text'), center: true })}
<div class="film__frame rv"><video controls playsinline preload="none" poster="/assets/video/poster.jpg" aria-label="${ctx.t('pages.gallery.film.title')}"><source src="/assets/video/film-full.mp4" type="video/mp4"></video></div></div></section>
<section class="sec" id="downloads"><div class="wrap">${sectionHead(ctx, { k: ctx.t('pages.gallery.downloads.kicker'), title: ctx.t('pages.gallery.downloads.title'), text: ctx.t('pages.gallery.downloads.text') })}
<div class="dl__cards dl__cards--3"><a class="dlc rv" href="${ctx.url('contact', 'enquire')}" data-enquire data-request="brochure">${icon('mail')}<span class="dlc__t">${ctx.t('pages.gallery.downloads.brochure')}</span><span class="dlc__m">${ctx.t('pages.gallery.downloads.brochureMeta')}</span></a>
<a class="dlc rv" href="${ctx.url('contact', 'enquire')}" data-enquire data-request="plans">${icon('key')}<span class="dlc__t">${ctx.t('pages.gallery.downloads.plans')}</span><span class="dlc__m">${ctx.t('pages.gallery.downloads.plansMeta')}</span></a>
<a class="dlc rv" href="/assets/img/masterplan-numbers-2400.jpg" download>${icon('download')}<span class="dlc__t">${ctx.t('pages.gallery.downloads.masterplan')}</span><span class="dlc__m">${ctx.t('pages.gallery.downloads.masterplanMeta')}</span></a></div></div></section>
${enquireSection(ctx, { source: 'gallery', img: 'location-dusk' })}`;
  return {
    key: 'gallery', section: 'gallery', heroDark: true,
    title: ctx.tr('pages.gallery.meta.title'), description: ctx.tr('pages.gallery.meta.description'), ogImage: 'aerial-pools',
    schema: [breadcrumbNode(ctx, crumbs), {
      '@type': 'ImageGallery', name: ctx.tr('pages.gallery.hero.title'),
      image: project.gallery.slice(0, 12).map((g) => `${ctx.config.site}/assets/img/${g.img}-${images[g.img].jpg}.jpg`),
    }],
    body,
  };
}

export function renderDeveloper(ctx) {
  const crumbs = crumbsFor(ctx, 'developer');
  const D = (k) => ctx.raw(`pages.developer.${k}`);
  const body = `${pageHero(ctx, { img: 'chania-harbour', k: ctx.t('pages.developer.hero.kicker'), title: ctx.t('pages.developer.hero.title'), sub: ctx.t('pages.developer.hero.subtitle'), crumbs })}
<section class="sec"><div class="wrap dev__grid"><div>${sectionHead(ctx, { k: ctx.t('pages.developer.about.kicker'), title: ctx.t('pages.developer.about.title'), text: ctx.t('pages.developer.about.text') })}<p class="rv">${ctx.t('pages.developer.about.text2')}</p></div>
<ul class="nums" role="list">${D('numbers').map((n, i) => `<li class="rv" style="--d:${i * 80}ms"><span class="nums__v" dir="ltr">${ctx.fe(n.value)}</span><span class="nums__l">${ctx.fe(n.label)}</span></li>`).join('')}</ul></div></section>
<section class="sec sec--line"><div class="wrap"><ul class="vals vals--4" role="list">${D('values').map((v, i) => `<li class="val rv" style="--d:${i * 80}ms"><span class="val__n">0${i + 1}</span><h3>${ctx.fe(v.title)}</h3><p>${ctx.fe(v.text)}</p></li>`).join('')}</ul></div></section>
<section class="sec dark"><div class="wrap">${sectionHead(ctx, { k: ctx.t('pages.developer.group.kicker'), title: ctx.t('pages.developer.group.title') })}
<ol class="trio" role="list">${D('group.items').map((g, i) => `<li class="rv" style="--d:${i * 100}ms"><span class="trio__n">0${i + 1}</span><h3>${ctx.fe(g.title)}</h3><p>${ctx.fe(g.text)}</p></li>`).join('')}</ol></div></section>
<section class="sec"><div class="wrap">${sectionHead(ctx, { k: ctx.t('pages.developer.process.kicker'), title: ctx.t('pages.developer.process.title') })}
<ol class="timeline" role="list" data-timeline>${D('process.steps').map((s, i) => `<li class="rv" style="--d:${i * 70}ms"><span class="timeline__n">${i + 1}</span><div><h3>${ctx.fe(s.title)}</h3><p>${ctx.fe(s.text)}</p></div></li>`).join('')}</ol></div></section>
<section class="sec sec--line" id="architects"><div class="wrap arch__grid"><div>${sectionHead(ctx, { k: ctx.t('pages.developer.architects.kicker'), title: ctx.t('pages.developer.architects.title'), text: ctx.t('pages.developer.architects.text') })}
<ul class="studios" role="list">${D('architects.studios').map((s, i) => `<li class="rv"><a href="${esc(s.url)}" target="_blank" rel="noopener"><img src="/assets/brand/arch-${['ar', 'tn'][i]}-ink.png" alt="${esc(s.name)}" width="${[70, 55][i]}" height="${[78, 49][i]}" loading="lazy"><span><strong>${ctx.fe(s.name)}</strong><em>${ctx.fe(s.role)}</em></span></a></li>`).join('')}</ul>
<a class="tlink rv" href="${ctx.url('project')}">${ctx.t('common.nav.project')} ${icon('arrow')}</a></div>
<div class="reveal-img" data-reveal>${picture('villa-curves-2', { sizes: '(min-width:900px) 50vw, 100vw', alt: 'Alkisti Roussou & Theodore Nikoloudakis · King Solomon' })}</div></div></section>
${ctaBand(ctx, { title: ctx.t('common.footer.statement'), btn: ctx.t('common.nav.cta'), href: ctx.url('contact', 'enquire'), img: 'terrace-horizon' })}`;
  return {
    key: 'developer', section: 'developer', heroDark: true,
    title: ctx.tr('pages.developer.meta.title'), description: ctx.tr('pages.developer.meta.description'), ogImage: 'villa-curves-2',
    schema: [breadcrumbNode(ctx, crumbs), { '@type': 'AboutPage', name: ctx.tr('pages.developer.hero.title'), about: { '@id': `${ctx.config.site}/#organization` } }],
    body,
  };
}

export function renderContact(ctx) {
  const crumbs = crumbsFor(ctx, 'contact');
  const body = `${pageHero(ctx, { img: 'location-dusk', k: ctx.t('pages.contact.hero.kicker'), title: ctx.t('pages.contact.hero.title'), sub: ctx.t('pages.contact.hero.subtitle'), crumbs })}
<section class="sec contact"><div class="wrap enq__grid">
<div class="enq__intro">${kicker(ctx.t('common.contactInfo.title'))}<h2 class="h-lg rv">${ctx.t('pages.contact.visit.title')}</h2><p class="lead rv">${ctx.t('pages.contact.visit.text')}</p>${contactDetails(ctx)}<p class="fine rv">${ctx.t('common.contactInfo.hoursLabel')}: ${ctx.t('common.contactInfo.hours')}</p></div>
<div class="enq__card enq__card--solid rv">${kicker(ctx.t('common.form.kicker'))}${leadForm(ctx, { title: ctx.t('common.form.title'), text: ctx.t('common.form.text'), source: 'contact' })}</div></div></section>
<section class="sec sec--tight" id="map"><div class="wrap"><div class="kmap rv">
<a class="kmap__img" href="${ctx.config.contact.mapsUrl}" target="_blank" rel="noopener" aria-label="${ctx.t('common.location.mapCta')}">${picture('map-kalyves', { sizes: '(min-width:1320px) 1272px, 100vw', alt: ctx.tr('common.location.title') })}
<span class="kmap__pin" aria-hidden="true"><span class="kmap__pulse"></span><img src="/assets/brand/crown-gold.svg" width="30" height="17" alt=""></span></a>
<div class="kmap__card"><p class="kicker">${ctx.t('common.location.kicker')}</p><h2 class="h-md">King Solomon</h2><p dir="auto">Kalyves, Apokoronas, Chania, Crete</p>
<ul class="kmap__dist" role="list">${ctx.raw('common.location.distances').map((d) => `<li><span>${ctx.fe(d.place)}</span><b>${ctx.fe(d.time)} ${ctx.t('common.labels.min')}</b></li>`).join('')}</ul>
<a class="btn btn--gold" href="${ctx.config.contact.mapsUrl}" target="_blank" rel="noopener">${icon('pin')} ${ctx.t('common.location.mapCta')}</a></div>
<p class="kmap__attr">© OpenStreetMap contributors</p></div></div></section>`;
  return {
    key: 'contact', section: 'contact', heroDark: true,
    title: ctx.tr('pages.contact.meta.title'), description: ctx.tr('pages.contact.meta.description'), ogImage: 'location-dusk',
    schema: [breadcrumbNode(ctx, crumbs), { '@type': 'ContactPage', name: ctx.tr('pages.contact.hero.title'), mainEntity: { '@id': `${ctx.config.site}/#organization` } }],
    body,
  };
}

export { enquireSection };
