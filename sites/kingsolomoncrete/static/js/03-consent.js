/* Cookie consent manager (GDPR / ePrivacy / Israeli PPL) + Google Consent Mode v2.
   Nothing non-essential loads until the visitor opts in. Reject is as easy as accept. */
(() => {
  'use strict';
  const { $, $$, store } = window.KSU;
  const KEY = 'ks_consent';
  const VERSION = 1;
  const MAX_AGE = 365 * 24 * 3600 * 1000;
  const cfg = (window.KS && window.KS.tracking) || {};
  const box = $('[data-consent]');
  const panel = $('[data-cc-panel]', box);
  let state = store.get(KEY);
  if (!state || state.v !== VERSION || Date.now() - state.ts > MAX_AGE) state = null;

  const gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
  const loaded = {};
  const addScript = (src) => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); return s; };

  function loadTags(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied',
      personalization_storage: c.preferences ? 'granted' : 'denied',
    });
    if (cfg.gtm && (c.analytics || c.marketing) && !loaded.gtm) {
      loaded.gtm = true;
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(cfg.gtm)}`);
    }
    const gaId = c.analytics && cfg.ga4;
    const adsId = c.marketing && cfg.googleAds;
    if ((gaId || adsId) && !loaded.gtag) {
      loaded.gtag = true;
      addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId || adsId)}`);
      gtag('js', new Date());
    }
    if (gaId && !loaded.ga) { loaded.ga = true; gtag('config', cfg.ga4, { anonymize_ip: true }); }
    if (adsId && !loaded.ads) { loaded.ads = true; gtag('config', cfg.googleAds); }
    if (c.marketing && cfg.metaPixel && !loaded.fb) {
      loaded.fb = true;
      /* Meta Pixel base code */
      const f = window; if (!f.fbq) {
        const n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        addScript('https://connect.facebook.net/en_US/fbevents.js');
      }
      f.fbq('init', cfg.metaPixel); f.fbq('track', 'PageView');
    }
  }

  function save(c) {
    state = { v: VERSION, ts: Date.now(), necessary: true, preferences: !!c.preferences, analytics: !!c.analytics, marketing: !!c.marketing };
    store.set(KEY, state);
    if (!state.preferences) { try { localStorage.removeItem('ks_a11y'); } catch {} }
    hide(); loadTags(state);
  }
  function show(withPanel = false) {
    box.hidden = false;
    panel.hidden = !withPanel;
    $('[data-cc="customize"]', box).hidden = withPanel;
    $('[data-cc="save"]', box).hidden = !withPanel;
    $$('[data-cc-cat]', box).forEach((i) => (i.checked = !!(state && state[i.name])));
    (withPanel ? $('[data-cc-cat]', box) : $('[data-cc="accept"]', box))?.focus({ preventScroll: true });
  }
  function hide() { box.hidden = true; }

  box?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cc]');
    if (!b) return;
    const a = b.dataset.cc;
    if (a === 'accept') save({ preferences: true, analytics: true, marketing: true });
    if (a === 'reject') save({});
    if (a === 'customize') show(true);
    if (a === 'save') { const c = {}; $$('[data-cc-cat]', box).forEach((i) => (c[i.name] = i.checked)); save(c); }
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-consent-open]')) { e.preventDefault(); show(true); } });

  window.KSC = {
    allowed: (cat) => cat === 'necessary' || !!(state && state[cat]),
    track(name, params = {}) {
      gtag('event', name, params);
      if (name === 'generate_lead') {
        if (window.fbq) window.fbq('track', 'Lead');
        if (cfg.googleAds && cfg.googleAdsLeadLabel) gtag('event', 'conversion', { send_to: `${cfg.googleAds}/${cfg.googleAdsLeadLabel}` });
      }
    },
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-track]');
    if (t) window.KSC.track(t.dataset.track === 'brochure' || t.dataset.track === 'plan' ? 'file_download' : 'contact', { method: t.dataset.track });
  });

  if (state) loadTags(state);
  else if (box) setTimeout(() => show(false), 900);
})();
