import { SITE, IMAGES } from '../config/site.mjs';
import { esc, plain, href, abs, img, icon } from './util.mjs';
import { ctaBand } from './home.mjs';

const eyebrow = (s) => `<p class="eyebrow">${esc(s)}</p>`;

export function pageHero(h, key, crumbsHtml) {
  return `<section class="p-hero">
  <div class="p-hero-img" data-speed="0.15">${img(IMAGES.pageHero[key] || 'hero-villa', plain(h.title), { eager: true, sizes: '100vw' })}</div>
  <div class="p-hero-shade"></div>
  <div class="container p-hero-copy">
    ${crumbsHtml}
    ${eyebrow(h.eyebrow)}
    <h1 class="display">${h.title}</h1>
    <p class="lead">${esc(h.lead)}</p>
  </div>
</section>`;
}

const bullets = (list) => `<ul class="checks">${list.map((b) => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>`;

export function servicesBody(t, lang) {
  const s = t.services;
  const index = `<nav class="sub-nav glass" aria-label="${esc(t.nav.services)}">${s.items.map((it, i) => `<a href="#${it.id}"><span>0${i + 1}</span>${esc(it.title)}</a>`).join('')}</nav>`;
  const rows = s.items.map((it, i) => `<section class="feature${i % 2 ? ' is-flip' : ''}" id="${it.id}">
    <div class="feature-img reveal-mask">${img(IMAGES.services[it.id], it.title, { sizes: '(max-width: 800px) 100vw, 50vw' })}</div>
    <div class="feature-copy">
      <span class="feature-num">0${i + 1}</span>
      <h2 class="h2 reveal">${esc(it.title)}</h2>
      <p class="body-lg reveal">${esc(it.short)}</p>
      <p class="reveal">${esc(it.text)}</p>
      ${bullets(it.bullets)}
    </div>
  </section>`).join('');
  const deliver = `<section class="section deliver"><div class="container"><h2 class="h2">${esc(s.deliverTitle)}</h2><ol class="deliver-list">${s.deliver.map((d, i) => `<li class="reveal" style="--d:${i * 80}ms"><span>0${i + 1}</span>${esc(d)}</li>`).join('')}</ol></div></section>`;
  return `<div class="container">${index}</div><div class="container features">${rows}</div>${deliver}${ctaBand(t, lang)}`;
}

export function servicesLd(t, lang) {
  return {
    '@type': 'ItemList',
    itemListElement: t.services.items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Service', name: it.title, description: it.text, url: abs(`${href(lang, 'services')}#${it.id}`), provider: { '@id': `${SITE.domain}/#organization` }, areaServed: 'Crete, Greece' },
    })),
  };
}

export function sectorsBody(t, lang) {
  const tabs = `<div class="tabs glass" role="tablist">${t.sectors.items.map((it, i) => `<a href="#${it.id}" role="tab"><span>0${i + 1}</span>${esc(it.title)}</a>`).join('')}</div>`;
  const rows = t.sectors.items.map((it, i) => `<section class="sector-full" id="${it.id}">
    <div class="sector-full-img" data-speed="0.08">${img(IMAGES.sectors[it.id], it.title, { sizes: '100vw' })}</div>
    <div class="container sector-full-inner">
      <div class="sector-full-card">
        <span class="feature-num">0${i + 1}</span>
        <h2 class="h2">${esc(it.title)}</h2>
        <p class="body-lg">${esc(it.short)}</p>
        <p>${esc(it.text)}</p>
        ${bullets(it.bullets)}
        <dl class="facts"><div><dt>${esc(t.common.typicalSize)}</dt><dd>${esc(it.size)}</dd></div><div><dt>${esc(t.common.typicalDuration)}</dt><dd>${esc(it.duration)}</dd></div></dl>
        <a class="btn btn-ink magnetic" href="${href(lang, 'contact')}">${esc(t.common.enquire)} ${icon('arrow')}</a>
      </div>
    </div>
  </section>`).join('');
  return `<div class="container">${tabs}</div>${rows}${ctaBand(t, lang)}`;
}

