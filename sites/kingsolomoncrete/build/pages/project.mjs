// "The Project" page template.
import { esc } from '../lib/util.mjs';
import { picture, images } from '../lib/context.mjs';
import { icon } from '../lib/icons.mjs';
import { breadcrumbNode, residenceNode, faqNode } from '../lib/seo.mjs';
import { pageHero, sectionHead, kicker, locationBlock, faqBlock, enquireSection } from '../lib/sections.mjs';

const ARRIVAL_IMG = ['entrance', 'gym-pavilion', 'infinity-pool', 'location-dusk'];
const RESORT_IMG = ['resort-pool-2', 'spa-jacuzzi', 'cliff-sea', 'location-day', 'terrace-table', 'resort-front-2'];
const RESORT_ICO = ['pool', 'spa', 'elevator', 'waves', 'sun', 'shield'];

function architecture(ctx) {
  return `<section class="sec arch"><div class="wrap arch__grid">
<div class="arch__txt">${sectionHead(ctx, { k: ctx.t('project.architecture.kicker'), title: ctx.t('project.architecture.title'), text: ctx.t('project.architecture.text') })}<p class="rv">${ctx.t('project.architecture.text2')}</p><p class="sig rv">Alkisti Roussou &amp; Theodore Nikoloudakis</p></div>
<div class="arch__media"><div class="reveal-img" data-reveal>${picture('villa-curves', { sizes: '(min-width:900px) 55vw, 100vw', alt: ctx.tr('project.architecture.title') })}</div></div></div></section>`;
}

function arrival(ctx) {
  const steps = ctx.raw('project.arrival.steps');
  return `<section class="story" data-story aria-labelledby="arr-t"><div class="wrap story__grid">
<div class="story__media" aria-hidden="true">${ARRIVAL_IMG.map((n, i) => `<div class="story__img${i ? '' : ' is-on'}" data-story-img="${i}">${picture(n, { sizes: '(min-width:900px) 50vw, 100vw', alt: '' })}</div>`).join('')}</div>
<div class="story__txt">${kicker(ctx.t('project.arrival.kicker'))}<h2 class="h-xl rv" id="arr-t">${ctx.t('project.arrival.title')}</h2>
<ol class="story__steps" role="list">${steps.map((s, i) => `<li class="story__step" data-story-step="${i}"><span class="story__n">0${i + 1}</span><h3>${ctx.fe(s.title)}</h3><p>${ctx.fe(s.text)}</p><div class="story__mimg">${picture(ARRIVAL_IMG[i], { sizes: '100vw', alt: '' })}</div></li>`).join('')}</ol></div></div></section>`;
}

function resort(ctx) {
  const items = ctx.raw('home.resort.items');
  return `<section class="sec"><div class="wrap">${sectionHead(ctx, { k: ctx.t('home.resort.kicker'), title: ctx.t('home.resort.title'), text: ctx.t('home.resort.text') })}
<div class="rgrid">${items.map((it, i) => `<article class="rcard rv" style="--d:${(i % 3) * 90}ms"><div class="rcard__m">${picture(RESORT_IMG[i], { sizes: '(min-width:900px) 33vw, 100vw', alt: it.title })}</div><div class="rcard__b">${icon(RESORT_ICO[i])}<h3>${ctx.fe(it.title)}</h3><p>${ctx.fe(it.text)}</p></div></article>`).join('')}</div></div></section>`;
}

function interiors(ctx) {
  return `<section class="sec dark interiors"><div class="wrap">${sectionHead(ctx, { k: ctx.t('project.interiors.kicker'), title: ctx.t('project.interiors.title'), text: ctx.t('project.interiors.text'), center: true })}
<div class="tri">${['living-room', 'interior-kitchen', 'interior-bedroom'].map((n, i) => `<button type="button" class="tri__i rv" style="--d:${i * 100}ms" data-lb="${n}" data-lb-w="${images[n].w}" aria-label="${ctx.t('common.buttons.openGallery')}">${picture(n, { sizes: '(min-width:900px) 33vw, 100vw', alt: '' })}</button>`).join('')}</div></div></section>`;
}

function specs(ctx) {
  const items = ctx.raw('project.specs.items');
  return `<section class="sec" id="specifications"><div class="wrap">${sectionHead(ctx, { k: ctx.t('project.specs.kicker'), title: ctx.t('project.specs.title'), text: ctx.t('project.specs.text') })}
<div class="specs">${items.map((s, i) => `<details class="spec rv"${i < 2 ? ' open' : ''}><summary><span class="spec__n">${String(i + 1).padStart(2, '0')}</span><span class="spec__t">${ctx.fe(s.title)}</span>${icon('plus')}</summary><p>${ctx.fe(s.text)}</p></details>`).join('')}</div>
<p class="fine">${ctx.t('project.specs.disclaimer')}</p></div></section>`;
}

function facilities(ctx) {
  const items = ctx.raw('project.facilities.items');
  return `<section class="sec sec--line"><div class="wrap">${sectionHead(ctx, { k: ctx.t('project.facilities.kicker'), title: ctx.t('project.facilities.title') })}
<ul class="vals vals--4" role="list">${items.map((f, i) => `<li class="val rv" style="--d:${i * 80}ms"><span class="val__n">0${i + 1}</span><h3>${ctx.fe(f.title)}</h3><p>${ctx.fe(f.text)}</p></li>`).join('')}</ul></div></section>`;
}

function crete(ctx) {
  const places = ctx.raw('project.crete.places');
  return `<section class="sec crete"><div class="wrap">${sectionHead(ctx, { k: ctx.t('project.crete.kicker'), title: ctx.t('project.crete.title'), text: ctx.t('project.crete.text') })}
<div class="places">${places.map((p, i) => `<article class="place rv" style="--d:${i * 90}ms"><div class="place__m">${picture(p.img, { sizes: '(min-width:900px) 25vw, 50vw', alt: p.name })}</div><h3>${ctx.fe(p.name)}</h3><p>${ctx.fe(p.text)}</p></article>`).join('')}</div></div></section>`;
}

export function renderProject(ctx) {
  const crumbs = [{ name: ctx.tr('common.nav.breadcrumbHome'), url: ctx.url('home') }, { name: ctx.tr('common.nav.project'), url: ctx.url('project') }];
  const faq = ctx.raw('home.faq');
  const body = [
    pageHero(ctx, { img: 'resort-front', k: ctx.t('project.hero.kicker'), title: ctx.t('project.hero.title'), sub: ctx.t('project.hero.subtitle'), crumbs }),
    architecture(ctx), arrival(ctx), resort(ctx), interiors(ctx), specs(ctx), facilities(ctx),
    locationBlock(ctx, { img: 'location-day' }), crete(ctx), faqBlock(ctx, faq), enquireSection(ctx, { source: 'project' }),
  ].join('\n');
  return {
    key: 'project', section: 'project', heroDark: true,
    title: ctx.tr('project.meta.title'), description: ctx.tr('project.meta.description'), ogImage: 'resort-front',
    schema: [breadcrumbNode(ctx, crumbs), residenceNode(ctx)],
    body,
  };
}
