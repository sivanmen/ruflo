#!/usr/bin/env node
/**
 * Pixel-compares the Elementor port against the React reference at fixed scroll
 * positions and viewports, after the frame bank is live and transitions settled.
 *
 *   CHROME=/path/to/chrome node scripts/compare.mjs <referenceUrl> <candidateUrl> <outDir>
 *
 * Needs `playwright`, `pngjs`, `pixelmatch` resolvable (NODE_PATH works).
 * Google Chrome (not the bundled Chromium) is required: the clip is H.264.
 */
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const [refUrl, candUrl, outDir] = process.argv.slice(2);
const VIEWPORTS = (process.env.VIEWPORTS || '1440x900,1024x768,768x1024,390x844')
  .split(',').map((s) => s.split('x').map(Number));
const POINTS = (process.env.POINTS || '0,0.1,0.24,0.36,0.45,0.58,0.71,0.85,1').split(',').map(Number);

async function openScene(browser, url, [w, h]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // Frame bank live = canvas fully opaque (both implementations fade it in on first paint).
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas');
    return c && getComputedStyle(c).opacity === '1';
  }, null, { timeout: 90000 }).catch(() => console.warn(`  ! canvas never went live on ${url}`));
  return page;
}

async function shoot(page, p) {
  await page.evaluate((p) => {
    const track = document.querySelector('canvas').closest('[class*="500vh"], [data-k="track"]') ||
      document.querySelector('canvas').parentElement.parentElement;
    const span = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + p * span, behavior: 'instant' });
  }, p);
  await page.waitForTimeout(2200); // lerp settle (tau 8) + 0.8s stagger + 500ms delays
  return PNG.sync.read(await page.screenshot());
}

const browser = await chromium.launch({ executablePath: process.env.CHROME });
await mkdir(outDir, { recursive: true });
const rows = [];
for (const vp of VIEWPORTS) {
  const [ref, cand] = await Promise.all([openScene(browser, refUrl, vp), openScene(browser, candUrl, vp)]);
  for (const p of POINTS) {
    const [a, b] = await Promise.all([shoot(ref, p), shoot(cand, p)]);
    const { width, height } = a;
    const diff = new PNG({ width, height });
    const n = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1 });
    const pct = (100 * n) / (width * height);
    const tag = `${vp.join('x')}_p${p}`;
    rows.push({ viewport: vp.join('x'), p, diffPixels: n, diffPct: +pct.toFixed(3) });
    if (n > 0) {
      await writeFile(path.join(outDir, `${tag}_ref.png`), PNG.sync.write(a));
      await writeFile(path.join(outDir, `${tag}_cand.png`), PNG.sync.write(b));
      await writeFile(path.join(outDir, `${tag}_diff.png`), PNG.sync.write(diff));
    }
    console.log(`${tag.padEnd(18)} diff ${String(n).padStart(8)} px  (${pct.toFixed(3)}%)`);
  }
  await ref.close();
  await cand.close();
}
await writeFile(path.join(outDir, 'report.json'), JSON.stringify(rows, null, 2));
await browser.close();
