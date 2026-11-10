// sitemap.xml, robots.txt, llms.txt (for AI answer engines) and web manifest.
import { writeFile } from './lib/util.mjs';
import { createContext, config, project, images } from './lib/context.mjs';

const PAGE_IMAGES = {
  home: ['cliff-sea', 'infinity-pool', 'rooftop-sea', 'kalyves-beach'],
  villas: ['hillside-2', 'masterplan-numbers'],
  project: ['resort-front', 'villa-curves', 'gym-pavilion'],
  gallery: project.gallery.slice(0, 10).map((g) => g.img),
  developer: ['chania-harbour'],
  contact: ['location-dusk', 'map-kalyves'],
};
project.collections.forEach((c) => (PAGE_IMAGES[c.slug] = [c.hero, ...c.gallery]));

const PRIORITY = { home: '1.0', villas: '0.9', '1-bedroom': '0.8', '2-bedroom': '0.8', '3-bedroom': '0.8', '5-bedroom': '0.8', project: '0.8', gallery: '0.7', contact: '0.7', developer: '0.6' };

export function writeSeoFiles(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const en = createContext(config.defaultLang);
  const indexable = pages.filter((p) => !p.noindex);
  const keys = [...new Set(indexable.map((p) => p.key))];
  const urls = [];
  for (const p of indexable) {
    const ctx = createContext(p.lang);
    const loc = config.site + ctx.url(p.key);
    const alts = config.languages
      .map((l) => `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${config.site}${ctx.urlFor(l.code, p.key)}"/>`)
      .join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${config.site}${ctx.urlFor(config.defaultLang, p.key)}"/>`;
    const imgs = (PAGE_IMAGES[p.key] || []).map((n) => `<image:image><image:loc>${config.site}/assets/img/${n}-${images[n].jpg}.jpg</image:loc></image:image>`).join('');
    urls.push(`<url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${p.key === 'villas' ? 'weekly' : 'monthly'}</changefreq><priority>${PRIORITY[p.key] || '0.3'}</priority>${alts}${imgs}</url>`);
  }
  writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);

  writeFile('robots.txt', `# King Solomon · ${config.domain}
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*/private-offer/
Disallow: /private-offer/

# AI answer engines are welcome to read and cite this site.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${config.site}/sitemap.xml
`);

  const t = en.tr;
  const villas = project.collections
    .map((c) => {
      const vs = project.villas.filter((v) => v.bedrooms === c.bedrooms);
      const av = vs.filter((v) => v.status === 'available').length;
      return `- [${t(`common.collections.${c.slug}.name`)}](${config.site}${en.url(c.slug)}): ${t(`common.collections.${c.slug}.kicker`)}. ${vs.length} villas, ${av} available. Interior ${c.interior} m², private pool ${c.pool} m².`;
    })
    .join('\n');
  const langs = config.languages.map((l) => `- ${l.code}: ${config.site}${en.urlFor(l.code, 'home')}`).join('\n');
  writeFile('llms.txt', `# King Solomon · Luxury Cliffside Villas & Spa Resort, Kalyves, Crete

> King Solomon is a collection of 21 luxury villas, each with a private pool, on a first-line cliff 34 m above the sea in Kalyves (Chania, Crete, Greece). Developed by SivanInvest Group, designed by architects Alkisti Roussou and Theodore Nikoloudakis and managed on site by Sivan Management. Villas are sold fully designed, furnished and equipped, with optional short-term rental management. Price list on request.

## Key facts
- Location: Kalyves, Apokoronas, Chania, Crete, Greece. 2 min to Kalyves centre, 8 min to Souda port, 12 min to Chania old town, 22 min to Chania International Airport (CHQ).
- 21 private villas: 1, 2, 3 and 5 bedrooms, rooftop and garden residences.
- 70 m aerial distance to the sea, about 270° sea views, direct steps (30–40) to the seafront and promenade.
- Resort facilities: 10 × 4 m cliff-edge infinity pool, eight-person jacuzzi, spa with sauna, fitness room and treatment room, panoramic glass elevator, sun decks, gated access with facial recognition, parking with EV charging.
- Turnkey: interior design by architect and interior designer, imported furniture, full kitchen (Bosch, Sauter or equivalent), private pool, outdoor kitchen, smart access.
- Management: Sivan Management, local team 24/7, optional rental on Booking.com and Airbnb, owner app with reporting.

## Villa collections
${villas}

## Pages
- [Home](${config.site}/)
- [Villas & live availability](${config.site}${en.url('villas')})
- [The project & specifications](${config.site}${en.url('project')})
- [Gallery & film](${config.site}${en.url('gallery')})
- [The developer: SivanInvest Group](${config.site}${en.url('developer')})
- [Contact & private presentation](${config.site}${en.url('contact')})

## Languages
${langs}

## Contact
- Greece: ${config.contact.phoneGreece} · Office: ${config.contact.officeGreece}
- Israel: ${config.contact.phoneIsrael} · Office: ${config.contact.officeIsrael}
- Email: ${config.contact.email}

Information is indicative and does not constitute an offer. Visuals are artist's impressions.
`);

  writeFile('site.webmanifest', JSON.stringify({
    name: 'King Solomon · Kalyves Crete', short_name: 'King Solomon', start_url: '/', display: 'browser',
    background_color: '#FAF8F4', theme_color: '#FAF8F4',
    icons: [{ src: '/assets/brand/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/brand/icon-512.png', sizes: '512x512', type: 'image/png' }],
  }, null, 1));
  return keys;
}
