import { SITE, CONSENT } from '../config/site.mjs';
import { esc, href, icon, formatDate } from './util.mjs';

/* ---------- Legal documents (privacy, cookies, accessibility, terms) ---------- */

function block(b) {
  if (b.p) return `<p>${b.p}</p>`;
  if (b.ul) return `<ul>${b.ul.map((li) => `<li>${li}</li>`).join('')}</ul>`;
  if (b.table) {
    const { head, rows } = b.table;
    return `<div class="table-wrap" role="region" tabindex="0" aria-label="${esc(head.join(', '))}"><table class="legal-table">
      <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td data-label="${esc(head[i])}">${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }
  return '';
}

export function legalBody(doc, L, lang, { cookieButton = false } = {}) {
  const toc = `<nav class="legal-toc glass" aria-label="${esc(L.common.onThisPage)}"><p>${esc(L.common.onThisPage)}</p><ol>${doc.sections.map((s) => `<li><a href="#${s.id}">${esc(s.h)}</a></li>`).join('')}</ol></nav>`;
  const sections = doc.sections.map((s) => `<section class="legal-section" id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h">${esc(s.h)}</h2>${s.blocks.map(block).join('')}</section>`).join('');
  return `<section class="section legal">
  <div class="container legal-grid">
    <aside class="legal-aside">${toc}</aside>
    <div class="prose legal-prose">
      <p class="legal-updated">${esc(L.common.lastUpdated)}: <time datetime="${doc.updated}">${formatDate(doc.updated, lang)}</time></p>
      <p class="body-lg">${esc(doc.lead)}</p>
      ${cookieButton ? `<p><button class="btn btn-ink" type="button" data-consent-open>${esc(doc.button)}</button></p>` : ''}
      ${sections}
      <div class="legal-contact"><h2>${esc(L.common.contactTitle)}</h2><p>${esc(L.common.contactText)}</p>
        <p><a class="btn btn-ghost" href="mailto:${SITE.email}">${icon('mail')} ${SITE.email}</a></p></div>
    </div>
  </div>
</section>`;
}

/* ---------- Consent banner + preferences sheet ---------- */

const toggle = (id, label, desc, { locked = false, lockedLabel = '' } = {}) => `<div class="pref">
  <div class="pref-copy"><p class="pref-title" id="pref-${id}-l">${esc(label)}</p><p class="pref-desc" id="pref-${id}-d">${esc(desc)}</p></div>
  ${locked
    ? `<span class="pref-locked">${esc(lockedLabel)}</span>`
    : `<label class="switch"><input type="checkbox" role="switch" data-consent-cat="${id}" aria-labelledby="pref-${id}-l" aria-describedby="pref-${id}-d"><span class="switch-ui" aria-hidden="true"></span></label>`}
</div>`;

export function consentUI(L, lang) {
  const c = L.consent;
  const cats = CONSENT.categories.filter((k) => k !== 'necessary');
  return `<section class="consent glass" data-consent-banner role="region" aria-labelledby="consent-title" hidden>
  <div class="consent-copy">
    <h2 id="consent-title">${esc(c.title)}</h2>
    <p>${esc(c.text)} <a href="${href(lang, 'cookies')}">${esc(c.policy)}</a> · <a href="${href(lang, 'privacy')}">${esc(c.privacy)}</a></p>
  </div>
  <div class="consent-actions">
    <button class="btn btn-ghost btn-sm" type="button" data-consent="reject">${esc(c.rejectAll)}</button>
    <button class="btn btn-ghost btn-sm" type="button" data-consent-open>${esc(c.customize)}</button>
    <button class="btn btn-ink btn-sm" type="button" data-consent="accept">${esc(c.acceptAll)}</button>
  </div>
</section>
<dialog class="sheet" data-consent-sheet aria-labelledby="sheet-consent-title">
  <form method="dialog" class="sheet-inner">
    <header class="sheet-head"><h2 id="sheet-consent-title">${esc(c.title)}</h2><button class="sheet-x" type="submit" value="close" aria-label="${esc(c.close)}">${icon('close')}</button></header>
    <p class="sheet-lead">${esc(c.text)}</p>
    <p class="sheet-gpc" data-gpc hidden>${esc(c.gpc)}</p>
    <div class="prefs">
      ${toggle('necessary', c.categories.necessary.title, c.categories.necessary.desc, { locked: true, lockedLabel: c.always })}
      ${cats.map((k) => toggle(k, c.categories[k].title, c.categories[k].desc)).join('')}
    </div>
    <footer class="sheet-actions">
      <button class="btn btn-ghost btn-sm" type="button" data-consent="reject">${esc(c.rejectAll)}</button>
      <button class="btn btn-ghost btn-sm" type="button" data-consent="save">${esc(c.save)}</button>
      <button class="btn btn-ink btn-sm" type="button" data-consent="accept">${esc(c.acceptAll)}</button>
    </footer>
    <p class="sheet-links"><a href="${href(lang, 'cookies')}">${esc(c.policy)}</a> · <a href="${href(lang, 'privacy')}">${esc(c.privacy)}</a></p>
  </form>
</dialog>
<p class="sr-only" role="status" aria-live="polite" data-consent-status data-saved="${esc(c.saved)}"></p>`;
}

/* ---------- Accessibility panel ---------- */

const a11ySwitch = (key, label) => `<div class="pref pref-row"><p class="pref-title" id="a11y-${key}-l">${esc(label)}</p><label class="switch"><input type="checkbox" role="switch" data-a11y="${key}" aria-labelledby="a11y-${key}-l"><span class="switch-ui" aria-hidden="true"></span></label></div>`;

export function a11yUI(L, lang) {
  const a = L.a11y;
  return `<button class="a11y-fab" type="button" data-a11y-open aria-haspopup="dialog" aria-label="${esc(a.open)}">
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5V14m0 0-3 6.5M12 14l3 6.5"/></svg>
</button>
<dialog class="sheet sheet-a11y" data-a11y-sheet aria-labelledby="a11y-title">
  <form method="dialog" class="sheet-inner">
    <header class="sheet-head"><h2 id="a11y-title">${esc(a.title)}</h2><button class="sheet-x" type="submit" value="close" aria-label="${esc(a.close)}">${icon('close')}</button></header>
    <p class="sheet-lead">${esc(a.text)}</p>
    <fieldset class="segmented"><legend class="pref-title">${esc(a.textSize)}</legend>
      ${a.sizes.map((s, i) => `<label><input type="radio" name="a11y-size" value="${i}" data-a11y-size${i === 0 ? ' checked' : ''}><span>${esc(s)}</span></label>`).join('')}
    </fieldset>
    <div class="prefs">
      ${a11ySwitch('contrast', a.contrast)}
      ${a11ySwitch('motion', a.motion)}
      ${a11ySwitch('links', a.links)}
      ${a11ySwitch('readable', a.readable)}
      ${a11ySwitch('spacing', a.spacing)}
      ${a11ySwitch('cursor', a.cursor)}
    </div>
    <footer class="sheet-actions">
      <button class="btn btn-ghost btn-sm" type="button" data-a11y-reset>${esc(a.reset)}</button>
      <a class="btn btn-ink btn-sm" href="${href(lang, 'accessibility')}">${esc(a.statement)}</a>
    </footer>
  </form>
</dialog>`;
}
