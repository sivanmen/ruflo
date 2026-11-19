import { SITE } from '../config/site.mjs';
import { esc, plain, href, abs, img, icon, formatDate } from './util.mjs';
import { chartFigure } from './charts.mjs';

export function articleCard(a, t, lang, { featured = false } = {}) {
  return `<article class="a-card reveal${featured ? ' is-featured' : ''}" data-cat="${a.category}">
  <a href="${href(lang, `insights/${a.slug}`)}">
    <div class="a-img">${img(a.image, a.title, { sizes: featured ? '(max-width: 800px) 100vw, 60vw' : '(max-width: 800px) 100vw, 33vw' })}</div>
    <div class="a-body">
      <p class="a-meta"><span class="tag">${esc(t.common.categories[a.category])}</span><span>${icon('clock')} ${a.readTime} ${esc(t.common.minRead)}</span></p>
      <h3>${esc(a.title)}</h3>
      ${featured ? `<p>${esc(a.description)}</p>` : ''}
      <span class="link">${esc(t.common.readMore)} ${icon('arrow')}</span>
    </div>
  </a>
</article>`;
}

export function insightsIndex(t, lang, articles) {
  const cats = ['all', ...new Set(articles.map((a) => a.category))];
  const [first, ...rest] = articles;
  return `<section class="section">
  <div class="container">
    <div class="filters" role="toolbar" data-filter="insights">
      ${cats.map((c, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-value="${c}" aria-pressed="${i === 0}">${esc(t.common.categories[c])}</button>`).join('')}
    </div>
    <div class="featured-wrap">${articleCard(first, t, lang, { featured: true })}</div>
    <div class="card-grid" data-filter-target="insights">${rest.map((a) => articleCard(a, t, lang)).join('')}</div>
  </div>
</section>`;
}

function block(b, t, lang) {
  switch (b.t) {
    case 'h2': return `<h2 id="${slugify(b.c)}">${esc(b.c)}</h2>`;
    case 'p': return `<p>${b.c}</p>`;
    case 'ul': return `<ul>${b.c.map((li) => `<li>${li}</li>`).join('')}</ul>`;
    case 'quote': return `<blockquote class="pull"><p>${esc(b.c)}</p></blockquote>`;
    case 'chart': return chartFigure(b.c, t, lang);
    default: return '';
  }
}

const slugify = (s) => plain(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60);

export function articleBody(a, t, lang, articles, crumbsHtml) {
  const toc = a.body.filter((b) => b.t === 'h2');
  const related = articles.filter((x) => x.slug !== a.slug && x.category === a.category)
    .concat(articles.filter((x) => x.slug !== a.slug && x.category !== a.category)).slice(0, 3);
  const faq = a.faq?.length ? `<section class="a-faq"><h2>${esc(t.common.faqTitle)}</h2>${a.faq.map((f) => `<details class="faq-item"><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`).join('')}</section>` : '';
  return `<article class="article">
  <header class="a-hero">
    <div class="a-hero-img" data-speed="0.12">${img(a.image, a.title, { eager: true, sizes: '100vw' })}</div>
    <div class="container a-hero-copy">
      ${crumbsHtml}
      <p class="a-meta"><span class="tag">${esc(t.common.categories[a.category])}</span><span>${formatDate(a.date, lang)}</span><span>${a.readTime} ${esc(t.common.minRead)}</span></p>
      <h1 class="h1">${esc(a.title)}</h1>
      <p class="lead">${esc(a.description)}</p>
      <p class="a-author">${esc(t.common.by)} <strong>${esc(a.author)}</strong> · ${SITE.name}</p>
    </div>
  </header>
  <div class="container a-layout">
    <aside class="a-aside">
      <div class="toc"><p>${esc(t.common.onThisPage)}</p><ol>${toc.map((h) => `<li><a href="#${slugify(h.c)}">${esc(h.c)}</a></li>`).join('')}</ol></div>
      <div class="aside-cta"><p>${esc(t.home.cta.title)}</p><a class="btn btn-ink btn-sm" href="${href(lang, 'contact')}">${esc(t.nav.cta)}</a></div>
    </aside>
    <div class="prose">
      ${a.body.map((b) => block(b, t, lang)).join('\n')}
      ${faq}
      <div class="a-end"><a class="btn btn-ghost" href="${href(lang, 'insights')}">← ${esc(t.common.backToInsights)}</a></div>
    </div>
  </div>
  <section class="section related"><div class="container"><h2 class="h2">${esc(t.common.related)}</h2><div class="card-grid">${related.map((r) => articleCard(r, t, lang)).join('')}</div></div></section>
</article>`;
}

export function articleLd(a, t, lang) {
  return {
    '@type': 'BlogPosting',
    headline: plain(a.title),
    description: plain(a.description),
    image: abs(`/assets/img/${a.image}-1600.webp`),
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: lang,
    author: { '@type': 'Person', name: a.author, worksFor: { '@id': `${SITE.domain}/#organization` } },
    publisher: { '@id': `${SITE.domain}/#organization` },
    mainEntityOfPage: abs(href(lang, `insights/${a.slug}`)),
    articleSection: t.common.categories[a.category],
    about: ['Crete', 'Greece', 'Construction'],
  };
}
