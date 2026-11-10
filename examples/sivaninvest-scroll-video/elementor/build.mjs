#!/usr/bin/env node
/**
 * Builds the King Solomon Project page for Elementor, per language:
 *   dist/king-solomon-project-<lang>.html            -> paste into ONE Elementor "HTML" widget
 *   dist/king-solomon-project-<lang>.elementor.json  -> Elementor template (Templates > Import), Canvas layout
 *   dist/preview-<lang>.html                         -> standalone preview (open in a browser)
 *
 *   node build.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { STRINGS } from './src/strings.mjs';
import { markup } from './src/markup.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist');
const FONT_LINK = '<link href="https://db.onlinewebfonts.com/c/95cecf452d3208890088a5b4c19c7ecf?family=Helvetica+Neue+ME" rel="stylesheet">';

const css = (await readFile(path.join(HERE, 'src/style.css'), 'utf8')).trim();
const js = (await readFile(path.join(HERE, 'src/scrub.js'), 'utf8')).trim();

function widgetHtml(t) {
  return [
    '<!-- King Solomon Project — scroll-tied video scene. Paste as-is into one Elementor HTML widget (page layout: Elementor Canvas). -->',
    FONT_LINK,
    `<style>\n${css}\n</style>`,
    markup(t),
    `<script>\n${js}\n</script>`
  ].join('\n');
}

// Stable 7-char hex ids, like Elementor's own element ids.
function elId(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

const ZERO = { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true };

function elementorContent(lang, html) {
  return [{
    id: elId(`ksp-section-${lang}`),
    elType: 'section',
    isInner: false,
    settings: { layout: 'full_width', gap: 'no', padding: ZERO, margin: ZERO },
    elements: [{
      id: elId(`ksp-column-${lang}`),
      elType: 'column',
      isInner: false,
      settings: { _column_size: 100, _inline_size: null, padding: ZERO, margin: ZERO },
      elements: [{
        id: elId(`ksp-html-${lang}`),
        elType: 'widget',
        widgetType: 'html',
        isInner: false,
        settings: { html, _padding: ZERO, _margin: ZERO },
        elements: []
      }]
    }]
  }];
}

function previewPage(t, html) {
  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scroll Tied Video Section</title>
<style>body{margin:0}</style>
</head>
<body>
${html}
</body>
</html>
`;
}

await mkdir(DIST, { recursive: true });
for (const [lang, t] of Object.entries(STRINGS)) {
  const html = widgetHtml(t);
  const template = {
    version: '0.4',
    title: `King Solomon Project (${lang.toUpperCase()})`,
    type: 'page',
    page_settings: { template: 'elementor_canvas' },
    content: elementorContent(lang, html)
  };
  await writeFile(path.join(DIST, `king-solomon-project-${lang}.html`), html + '\n');
  await writeFile(path.join(DIST, `king-solomon-project-${lang}.elementor.json`), JSON.stringify(template, null, 1) + '\n');
  await writeFile(path.join(DIST, `preview-${lang}.html`), previewPage(t, html));
  console.log(`${lang}: widget ${(html.length / 1024).toFixed(1)} KB`);
}
