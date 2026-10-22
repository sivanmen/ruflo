#!/usr/bin/env node
/**
 * Publishes the King Solomon project site (he + en) to sivaninvestgroup.com via the REST API.
 * Only touches the two existing King Solomon home pages and the pages it creates itself
 * (ids kept in .deploy-state.json). Nothing else on the site is modified.
 *
 *   WP_USER=.. WP_APP_PASSWORD=".." node deploy.mjs [--draft]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://sivaninvestgroup.com';
const AUTH = 'Basic ' + Buffer.from(`${process.env.WP_USER}:${(process.env.WP_APP_PASSWORD || '').replace(/\s+/g, '')}`).toString('base64');
const STATE = path.join(HERE, '.deploy-state.json');
const STATUS = process.argv.includes('--draft') ? 'draft' : 'publish';
const HOME = { he: 32370, en: 32371 }; // existing King Solomon pages (created earlier)

// key -> [slug, parentKey]
const TREE = { home: [null, null], villas: ['villas', 'home'], 'type-1': ['1-bedroom', 'villas'], 'type-2': ['2-bedroom', 'villas'], 'type-3': ['3-bedroom', 'villas'],
  'type-5': ['5-bedroom', 'villas'], project: ['the-project', 'home'], gallery: ['gallery', 'home'], developer: ['developer', 'home'], contact: ['contact', 'home'] };

// Retries: under bursts the site's protection layer sometimes answers 200 with an empty / non-JSON body.
async function api(method, route, body, tries = 4) {
  const res = await fetch(`${SITE}/wp-json${route}`, { method, headers: { Authorization: AUTH, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  const j = await res.json().catch(() => null);
  if (res.ok && j && typeof j === 'object' && Object.keys(j).length) return j;
  if (tries > 1 && (!j || res.status >= 500 || res.status === 429)) { await new Promise((r) => setTimeout(r, 2500)); return api(method, route, body, tries - 1); }
  throw new Error(`${method} ${route} -> ${res.status} ${(j && j.message) || 'unexpected response'}`);
}

const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { he: {}, en: {} };
state.he.home ??= HOME.he; state.en.home ??= HOME.en;

// --recreate-home: Elementor's element cache is not cleared by REST meta updates, so the home pages
// (ours) are moved to the trash and recreated at the same URL; children are re-attached afterwards.
if (process.argv.includes('--recreate-home')) {
  for (const lang of ['he', 'en']) {
    const old = await api('GET', `/wp/v2/pages/${state[lang].home}?context=edit&_fields=id,slug`);
    if (old.slug !== 'kingsolomonproject') throw new Error(`refusing to trash page ${old.id} (${old.slug})`);
    await api('DELETE', `/wp/v2/pages/${old.id}`);
    console.log(`trashed ${lang}/home #${old.id}`);
    delete state[lang].home;
  }
}
const me = await api('GET', '/wp/v2/users/me?context=edit');
if (!me.capabilities?.unfiltered_html) throw new Error('user lacks unfiltered_html');

for (const key of Object.keys(TREE)) {
  for (const lang of ['he', 'en']) {
    const [slug, parentKey] = TREE[key];
    const data = JSON.parse(readFileSync(path.join(HERE, 'dist', lang, `${key}.json`), 'utf8'));
    const body = { title: data.title, template: 'elementor_canvas',
      meta: { _elementor_edit_mode: 'builder', _elementor_template_type: 'wp-page', _elementor_data: JSON.stringify(data.content) } };
    let pid = state[lang][key];
    if (pid) {
      const cur = await api('GET', `/wp/v2/pages/${pid}?context=edit&_fields=id,slug`);
      if (!cur.slug.startsWith('kingsolomonproject') && cur.slug !== slug) throw new Error(`refusing to touch page ${pid} (${cur.slug})`);
      const parent = parentKey ? state[lang][parentKey] : 0;
      await api('POST', `/wp/v2/pages/${pid}`, key === 'home' ? body : { ...body, status: STATUS, parent });
      console.log(`updated ${lang}/${key} #${pid}`);
    } else {
      const parent = parentKey ? state[lang][parentKey] : 0;
      const created = await api('POST', '/wp/v2/pages', { ...body, slug: slug || 'kingsolomonproject', parent, status: key === 'home' ? 'publish' : STATUS, lang,
        ...(lang === 'en' && state.he[key] ? { translations: { he: state.he[key] } } : {}) });
      pid = state[lang][key] = created.id;
      writeFileSync(STATE, JSON.stringify(state, null, 1));
      console.log(`created ${lang}/${key} #${pid} -> ${created.link}`);
    }
  }
}
for (const lang of ['he', 'en']) for (const key of Object.keys(TREE)) {
  const p = await api('GET', `/wp/v2/pages/${state[lang][key]}?_fields=link`);
  console.log(`${lang.padEnd(3)} ${key.padEnd(10)} ${p.link}`);
}
