// Home page template.
import { esc } from '../lib/util.mjs';
import { project, picture, images } from '../lib/context.mjs';
import { icon } from '../lib/icons.mjs';
import { residenceNode, faqNode } from '../lib/seo.mjs';
import {
  kicker, sectionHead, collectionGrid, statsBand, includedList, locationBlock,
  faqBlock, enquireSection, downloadsBlock,
} from '../lib/sections.mjs';

const RESORT_IMG = ['infinity-pool', 'gym-pavilion', 'entrance', 'location-day', 'terrace-table', 'resort-front'];
const RESORT_ICO = ['pool', 'spa', 'elevator', 'waves', 'sun', 'shield'];
const MGMT_ICO = ['chart', 'key', 'check', 'concierge'];
const SLIDES = ['cliff-sea', 'rooftop-sea', 'living-room', 'aerial-pools', 'terrace-dining', 'interior-kitchen', 'villa-curves', 'location-day'];

function hero(ctx) {
  const avail = project.villas.filter((v) => v.status === 'available').length;
  return `<section class="hero" data-hero>
<div class="hero__media" data-hero-media>
<video class="hero__video" autoplay muted loop playsinline preload="metadata" poster="/assets/video/poster.jpg" data-hero-video aria-hidden="true">
<source src="/assets/video/film-720.mp4" type="video/mp4" media="(max-width: 900px)"><source src="/assets/video/film-1080.mp4" type="video/mp4"></video>
<div class="hero__shade"></div></div>
<div class="hero__in wrap" data-hero-text>
<img class="hero__crown" src="/assets/brand/crown-white.svg" width="88" height="50" alt="">
<p class="kicker kicker--light hero__k">${ctx.t('home.hero.kicker')}</p>
<h1 class="h-display hero__t"><span class="split">${ctx.t('home.hero.title')}</span></h1>
<p class="hero__sub">${ctx.t('home.hero.subtitle')}</p>
<div class="hero__row"><p class="hero__price"><span>${ctx.t('common.labels.priceOnRequest')}</span> <strong>${ctx.t('common.labels.villasAvailable', { a: avail, t: project.villas.length })}</strong></p>
<div class="hero__ctas"><a class="btn btn--light" href="${ctx.url('villas')}">${ctx.t('home.hero.cta')} ${icon('arrow')}</a><a class="btn btn--glass" href="${ctx.url('contact', 'enquire')}" data-enquire>${ctx.t('home.hero.cta2')}</a></div></div>
</div>
<button class="hero__toggle" type="button" data-video-toggle aria-label="Pause">${icon('pause')}</button>
<a class="phero__scroll" href="#intro" aria-label="${ctx.t('common.buttons.scroll')}"><span></span></a>
</section>`;
}

function intro(ctx) {
  return `<section class="sec intro" id="intro"><div class="wrap wrap--narrow">${kicker(ctx.t('home.intro.kicker'))}
<h2 class="h-xl rv">${ctx.t('home.intro.title')}</h2>
<p class="words" data-words>${ctx.t('home.intro.lead')}</p>
<p class="lead rv">${ctx.t('home.intro.text')}</p></div>
<div class="wrap pair"><div class="pair__a rv" data-parallax="-0.06">${picture('lifestyle-pool', { sizes: '(min-width:900px) 58vw, 100vw', alt: '' })}</div><div class="pair__b rv" data-parallax="0.1">${picture('sunset-sail', { sizes: '(min-width:900px) 34vw, 70vw', alt: '' })}</div></div></section>`;
}

function concept(ctx) {
  const pts = ctx.raw('home.concept.points');
  return `<section class="sec concept"><div class="wrap concept__grid">
<div class="concept__media"><div class="reveal-img" data-reveal>${picture('villa-sea', { sizes: '(min-width:900px) 55vw, 100vw', alt: ctx.tr('home.concept.title') })}</div>
<div class="concept__float rv" data-parallax="-0.12">${picture('rooftop-pavilion', { sizes: '30vw', alt: '' })}</div></div>
<div class="concept__txt">${sectionHead(ctx, { k: ctx.t('home.concept.kicker'), title: ctx.t('home.concept.title'), text: ctx.t('home.concept.text') })}
<blockquote class="quote rv">${ctx.t('home.concept.quote')}</blockquote>
<ol class="pts" role="list">${pts.map((p, i) => `<li class="rv" style="--d:${i * 90}ms"><span class="pts__n">0${i + 1}</span><div><h3>${ctx.fe(p.title)}</h3><p>${ctx.fe(p.text)}</p></div></li>`).join('')}</ol></div></div></section>`;
}

function zoom(ctx) {
  return `<section class="zoom" data-zoom><div class="zoom__stick"><div class="zoom__frame" data-zoom-frame>${picture('aerial-terraces', { alt: ctx.tr('home.statement.line1') })}</div>
<div class="zoom__txt"><p class="h-display" data-zoom-l1>${ctx.t('home.statement.line1')}</p><p class="h-display h-display--gold" data-zoom-l2>${ctx.t('home.statement.line2')}</p></div></div></section>`;
}

function collections(ctx) {
  return `<section class="sec" id="collections"><div class="wrap">
<div class="shead-row">${sectionHead(ctx, { k: ctx.t('home.collections.kicker'), title: ctx.t('home.collections.title'), text: ctx.t('home.collections.text') })}<a class="tlink rv" href="${ctx.url('villas')}">${ctx.t('common.buttons.viewAvailability')} ${icon('arrow')}</a></div>
${collectionGrid(ctx)}</div></section>`;
}

