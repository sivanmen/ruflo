import { IMAGES, SITE } from '../config/site.mjs';
import { esc, plain, href, img, icon } from './util.mjs';
import { chartFigure } from './charts.mjs';
import { articleCard } from './insights.mjs';

const eyebrow = (s) => `<p class="eyebrow">${esc(s)}</p>`;

function hero(t, lang) {
  const h = t.home.hero;
  return `<section class="hero" data-hero>
  <div class="hero-sticky">
    <div class="hero-ghost" aria-hidden="true" data-speed="-0.15">MODERA</div>
    <div class="container hero-copy">
      ${eyebrow(h.eyebrow)}
      <h1 class="display split-lines">${h.title}</h1>
      <p class="lead">${esc(h.lead)}</p>
      <div class="hero-cta">
        <a class="btn btn-ink magnetic" href="${href(lang, 'contact')}">${esc(h.ctaPrimary)} ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="${href(lang, 'projects')}">${esc(h.ctaSecondary)}</a>
      </div>
    </div>
    <div class="hero-window">
      <video class="hero-media" autoplay muted loop playsinline preload="metadata" poster="/assets/video/modera-film-poster.webp" aria-hidden="true">
        <source src="/assets/video/modera-film.mp4" type="video/mp4">
      </video>
      <div class="hero-glass glass">
        <span class="pulse"></span><span>${esc(h.badge)}</span>
      </div>
    </div>
    <a href="#stats" class="scroll-cue" aria-label="${esc(t.common.scroll)}">${icon('arrowDown')}</a>
  </div>
</section>`;
}

