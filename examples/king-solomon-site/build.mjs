#!/usr/bin/env node
/**
 * Builds every King Solomon page (he + en) as Elementor data, plus a local preview per page.
 *   node build.mjs   ->  dist/<lang>/<page>.json  (+ .preview.html)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import he from './content/he.mjs';
import en from './content/en.mjs';
import { TYPES } from './data/villas.mjs';
import { nav, footer, esc } from './src/ui.mjs';
import home from './src/pages/home.mjs';
import { villasPage, typePage } from './src/pages/villas.mjs';
import { projectPage, galleryPage, developerPage, contactPage } from './src/pages/more.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(path.join(HERE, p), 'utf8');
const SCENE_DIR = '../sivaninvest-scroll-video/elementor/src/';

// Double the .ks root class at selector starts so project rules outrank theme / kit rules.
function scope(css) {
  const one = (s) => {
    s = s.trim();
    if (!s || /^(html|body|from|to|\d|\.ks-js|\.admin-bar|\[dir)/.test(s)) return s;
    if (/^\.ks(?=[\s.:[>]|$)/.test(s)) return '.ks.ks' + s.slice(3);
    return `.ks.ks ${s}, .ks.ks${s}`;
  };
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[{}])(\s*)([^{}@]+?)(\s*)\{/g, (m, a, w1, sel, w2) => a + w1 + sel.split(',').map(one).join(', ') + w2 + '{');
}
const CSS = scope(read('src/theme.css') + '\n' + read('src/components.css'));
const SITE_JS = read('src/site.js');
const FONTS_EN = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet"><link href="https://db.onlinewebfonts.com/c/95cecf452d3208890088a5b4c19c7ecf?family=Helvetica+Neue+ME" rel="stylesheet">';

let seq = 0;
const id = (seed) => { let h = 2166136261; for (const c of seed + ++seq) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7); };
const ZERO = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };
const widget = (type, settings) => ({ id: id(type), elType: 'widget', widgetType: type, isInner: false, settings: { _padding: ZERO, _margin: ZERO, ...settings }, elements: [] });
const column = (widgets, size = 100) => ({ id: id('col'), elType: 'column', isInner: false, settings: { _column_size: size, _inline_size: size === 100 ? null : size, padding: ZERO }, elements: widgets });
const sectionEl = (columns, cls = '') => ({ id: id('sec'), elType: 'section', isInner: false, settings: { layout: 'full_width', gap: 'no', padding: ZERO, margin: ZERO, css_classes: cls, ...(columns.length > 1 ? { structure: '20' } : {}) }, elements: columns });
const html = (h) => widget('html', { html: h });

function contactBlock(t, b, pageKey) {
  const f = t.contact.fields, d = t.contact.details;
  const intro = `<p class="ks-eyebrow">King Solomon</p><h2 class="ks-h2">${esc(b.title)}</h2><p class="ks-p">${esc(b.lead)}</p>
<ul class="ks-list" style="margin-top:36px">${d.phones.map((p, i) => `<li><span>${i + 1}</span><span><b>${i ? 'Greece' : 'Israel'}</b><a href="tel:${p.replace(/\s/g, '')}" dir="ltr">${p}</a></span></li>`).join('')}
<li><span>@</span><span><b>Email</b><a href="mailto:${d.email}">${d.email}</a></span></li>${b.details ? `<li><span>⌂</span><span><b>${esc(d.title)}</b>${esc(d.address)}</span></li>` : ''}</ul>`;
  const form = widget('form', {
    form_name: `King Solomon (${t.lang.toUpperCase()})`,
    form_fields: [
      { _id: id('f'), custom_id: 'name', field_type: 'text', field_label: f.name, placeholder: '', required: 'true', width: '50' },
      { _id: id('f'), custom_id: 'phone', field_type: 'tel', field_label: f.phone, placeholder: '', required: 'true', width: '50' },
      { _id: id('f'), custom_id: 'email', field_type: 'email', field_label: f.email, placeholder: '', required: 'true', width: '50' },
      { _id: id('f'), custom_id: 'villa_type', field_type: 'select', field_label: f.type, field_options: f.types.join('\n'), width: '50' },
      { _id: id('f'), custom_id: 'notes', field_type: 'textarea', field_label: f.notes, rows: 4, width: '100' },
      { _id: id('f'), custom_id: 'source', field_type: 'hidden', field_label: 'Source', field_value: `King Solomon website · ${t.lang.toUpperCase()} · ${pageKey}`, width: '100' }
    ],
    show_labels: 'yes', input_size: 'md', button_text: f.send, button_size: 'md', button_width: '100',
    submit_actions: ['email', 'save-to-database'],
    email_to: 'support@sivaninvestgroup.com', email_subject: `King Solomon website enquiry (${t.lang.toUpperCase()})`, email_content: '[all-fields]',
    email_from_name: 'King Solomon Website', email_reply_to: 'email', email_content_type: 'html',
    success_message: t.contact.success, form_validation: 'browser', _css_classes: 'ks-form'
  });
  return sectionEl([column([html(`<div class="ks ks-reveal">${intro}</div>`)], 45), column([form], 55)], 'ks ks-sec is-ink ks-contact');
}

function accordionBlock(t, b) {
  const head = html(`<div class="ks"><h2 class="ks-h2">${esc(b.title)}</h2><p class="ks-lead">${esc(b.lead)}</p><p class="ks-note">${esc(b.note)}</p></div>`);
  const acc = widget('accordion', { tabs: b.items.map(([a, c]) => ({ _id: id('t'), tab_title: a, tab_content: `<p>${esc(c)}</p>` })), title_html_tag: 'h3' });
  return sectionEl([column([head], 40), column([acc], 60)], 'ks ks-sec ks-acc');
}

function build(t, pageKey, page) {
  seq = 0;
  const head = `${t.lang === 'en' ? FONTS_EN : ''}<style>${CSS}</style>${nav(t, pageKey.startsWith('type') ? 'villas' : pageKey)}`;
  const tail = `${page.altimeter ? `<div class="ks"><div class="ks-alt" aria-hidden="true"><span>${t.lang === 'he' ? 'מעל הים' : 'Above sea'}</span><div class="ks-alt-bar"><i class="ks-alt-dot"></i></div><b dir="ltr">34 m</b><span>${t.lang === 'he' ? 'הים' : 'Sea'}</span></div></div>` : ''}${footer(t)}<script>${SITE_JS}</script>`;
  const els = [], preview = [];
  page.blocks.forEach((b, i) => {
    const first = i === 0 ? head : '';
    if (b.kind === 'html' || b.kind === 'scene') {
      const body = b.kind === 'scene' ? `<style>${read(SCENE_DIR + 'style.css')}</style>${b.html}<script>${read(SCENE_DIR + 'scrub.js')}</script>` : b.html;
      els.push(sectionEl([column([html(first + body)])])); preview.push(first + body);
    } else if (b.kind === 'contact') {
      els.push(contactBlock(t, b, pageKey)); preview.push(`<section class="ks ks-sec is-ink"><div class="ks-wrap"><h2 class="ks-h2">${esc(b.title)}</h2><p>[Elementor form]</p></div></section>`);
    } else if (b.kind === 'accordion') {
      els.push(accordionBlock(t, b)); preview.push(`<section class="ks ks-sec"><div class="ks-wrap"><h2 class="ks-h2">${esc(b.title)}</h2>${b.items.map(([a, c]) => `<h3>${esc(a)}</h3><p>${esc(c)}</p>`).join('')}</div></section>`);
    } else if (b.kind === 'video') {
      const v = widget('video', { video_type: 'hosted', hosted_url: { url: b.src, id: '' }, autoplay: 'yes', mute: 'yes', loop: 'yes', controls: 'yes', play_on_mobile: 'yes' });
      els.push(sectionEl([column([html(`<div class="ks"><div class="ks-wrap"><h2 class="ks-h2">${esc(b.title)}</h2><p class="ks-lead" style="margin-bottom:40px">${esc(b.lead)}</p></div></div>`), v])], 'ks ks-sec is-ink ks-video'));
      preview.push(`<section class="ks ks-sec is-ink"><div class="ks-wrap"><h2 class="ks-h2">${esc(b.title)}</h2><video src="${b.src}" muted controls style="width:100%"></video></div></section>`);
    } else if (b.kind === 'map') {
      els.push(sectionEl([column([widget('google_maps', { address: b.address, zoom: { unit: 'px', size: 13 }, height: { unit: 'px', size: 480 } })])], 'ks ks-map'));
      preview.push('<section class="ks"><p>[Google map]</p></section>');
    }
  });
  els.push(sectionEl([column([html(tail)])])); preview.push(tail);
  return { title: page.title, content: els, preview: preview.join('\n') };
}

const out = path.join(HERE, 'dist');
const manifest = [];
for (const t of [he, en]) {
  mkdirSync(path.join(out, t.lang), { recursive: true });
  const pages = [['home', home(t)], ['villas', villasPage(t)], ['project', projectPage(t)], ['gallery', galleryPage(t)], ['developer', developerPage(t)], ['contact', contactPage(t)],
    ...TYPES.map((ty) => [`type-${ty.beds}`, typePage(t, ty)])];
  for (const [key, page] of pages) {
    const b = build(t, key, page);
    writeFileSync(path.join(out, t.lang, `${key}.json`), JSON.stringify({ title: b.title, content: b.content }));
    writeFileSync(path.join(out, t.lang, `${key}.preview.html`), `<!doctype html><html lang="${t.lang}" dir="${t.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.title)}</title></head><body>${b.preview}</body></html>`);
    manifest.push(`${t.lang}/${key} ${(JSON.stringify(b.content).length / 1024).toFixed(0)}KB`);
  }
}
console.log(manifest.join('\n'));
