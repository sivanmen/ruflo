// King Solomon static site generator. Usage: node build/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, writeFile, copyDir, minifyHTML } from './lib/util.mjs';
import { createContext, config, project, ROUTES } from './lib/context.mjs';
import { documentShell, CONSENT_JS } from './lib/layout.mjs';
import { writeServerFiles } from './server-files.mjs';
import { renderHome } from './pages/home.mjs';
import { renderVillas, renderCollection } from './pages/villas.mjs';
import { renderProject } from './pages/project.mjs';
import { renderGallery, renderDeveloper, renderContact } from './pages/other.mjs';
import { renderLanding, renderLegal, render404 } from './pages/landing.mjs';
import { writeSeoFiles } from './seo-files.mjs';
import { writeLeadI18n } from './lead-i18n.mjs';

const t0 = Date.now();

// 1. Static assets: concatenate CSS/JS partials, copy the PHP API.
const bundle = (dir, ext) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(ext)).sort()
  .map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(ROOT, dir, f), 'utf8')).join('\n');
const css = bundle('static/css', '.css').replace(/\/\*(?!\s*\d\d-)[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
const js = bundle('static/js', '.js');
writeFile('assets/css/main.css', css);
writeFile('assets/js/main.js', js);
copyDir(path.join(ROOT, 'static/api'), path.join(ROOT, 'dist/api'));
const version = crypto.createHash('md5').update(css).update(js).digest('hex').slice(0, 8);

// 2. Pages per language.
const pages = [];
for (const L of config.languages) {
  const ctx = createContext(L.code);
  ctx.version = version;
  const list = [
    renderHome(ctx),
    renderVillas(ctx),
    ...project.collections.map((c) => renderCollection(ctx, c)),
    renderProject(ctx),
    renderGallery(ctx),
    renderDeveloper(ctx),
    renderContact(ctx),
    renderLanding(ctx),
    ...['privacy', 'cookies', 'terms', 'accessibility'].map((k) => renderLegal(ctx, k)),
  ];
  for (const page of list) {
    const html = minifyHTML(documentShell(ctx, page, page.body));
    const rel = ctx.url(page.key).replace(/^\//, '') + 'index.html';
    writeFile(rel, html);
    pages.push({ lang: L.code, key: page.key, noindex: !!page.noindex });
  }
  if (L.code === config.defaultLang) {
    const p404 = render404(ctx);
    writeFile('404.html', minifyHTML(documentShell(ctx, p404, p404.body)));
  }
}

// 3. sitemap.xml, robots.txt, llms.txt, manifest.
writeSeoFiles(pages);
writeServerFiles([CONSENT_JS]);
writeLeadI18n();

console.log(`Built ${pages.length} pages in ${config.languages.length} languages (${Date.now() - t0} ms). Assets v${version}.`);
export { ROUTES };
