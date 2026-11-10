/* King Solomon · core interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const RTL = root.dir === 'rtl';
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => mqReduce.matches || root.classList.contains('reduced');
  window.KSU = { $, $$, reduced, RTL };
  root.classList.remove('no-js');

  /* Persistent prefs (accessibility) — read before paint where possible */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  window.KSU.store = store;

  /* Header: solid on scroll, hide on scroll down ------------------------ */
  const hdr = $('[data-header]');
  let lastY = 0;
  const onScrollHeader = () => {
    const y = scrollY;
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 40);
      hdr.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
    }
    const sticky = $('[data-sticky]');
    if (sticky) sticky.classList.toggle('is-on', y > innerHeight * 0.6);
    lastY = y;
  };

  /* Mobile menu --------------------------------------------------------- */
  const burger = $('[data-burger]');
  const mnav = $('#mnav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { mnav.hidden = false; requestAnimationFrame(() => mnav.classList.add('is-open')); }
    else { mnav.classList.remove('is-open'); setTimeout(() => (mnav.hidden = true), 300); }
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  mnav?.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));

  /* Language switcher ---------------------------------------------------- */
  $$('[data-lang-switch]').forEach((el) => {
    const btn = $('.lang__btn', el);
    const toggle = (open) => { el.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(!el.classList.contains('is-open')); });
    document.addEventListener('click', (e) => !el.contains(e.target) && toggle(false));
    el.addEventListener('keydown', (e) => e.key === 'Escape' && (toggle(false), btn.focus()));
    $$('a[data-lang]', el).forEach((a) => a.addEventListener('click', () => {
      a.href += location.hash || '';
    }));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });

  /* Reveal on scroll ----------------------------------------------------- */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv, [data-reveal], [data-stack]').forEach((el) => io.observe(el));

  /* Split headline into words for the hero animation --------------------- */
  $$('.split').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w"><span style="--wi:${i}">${w}</span></span>`).join(' ');
    el.setAttribute('aria-label', words.join(' '));
  });

  /* Word-by-word highlight driven by scroll ----------------------------- */
  const wordBlocks = $$('[data-words]').map((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="wd">${w}</span>`).join(' ');
    return { el, spans: $$('.wd', el) };
  });

  /* Count-up numbers ----------------------------------------------------- */
  const cio = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target; const end = +el.dataset.count;
    if (reduced()) return;
    const t0 = performance.now(); const dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0'; requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  /* Scroll-driven scenes: parallax, zoom, horizontal track, story -------- */
  const parallax = $$('[data-parallax]');
  const zoom = $('[data-zoom]');
  const hs = $('[data-hscroll]');
  const story = $('[data-story]');
  const heroMedia = $('[data-hero-media]');
  const heroText = $('[data-hero-text]');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const setupHS = () => {
    if (!hs) return;
    const track = $('[data-hscroll-track]', hs);
    const pin = innerWidth > 900 && !reduced();
    hs.classList.toggle('is-pinned', pin);
    if (pin) {
      const dist = track.scrollWidth - innerWidth;
      hs.style.setProperty('--hs-h', `${innerHeight + Math.max(0, dist)}px`);
      hs.dataset.dist = Math.max(0, dist);
    } else { track.style.transform = ''; }
  };

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    onScrollHeader();
    if (reduced()) return;
    for (const el of parallax) {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const k = parseFloat(el.dataset.parallax) || 0.2;
      const off = (r.top + r.height / 2 - vh / 2) * -k;
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    }
    if (heroMedia) {
      const p = clamp(scrollY / vh);
      heroMedia.style.transform = `scale(${1 + p * 0.12})`;
      heroMedia.style.opacity = String(1 - p * 0.5);
      if (heroText) { heroText.style.transform = `translate3d(0, ${p * -80}px, 0)`; heroText.style.opacity = String(1 - p * 1.4); }
    }
    for (const b of wordBlocks) {
      const r = b.el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const n = Math.round(p * b.spans.length);
      b.spans.forEach((s, i) => s.classList.toggle('on', i < n));
    }
    if (zoom) {
      const r = zoom.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh));
      const g = clamp(p / 0.55);
      zoom.style.setProperty('--zi', `${(1 - g) * 18}%`);
      zoom.style.setProperty('--zx', `${(1 - g) * 22}%`);
      zoom.style.setProperty('--zr', `${(1 - g) * 24}px`);
      zoom.style.setProperty('--zs', String(1.15 - g * 0.15));
      zoom.style.setProperty('--zd', String(0.1 + g * 0.35));
      zoom.style.setProperty('--zo1', String(clamp((p - 0.35) / 0.2)));
      zoom.style.setProperty('--zo2', String(clamp((p - 0.55) / 0.2)));
    }
    if (hs && hs.classList.contains('is-pinned')) {
      const r = hs.getBoundingClientRect();
      const dist = +hs.dataset.dist || 0;
      const p = clamp(-r.top / (r.height - vh));
      $('[data-hscroll-track]', hs).style.transform = `translate3d(${(RTL ? 1 : -1) * p * dist}px, 0, 0)`;
      $('[data-hscroll-prog]', hs)?.style.setProperty('--p', p.toFixed(3));
    }
    if (story && innerWidth > 900) {
      const steps = $$('[data-story-step]', story);
      let active = 0;
      steps.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.55) active = i; });
      steps.forEach((s, i) => s.classList.toggle('is-on', i === active));
      $$('[data-story-img]', story).forEach((m, i) => m.classList.toggle('is-on', i === active));
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', () => { setupHS(); req(); });
  addEventListener('load', () => { setupHS(); req(); });
  setupHS(); frame();

  /* Hero video: pause control, respect reduced motion & data saver ------- */
  const vid = $('[data-hero-video]');
  const vbtn = $('[data-video-toggle]');
  if (vid) {
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduced() || saveData) { vid.removeAttribute('autoplay'); vid.pause(); vbtn?.querySelector('use')?.setAttribute('href', '#i-play'); }
    vbtn?.addEventListener('click', () => {
      if (vid.paused) { vid.play(); vbtn.querySelector('use').setAttribute('href', '#i-pause'); vbtn.setAttribute('aria-label', 'Pause'); }
      else { vid.pause(); vbtn.querySelector('use').setAttribute('href', '#i-play'); vbtn.setAttribute('aria-label', 'Play'); }
    });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) vid.pause(); else if (!reduced() && !saveData && vbtn.querySelector('use').getAttribute('href') === '#i-pause') vid.play().catch(() => {}); }).observe(vid);
  }

  /* Marquee: duplicate content for a seamless loop ---------------------- */
  $$('[data-marquee] ul').forEach((ul) => {
    ul.innerHTML += ul.innerHTML.replace(/<li/g, '<li aria-hidden="true"');
    $$('[aria-hidden="true"] a, [aria-hidden="true"] button', ul).forEach((x) => x.setAttribute('tabindex', '-1'));
    ul.style.setProperty('--mq', `${Math.max(30, ul.children.length * 3.2)}s`);
  });

  /* Slider: arrows + mouse drag ----------------------------------------- */
  $$('[data-slider]').forEach((s) => {
    const tr = $('[data-slider-track]', s);
    const by = () => (tr.firstElementChild?.getBoundingClientRect().width || 400) + 20;
    $('[data-slider-next]', s)?.addEventListener('click', () => tr.scrollBy({ left: RTL ? -by() : by(), behavior: 'smooth' }));
    $('[data-slider-prev]', s)?.addEventListener('click', () => tr.scrollBy({ left: RTL ? by() : -by(), behavior: 'smooth' }));
    let down = false, sx = 0, sl = 0, moved = false;
    tr.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; tr.classList.add('is-drag'); } tr.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { down = false; tr.classList.remove('is-drag'); });
    tr.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  /* Tabs (layouts) ------------------------------------------------------- */
  $$('[data-tabs]').forEach((t) => {
    const tabs = $$('[data-tab]', t);
    const select = (tab) => tabs.forEach((x) => {
      const on = x === tab; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const d = { ArrowRight: RTL ? -1 : 1, ArrowLeft: RTL ? 1 : -1 }[e.key];
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });

  /* Villa filters + jump to row ----------------------------------------- */
  $$('[data-vtable]').forEach((vt) => {
    const state = { bed: 'all', status: 'all' };
    const rows = $$('tbody tr', vt);
    const apply = () => {
      let shown = 0;
      rows.forEach((r) => {
        const ok = (state.bed === 'all' || r.dataset.bed === state.bed) && (state.status === 'all' || r.dataset.status === state.status);
        r.hidden = !ok; if (ok) shown++;
      });
      $('[data-vnone]', vt).hidden = shown > 0;
    };
    $$('[data-filter]', vt).forEach((b) => b.addEventListener('click', () => {
      const g = b.dataset.filter; state[g] = b.dataset.val;
      $$(`[data-filter="${g}"]`, vt).forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      apply();
    }));
  });
  $$('[data-vjump]').forEach((a) => a.addEventListener('click', (e) => {
    const row = document.getElementById(`villa-${a.dataset.vjump}`);
    if (!row) return;
    e.preventDefault();
    if (row.hidden) { $$('[data-filter][data-val="all"]').forEach((b) => b.click()); }
    row.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    row.classList.add('is-flash'); setTimeout(() => row.classList.remove('is-flash'), 2200);
  }));

  /* Gallery filter -------------------------------------------------------- */
  $$('[data-gfilter]').forEach((b) => b.addEventListener('click', () => {
    const c = b.dataset.gfilter;
    $$('[data-gfilter]').forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
    let n = 0;
    $$('[data-masonry] [data-cat]').forEach((i) => { const out = c !== 'all' && i.dataset.cat !== c; i.classList.toggle('is-out', out); if (!out) { i.classList.toggle('is-tall', n % 5 === 0); n++; } });
  }));

  /* Enquire buttons pre-select the villa in the form --------------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-enquire]');
    if (!a) return;
    try {
      if (a.dataset.villa) sessionStorage.setItem('ks_villa', a.dataset.villa);
      sessionStorage.setItem('ks_request', a.dataset.request || '');
    } catch {}
    if ($('#enquire')) applyPrefill();
  });
  function applyPrefill() {
    try {
      const v = sessionStorage.getItem('ks_villa');
      const r = sessionStorage.getItem('ks_request') || '';
      $$('form[data-lead]').forEach((f) => {
        if (v && f.villa) f.villa.value = v;
        if (f.request) f.request.value = r;
        const note = f.querySelector('[data-request-note]');
        if (note) { const t = note.dataset[r] || ''; note.textContent = t; note.hidden = !t; }
      });
    } catch {}
  }
  applyPrefill();
})();
