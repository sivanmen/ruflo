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
  gemi: '178690758000',
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
  // Google reCAPTCHA v3 (score-based). The site key is public; the SECRET key is injected
  // at build/deploy time from MODERA_RECAPTCHA_SECRET and never committed.
  // Google Tag Manager containers (Google Analytics etc.). Loaded ONLY after the visitor
  // consents to Statistics or Marketing, with Google Consent Mode v2 signals.
  gtm: ['GTM-TDX9Z9HT', 'GTM-PFFK2R8T'],
  recaptcha: { siteKey: '6Le-ziYuAAAAAHBWSdGev2zj7sGp4etOsznHvx3', action: 'contact', minScore: 0.5 },
};

/** Languages in display order. `default` is served as x-default. */
/**
 * Additional languages published for selected pages only (not in the main switcher).
 * Hebrew: privacy policy + accessibility statement for the Israeli public.
 */
export const PARTIAL_LANGS = [
  { code: 'he', label: 'עברית', short: 'HE', locale: 'he_IL', dir: 'rtl', pages: ['privacy', 'accessibility'] },
];

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
    construction: 'site-piling-rig',
    development: 'ks-resort-aerial',
    'contracting-support': 'site-team',
    'engineering-management': 'site-pile-cage',
    regulatory: 'ks-site-plan',
  },
  sectors: {
    residential: 'chania-residence-dusk',
    commercial: 'chania-street-building',
    hospitality: 'ks-resort-pool',
    infrastructure: 'site-earthworks-sea',
  },
  process: ['ks-land-sea', 'ks-site-plan-2', 'eco-villas-model', 'site-rebar-cage', 'ks-resort-pool-2'],
  gallery: ['ks-resort-pool', 'chania-alley-flowers', 'eco-villas-rock', 'site-piling-dusk', 'chania-residence-sunset', 'crete-harbour-boats', 'eco-villas-aerial', 'chania-venetian-walls'],
  pageHero: {
    services: 'site-earthworks-road', sectors: 'eco-villas-hillside', projects: 'ks-aerial-render', about: 'chania-harbour-dusk',
    team: 'chania-sunset', insights: 'chania-harbour-aerial', contact: 'chania-lighthouse-night', credits: 'chania-alley', privacy: 'chania-old-town-sea',
    cookies: 'chania-waterfront', accessibility: 'chania-harbour-day', terms: 'chania-venetian-walls',
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
  version: 2, // bumped: statistics & marketing (Google Tag Manager) added — everyone is asked again
  maxAgeDays: 365,
  categories: ['necessary', 'preferences', 'analytics', 'marketing', 'media'],
};