function living(ctx) {
  const panel = (k, img, href) => `<a class="duo__p rv" href="${href}">${picture(img, { sizes: '(min-width:900px) 50vw, 100vw', alt: ctx.tr(`home.living.${k}.title`) })}<div class="duo__c"><h3 class="h-lg">${ctx.t(`home.living.${k}.title`)}</h3><p>${ctx.t(`home.living.${k}.text`)}</p><span class="tlink tlink--light">${ctx.t('common.buttons.discover')} ${icon('arrow')}</span></div></a>`;
  return `<section class="sec sec--tight"><div class="wrap">${kicker(ctx.t('home.living.kicker'))}<div class="duo">${panel('rooftop', 'rooftop-sofa', ctx.url('3-bedroom'))}${panel('garden', 'facade-gardens', ctx.url('2-bedroom'))}</div></div></section>`;
}

function resort(ctx) {
  const items = ctx.raw('home.resort.items');
  return `<section class="hs" data-hscroll aria-labelledby="resort-t"><div class="hs__stick">
<div class="wrap hs__head">${kicker(ctx.t('home.resort.kicker'))}<h2 class="h-xl" id="resort-t">${ctx.t('home.resort.title')}</h2><p class="lead">${ctx.t('home.resort.text')}</p></div>
<div class="hs__track" data-hscroll-track>${items
    .map((it, i) => `<article class="hcard"><div class="hcard__m">${picture(RESORT_IMG[i], { sizes: '(min-width:900px) 34vw, 82vw', alt: it.title })}</div><div class="hcard__b">${icon(RESORT_ICO[i])}<h3>${ctx.fe(it.title)}</h3><p>${ctx.fe(it.text)}</p></div></article>`)
    .join('')}</div>
<div class="wrap hs__bar"><span class="hs__prog"><span data-hscroll-prog></span></span></div></div></section>`;
}

function turnkey(ctx) {
  return `<section class="sec turnkey"><div class="wrap turnkey__grid">
<div class="turnkey__txt">${sectionHead(ctx, { k: ctx.t('home.turnkey.kicker'), title: ctx.t('home.turnkey.title'), text: ctx.t('home.turnkey.text') })}<a class="tlink rv" href="${ctx.url('project', 'specifications')}">${ctx.t('common.buttons.readMore')} ${icon('arrow')}</a></div>
<div class="stack" data-stack>${['living-room', 'interior-kitchen', 'interior-bedroom'].map((n, i) => `<div class="stack__i" style="--i:${i}">${picture(n, { sizes: '(min-width:900px) 40vw, 90vw', alt: '' })}</div>`).join('')}</div></div></section>
${includedList(ctx)}`;
}

function management(ctx) {
  const items = ctx.raw('home.management.items');
  return `<section class="sec dark mgmt"><div class="wrap mgmt__grid">
<div>${sectionHead(ctx, { k: ctx.t('home.management.kicker'), title: ctx.t('home.management.title'), text: ctx.t('home.management.text') })}</div>
<ol class="mgmt__list" role="list">${items.map((m, i) => `<li class="rv" style="--d:${i * 80}ms">${icon(MGMT_ICO[i])}<div><h3>${ctx.fe(m.title)}</h3><p>${ctx.fe(m.text)}</p></div></li>`).join('')}</ol></div></section>`;
}

function invest(ctx) {
  const items = ctx.raw('home.invest.items');
  return `<section class="sec"><div class="wrap">${sectionHead(ctx, { k: ctx.t('home.invest.kicker'), title: ctx.t('home.invest.title'), center: true })}
<ul class="vals" role="list">${items.map((v, i) => `<li class="val rv" style="--d:${i * 80}ms"><span class="val__v" dir="ltr">${ctx.fe(v.value)}</span><h3>${ctx.fe(v.title)}</h3><p>${ctx.fe(v.text)}</p></li>`).join('')}</ul></div></section>`;
}

function galleryTeaser(ctx) {
  return `<section class="sec sec--tight gteaser"><div class="wrap shead-row">${sectionHead(ctx, { k: ctx.t('home.galleryTeaser.kicker'), title: ctx.t('home.galleryTeaser.title'), text: ctx.t('home.galleryTeaser.text') })}<a class="tlink rv" href="${ctx.url('gallery')}">${ctx.t('common.buttons.openGallery')} ${icon('arrow')}</a></div>
<div class="slider" data-slider><div class="slider__track" data-slider-track>${SLIDES.map((n) => `<figure class="slide"><button type="button" class="slide__btn" data-lb="${n}" data-lb-w="${images[n].w}" aria-label="${ctx.t('common.buttons.openGallery')}">${picture(n, { sizes: '(min-width:900px) 46vw, 85vw', alt: '' })}</button></figure>`).join('')}</div>
<div class="wrap slider__ctl"><button class="rbtn" data-slider-prev aria-label="${ctx.t('common.buttons.prev')}">${icon('chevron')}</button><button class="rbtn" data-slider-next aria-label="${ctx.t('common.buttons.next')}">${icon('chevron')}</button></div></div></section>`;
}

export function renderHome(ctx) {
  const faq = ctx.raw('home.faq');
  const body = [
    hero(ctx), intro(ctx), statsBand(ctx), concept(ctx), zoom(ctx), collections(ctx), living(ctx), resort(ctx),
    turnkey(ctx), locationBlock(ctx, { img: 'kalyves-beach' }), management(ctx), invest(ctx), galleryTeaser(ctx), downloadsBlock(ctx),
    faqBlock(ctx, faq), enquireSection(ctx, { source: 'home' }),
  ].join('\n');
  return {
    key: 'home', section: 'home', heroDark: true, bodyClass: 'p-home',
    title: ctx.tr('home.meta.title'), description: ctx.tr('home.meta.description'),
    ogImage: 'cliff-sea',
    schema: [residenceNode(ctx), faqNode(faq)],
    body,
  };
}
