// Generate favicons, app icons and the Open Graph share image with headless Chromium.
// Usage: node scripts/brand-assets.mjs   (requires Playwright)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = (f) => path.join(ROOT, 'dist/assets/brand', f);
const crown = fs.readFileSync(out('crown-gold.svg'), 'utf8');
const fontCss = fs.readFileSync(path.join(ROOT, 'dist/assets/fonts/latin.css'), 'utf8').replaceAll('/assets/fonts/', `file://${ROOT}/dist/assets/fonts/`);
const b64 = (p) => `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`;
fs.writeFileSync(out('favicon.svg'), crown.replace('viewBox="0 0 283 162"', 'viewBox="-10 -70 303 303"'));

const browser = await chromium.launch();
const page = await browser.newPage();
const icon = async (size, file, bg) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${bg}">${crown.replace('<svg ', `<svg style="width:${Math.round(size * (bg === 'transparent' ? 0.96 : 0.66))}px" `)}</body>`);
  await page.screenshot({ path: out(file), omitBackground: bg === 'transparent' });
};
await icon(32, 'favicon-32.png', 'transparent');
await icon(180, 'apple-touch-icon.png', '#0E0E0D');
await icon(192, 'icon-192.png', '#0E0E0D');
await icon(512, 'icon-512.png', '#0E0E0D');
await icon(512, 'logo-512.png', '#FAF8F4');

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<html><head><style>${fontCss}
body{margin:0;width:1200px;height:630px;position:relative;font-family:Inter;color:#fff;overflow:hidden}
.bg{position:absolute;inset:0;background:url(${b64(path.join(ROOT, 'dist/assets/img/cliff-sea-1600.jpg').replace('-1600.jpg', '-960.jpg'))}) center/cover}
.sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,9,.82),rgba(10,10,9,.2))}
.c{position:absolute;left:80px;top:150px}.c svg{width:120px;margin-bottom:28px}
h1{font-family:'Cormorant Garamond';font-weight:300;font-size:92px;letter-spacing:.12em;margin:0;line-height:1}
p{letter-spacing:.42em;font-size:18px;color:#D9BC85;margin:18px 0 40px}
span{font-size:26px;font-weight:300}</style></head><body><div class="bg"></div><div class="sh"></div>
<div class="c">${crown}<h1>KING SOLOMON</h1><p>KALYVES | CRETE</p><span>21 cliffside villas with private pools · from €507,104</span></div></body></html>`);
await page.waitForTimeout(400);
await page.screenshot({ path: out('og-image.jpg'), type: 'jpeg', quality: 86 });
await browser.close();
console.log('brand assets ok');