function stats(t) {
  const items = t.home.stats.map((s) => `<div class="stat reveal"><span class="stat-num"><span data-count="${s.value}">${s.value}</span>${esc(s.suffix)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join('');
  const words = t.services.items.map((s) => s.title).concat(t.sectors.items.map((s) => s.title));
  const track = words.map((w) => `<span>${esc(w)}</span><i aria-hidden="true">✦</i>`).join('');
  return `<section class="stats-band" id="stats">
  <div class="container stats">${items}</div>
  <div class="marquee" aria-hidden="true"><div class="marquee-track">${track}${track}</div></div>
</section>`;
}

function intro(t) {
  const s = t.home.intro;
  return `<section class="section intro">
  <div class="container split">
    <div class="intro-visual" aria-hidden="true">
      <div class="layer layer-back" data-speed="0.08">${img('stone-mansion', '', { sizes: '40vw' })}</div>
      <div class="layer layer-front" data-speed="-0.06">${img('interior-living', '', { sizes: '30vw' })}</div>
      <div class="layer-tag glass">${esc(t.home.stats[1].value)}${esc(t.home.stats[1].suffix)} <small>${esc(t.home.stats[1].label)}</small></div>
    </div>
    <div class="intro-copy">
      ${eyebrow(s.eyebrow)}
      <h2 class="h2 reveal">${s.title}</h2>
      <p class="body-lg reveal">${esc(s.text)}</p>
      <ul class="checks reveal">${s.points.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>`;
}

function services(t, lang) {
  const s = t.home.services;
  const rows = t.services.items.map((it, i) => `<li class="svc-row reveal" data-preview="${IMAGES.services[it.id]}">
    <a href="${href(lang, 'services')}#${it.id}">
      <span class="svc-num">0${i + 1}</span>
      <span class="svc-title">${esc(it.title)}</span>
      <span class="svc-short">${esc(it.short)}</span>
      <span class="svc-arrow">${icon('arrow')}</span>
    </a>
  </li>`).join('');
  return `<section class="section services-home">
  <div class="container">
    <div class="section-head">${eyebrow(s.eyebrow)}<h2 class="h2 reveal">${s.title}</h2><p class="lead reveal">${esc(s.lead)}</p></div>
    <div class="svc-wrap">
      <ul class="svc-list">${rows}</ul>
      <div class="svc-preview" aria-hidden="true">${t.services.items.map((it, i) => img(IMAGES.services[it.id], '', { cls: i === 0 ? 'is-on' : '', sizes: '35vw', attrs: `data-key="${IMAGES.services[it.id]}"` })).join('')}</div>
    </div>
  </div>
</section>`;
}

function sectors(t, lang) {
  const s = t.home.sectors;
  const cards = t.sectors.items.map((it, i) => `<article class="sector-card">
    <a href="${href(lang, 'sectors')}#${it.id}">
      <div class="sector-img">${img(IMAGES.sectors[it.id], it.title, { sizes: '(max-width: 800px) 85vw, 40vw' })}</div>
      <div class="sector-body glass-dark">
        <span class="sector-idx">0${i + 1} / 0${t.sectors.items.length}</span>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.short)}</p>
        <span class="link">${esc(t.common.learnMore)} ${icon('arrow')}</span>
      </div>
    </a>
  </article>`).join('');
  return `<section class="section sectors-home">
  <div class="container section-head row-head">
    <div>${eyebrow(s.eyebrow)}<h2 class="h2 reveal">${s.title}</h2></div>
    <p class="lead reveal">${esc(s.lead)}</p>
  </div>
  <div class="h-scroll" data-drag><div class="h-track">${cards}</div></div>
</section>`;
}

function process(t) {
  const s = t.home.process;
  const steps = s.steps.map((st, i) => `<li class="step" data-step="${i}">
    <span class="step-num">0${i + 1}</span>
    <div><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></div>
  </li>`).join('');
  const imgs = IMAGES.process.map((n, i) => img(n, s.steps[i].title, { cls: i === 0 ? 'is-on' : '', sizes: '50vw' })).join('');
  return `<section class="section process" data-process>
  <div class="container">
    <div class="section-head">${eyebrow(s.eyebrow)}<h2 class="h2 reveal">${s.title}</h2><p class="lead reveal">${esc(s.lead)}</p></div>
    <div class="process-grid">
      <div class="process-stage"><div class="process-frame">${imgs}<div class="process-meter"><span></span></div></div></div>
      <ol class="steps">${steps}</ol>
    </div>
  </div>
</section>`;
}

function film(t) {
  const s = t.home.film;
  return `<section class="film" data-film>
  <video class="film-media" muted loop playsinline preload="none" poster="/assets/video/excavation-poster.webp" data-autoplay aria-hidden="true">
    <source src="/assets/video/excavation.mp4" type="video/mp4">
  </video>
  <div class="film-shade"></div>
  <div class="container film-copy">
    ${eyebrow(s.eyebrow)}
    <h2 class="h2 reveal">${s.title}</h2>
    <p class="body-lg reveal">${esc(s.text)}</p>
  </div>
</section>`;
}

function charts(t, lang) {
  const s = t.home.charts;
  return `<section class="section charts">
  <div class="container">
    <div class="section-head">${eyebrow(s.eyebrow)}<h2 class="h2 reveal">${s.title}</h2><p class="lead reveal">${esc(s.lead)}</p></div>
    <div class="chart-grid">
      <div class="chart-wide">${chartFigure('cost', t, lang)}</div>
      ${chartFigure('timeline', t, lang)}
      ${chartFigure('split', t, lang)}
    </div>
  </div>
</section>`;
}

function compare(t) {
  const s = t.home.compare;
  return `<section class="section compare">
  <div class="container">
    <div class="section-head">${eyebrow(s.eyebrow)}<h2 class="h2 reveal">${s.title}</h2></div>
    <div class="cmp reveal" role="table">
      <div class="cmp-row cmp-head" role="row"><span role="columnheader"></span><span role="columnheader">${esc(s.colA)}</span><span role="columnheader" class="cmp-b">${esc(s.colB)}</span></div>
      ${s.rows.map((r) => `<div class="cmp-row" role="row"><span role="rowheader">${esc(r.label)}</span><span role="cell" class="cmp-a">${esc(r.a)}</span><span role="cell" class="cmp-b">${icon('check')} ${esc(r.b)}</span></div>`).join('')}
    </div>
  </div>
</section>`;
}

function partners(t, lang) {
  const s = t.home.partners;
  return `<section class="section partners">
  <div class="container partners-panel">
    <div class="partners-bg" aria-hidden="true" data-speed="0.1">${img('cretan-bay', '', { sizes: '100vw' })}</div>
    <div class="partners-copy">
      ${eyebrow(s.eyebrow)}
      <h2 class="h2 reveal">${s.title}</h2>
      <p class="body-lg reveal">${esc(s.text)}</p>
      <div class="partner-marks"><span>Sivan Invest Group</span><span>Harmony Fund</span><span>Modera Group</span></div>
      <a class="btn btn-light magnetic" href="${href(lang, 'insights/sivan-invest-group-modera-turnkey-projects')}">${esc(s.cta)} ${icon('arrow')}</a>
    </div>
  </div>
</section>`;
}

function insights(t, lang, articles) {
  const s = t.home.insights;
  return `<section class="section insights-home">
  <div class="container">
    <div class="section-head row-head"><div>${eyebrow(s.eyebrow)}<h2 class="h2 reveal">${s.title}</h2></div><a class="btn btn-ghost" href="${href(lang, 'insights')}">${esc(t.common.allArticles)} ${icon('arrow')}</a></div>
    <div class="card-grid">${articles.slice(0, 3).map((a) => articleCard(a, t, lang)).join('')}</div>
  </div>
</section>`;
}

export function faqBlock(t, items) {
  return `<div class="faq">${items.map((f) => `<details class="faq-item reveal"><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><div class="faq-a"><p>${f.a}</p></div></details>`).join('')}</div>`;
}
export const faqLd = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
});

export function ctaBand(t, lang) {
  const s = t.home.cta;
  return `<section class="cta-band">
  <div class="container cta-inner">
    <div class="cta-bg" aria-hidden="true">${img('infinity-pool', '', { sizes: '100vw' })}</div>
    <div class="cta-copy glass">
      <h2 class="h2">${esc(s.title)}</h2>
      <p>${esc(s.text)}</p>
      <div class="hero-cta">
        <a class="btn btn-ink magnetic" href="${href(lang, 'contact')}">${esc(s.button)} ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a>
      </div>
    </div>
  </div>
</section>`;
}

export function homeBody(t, lang, articles) {
  const faq = `<section class="section faq-sec"><div class="container narrow"><div class="section-head"><h2 class="h2">${esc(t.common.faqTitle)}</h2></div>${faqBlock(t, t.home.faq)}</div></section>`;
  return [hero(t, lang), stats(t), intro(t), services(t, lang), sectors(t, lang), process(t), film(t), charts(t, lang), compare(t), partners(t, lang), insights(t, lang, articles), faq, ctaBand(t, lang)].join('\n');
}
