import { SITE, LANGS, NAV } from '../config/site.mjs';
import { esc, plain, href, abs, icon, logo, langMeta } from './util.mjs';

const ASSET_V = Date.now().toString(36);

/** Organization + WebSite graph shared by every page. */
function baseGraph(t, lang) {
  const org = {
    '@type': ['GeneralContractor', 'Organization'],
    '@id': `${SITE.domain}/#organization`,
    name: SITE.name,
    url: SITE.domain,
    logo: abs('/assets/img/brand/logo-square.png'),
    image: abs('/assets/img/hero-villa-1600.webp'),
    description: plain(t.meta.home.description),
    email: SITE.email,
    telephone: SITE.phone,
    taxID: SITE.taxNo,
    vatID: SITE.taxNo,
    address: {
      '@type': 'PostalAddress', streetAddress: SITE.address.street, postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city, addressRegion: SITE.address.region, addressCountry: SITE.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    areaServed: [{ '@type': 'Place', name: 'Crete' }, { '@type': 'Country', name: 'Greece' }],
    knowsLanguage: ['el', 'en', 'he'],
    openingHours: 'Mo-Fr 09:00-17:00',
    priceRange: '€€€',
    knowsAbout: ['Residential construction', 'Commercial construction', 'Hotel construction', 'Infrastructure works', 'Building permits in Greece', 'Construction management', 'Real estate development'],
    parentOrganization: { '@type': 'Organization', name: 'Sivan Invest Group' },
  };
  const site = {
    '@type': 'WebSite', '@id': `${SITE.domain}/#website`, url: SITE.domain, name: SITE.name,
    inLanguage: LANGS.map((l) => l.code), publisher: { '@id': `${SITE.domain}/#organization` },
  };
  return [org, site];
}

function head({ t, lang, title, description, path, alternates, image, graph = [], noindex = false }) {
  const url = abs(path);
  const ogImg = abs(`/assets/img/${image || 'hero-villa'}-1600.webp`);
  const alt = Object.entries(alternates)
    .map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${abs(p)}">`).join('\n  ');
  const ld = { '@context': 'https://schema.org', '@graph': [...baseGraph(t, lang), ...graph] };
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(plain(title))}</title>
  <meta name="description" content="${esc(plain(description))}">
  ${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <link rel="canonical" href="${url}">
  ${alt}
  <link rel="alternate" hreflang="x-default" href="${abs(alternates.en)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${esc(plain(title))}">
  <meta property="og:description" content="${esc(plain(description))}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:locale" content="${langMeta(lang).locale}">
  ${LANGS.filter((l) => l.code !== lang).map((l) => `<meta property="og:locale:alternate" content="${l.locale}">`).join('')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" href="/assets/img/brand/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/img/brand/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Noto+Serif+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap">
  <link rel="stylesheet" href="/assets/css/main.css?v=${ASSET_V}">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>`;
}

function header(t, lang, active, alternates) {
  const links = NAV.map((k) => `<a href="${href(lang, k)}" class="nav-link${active === k ? ' is-active' : ''}"${active === k ? ' aria-current="page"' : ''}>${esc(t.nav[k])}</a>`).join('');
  const langs = LANGS.map((l) => `<li><a href="${alternates[l.code]}" hreflang="${l.code}" lang="${l.code}"${l.code === lang ? ' aria-current="true"' : ''}><span>${l.short}</span>${esc(l.label)}</a></li>`).join('');
  return `<a class="skip" href="#main">${esc(t.common.skipToContent)}</a>
<div class="progress" aria-hidden="true"><span></span></div>
<header class="site-header" data-header>
  <div class="header-inner">
    ${logo(lang)}
    <nav class="nav" aria-label="Main">${links}</nav>
    <div class="header-actions">
      <div class="lang" data-lang>
        <button class="lang-btn" aria-expanded="false" aria-haspopup="true" aria-label="${esc(t.nav.language)}">${icon('globe')}<span>${langMeta(lang).short}</span></button>
        <ul class="lang-menu" role="list">${langs}</ul>
      </div>
      <a class="btn btn-ink btn-sm header-cta magnetic" href="${href(lang, 'contact')}">${esc(t.nav.cta)}</a>
      <button class="burger" data-burger aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(t.nav.menu)}"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
  <nav aria-label="Mobile">${['home', ...NAV, 'contact'].map((k, i) => `<a href="${href(lang, k === 'home' ? '' : k)}" style="--i:${i}">${esc(t.nav[k])}</a>`).join('')}</nav>
  <div class="mobile-langs">${LANGS.map((l) => `<a href="${alternates[l.code]}" hreflang="${l.code}"${l.code === lang ? ' aria-current="true"' : ''}>${l.short}</a>`).join('')}</div>
  <div class="mobile-contact"><a href="tel:${SITE.phone}">${icon('phone')} ${SITE.phoneDisplay}</a><a href="mailto:${SITE.email}">${icon('mail')} ${SITE.email}</a></div>
</div>`;
}

function footer(t, lang) {
  const year = new Date().getFullYear();
  const col = (title, keys) => `<div class="f-col"><h3>${esc(title)}</h3>${keys.map((k) => `<a href="${href(lang, k === 'home' ? '' : k)}">${esc(t.nav[k])}</a>`).join('')}</div>`;
  return `<footer class="site-footer">
  <div class="container">
    <div class="f-top">
      <div class="f-brand">
        ${logo(lang)}
        <p>${esc(t.footer.tagline)}</p>
        <a class="btn btn-bronze magnetic" href="${href(lang, 'contact')}">${esc(t.nav.cta)} ${icon('arrow')}</a>
      </div>
      ${col(t.footer.explore, ['services', 'sectors', 'projects', 'insights'])}
      ${col(t.footer.company, ['about', 'team', 'contact'])}
      <div class="f-col f-contact">
        <h3>${esc(t.footer.contact)}</h3>
        <a href="tel:${SITE.phone}">${icon('phone')} ${SITE.phoneDisplay}</a>
        <a href="mailto:${SITE.email}">${icon('mail')} ${SITE.email}</a>
        <a href="${SITE.whatsapp}" rel="noopener" target="_blank">${icon('whatsapp')} WhatsApp</a>
        <address>${icon('pin')} <span>${SITE.address.street}<br>${SITE.address.postalCode} ${SITE.address.city}, ${SITE.address.region}, ${SITE.address.countryName}</span></address>
      </div>
    </div>
    <div class="f-giant" aria-hidden="true"><img src="/assets/img/brand/logo-light.webp" alt="" width="900" height="189" loading="lazy"></div>
    <div class="f-bottom">
      <p>© ${year} ${SITE.name}. ${esc(t.common.rights)} · ${esc(t.common.taxNo)} ${SITE.taxNo}</p>
      <p class="f-legal"><a href="${href(lang, 'privacy')}">${esc(t.common.privacy)}</a><a href="${href(lang, 'credits')}">${esc(t.common.credits)}</a></p>
      <p class="f-disclaimer">${esc(t.footer.disclaimer)}</p>
    </div>
  </div>
</footer>
<nav class="mobile-bar" aria-label="Quick contact">
  <a href="tel:${SITE.phone}">${icon('phone')}<span>${esc(t.mobileBar.call)}</span></a>
  <a href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(t.mobileBar.whatsapp)}</span></a>
  <a href="${href(lang, 'contact')}" class="is-primary">${icon('mail')}<span>${esc(t.mobileBar.enquire)}</span></a>
</nav>`;
}

/** Breadcrumb JSON-LD + markup. */
export function breadcrumbs(t, lang, trail) {
  const items = [{ name: t.nav.home, path: href(lang) }, ...trail];
  const ld = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: plain(it.name), item: abs(it.path) })),
  };
  const html = `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) => i === items.length - 1
    ? `<li aria-current="page">${esc(plain(it.name))}</li>`
    : `<li><a href="${it.path}">${esc(plain(it.name))}</a></li>`).join('')}</ol></nav>`;
  return { ld, html };
}

/** Full HTML document. */
export function page({ t, lang, key, title, description, path, alternates, image, graph, body, noindex, bodyClass = '' }) {
  return `<!doctype html>
<html lang="${lang}" dir="ltr">
${head({ t, lang, title, description, path, alternates, image, graph, noindex })}
<body class="page-${key} ${bodyClass}">
${header(t, lang, key, alternates)}
<main id="main">
${body}
</main>
${footer(t, lang)}
<script src="/assets/js/main.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}
