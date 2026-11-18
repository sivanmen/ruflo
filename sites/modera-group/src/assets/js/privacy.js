/* Modera Group — consent manager + accessibility preferences.
 * Privacy by default: nothing optional is stored or loaded before an explicit choice.
 * Exposes window.ModeraConsent = { has(cat), onChange(fn) } for main.js.
 */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (_) { /* storage blocked */ } },
  };

  /* ================= Consent ================= */
  const KEY = 'modera-consent';
  const VERSION = Number(body.dataset.consentVersion || 1);
  const MAX_AGE = Number(body.dataset.consentMaxAge || 365) * 864e5;
  const CATS = (body.dataset.consentCategories || 'preferences,media').split(',').filter((c) => c && c !== 'necessary');
  // Items each category is allowed to write; removed immediately when consent is withdrawn.
  const OWNED = { preferences: ['modera-lang'], media: [], analytics: [] };
  const gpc = navigator.globalPrivacyControl === true;
  const listeners = [];

  function read() {
    const c = store.get(KEY);
    if (!c || c.v !== VERSION || !c.ts || Date.now() - c.ts > MAX_AGE) return null;
    return c;
  }
  let state = read();

  const has = (cat) => cat === 'necessary' || !!(state && state.cats && state.cats[cat]);

  function apply(cats, source) {
    const prev = state;
    state = { v: VERSION, ts: Date.now(), source, gpc, cats };
    store.set(KEY, state);
    for (const cat of Object.keys(OWNED)) {
      if (!cats[cat]) OWNED[cat].forEach((k) => store.del(k));
    }
    hideBanner();
    const status = $('[data-consent-status]');
    if (status) { status.textContent = ''; setTimeout(() => { status.textContent = status.dataset.saved; }, 50); }
    listeners.forEach((fn) => { try { fn(state, prev); } catch (_) { /* listener error */ } });
  }
  const all = (v) => Object.fromEntries(CATS.map((c) => [c, v]));

  const banner = $('[data-consent-banner]');
  const sheet = $('[data-consent-sheet]');
  function showBanner() { if (banner) { banner.hidden = false; requestAnimationFrame(() => banner.classList.add('is-in')); } }
  function hideBanner() { if (banner) { banner.classList.remove('is-in'); banner.hidden = true; } }

  function openSheet() {
    if (!sheet) return;
    $$('[data-consent-cat]', sheet).forEach((inp) => { inp.checked = has(inp.dataset.consentCat); });
    const g = $('[data-gpc]', sheet);
    if (g) g.hidden = !gpc;
    if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', '');
  }
  function closeSheet() { if (sheet && sheet.open) sheet.close(); }

  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-consent-open]');
    if (open) { e.preventDefault(); openSheet(); return; }
    const btn = e.target.closest('[data-consent]');
    if (!btn) return;
    const action = btn.dataset.consent;
    if (action === 'accept') apply(all(true), 'accept-all');
    else if (action === 'reject') apply(all(false), 'reject-all');
    else if (action === 'save') {
      const cats = all(false);
      $$('[data-consent-cat]', sheet).forEach((inp) => { if (CATS.includes(inp.dataset.consentCat)) cats[inp.dataset.consentCat] = inp.checked; });
      apply(cats, 'custom');
    }
    closeSheet();
  });
  // Click on the backdrop closes the sheet.
  [sheet, $('[data-a11y-sheet]')].forEach((d) => d && d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

  // Global Privacy Control is an explicit refusal: no banner, optional categories stay off.
  if (!state && !gpc) showBanner();

  window.ModeraConsent = { has, onChange: (fn) => listeners.push(fn), open: openSheet };

  /* ================= Accessibility preferences ================= */
  const AKEY = 'modera-a11y';
  const FLAGS = ['contrast', 'motion', 'links', 'readable', 'spacing', 'cursor'];
  let prefs = store.get(AKEY) || {};
  const a11ySheet = $('[data-a11y-sheet]');

  function applyA11y() {
    root.classList.remove('a11y-size-1', 'a11y-size-2');
    if (prefs.size) root.classList.add(`a11y-size-${prefs.size}`);
    FLAGS.forEach((f) => root.classList.toggle(`a11y-${f}`, !!prefs[f]));
    document.dispatchEvent(new CustomEvent('modera:a11y', { detail: prefs }));
  }
  function syncA11yUI() {
    if (!a11ySheet) return;
    $$('[data-a11y]', a11ySheet).forEach((inp) => { inp.checked = !!prefs[inp.dataset.a11y]; });
    $$('[data-a11y-size]', a11ySheet).forEach((inp) => { inp.checked = Number(inp.value) === (prefs.size || 0); });
  }
  function saveA11y() {
    const empty = !prefs.size && !FLAGS.some((f) => prefs[f]);
    if (empty) store.del(AKEY); else store.set(AKEY, prefs);
    applyA11y();
  }

  if (a11ySheet) {
    a11ySheet.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('[data-a11y]')) prefs[t.dataset.a11y] = t.checked;
      if (t.matches('[data-a11y-size]')) prefs.size = Number(t.value);
      saveA11y();
    });
    $('[data-a11y-reset]', a11ySheet)?.addEventListener('click', () => { prefs = {}; saveA11y(); syncA11yUI(); });
  }
  $$('[data-a11y-open]').forEach((b) => b.addEventListener('click', () => {
    syncA11yUI();
    if (typeof a11ySheet?.showModal === 'function') a11ySheet.showModal();
  }));
  applyA11y();
})();
