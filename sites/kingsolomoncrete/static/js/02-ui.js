/* Lightbox, lead forms, accessibility menu */
(() => {
  'use strict';
  const { $, $$, store, RTL } = window.KSU;
  const root = document.documentElement;

  /* Lightbox ------------------------------------------------------------- */
  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]', lb);
  let group = [], idx = 0, lastFocus = null;
  const srcOf = (btn) => {
    const name = btn.dataset.lb; const w = +btn.dataset.lbW || 2400;
    const pick = [2400, 1600, 960, 480].find((x) => x <= w) || w;
    return `/assets/img/${name}-${Math.min(w, pick)}.webp`;
  };
  const show = (i) => {
    idx = (i + group.length) % group.length;
    const b = group[idx];
    lbImg.src = srcOf(b);
    lbImg.alt = b.querySelector('img')?.alt || '';
    $('[data-lb-count]', lb).textContent = group.length > 1 ? `${idx + 1} / ${group.length}` : '';
    $('[data-lb-prev]', lb).hidden = $('[data-lb-next]', lb).hidden = group.length < 2;
  };
  const open = (btn) => {
    const g = btn.dataset.lbGroup;
    const scope = btn.closest('[data-slider], [data-masonry], .mosaic, .tri, .marquee, .tabs') || document;
    group = g ? $$(`[data-lb-group="${g}"]:not(.is-out)`) : $$('[data-lb]', scope).filter((x) => !x.closest('[aria-hidden="true"]'));
    if (!group.includes(btn)) group = [btn];
    lastFocus = btn; lb.hidden = false; document.body.style.overflow = 'hidden';
    show(group.indexOf(btn)); $('[data-lb-close]', lb).focus();
  };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; lbImg.src = ''; lastFocus?.focus(); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]');
    if (b) { e.preventDefault(); open(b); }
  });
  $('[data-lb-close]', lb)?.addEventListener('click', close);
  $('[data-lb-next]', lb)?.addEventListener('click', () => show(idx + 1));
  $('[data-lb-prev]', lb)?.addEventListener('click', () => show(idx - 1));
  lb?.addEventListener('click', (e) => e.target === lb && close());
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + (RTL ? -1 : 1));
    if (e.key === 'ArrowLeft') show(idx + (RTL ? 1 : -1));
    if (e.key === 'Tab') { const f = $$('button:not([hidden])', lb); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
  });
  let tx = 0;
  lb?.addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  lb?.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + ((dx < 0) !== RTL ? 1 : -1)); });

  /* Lead forms ----------------------------------------------------------- */
  const utm = (() => {
    const p = new URLSearchParams(location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'gbraid', 'wbraid'];
    const found = {};
    keys.forEach((k) => p.get(k) && (found[k] = p.get(k).slice(0, 200)));
    try {
      if (Object.keys(found).length) sessionStorage.setItem('ks_utm', JSON.stringify(found));
      return JSON.parse(sessionStorage.getItem('ks_utm') || '{}');
    } catch { return found; }
  })();
  $$('form[data-lead]').forEach((form) => {
    const i18n = JSON.parse($('[data-i18n]', form).textContent);
    const err = (input, msg) => {
      const fld = input.closest('.fld');
      fld?.classList.toggle('is-err', !!msg);
      const p = fld?.querySelector('.fld__err'); if (p) p.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    const check = (input) => {
      const v = input.value.trim();
      if (input.required && !v) return err(input, i18n.required);
      if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return err(input, i18n.email);
      if (input.type === 'tel' && v && !/^[+()\d\s.-]{6,}$/.test(v)) return err(input, i18n.phone);
      return err(input, '');
    };
    $$('input[required]:not([type=checkbox]), input[type=email], input[type=tel]', form).forEach((i) => i.addEventListener('blur', () => check(i)));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let ok = true;
      $$('input[required]:not([type=checkbox]), input[type=email], input[type=tel]', form).forEach((i) => (ok = check(i) && ok));
      const consent = form.querySelector('[name="consent_privacy"]');
      const cErr = $('[data-consent-err]', form);
      cErr.textContent = consent.checked ? '' : i18n.consent;
      ok = consent.checked && ok;
      if (!ok) { form.querySelector('[aria-invalid="true"], [name="consent_privacy"]:not(:checked)')?.focus(); return; }
      form.page.value = location.pathname;
      form.utm.value = JSON.stringify(utm);
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true; const label = btn.innerHTML; btn.textContent = btn.dataset.sending;
      const msg = $('[data-msg]', form);
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || res.status);
        form.classList.add('is-done'); msg.hidden = false; $('[data-ok]', msg).hidden = false; $('[data-fail]', msg).hidden = true; msg.focus();
        window.KSC?.track('generate_lead', { form_source: form.dataset.source, villa: form.villa?.value || '' });
      } catch {
        msg.hidden = false; $('[data-fail]', msg).hidden = false; $('[data-ok]', msg).hidden = true;
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  });

  /* Accessibility menu ---------------------------------------------------- */
  const a = $('[data-a11y-root]');
  const DEF = { size: 1, contrast: false, motion: false, links: false, font: false, spacing: false, dark: false, mono: false, headings: false, cursor: false, guide: false, speak: false };
  const prefs = Object.assign({}, DEF, store.get('ks_a11y') || {}, { speak: false });
  const guide = document.createElement('div'); guide.className = 'a11y-guide'; guide.hidden = true; guide.setAttribute('aria-hidden', 'true'); document.body.appendChild(guide);
  const moveGuide = (y) => { guide.style.transform = `translateY(${y - 18}px)`; };
  addEventListener('pointermove', (e) => { if (!guide.hidden) moveGuide(e.clientY); }, { passive: true });
  addEventListener('touchmove', (e) => { if (!guide.hidden && e.touches[0]) moveGuide(e.touches[0].clientY); }, { passive: true });
  const hint = $('[data-a11y-hint]', a);
  const speakBtn = $('[data-a11y="speak"]', a);
  if (!('speechSynthesis' in window) && speakBtn) speakBtn.hidden = true;
  const VOICE = { en: 'en-GB', he: 'he-IL', ar: 'ar-SA', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', el: 'el-GR', ru: 'ru-RU', zh: 'zh-CN' };
  const say = (text) => {
    text = (text || '').replace(/\s+/g, ' ').trim(); if (!text) return;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.slice(0, 3000));
    u.lang = VOICE[root.dataset.lang] || root.lang; u.rate = 0.95; speechSynthesis.speak(u);
  };
  document.addEventListener('click', (e) => {
    if (!prefs.speak || a.contains(e.target) || e.target.closest('a, button, input, select, textarea, label, summary')) return;
    const sel = String(getSelection() || '').trim();
    const blk = e.target.closest('p, h1, h2, h3, h4, li, dt, dd, td, th, blockquote, figcaption, legend');
    say(sel || (blk && blk.innerText));
  });
  document.addEventListener('focusin', (e) => { if (prefs.speak && !a.contains(e.target) && e.target.matches('a, button')) say(e.target.getAttribute('aria-label') || e.target.innerText); });
  $('[data-a11y-lang]', a)?.addEventListener('change', (e) => { try { store.set('ks_lang', { chose: e.target.value }); } catch (x) {} location.href = e.target.value; });
  const apply = () => {
    root.style.setProperty('--fs', prefs.size);
    root.classList.toggle('a11y-contrast', prefs.contrast);
    root.classList.toggle('reduced', prefs.motion);
    root.classList.toggle('a11y-links', prefs.links);
    root.classList.toggle('a11y-font', prefs.font);
    ['spacing', 'dark', 'mono', 'headings', 'cursor'].forEach((k) => root.classList.toggle(`a11y-${k}`, prefs[k]));
    root.style.filter = [prefs.mono ? 'grayscale(1)' : '', prefs.dark ? 'invert(1) hue-rotate(180deg)' : ''].join(' ').trim();
    guide.hidden = !prefs.guide;
    if (hint) hint.hidden = !prefs.speak;
    if (!prefs.speak && 'speechSynthesis' in window) speechSynthesis.cancel();
    $$('[data-a11y]', a).forEach((b) => b.hasAttribute('aria-pressed') && b.setAttribute('aria-pressed', !!prefs[b.dataset.a11y]));
    if (prefs.motion) $$('video').forEach((v) => v.pause());
  };
  const save = () => { if (window.KSC?.allowed('preferences')) store.set('ks_a11y', prefs); };
  const btn = $('.a11y__btn', a); const panel = $('#a11y-p');
  const hb = $('[data-a11y-open]');
  const set = (o) => { panel.hidden = !o; btn?.setAttribute('aria-expanded', o); hb?.setAttribute('aria-expanded', o); if (o) $('button', panel)?.focus(); };
  btn?.addEventListener('click', () => set(panel.hidden));
  hb?.addEventListener('click', (e) => { e.stopPropagation(); set(panel.hidden); });
  document.addEventListener('click', (e) => { if (a && !a.contains(e.target) && !panel.hidden) set(false); });
  a?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); (hb && hb.offsetParent ? hb : btn).focus(); } });
  $$('[data-a11y]', a).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.a11y;
    if (k === 'bigger') prefs.size = Math.min(1.4, +(prefs.size + 0.1).toFixed(2));
    else if (k === 'smaller') prefs.size = Math.max(0.9, +(prefs.size - 0.1).toFixed(2));
    else if (k === 'reset') Object.assign(prefs, DEF);
    else prefs[k] = !prefs[k];
    apply(); save(); dispatchEvent(new Event('scroll'));
    if (k === 'speak' && prefs.speak && hint) say(hint.textContent);
  }));
  apply();
})();