export function projectsBody(t, lang) {
  const p = t.projects;
  const sectors = ['all', ...t.sectors.items.map((s) => s.id)];
  const name = (id) => (id === 'all' ? p.filterAll : t.sectors.items.find((s) => s.id === id).title);
  const cards = p.items.map((it, i) => `<article class="proj reveal" data-cat="${it.sector}" style="--d:${(i % 3) * 80}ms">
    <div class="proj-img">${img(it.image, it.title, { sizes: '(max-width: 800px) 100vw, 33vw' })}<span class="tag tag-glass">${esc(name(it.sector))}</span></div>
    <div class="proj-body">
      <h2>${esc(it.title)}</h2>
      <p class="proj-loc">${icon('pin')} ${esc(it.location)}</p>
      <dl class="facts facts-sm"><div><dt>${esc(t.common.typicalSize)}</dt><dd>${esc(it.size)}</dd></div><div><dt>${esc(t.common.typicalDuration)}</dt><dd>${esc(it.duration)}</dd></div></dl>
      <p class="proj-scope"><strong>${esc(t.common.scope)}:</strong> ${esc(it.scope)}</p>
    </div>
  </article>`).join('');
  const gallery = `<section class="section gallery-sec"><div class="h-scroll" data-drag tabindex="0" role="region" aria-label="${esc(t.nav.projects)}"><div class="h-track gallery">${IMAGES.gallery.map((g) => `<figure>${img(g, '', { sizes: '40vw' })}</figure>`).join('')}</div></div></section>`;
  return `<section class="section"><div class="container">
    <div class="filters" role="toolbar" data-filter="projects">${sectors.map((s, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-value="${s}" aria-pressed="${i === 0}">${esc(name(s))}</button>`).join('')}</div>
    <div class="proj-grid" data-filter-target="projects">${cards}</div>
    <p class="note">${esc(p.note)}</p>
  </div></section>${gallery}${ctaBand(t, lang)}`;
}

export function aboutBody(t, lang) {
  const a = t.about;
  return `<section class="section"><div class="container split about-story">
    <div><h2 class="h2">${esc(a.story.title)}</h2>${a.story.paragraphs.map((p) => `<p class="body-lg reveal">${esc(p)}</p>`).join('')}</div>
    <div class="intro-visual" aria-hidden="true">
      <div class="layer layer-back" data-speed="0.08">${img('chania-harbour-night', '', { sizes: '40vw' })}</div>
      <div class="layer layer-front" data-speed="-0.06">${img('site-sivan', '', { sizes: '30vw' })}</div>
    </div>
  </div></section>
  <section class="section values-sec"><div class="container"><div class="values">${a.values.map((v, i) => `<div class="value reveal" style="--d:${i * 80}ms"><span>0${i + 1}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join('')}</div></div></section>
  <section class="section region"><div class="container split">
    <div><h2 class="h2">${esc(a.region.title)}</h2><p class="body-lg">${esc(a.region.text)}</p><ul class="areas">${a.region.areas.map((x) => `<li>${icon('pin')}${esc(x)}</li>`).join('')}</ul></div>
    ${creteMap()}
  </div></section>
  <section class="section"><div class="container"><div class="company-card glass">
    <h2 class="h3">${esc(a.company.title)}</h2>
    <dl class="facts"><div><dt>${esc(a.company.legal)}</dt><dd>${SITE.name}</dd></div><div><dt>${esc(t.common.taxNo)}</dt><dd>${SITE.taxNo}</dd></div><div><dt>G.E.MI.</dt><dd>${SITE.gemi}</dd></div><div><dt>${esc(a.company.office)}</dt><dd>${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}</dd></div><div><dt>${esc(t.common.emailUs)}</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div></dl>
  </div></div></section>
  ${ctaBand(t, lang)}`;
}

/** Stylised outline of Crete with pins (decorative). */
function creteMap() {
  const pins = [[78, 58, 'Chania'], [190, 72, 'Rethymno'], [300, 62, 'Heraklion'], [430, 92, 'Lasithi']];
  return `<figure class="crete-map reveal" aria-hidden="true"><svg viewBox="0 0 520 170">
    <path class="crete" d="M14 70c18-14 30-30 48-28 14 2 12 18 28 16 22-3 34-20 58-14 18 4 26 18 48 18 26 0 40-16 66-12 24 4 30 20 56 22 28 2 44-14 70-8 22 5 26 22 50 26 26 4 40-10 60-2 14 6 10 22 4 30-10 12-32 8-50 16-20 9-26 26-52 26-24 0-34-16-58-16-28 0-40 18-70 16-26-2-36-20-62-22-30-2-44 14-74 10-26-4-34-22-60-20-24 2-34 16-56 10-18-5-22-22-8-34z"/>
    ${pins.map(([x, y, n], i) => `<g class="pin" style="--d:${i * 150}ms"><circle cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y}" r="12" class="ring"/><text x="${x}" y="${y - 18}" text-anchor="middle">${n}</text></g>`).join('')}
  </svg></figure>`;
}

const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('');

export function teamBody(t, lang, hasPhoto) {
  const tm = t.team;
  const dept = (id) => tm.departments.find((d) => d.id === id)?.name || '';
  const card = (m, lead = false) => `<article class="person reveal${lead ? ' is-lead' : ''}">
    <div class="avatar">${m.photo && hasPhoto(m.photo) ? `<img src="/assets/img/team/${m.photo}.webp" alt="${esc(m.name)}" loading="lazy" width="600" height="750">` : `<span>${esc(initials(m.name))}</span>`}</div>
    <div class="person-body"><p class="person-dept">${esc(dept(m.dept))}</p><h3>${esc(m.name)}</h3><p class="person-role">${esc(m.role)}</p><p>${esc(m.bio)}</p></div>
  </article>`;
  const [a, b, ...rest] = tm.members;
  return `<section class="section"><div class="container">
    <h2 class="h2">${esc(tm.leadershipTitle)}</h2>
    <div class="lead-grid">${card(a, true)}${card(b, true)}</div>
    <div class="team-grid">${rest.map((m) => card(m)).join('')}</div>
  </div></section>
  <section class="section depts"><div class="container"><h2 class="h2">${esc(tm.departmentsTitle)}</h2>
    <div class="dept-grid">${tm.departments.map((d, i) => `<div class="dept reveal" style="--d:${i * 60}ms"><span>0${i + 1}</span><h3>${esc(d.name)}</h3><p>${esc(d.text)}</p></div>`).join('')}</div>
  </div></section>
  <section class="section"><div class="container narrow center"><h2 class="h2">${esc(tm.joinTitle)}</h2><p class="body-lg">${esc(tm.joinText)}</p><a class="btn btn-ink" href="mailto:${SITE.email}">${SITE.email}</a></div></section>`;
}

export function teamLd(t) {
  return t.team.members.map((m) => ({ '@type': 'Person', name: m.name, jobTitle: m.role, worksFor: { '@id': `${SITE.domain}/#organization` } }));
}

