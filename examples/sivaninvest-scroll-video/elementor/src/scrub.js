/* King Solomon Project — scroll-tied video scene (vanilla port of useVideoScrub + App). */
(function () {
  'use strict';
  var root = document.getElementById('ksp');
  if (!root || root.__kspInit) return;
  root.__kspInit = true;

  var VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4';
  var MP4BOX_SRC = 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js';
  var MP4BOX_SRI = 'sha384-9oK16t6TCKqCB5OpB/LwRkNa48prlRFQPTYw8tb9uj699JvQ1wjxIq7YO8Z4hn3a';

  var LERP_TAU = 8;
  var SNAP = 0.002;
  var LRU_MAX = 24;
  var LEAD = 24;
  var WATCHDOG = 60000;

  var container = root.querySelector('[data-k="track"]');
  var video = root.querySelector('[data-k="video"]');
  var canvas = root.querySelector('[data-k="canvas"]');
  var ctx = canvas.getContext('2d');
  var sections = [
    root.querySelector('[data-k="s1"]'),
    root.querySelector('[data-k="s2"]'),
    root.querySelector('[data-k="s3"]')
  ];
  var menu = root.querySelector('[data-k="menu"]');

  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  if (!video.getAttribute('src')) video.setAttribute('src', VIDEO_SRC);
  video.muted = true;

  /* ---------- scroll progress ---------- */
  /* The track sits at the top of an Elementor Canvas page, so `top` is 0 there
     (same formula as the spec); it only matters when the WP admin bar is shown. */
  var span = 1;
  var top = 0;
  function measure() {
    span = Math.max(1, container.offsetHeight - window.innerHeight);
    top = container.getBoundingClientRect().top + window.scrollY;
  }
  function getProgress() {
    return Math.min(1, Math.max(0, (window.scrollY - top) / span));
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('orientationchange', measure);
  window.addEventListener('load', measure);

  /* ---------- overlay state (mirrors App render) ---------- */
  function s1Opacity(p) { return p < 0.2 ? 1 : Math.max(0, 1 - (p - 0.2) / 0.08); }
  function s2Opacity(p) {
    if (p < 0.32) return 0;
    if (p < 0.4) return (p - 0.32) / 0.08;
    if (p < 0.55) return 1;
    return Math.max(0, 1 - (p - 0.55) / 0.08);
  }
  function s3Opacity(p) {
    if (p < 0.67) return 0;
    if (p < 0.75) return (p - 0.67) / 0.08;
    return 1;
  }
  var lastP = -1;
  function render(p) {
    if (p === lastP) return;
    lastP = p;
    var ops = [s1Opacity(p), s2Opacity(p), s3Opacity(p)];
    for (var i = 0; i < 3; i++) {
      sections[i].style.opacity = String(ops[i]);
      sections[i].classList.toggle('is-visible', ops[i] > 0.3);
    }
    root.classList.toggle('is-dark', p > 0.55);
  }

  /* ---------- nav entrance ---------- */
  setTimeout(function () { root.classList.add('is-mounted'); }, 200);

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  root.querySelectorAll('[data-k="menu-open"]').forEach(function (b) {
    b.addEventListener('click', function () { setMenu(true); });
  });
  root.querySelectorAll('[data-k="menu-close"]').forEach(function (b) {
    b.addEventListener('click', function () { setMenu(false); });
  });
  root.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- frame bank state ---------- */
  var bank = [];
  var lru = new Map();
  var current = 0;
  var target = 0;
  var ready = false;
  var reverted = false;
  var painted = false;
  var building = false;
  var dur = 0;
  var lastDrawn = -1;

  function setDur(d) { if (isFinite(d) && d > 0) dur = d; }
  video.addEventListener('loadedmetadata', function () { setDur(video.duration); });
  if (video.readyState >= 1) setDur(video.duration);

  function setCanvasLive(live) { canvas.classList.toggle('is-live', live); }

  function nearestIndex(t) {
    var us = t * 1e6;
    var lo = 0;
    var hi = bank.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (bank[mid].ts < us) lo = mid + 1; else hi = mid;
    }
    if (lo > 0 && Math.abs(bank[lo - 1].ts - us) <= Math.abs(bank[lo].ts - us)) return lo - 1;
    return lo;
  }

  function warmLRU(i) {
    for (var j = i - 1; j <= i + 2; j++) {
      if (j < 0 || j >= bank.length) continue;
      if (lru.has(j)) {
        var v = lru.get(j);
        lru.delete(j);
        lru.set(j, v);
        continue;
      }
      lru.set(j, null);
      (function (k) {
        createImageBitmap(bank[k].blob).then(function (bmp) {
          if (lru.has(k)) lru.set(k, bmp); else bmp.close();
        }, function () { lru.delete(k); });
      })(j);
    }
    while (lru.size > LRU_MAX) {
      var oldest = lru.keys().next().value;
      var b = lru.get(oldest);
      lru.delete(oldest);
      if (b) b.close();
    }
  }

  function drawFrame(t) {
    if (!bank.length) return;
    var i = nearestIndex(t);
    warmLRU(i);
    var bmp = lru.get(i);
    if (!bmp || i === lastDrawn) return;
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    lastDrawn = i;
    if (!painted) {
      painted = true;
      setCanvasLive(true);
    }
  }

  function revert() {
    reverted = true;
    ready = false;
    setCanvasLive(false);
  }

  /* ---------- rAF loop ---------- */
  var lastT = performance.now();
  function tick(now) {
    var dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    var p = getProgress();
    render(p);
    if (dur > 0) {
      target = p * dur;
      if (reducedMotion) {
        current = target;
      } else {
        current += (target - current) * (1 - Math.exp(-dt * LERP_TAU));
        if (Math.abs(target - current) < SNAP) current = target;
      }
      if (ready && !reverted) {
        drawFrame(current);
      } else if (!video.seeking && Math.abs(video.currentTime - current) > 0.01) {
        video.currentTime = current;
      }
    }
    requestAnimationFrame(tick);
  }
  render(getProgress());
  requestAnimationFrame(tick);

  /* ---------- frame bank build (WebCodecs + mp4box) ---------- */
  function loadMp4box() {
    if (window.MP4Box && window.DataStream) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = MP4BOX_SRC;
      s.integrity = MP4BOX_SRI;
      s.crossOrigin = 'anonymous';
      s.async = true;
      s.onload = function () { (window.MP4Box && window.DataStream) ? resolve() : reject(new Error('mp4box')); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function getDescription(file, trackId) {
    var trak = file.getTrackById(trackId);
    var entries = trak.mdia.minf.stbl.stsd.entries;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var box = e.avcC || e.hvcC || e.vpcC || e.av1C;
      if (box) {
        var stream = new window.DataStream(undefined, 0, window.DataStream.BIG_ENDIAN);
        box.write(stream);
        return new Uint8Array(stream.buffer, 8);
      }
    }
    return undefined;
  }

  function demux(buf) {
    return new Promise(function (resolve, reject) {
      var file = window.MP4Box.createFile();
      var samples = [];
      var info = null;
      file.onError = reject;
      file.onReady = function (i) {
        info = i;
        var track = i.videoTracks && i.videoTracks[0];
        if (!track) { reject(new Error('no video track')); return; }
        file.setExtractionOptions(track.id, null, { nbSamples: track.nb_samples });
        file.start();
      };
      file.onSamples = function (id, user, s) {
        for (var k = 0; k < s.length; k++) samples.push(s[k]);
      };
      buf.fileStart = 0;
      file.appendBuffer(buf);
      file.flush();
      if (!info) { reject(new Error('mp4 not ready')); return; }
      var track = info.videoTracks[0];
      resolve({
        track: track,
        description: getDescription(file, track.id),
        samples: samples,
        duration: info.duration / info.timescale
      });
    });
  }

  function decodeAll(demuxed, hwAccel) {
    return new Promise(function (resolve, reject) {
      var track = demuxed.track;
      var out = [];
      var pending = 0;
      var next = 0;
      var flushed = false;
      var failed = false;
      var off = null;
      var offCtx = null;

      function fail(err) {
        if (failed) return;
        failed = true;
        try { decoder.close(); } catch (e) { /* closed */ }
        reject(err);
      }
      function maybeDone() {
        if (flushed && pending === 0 && !failed) resolve(out);
      }
      function pump() {
        if (failed) return;
        if (reverted) { fail(new Error('reverted')); return; }
        while (next < demuxed.samples.length && decoder.decodeQueueSize + pending < LEAD) {
          var s = demuxed.samples[next++];
          decoder.decode(new EncodedVideoChunk({
            type: s.is_sync ? 'key' : 'delta',
            timestamp: (1e6 * s.cts) / s.timescale,
            duration: (1e6 * s.duration) / s.timescale,
            data: s.data
          }));
        }
        if (next >= demuxed.samples.length && !flushed && decoder.state === 'configured') {
          flushed = true;
          decoder.flush().then(maybeDone, fail);
        }
      }

      var decoder = new VideoDecoder({
        output: function (frame) {
          if (!off) {
            off = document.createElement('canvas');
            off.width = frame.displayWidth;
            off.height = frame.displayHeight;
            offCtx = off.getContext('2d');
          }
          var ts = frame.timestamp;
          offCtx.drawImage(frame, 0, 0, off.width, off.height);
          frame.close();
          pending++;
          off.toBlob(function (blob) {
            pending--;
            if (blob) out.push({ ts: ts, blob: blob });
            pump();
            maybeDone();
          }, 'image/webp', 0.82);
        },
        error: fail
      });

      var config = {
        codec: track.codec,
        codedWidth: track.video ? track.video.width : track.track_width,
        codedHeight: track.video ? track.video.height : track.track_height,
        hardwareAcceleration: hwAccel
      };
      if (demuxed.description) config.description = demuxed.description;

      VideoDecoder.isConfigSupported(config).then(function (support) {
        if (!support.supported) { fail(new Error('unsupported config')); return; }
        decoder.configure(config);
        decoder.addEventListener('dequeue', pump);
        pump();
      }, fail);
    });
  }

  function buildBank() {
    if (building || reducedMotion || typeof window.VideoDecoder !== 'function') return;
    building = true;
    var watchdog = setTimeout(function () { if (!ready) revert(); }, WATCHDOG);
    var demuxed = null;

    Promise.all([
      fetch(VIDEO_SRC, { mode: 'cors' }).then(function (r) {
        if (!r.ok) throw new Error('fetch ' + r.status);
        return r.arrayBuffer();
      }),
      loadMp4box()
    ]).then(function (res) {
      return demux(res[0]);
    }).then(function (d) {
      demuxed = d;
      if (!dur) setDur(d.duration);
      return decodeAll(d, 'no-preference').catch(function () {
        if (reverted) throw new Error('reverted');
        return decodeAll(d, 'prefer-software');
      });
    }).then(function (frames) {
      clearTimeout(watchdog);
      if (reverted || !frames.length) { revert(); return; }
      frames.sort(function (a, b) { return a.ts - b.ts; });
      bank = frames;
      ready = true;
    }).catch(function () {
      clearTimeout(watchdog);
      revert();
    }).then(function () {
      building = false;
    });
  }

  if (document.readyState === 'complete') buildBank();
  else window.addEventListener('load', buildBank, { once: true });
})();
