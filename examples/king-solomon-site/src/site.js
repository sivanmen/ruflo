/* King Solomon project site — shared behaviours (vanilla, no dependencies). */
(function () {
  'use strict';
  if (window.__ksSite) return;
  window.__ksSite = true;
  var doc = document.documentElement;
  doc.classList.add('ks-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
  $$('.ks-reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('is-in'); });

  /* ---------- counters ---------- */
  var co = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var el = e.target, to = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1600;
      if (reduce) { el.textContent = to; return; }
      requestAnimationFrame(function step(t) {
        t0 = t0 || t; var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * k); if (k < 1) requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.6 }) : null;
  $$('[data-count]').forEach(function (el) { co && co.observe(el); });

  /* ---------- navigation ---------- */
  var nav = $('.ks-nav'), heroScene = document.getElementById('ksp'), hero = heroScene || $('.ks-hero'), lastY = 0;
  function navState() {
    if (!nav) return;
    var y = window.scrollY, h = hero ? hero.getBoundingClientRect().bottom + y - 90 : 0;
    var overHero = hero && y < h;
    nav.classList.toggle('is-solid', !overHero);
    nav.classList.toggle('is-light', !!(overHero && heroScene && !heroScene.classList.contains('is-dark')));
    nav.classList.toggle('is-hidden', !overHero && y > lastY && y > 700 && !$('.ks-drawer.is-open'));
    lastY = y;
  }
  window.addEventListener('scroll', navState, { passive: true });
  if (heroScene) setInterval(navState, 250);
  navState();

  var drawer = $('.ks-drawer');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  $$('[data-ks="open-menu"]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  $$('[data-ks="close-menu"], .ks-drawer nav a').forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setDrawer(false); closeLb(); } });

  /* ---------- elevation rail (home): 34 m above the sea -> 0 m ---------- */
  var alt = $('.ks-alt');
  if (alt) {
    var altVal = $('b', alt), dot = $('.ks-alt-dot', alt);
    window.addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - innerHeight, y = scrollY;
      var start = heroScene ? heroScene.offsetHeight - innerHeight : 0, k = Math.min(1, Math.max(0, (y - start) / (max - start)));
      alt.classList.toggle('is-on', y > start + 80);
      alt.classList.toggle('is-dark', !!document.elementFromPoint(innerWidth - 30, innerHeight / 2) &&
        !!document.elementFromPoint(innerWidth - 30, innerHeight / 2).closest('.is-ink, .ks-hero, .ks-foot'));
      altVal.textContent = Math.round(34 * (1 - k)) + ' m';
      dot.style.setProperty('--y', (k * 100) + '%');
    }, { passive: true });
  }

  /* ---------- horizontal rails ---------- */
  $$('[data-rail]').forEach(function (wrap) {
    var rail = $('.ks-rail', wrap), rtl = getComputedStyle(rail).direction === 'rtl';
    $$('[data-dir]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = parseInt(b.getAttribute('data-dir'), 10) * (rtl ? -1 : 1);
        rail.scrollBy({ left: d * rail.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  });

  /* ---------- tabs (villa layouts) ---------- */
  $$('[data-tabs]').forEach(function (box) {
    var tabs = $$('.ks-tab', box), panels = $$('.ks-panel', box);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, j) { x.classList.toggle('is-on', i === j); x.setAttribute('aria-selected', i === j); });
        panels.forEach(function (p, j) { p.classList.toggle('is-on', i === j); });
      });
    });
  });

  /* ---------- availability explorer ---------- */
  $$('[data-explorer]').forEach(function (ex) {
    var rows = $$('tbody tr', ex), tiles = $$('.ks-tile', ex), f = { beds: 'all', status: 'all' };
    function apply() {
      function ok(el) {
        return (f.beds === 'all' || el.getAttribute('data-beds') === f.beds) &&
          (f.status === 'all' || el.getAttribute('data-status') === f.status);
      }
      rows.forEach(function (r) { r.classList.toggle('is-hidden', !ok(r)); });
      tiles.forEach(function (t) { t.classList.toggle('is-dim', !ok(t)); });
    }
    $$('[data-filter]', ex).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var k = chip.getAttribute('data-filter');
        f[k] = chip.getAttribute('data-value');
        $$('[data-filter="' + k + '"]', ex).forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        apply();
      });
    });
    tiles.forEach(function (t) {
      t.addEventListener('click', function () {
        var no = t.getAttribute('data-no'), row = $('tr[data-no="' + no + '"]', ex);
        tiles.forEach(function (x) { x.classList.toggle('is-sel', x === t); });
        rows.forEach(function (r) { r.classList.toggle('is-sel', r === row); });
        if (row) { row.classList.remove('is-hidden'); row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
      });
    });
  });

  /* ---------- gallery filters + lightbox (also plan zoom) ---------- */
  $$('[data-gallery-filters]').forEach(function (bar) {
    var items = $$('.ks-gallery a', bar.parentNode);
    $$('.ks-chip', bar).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var v = chip.getAttribute('data-value');
        $$('.ks-chip', bar).forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        items.forEach(function (a) { a.classList.toggle('is-hidden', v !== 'all' && a.getAttribute('data-cat') !== v); });
      });
    });
  });
  var lb = $('.ks-lb'), lbImg = lb && $('img', lb), lbCap = lb && $('.ks-lb-cap', lb), group = [], idx = 0;
  function show(i) {
    idx = (i + group.length) % group.length;
    var a = group[idx];
    lbImg.src = a.getAttribute('href') || a.getAttribute('data-full');
    lbCap.textContent = a.getAttribute('data-caption') || '';
  }
  function closeLb() { if (lb) { lb.classList.remove('is-open'); document.body.style.overflow = ''; } }
  if (lb) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-lb]');
      if (!a) return;
      e.preventDefault();
      var g = a.getAttribute('data-lb');
      group = $$('[data-lb="' + g + '"]').filter(function (x) { return !x.classList.contains('is-hidden'); });
      show(group.indexOf(a));
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
    $('.ks-lb-x', lb).addEventListener('click', closeLb);
    $('.ks-lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.ks-lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  }

  /* ---------- enquiry form prefill: ?villa=7&beds=5 ---------- */
  var q = new URLSearchParams(location.search), villa = q.get('villa'), beds = q.get('beds');
  if (villa || beds) {
    var tries = 0, timer = setInterval(function () {
      var sel = $('.ks .elementor-form select'), msg = $('.ks .elementor-form textarea');
      if (sel || ++tries > 40) clearInterval(timer);
      if (!sel) return;
      $$('option', sel).forEach(function (o) { if (beds && o.value.indexOf(beds) === 0) sel.value = o.value; });
      if (msg && villa && !msg.value) msg.value = (doc.lang.indexOf('he') === 0 ? 'מתעניין/ת בווילה מס׳ ' : 'Interested in villa no. ') + villa;
    }, 150);
  }

  /* ---------- scroll-scene buttons (home hero) ---------- */
  $$('[data-ks="next"]').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollBy({ top: innerHeight * 1.1, behavior: reduce ? 'auto' : 'smooth' }); });
  });
  $$('[data-ks="up"]').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  });
})();
