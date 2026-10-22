#!/usr/bin/env node
/**
 * Creates (or updates) ONLY the two King Solomon Project pages on sivaninvestgroup.com
 * through the WordPress REST API. Nothing else on the site is read-modified-written:
 * no theme, global, menu, template or other-page changes.
 *
 *   WP_USER=<username> WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx" node deploy.mjs [--dry-run] [--publish]
 *
 * - Pages are created as drafts (status "draft") unless --publish is passed.
 * - Template: elementor_canvas (no theme header/footer) — a per-page setting.
 * - Hebrew page lang=he, English page lang=en, linked as Polylang translations.
 * - Page ids are remembered in .deploy-state.json (git-ignored); later runs update
 *   only those two ids, and refuse to touch any page whose slug is not ours.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://sivaninvestgroup.com';
const SLUG = 'kingsolomonproject';
const STATE_FILE = path.join(HERE, '.deploy-state.json');
const DRY = process.argv.includes('--dry-run');
const PUBLISH = process.argv.includes('--publish');

const PAGES = [
  { lang: 'he', title: 'King Solomon Project', file: 'dist/king-solomon-project-he.elementor.json' },
  { lang: 'en', title: 'King Solomon Project', file: 'dist/king-solomon-project-en.elementor.json' }
];

const user = process.env.WP_USER;
const pass = process.env.WP_APP_PASSWORD;
if (!user || !pass) {
  console.error('Set WP_USER and WP_APP_PASSWORD (an Application Password, not the login password).');
  process.exit(1);
}
const AUTH = 'Basic ' + Buffer.from(`${user}:${pass.replace(/\s+/g, '')}`).toString('base64');

async function api(method, route, body) {
  const res = await fetch(`${SITE}/wp-json${route}`, {
    method,
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status}: ${json.message || json.raw}`);
  return json;
}

async function loadState() {
  return existsSync(STATE_FILE) ? JSON.parse(await readFile(STATE_FILE, 'utf8')) : {};
}

function isOurs(page) {
  return typeof page.slug === 'string' && page.slug.startsWith(SLUG);
}

async function main() {
  const me = await api('GET', '/wp/v2/users/me?context=edit');
  const caps = me.capabilities || {};
  console.log(`Authenticated as ${me.name} (${(me.roles || []).join(', ')})`);
  if (!caps.unfiltered_html) {
    throw new Error('This user lacks unfiltered_html — Elementor would strip the page <script>. Use an Administrator/Editor account.');
  }

  const state = await loadState();
  const ids = {};

  for (const page of PAGES) {
    const template = JSON.parse(await readFile(path.join(HERE, page.file), 'utf8'));
    const body = {
      title: page.title,
      template: 'elementor_canvas',
      meta: {
        _elementor_edit_mode: 'builder',
        _elementor_template_type: 'wp-page',
        _elementor_data: JSON.stringify(template.content)
      }
    };

    const existingId = state[page.lang];
    if (existingId) {
      const current = await api('GET', `/wp/v2/pages/${existingId}?context=edit`);
      if (!isOurs(current)) throw new Error(`Refusing to update page ${existingId}: slug "${current.slug}" is not ours.`);
      console.log(`${DRY ? '[dry-run] would update' : 'Updating'} ${page.lang} page ${existingId} (${current.link})`);
      if (!DRY) await api('POST', `/wp/v2/pages/${existingId}`, PUBLISH ? { ...body, status: 'publish' } : body);
      ids[page.lang] = existingId;
      continue;
    }

    const clash = await api('GET', `/wp/v2/pages?slug=${SLUG}&lang=${page.lang}&status=publish,draft,pending,private,future&context=edit`);
    if (clash.length) throw new Error(`A ${page.lang} page with slug "${SLUG}" already exists (id ${clash[0].id}). Not touching it.`);

    const create = {
      ...body,
      slug: SLUG,
      status: PUBLISH ? 'publish' : 'draft',
      lang: page.lang,
      ...(page.lang !== 'he' && ids.he ? { translations: { he: ids.he } } : {})
    };
    if (DRY) {
      console.log(`[dry-run] would create ${page.lang} page "${page.title}" (/${SLUG}, ${create.status}, ${(create.meta._elementor_data.length / 1024).toFixed(0)} KB data)`);
      ids[page.lang] = 0;
      continue;
    }
    const created = await api('POST', '/wp/v2/pages', create);
    ids[page.lang] = created.id;
    state[page.lang] = created.id;
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`Created ${page.lang} page ${created.id}: slug "${created.slug}" status ${created.status}`);
    if (created.slug !== SLUG) console.log(`  note: WordPress assigned slug "${created.slug}" (slug "${SLUG}" was taken in another language).`);
  }

  for (const [lang, id] of Object.entries(ids)) {
    if (!id) continue;
    const p = await api('GET', `/wp/v2/pages/${id}?context=edit`);
    console.log(`${lang}: ${p.link}  | preview: ${SITE}/?page_id=${id}&preview=true  | edit: ${SITE}/wp-admin/post.php?post=${id}&action=elementor`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