export function contactBody(t, L, lang, enForm) {
  const f = t.contact.form;
  // Visible text is localised; the submitted value is always English for a consistent inbox.
  const opt = (list, key) => list.map((o, i) => `<option value="${esc(enForm[key][i] || o)}">${esc(o)}</option>`).join('');
  const field = (name, label, type = 'text', req = true, extra = '') => `<div class="field"><label for="f-${name}">${esc(label)}${req ? ' <span aria-hidden="true">*</span>' : ''}</label><input id="f-${name}" name="${name}" type="${type}" ${req ? 'required aria-required="true"' : ''} aria-describedby="f-${name}-err" ${extra}><span class="field-err" id="f-${name}-err"></span></div>`;
  const select = (name, label, list, key) => `<div class="field"><label for="f-${name}">${esc(label)}</label><select id="f-${name}" name="${name}"><option value=""></option>${opt(list, key)}</select></div>`;
  return `<section class="section contact-sec"><div class="container contact-grid">
    <form class="form glass" data-form action="${SITE.formEndpoint}" method="POST" novalidate data-msg-required="${esc(L.form.required)}" data-msg-email="${esc(L.form.email)}" data-msg-consent="${esc(L.form.consentRequired)}" data-msg-spam="${esc(L.form.spam)}"${SITE.recaptcha?.siteKey ? ` data-recaptcha-key="${SITE.recaptcha.siteKey}" data-recaptcha-action="${SITE.recaptcha.action}"` : ''}>
      <input type="hidden" name="language" value="${lang}">
      <input type="hidden" name="notice_version" value="${esc(L.privacy.updated)}">
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="form-row">${field('name', f.name, 'text', true, 'autocomplete="name"')}${field('email', f.email, 'email', true, 'autocomplete="email"')}</div>
      <div class="form-row">${field('phone', f.phone, 'tel', false, 'autocomplete="tel"')}${field('country', f.country, 'text', false, 'autocomplete="country-name"')}</div>
      <div class="form-row">${select('project_type', f.type, f.types, 'types')}${select('service', f.service, f.services, 'services')}</div>
      <div class="form-row">${select('budget', f.budget, f.budgets, 'budgets')}${select('stage', f.stage, f.stages, 'stages')}</div>
      <div class="field"><label for="f-message">${esc(f.message)}</label><textarea id="f-message" name="message" rows="5" maxlength="4000"></textarea></div>
      <p class="form-notice">${esc(L.form.notice)} <a href="${href(lang, 'privacy')}">${esc(L.nav.privacy)}</a></p>
      <div class="consent-row"><input type="checkbox" id="f-consent" name="consent" value="yes" required aria-required="true" aria-describedby="f-consent-err"><label for="f-consent">${esc(f.consent)} <span aria-hidden="true">*</span></label><span class="field-err" id="f-consent-err"></span></div>
      <div class="consent-row"><input type="checkbox" id="f-marketing" name="marketing" value="yes"><label for="f-marketing">${esc(L.form.marketing)}</label></div>
      <button class="btn btn-ink btn-block magnetic" type="submit" data-sending="${esc(f.sending)}">${esc(f.submit)} ${icon('arrow')}</button>
      ${SITE.recaptcha?.siteKey ? `<p class="recaptcha-note">${L.form.recaptcha}</p>` : ''}
      <p class="form-status" tabindex="-1" role="status" aria-live="polite" data-ok="${esc(f.success)}" data-err="${esc(f.error)}"></p>
    </form>
    <aside class="contact-aside">
      <h2 class="h3">${esc(t.contact.details)}</h2>
      <a class="contact-line" href="tel:${SITE.phone}">${icon('phone')}<span><small>${esc(t.common.callUs)}</small>${SITE.phoneDisplay}</span></a>
      <a class="contact-line" href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon('whatsapp')}<span><small>WhatsApp</small>${SITE.phoneDisplay}</span></a>
      <a class="contact-line" href="mailto:${SITE.email}">${icon('mail')}<span><small>${esc(t.common.emailUs)}</small>${SITE.email}</span></a>
      <div class="contact-line">${icon('pin')}<span><small>${esc(t.contact.office)}</small>${SITE.address.street}<br>${SITE.address.postalCode} ${SITE.address.city}, ${SITE.address.region}<br>${esc(t.contact.hours)}</span></div>
      <p class="tax">${esc(t.common.taxNo)} ${SITE.taxNo} · G.E.MI. ${SITE.gemi}</p>
    </aside>
  </div></section>
  <section class="map-sec" aria-label="${esc(t.contact.mapTitle)}"><div class="map" data-map="https://www.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&output=embed" data-title="${esc(t.contact.mapTitle)}">
    <div class="map-gate">
      ${icon('pin', 'i map-pin')}
      <h2 class="h3">${esc(L.consent.map.title)}</h2>
      <p>${esc(L.consent.map.text)}</p>
      <p class="map-address">${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}, ${SITE.address.region}</p>
      <div class="hero-cta center"><button class="btn btn-ink btn-sm" type="button" data-map-load>${esc(L.consent.map.button)}</button><a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapQuery)}" target="_blank" rel="noopener">${esc(L.consent.map.open)}</a></div>
    </div>
  </div></section>`;
}

export function creditsBody(t, credits) {
  return `<section class="section"><div class="container narrow prose">
    <p>${esc(t.credits.intro)}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-label="${esc(t.credits.title)}"><table class="credits"><tbody>${credits.map((c) => `<tr><td>${esc(c.title)}</td><td>${esc(c.creator)}</td><td>${esc(c.license)}</td><td><a href="${esc(c.source)}" rel="nofollow noopener" target="_blank">Source</a></td></tr>`).join('')}</tbody></table></div>
  </div></section>`;
}

export function notFoundBody(t, lang) {
  return `<section class="section nf"><div class="container narrow center"><p class="nf-code">404</p><h1 class="h1">${esc(t.common.notFoundTitle)}</h1><p class="body-lg">${esc(t.common.notFoundText)}</p><div class="hero-cta center"><a class="btn btn-ink" href="${href(lang)}">${esc(t.common.goHome)}</a><a class="btn btn-ghost" href="${href(lang, 'contact')}">${esc(t.common.contactUs)}</a></div></div></section>`;
}
