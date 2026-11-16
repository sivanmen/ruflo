// SEO: meta tags, hreflang alternates and schema.org JSON-LD.
import { esc } from './util.mjs';
import { config, project, imgJpg } from './context.mjs';

const abs = (p) => config.site + p;

export function metaTags(ctx, page) {
  const { lang, L } = ctx;
  const canonical = abs(ctx.url(page.key));
  const alts = config.languages
    .map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${abs(ctx.urlFor(l.code, page.key))}">`)
    .join('');
  const xdef = `<link rel="alternate" hreflang="x-default" href="${abs(ctx.urlFor(config.defaultLang, page.key))}">`;
  const ogImg = abs(page.ogImage ? imgJpg(page.ogImage) : '/assets/brand/og-image.jpg');
  const ogAlt = config.languages.filter((l) => l.code !== lang).map((l) => `<meta property="og:locale:alternate" content="${l.locale}">`).join('');
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">`,
    `<link rel="canonical" href="${canonical}">`,
    page.noindex ? '' : alts + xdef,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="King Solomon · Kalyves Crete">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${ogImg}">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta property="og:locale" content="${L.locale}">${ogAlt}`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.description)}">`,
    `<meta name="twitter:image" content="${ogImg}">`,
    `<meta name="geo.region" content="GR-94"><meta name="geo.placename" content="Kalyves, Chania, Crete">`,
    `<meta name="geo.position" content="${project.geo.lat};${project.geo.lng}"><meta name="ICBM" content="${project.geo.lat}, ${project.geo.lng}">`,
  ].join('\n');
}

const orgId = `${config.site}/#organization`;
const placeId = `${config.site}/#residence`;

export function baseGraph(ctx) {
  const c = config.contact;
  return [
    {
      '@type': ['Organization', 'RealEstateAgent'],
      '@id': orgId,
      name: 'SivanInvest Group',
      legalName: config.legal.company,
      vatID: config.legal.vat,
      taxID: config.legal.vat,
      alternateName: ['SivanInvest', 'Sivan Management'],
      url: config.social.group,
      logo: abs('/assets/brand/logo-512.png'),
      email: c.email,
      telephone: c.phoneGreece,
      sameAs: [config.social.youtube, config.social.group],
      address: [
        { '@type': 'PostalAddress', streetAddress: '2 Plateia Eleftherias', postalCode: '73132', addressLocality: 'Chania', addressRegion: 'Crete', addressCountry: 'GR' },
        { '@type': 'PostalAddress', streetAddress: '5 Golda Meir St, 3rd floor', addressLocality: 'Ness Ziona', addressCountry: 'IL' },
      ],
      contactPoint: [
        { '@type': 'ContactPoint', telephone: c.phoneGreece, contactType: 'sales', areaServed: 'Worldwide', availableLanguage: ['en', 'el', 'he'] },
        { '@type': 'ContactPoint', telephone: c.phoneIsrael, contactType: 'sales', areaServed: 'IL', availableLanguage: ['he', 'en'] },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${config.site}/#website`,
      url: config.site,
      name: 'King Solomon Kalyves',
      inLanguage: config.languages.map((l) => l.hreflang),
      publisher: { '@id': orgId },
    },
  ];
}

export function residenceNode(ctx) {
  return {
    '@type': ['ApartmentComplex', 'Place'],
    '@id': placeId,
    name: 'King Solomon Luxury Cliffside Villas & Spa Resort',
    description: ctx.tr('home.meta.description'),
    url: abs(ctx.url('home')),
    image: ['cliff-sea', 'infinity-pool', 'rooftop-sea', 'living-room'].map((n) => abs(imgJpg(n))),
    numberOfAccommodationUnits: project.stats.villas,
    petsAllowed: false,
    address: { '@type': 'PostalAddress', addressLocality: 'Kalyves', addressRegion: 'Chania, Crete', postalCode: '73003', addressCountry: 'GR' },
    geo: { '@type': 'GeoCoordinates', latitude: project.geo.lat, longitude: project.geo.lng },
    amenityFeature: ['Private pool', 'Infinity pool', 'Spa', 'Sauna', 'Fitness room', 'Glass elevator', 'Direct sea access', 'Gated community', 'EV charging'].map((n) => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
    containsPlace: project.collections.map((c) => ({ '@id': `${abs(ctx.url(c.slug))}#offer` })),
  };
}

export function collectionNode(ctx, c) {
  const vs = project.villas.filter((v) => v.bedrooms === c.bedrooms);
  return {
    '@type': ['Accommodation', 'House'],
    '@id': `${abs(ctx.url(c.slug))}#offer`,
    name: `King Solomon · ${ctx.tr(`common.collections.${c.slug}.name`)}`,
    description: ctx.tr(`villas.${c.slug}.meta.description`),
    image: c.gallery.map((n) => abs(imgJpg(n))),
    numberOfBedrooms: c.bedrooms,
    numberOfRooms: c.bedrooms,
    floorSize: { '@type': 'QuantitativeValue', value: c.interior, unitCode: 'MTK' },
    containedInPlace: { '@id': placeId },
  };
}

export function faqNode(items) {
  return { '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function breadcrumbNode(ctx, trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: abs(b.url) })),
  };
}

export const jsonLd = (nodes) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c')}</script>`;
