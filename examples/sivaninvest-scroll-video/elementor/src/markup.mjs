// Markup of the scene — mirrors reference/src/App.tsx element for element.
const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4';

// lucide-react 0.344.0 icons, as rendered by the reference.
const svg = (size, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICON = {
  arrowRight: (s) => svg(s, '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>'),
  arrowDown: (s) => svg(s, '<path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>'),
  chevronUp: (s) => svg(s, '<path d="m18 15-6-6-6 6"></path>'),
  info: (s) => svg(s, '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>'),
  x: (s) => svg(s, '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>')
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function markup(t) {
  // Latin brand labels inside RTL text: isolate them so "VECTRUS+" doesn't render as "+VECTRUS".
  const label = (s) => (t.dir === 'rtl' ? `<bdi>${esc(s)}</bdi>` : esc(s));
  const navLinks = t.navLinks.map((text, i) =>
    `<div class="k-ent" style="--d:${i * 80 + 100}ms"><a href="#" class="k-link">${label(text)}${i === 0 ? '<span class="k-underline"></span>' : ''}</a></div>`
  ).join('');
  const menuLinks = t.navLinks.map((text, i) =>
    `<a href="#" class="k-mlink${i === 0 ? ' is-active' : ''}" style="--d:${i * 60}ms">${label(text)}</a>`
  ).join('');

  return `<div id="ksp" lang="${t.lang}" dir="${t.dir}">
<div class="k-track" data-k="track">
<div class="k-sticky">
<video class="k-media" data-k="video" src="${VIDEO_SRC}" muted playsinline preload="auto"></video>
<canvas class="k-media k-canvas" data-k="canvas" width="1920" height="1080"></canvas>
<div class="k-overlay">
<nav class="k-nav">
<div class="k-links">${navLinks}</div>
<button type="button" class="k-burger" data-k="menu-open" aria-label="${esc(t.openMenu)}"><span class="k-bar"></span><span class="k-bar"></span><span class="k-bar k-bar-s"></span></button>
<div class="k-right k-ent" style="--d:500ms"><a href="#" class="k-news k-type">${esc(t.news)}<span class="k-dot">${ICON.info(10)}</span></a><span class="k-menu-label k-type">${esc(t.menu)}</span><button type="button" class="k-menu-btn k-type" data-k="menu-open">${esc(t.menu)}</button></div>
</nav>
<section class="k-s k-s1" data-k="s1">
<div class="k-st" style="--d:0ms"><h1 class="k-h1">${esc(t.h1)}</h1></div>
<div class="k-st" style="--d:150ms"><p class="k-sub">${esc(t.subtitle)}</p></div>
<div class="k-st k-s1-btn" style="--d:300ms"><button type="button" class="k-circle k-c48 k-next k-pe k-flip" aria-label="${esc(t.next)}">${ICON.arrowRight(18)}</button></div>
</section>
<section class="k-s k-s2" data-k="s2">
<div class="k-s2-inner"><div class="k-st" style="--d:0ms"><h2 class="k-h2a">${esc(t.s2Lead)}<span class="k-a80">${esc(t.s2Mid)}</span> <span class="k-a50">${esc(t.s2Tail)}</span></h2></div></div>
<div class="k-rail">
<div class="k-st" style="--d:200ms"><button type="button" class="k-circle k-c48 k-down k-pe" aria-label="${esc(t.scrollDown)}">${ICON.arrowDown(18)}</button></div>
<div class="k-st" style="--d:350ms"><div class="k-dots"><span class="is-active"></span><span></span><span></span></div></div>
<div class="k-st" style="--d:500ms"><button type="button" class="k-circle k-c40 k-up k-pe" aria-label="${esc(t.scrollUp)}">${ICON.chevronUp(16)}</button></div>
</div>
</section>
<section class="k-s k-s3" data-k="s3">
<div class="k-s3-inner">
<div class="k-st" style="--d:0ms"><p class="k-eyebrow">${esc(t.eyebrow)}</p></div>
<div class="k-st" style="--d:150ms"><h2 class="k-h2b">${esc(t.s3Line1)}<br>${esc(t.s3Line2)}</h2></div>
<div class="k-st" style="--d:300ms"><div class="k-cta"><span class="k-cta-label">${esc(t.cta)}</span><button type="button" class="k-cta-btn k-pe k-flip" aria-label="${esc(t.cta)}">${ICON.arrowRight(16)}</button></div></div>
</div>
</section>
</div>
</div>
</div>
<div class="k-menu" data-k="menu" aria-hidden="true">
<div class="k-panel">
<div class="k-close-row"><button type="button" class="k-circle k-c40 k-close" data-k="menu-close" aria-label="${esc(t.closeMenu)}">${ICON.x(18)}</button></div>
<div class="k-mlinks">${menuLinks}</div>
<div class="k-mfoot"><a href="#">${esc(t.news)}</a><a href="#">${esc(t.contact)}</a></div>
</div>
</div>
</div>`;
}
