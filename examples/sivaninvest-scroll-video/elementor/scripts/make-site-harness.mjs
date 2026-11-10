#!/usr/bin/env node
/**
 * Builds a local test page that reproduces an Elementor Canvas page of sivaninvestgroup.com
 * (same <head> CSS, theme/Elementor JS and body classes as the live /wh-sim/ Canvas page),
 * with its content replaced by our widget. Tracking / third-party scripts are stripped so
 * tests never send analytics hits to the live site.
 *
 *   node scripts/make-site-harness.mjs <saved-canvas-page.html> <widget.html> <out.html>
 */
import { readFile, writeFile } from 'node:fs/promises';

const [src, widgetFile, out] = process.argv.slice(2);
if (!src || !widgetFile || !out) {
  console.error('usage: make-site-harness.mjs <canvas-page.html> <widget.html> <out.html>');
  process.exit(1);
}

let html = await readFile(src, 'utf8');
const widget = await readFile(widgetFile, 'utf8');

// Keep only same-site scripts (theme, Elementor, jQuery, GSAP); drop inline + third-party ones.
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (tag) => {
  const srcAttr = tag.match(/\bsrc=["']([^"']+)["']/i);
  if (!srcAttr) return /ElementorProFrontendConfig|elementorFrontendConfig|liko|jQuery/.test(tag) &&
    !/gtag|fbq|ttq|userway|clarity|hotjar/i.test(tag) ? tag : '';
  return srcAttr[1].startsWith('https://sivaninvestgroup.com/') &&
    !/complianz|cookie|site-kit|googlesitekit|pys|pixel/i.test(srcAttr[1]) ? tag : '';
});
html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

// Replace the Elementor page document with a single full-width section holding our HTML widget.
const start = html.indexOf('<div data-elementor-type="wp-page"');
if (start < 0) throw new Error('could not locate Elementor document in source page');
const tagRe = /<\/?div\b[^>]*>/gi;
tagRe.lastIndex = start;
let depth = 0;
let end = -1;
for (let m; (m = tagRe.exec(html));) {
  depth += m[0][1] === '/' ? -1 : 1;
  if (depth === 0) { end = tagRe.lastIndex; break; }
}
if (end < 0) throw new Error('unbalanced Elementor document');
const doc = `<div data-elementor-type="wp-page" data-elementor-id="1" class="elementor elementor-1" data-elementor-post-type="page">
<section class="elementor-section elementor-top-section elementor-element elementor-element-kspsec elementor-section-full_width elementor-section-height-default" data-id="kspsec" data-element_type="section">
<div class="elementor-container elementor-column-gap-no">
<div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-kspcol" data-id="kspcol" data-element_type="column">
<div class="elementor-widget-wrap elementor-element-populated">
<div class="elementor-element elementor-element-ksphtml elementor-widget elementor-widget-html" data-id="ksphtml" data-element_type="widget" data-widget_type="html.default">
<div class="elementor-widget-container">
${widget}
</div></div></div></div></div></section></div>
`;
html = html.slice(0, start) + doc + html.slice(end);
html = html.replace(/page-id-\d+/g, 'page-id-1').replace(/elementor-page-\d+/g, 'elementor-page-1');

await writeFile(out, html);
console.log(`harness written: ${out} (${(html.length / 1024).toFixed(0)} KB)`);
