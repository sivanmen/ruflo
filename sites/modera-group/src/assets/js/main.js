/* Modera Group — interaction layer. Vanilla JS, no dependencies. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => matchMedia('(min-width: 901px)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;

  /* ---------- Scroll-driven: header, progress, hero, parallax ---------- */
  const header = $('[data-header]');
  const hero = $('[data-hero]');
  const parallax = $$('[data-speed]');
  let lastY = scrollY;
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);

    if (header) {
      header.classList.toggle('is-solid', y > 24 && !(hero && desktop() && y < hero.offsetHeight - innerHeight));
      const goingDown = y > lastY && y > 400;
      header.classList.toggle('is-hidden', goingDown && !document.body.classList.contains('menu-open'));
    }
    if (hero && desktop() && !reduce) {
      const p = Math.min(1, Math.max(0, y / (hero.offsetHeight - innerHeight)));
      hero.style.setProperty('--p', p.toFixed(4));
    }
    if (!reduce) {
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        const offset = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    }
    lastY = y;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Reveal + charts ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('.reveal, .reveal-mask, [data-chart]').forEach((el) => io.observe(el));

  /* ---------- Count-up numbers ---------- */
  const countIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      countIO.unobserve(e.target);
      const end = +e.target.dataset.count;
      if (reduce || end < 2) continue;
      const t0 = performance.now();
      const dur = 1600;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      };
      e.target.textContent = '0';
      requestAnimationFrame(step);
    }
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Services preview ---------- */
  const preview = $('.svc-preview');
  if (preview) {
    const imgs = $$('img', preview);
    $$('.svc-row').forEach((row) => {
      const show = () => {
        $$('.svc-row').forEach((r) => r.classList.toggle('is-active', r === row));
        imgs.forEach((im) => im.classList.toggle('is-on', im.dataset.key === row.dataset.preview));
      };
      row.addEventListener('mouseenter', show);
      row.addEventListener('focusin', show);
    });
  }

  /* ---------- Process storytelling ---------- */
  const proc = $('[data-process]');
  if (proc) {
    const steps = $$('.step', proc);
    const frames = $$('.process-frame img', proc);
    const meter = $('.process-meter', proc);
    const setStep = (i) => {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
      meter?.style.setProperty('--step-p', ((i + 1) / steps.length).toFixed(3));
    };
    setStep(0);
    const sio = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setStep(+e.target.dataset.step);
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s));
  }

  /* ---------- Videos: play only when visible ---------- */
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }
  }, { threshold: 0.15 });
  $$('video').forEach((v) => { if (reduce) v.removeAttribute('autoplay'); vio.observe(v); });

  /* ---------- Drag-to-scroll rails ---------- */
  $$('[data-drag]').forEach((rail) => {
    let down = false, startX = 0, startL = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = rail.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-dragging'); }
      rail.scrollLeft = startL - dx;
    });
    addEventListener('pointerup', () => { down = false; rail.classList.remove('is-dragging'); });
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---------- Filters (insights, projects) ---------- */
  $$('[data-filter]').forEach((bar) => {
    const target = $(`[data-filter-target="${bar.dataset.filter}"]`);
    const featured = $('.featured-wrap');
    bar.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const v = chip.dataset.value;
      $$('.chip', bar).forEach((c) => { const on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
      $$('[data-cat]', target).forEach((card) => { card.hidden = v !== 'all' && card.dataset.cat !== v; card.classList.add('is-in'); });
      if (featured && bar.dataset.filter === 'insights') {
        const f = $('[data-cat]', featured);
        featured.hidden = v !== 'all' && f.dataset.cat !== v;
      }
    });
  });

  /* ---------- Language menu ---------- */
  const lang = $('[data-lang]');
  if (lang) {
    const btn = $('.lang-btn', lang);
    const close = () => { lang.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !lang.classList.contains('is-open');
      lang.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => { if (!lang.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }
  $$('a[hreflang]').forEach((a) => a.addEventListener('click', () => {
    try { localStorage.setItem('modera-lang', a.getAttribute('hreflang')); } catch (_) { /* storage unavailable */ }
  }));

  /* ---------- Mobile menu ---------- */
  const burger = $('[data-burger]');
  const menu = $('[data-mobile-menu]');
  if (burger && menu) {
    const toggle = (open) => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle(menu.hidden));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) toggle(false); });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Active anchors (sub-nav, tabs, TOC) ---------- */
  const anchorBars = $$('.sub-nav, .tabs, .toc');
  if (anchorBars.length) {
    const links = anchorBars.flatMap((b) => $$('a[href^="#"]', b));
    const targets = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
    const aio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.toggle('is-active', a.hash.slice(1) === e.target.id));
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach((t) => aio.observe(t));
  }

  /* ---------- Lazy map ---------- */
  const map = $('[data-map]');
  if (map) {
    const mio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      mio.disconnect();
      const f = document.createElement('iframe');
      f.src = map.dataset.map; f.title = map.dataset.title; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      map.appendChild(f);
    }, { rootMargin: '300px' });
    mio.observe(map);
  }

  /* ---------- Contact form (FormSubmit AJAX) ---------- */
  const form = $('[data-form]');
  if (form) {
    const status = $('.form-status', form);
    const btn = $('button[type="submit"]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form._honey.value) return;
      const label = btn.innerHTML;
      btn.disabled = true; btn.textContent = btn.dataset.sending;
      status.className = 'form-status'; status.textContent = '';
      try {
        const data = Object.fromEntries(new FormData(form));
        delete data._honey;
        const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.classList.add('is-ok'); status.textContent = status.dataset.ok;
      } catch (_) {
        status.classList.add('is-err'); status.textContent = status.dataset.err;
      } finally {
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  }
})();
