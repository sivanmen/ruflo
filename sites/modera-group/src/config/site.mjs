/**
 * Global, language-independent configuration for modera-group.com.
 * Text lives in src/content/<lang>/*.json — this file holds facts, routes and data.
 */

export const SITE = {
  name: 'Modera Group',
  domain: 'https://modera-group.com',
  email: 'support@modera-group.com',
  phone: '+306983924820',
  phoneDisplay: '+30 698 392 4820',
  whatsapp: 'https://wa.me/306983924820',
  taxNo: 'EL802555027',
  address: {
    street: '2 Plateia Eleftherias',
    postalCode: '73132',
    city: 'Chania',
    region: 'Crete',
    country: 'GR',
    countryName: 'Greece',
  },
  geo: { lat: 35.5138, lng: 24.0180 },
  mapQuery: 'Plateia Eleftherias 2, 73132 Chania, Greece',
  foundingYearApprox: 2014,
  // Contact form is handled on our own server (no third-party processor).
  formEndpoint: '/contact.php',
  // Who receives new enquiries by email. Every enquiry is ALSO stored on the server,
  // so nothing is lost if mail delivery fails.
  leadRecipients: ['support@modera-group.com'],
  leadRetentionDays: 730,
  // Sender of enquiry emails. The domain needs SPF (and ideally DKIM) for inbox delivery.
  mailFrom: 'no-reply@modera-group.com',
  // Send the visitor a branded confirmation in their language.
  sendConfirmation: true,
};

/** Languages in display order. `default` is served as x-default. */
export const LANGS = [
  { code: 'en', label: 'English', short: 'EN', locale: 'en_GB', default: true },
  { code: 'el', label: 'Ελληνικά', short: 'EL', locale: 'el_GR' },
  { code: 'fr', label: 'Français', short: 'FR', locale: 'fr_FR' },
  { code: 'de', label: 'Deutsch', short: 'DE', locale: 'de_DE' },
  { code: 'ru', label: 'Русский', short: 'RU', locale: 'ru_RU' },
  { code: 'es', label: 'Español', short: 'ES', locale: 'es_ES' },
  { code: 'nl', label: 'Nederlands', short: 'NL', locale: 'nl_NL' },
];

/** Page routes (slug is shared across languages for clean hreflang pairing). */
export const PAGES = [
  { key: 'home', path: '' },
  { key: 'services', path: 'services' },
  { key: 'sectors', path: 'sectors' },
  { key: 'projects', path: 'projects' },
  { key: 'about', path: 'about' },
  { key: 'team', path: 'team' },
  { key: 'insights', path: 'insights' },
  { key: 'contact', path: 'contact' },
  { key: 'credits', path: 'credits', noindex: false },
  { key: 'privacy', path: 'privacy' },
  { key: 'cookies', path: 'cookies' },
  { key: 'accessibility', path: 'accessibility' },
  { key: 'terms', path: 'terms' },
];

export const NAV = ['services', 'sectors', 'projects', 'about', 'team', 'insights'];

/** Imagery per section (file stem in src/assets/img, available at -1600 and -800). */
export const IMAGES = {
  services: {
    construction: 'steel-crew',
    development: 'plot-aerial',
    'contracting-support': 'site-engineer',
    'engineering-management': 'blueprint',
    regulatory: 'drafting',
  },
  sectors: {
    residential: 'stone-villa',
    commercial: 'office-facade',
    hospitality: 'resort-sunset',
    infrastructure: 'road-paving',
  },
  process: ['plot-aerial', 'blueprint', 'drafting', 'slab-rebar', 'interior-living'],
  gallery: ['hero-villa', 'resort-terraces', 'kitchen-island', 'stone-mansion', 'crane', 'interior-bright', 'cretan-bay', 'modern-mountain'],
  pageHero: {
    services: 'crane', sectors: 'resort-pool', projects: 'infinity-pool', about: 'chania-harbour',
    team: 'survey', insights: 'olive-valley', contact: 'cretan-sea', credits: 'olive-tree', privacy: 'olive-tree', cookies: 'olive-valley', accessibility: 'cretan-bay', terms: 'stone-mansion',
  },
};

/** Chart data — numbers only; labels come from content files. */
export const CHARTS = {
  // € per m² ranges (indicative, Crete 2026, excl. land & VAT)
  cost: [[1400, 1800], [1300, 1700], [2000, 2800], [2800, 4200], [2200, 3200], [1100, 1600]],
  // [start month, end month] per phase
  timeline: [[0, 2], [1, 7], [5, 10], [9, 22], [22, 24]],
  // % of a typical premium villa budget
  split: [24, 14, 20, 26, 11, 5],
  // International arrivals to Greece, millions (rounded; Bank of Greece / INSETE)
  arrivals: { years: [2019, 2020, 2021, 2022, 2023, 2024], values: [31.3, 7.4, 14.7, 27.8, 32.7, 35.9] },
};

/**
 * Consent (GDPR / ePrivacy / Israeli Privacy Protection Law).
 * Only categories listed here are shown in the consent dialog. Add 'analytics'
 * (and wire the script with data-consent="analytics") only if statistics are introduced.
 */
export const CONSENT = {
  version: 1, // bump to ask everyone again after material changes
  maxAgeDays: 365,
  categories: ['necessary', 'preferences', 'media'],
};