/* Language suggestion: offer the visitor's browser language once (never auto-redirect, good for SEO) */
(() => {
  const { store } = window.KSU;
  const map = (window.KS && window.KS.langs) || {};
  const cur = document.documentElement.dataset.lang;
  if (store.get('ks_lang')) return;
  const want = (navigator.languages || [navigator.language || '']).map((l) => l.slice(0, 2).toLowerCase()).find((l) => map[l]);
  if (!want || want === cur) return;
  const link = document.querySelector(`.ftr__langs a[hreflang="${want}"]`);
  if (!link) return;
  const [text, go, stay] = map[want];
  const el = document.createElement('div');
  el.className = 'lsug'; el.setAttribute('role', 'region'); el.lang = want; el.dir = want === 'he' || want === 'ar' ? 'rtl' : 'ltr';
  el.innerHTML = `<span></span><a class="btn btn--gold" href="${link.getAttribute('href')}"></a><button type="button" class="btn btn--line"></button>`;
  el.children[0].textContent = text; el.children[1].textContent = go; el.children[2].textContent = stay;
  const close = () => { store.set('ks_lang', { dismissed: Date.now() }); el.remove(); };
  el.children[1].addEventListener('click', () => store.set('ks_lang', { chose: want }));
  el.children[2].addEventListener('click', close);
  setTimeout(() => document.body.appendChild(el), 2500);
})();
