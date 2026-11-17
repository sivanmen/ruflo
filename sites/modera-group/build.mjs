#!/usr/bin/env node
/**
 * Static site generator for modera-group.com.
 * Renders every page in every language into ./dist, plus sitemap, robots and llms.txt.
 * Zero dependencies — Node 20+.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, LANGS, PAGES } from './src/config/site.mjs';
import { href, abs, plain } from './src/templates/util.mjs';
import { page, breadcrumbs } from './src/templates/layout.mjs';
import { homeBody, faqLd } from './src/templates/home.mjs';
import { insightsIndex, articleBody, articleLd } from './src/templates/insights.mjs';
import {
  pageHero, servicesBody, servicesLd, sectorsBody, projectsBody, aboutBody,
  teamBody, teamLd, contactBody, creditsBody, privacyBody, notFoundBody,
} from './src/templates/pages.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

const credits = readJSON(join(SRC, 'data/credits.json'));
const en = { site: readJSON(join(SRC, 'content/en/site.json')), articles: readJSON(join(SRC, 'content/en/articles.json')) };

/** Load a language, falling back to English for any missing file. */
function load(code) {
  const dir = join(SRC, 'content', code);
  const site = existsSync(join(dir, 'site.json')) ? readJSON(join(dir, 'site.json')) : null;
  const articles = existsSync(join(dir, 'articles.json')) ? readJSON(join(dir, 'articles.json')) : null;
  if (!site || !articles) console.warn(`  ! ${code}: missing content, using English fallback`);
  return { site: site || en.site, articles: (articles || en.articles).sort((a, b) => b.date.localeCompare(a.date)), complete: !!(site && articles) };
}

const hasPhoto = (name) => existsSync(join(SRC, 'assets/img/team', `${name}.webp`));
const write = (p, html) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
const alternatesFor = (path) => Object.fromEntries(LANGS.map((l) => [l.code, href(l.code, path)]));
const sitemap = [];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true });
// Bundle CSS modules (ordered by filename) into one stylesheet.
const css = readdirSync(join(SRC, 'styles')).filter((f) => f.endsWith('.css')).sort()
  .map((f) => readFileSync(join(SRC, 'styles', f), 'utf8')).join('\n');
write(join(OUT, 'assets/css/main.css'), css);

for (const L of LANGS) {
  const { site: t, articles, complete } = load(L.code);
  const lang = L.code;

  for (const P of PAGES) {
    const path = href(lang, P.path);
    const meta = t.meta[P.key];
    const trail = P.key === 'home' ? [] : [{ name: t.nav[P.key] || plain(meta.title).split('|')[0].trim(), path }];
    const crumbs = breadcrumbs(t, lang, trail);
    const graph = [{ '@type': 'WebPage', url: abs(path), name: plain(meta.title), inLanguage: lang, isPartOf: { '@id': `${SITE.domain}/#website` } }];
    if (trail.length) graph.push(crumbs.ld);

    let body;
    let image = 'hero-villa';
    switch (P.key) {
      case 'home': body = homeBody(t, lang, articles); graph.push(faqLd(t.home.faq)); break;
      case 'services': body = pageHero(t.services.hero, 'services', crumbs.html) + servicesBody(t, lang); graph.push(servicesLd(t, lang)); image = 'crane'; break;
      case 'sectors': body = pageHero(t.sectors.hero, 'sectors', crumbs.html) + sectorsBody(t, lang); image = 'resort-pool'; break;
      case 'projects': body = pageHero(t.projects.hero, 'projects', crumbs.html) + projectsBody(t, lang); image = 'infinity-pool'; break;
      case 'about': body = pageHero(t.about.hero, 'about', crumbs.html) + aboutBody(t, lang); image = 'chania-harbour'; break;
      case 'team': body = pageHero(t.team.hero, 'team', crumbs.html) + teamBody(t, lang, hasPhoto); graph.push(...teamLd(t)); break;
      case 'insights': body = pageHero(t.insights.hero, 'insights', crumbs.html) + insightsIndex(t, lang, articles); break;
      case 'contact': body = pageHero(t.contact.hero, 'contact', crumbs.html) + contactBody(t, lang); graph[0]['@type'] = 'ContactPage'; break;
      case 'credits': body = pageHero({ eyebrow: '', title: t.credits.title, lead: '' }, 'credits', crumbs.html) + creditsBody(t, credits); break;
      case 'privacy': body = pageHero({ eyebrow: '', title: t.privacy.title, lead: '' }, 'privacy', crumbs.html) + privacyBody(t); break;
      default: throw new Error(`Unknown page ${P.key}`);
    }
    write(join(OUT, path, 'index.html'), page({
      t, lang, key: P.key, title: meta.title, description: meta.description, path,
      alternates: alternatesFor(P.path), image, graph, body, bodyClass: P.key === 'home' ? 'has-hero' : 'has-phero',
    }));
    sitemap.push({ path: P.path, priority: P.key === 'home' ? '1.0' : P.key === 'credits' || P.key === 'privacy' ? '0.3' : '0.8' });
  }

  for (const a of articles) {
    const p = `insights/${a.slug}`;
    const path = href(lang, p);
    const crumbs = breadcrumbs(t, lang, [{ name: t.nav.insights, path: href(lang, 'insights') }, { name: a.title, path }]);
    const graph = [articleLd(a, t, lang), crumbs.ld];
    if (a.faq?.length) graph.push(faqLd(a.faq));
    write(join(OUT, path, 'index.html'), page({
      t, lang, key: 'article', title: `${a.title} | ${SITE.name}`, description: a.description, path,
      alternates: alternatesFor(p), image: a.image, graph, body: articleBody(a, t, lang, articles, crumbs.html), bodyClass: 'has-phero',
    }));
    if (lang === 'en') sitemap.push({ path: p, priority: '0.7', date: a.date });
  }

  write(join(OUT, lang, '404.html'), page({
    t, lang, key: 'notfound', title: t.meta.notFound.title, description: t.meta.notFound.description,
    path: href(lang, '404'), alternates: alternatesFor('404'), body: notFoundBody(t, lang), noindex: true,
  }));
  console.log(`  ✓ ${lang}${complete ? '' : ' (fallback)'}`);
}

// Root: language negotiation with crawlable links (x-default = English).
const langLinks = LANGS.map((l) => `<a href="/${l.code}/" hreflang="${l.code}" lang="${l.code}">${l.label}</a>`).join(' · ');
write(join(OUT, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${SITE.name} — Construction & Development in Crete, Greece</title>
<meta name="description" content="${en.site.meta.home.description}">
<link rel="canonical" href="${SITE.domain}/en/">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE.domain}/${l.code}/">`).join('')}
<link rel="alternate" hreflang="x-default" href="${SITE.domain}/">
<link rel="icon" href="/assets/img/brand/favicon.png" type="image/png">
<script>(function(){var s=${JSON.stringify(LANGS.map((l) => l.code))},p=(navigator.languages||[navigator.language||'en']).map(function(x){return x.slice(0,2).toLowerCase()}),m='en';try{var k=localStorage.getItem('modera-lang');if(k&&s.indexOf(k)>-1)m=k;else for(var i=0;i<p.length;i++)if(s.indexOf(p[i])>-1){m=p[i];break}}catch(e){}location.replace('/'+m+'/')})();</script>
<noscript><meta http-equiv="refresh" content="0; url=/en/"></noscript>
<style>body{font:16px/1.6 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;color:#0f1b2a}a{color:#8a6436}</style>
</head><body><p>${langLinks}</p></body></html>`);
write(join(OUT, '404.html'), readFileSync(join(OUT, 'en', '404.html'), 'utf8'));

// Sitemap with hreflang alternates.
const urls = sitemap.filter((s, i, arr) => arr.findIndex((x) => x.path === s.path) === i).flatMap((s) => LANGS.map((l) => `<url><loc>${abs(href(l.code, s.path))}</loc>${s.date ? `<lastmod>${s.date}</lastmod>` : ''}<priority>${s.priority}</priority>${LANGS.map((x) => `<xhtml:link rel="alternate" hreflang="${x.code}" href="${abs(href(x.code, s.path))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${abs(href('en', s.path))}"/></url>`));
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);

// robots.txt — welcome search and AI crawlers.
write(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\n# AI search & assistants are welcome\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);

// llms.txt — concise, citable summary for AI systems.
const s = en.site;
write(join(OUT, 'llms.txt'), `# ${SITE.name}

> ${plain(s.meta.home.description)}

${SITE.name} is a construction, development and engineering-management company headquartered at ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}, ${SITE.address.region}, ${SITE.address.countryName} (tax no. ${SITE.taxNo}). Contact: ${SITE.email}, ${SITE.phoneDisplay}. More than 10 years of experience and more than 60 projects delivered and managed. Strategic partners: Sivan Invest Group and the Harmony Fund. Languages: ${LANGS.map((l) => l.label).join(', ')}.

## Services
${s.services.items.map((i) => `- [${i.title}](${abs(href('en', 'services'))}#${i.id}): ${i.short}`).join('\n')}

## Sectors
${s.sectors.items.map((i) => `- [${i.title}](${abs(href('en', 'sectors'))}#${i.id}): ${i.short} Typical duration ${i.duration}.`).join('\n')}

## Key pages
- [About](${abs(href('en', 'about'))})
- [Team](${abs(href('en', 'team'))})
- [Projects](${abs(href('en', 'projects'))})
- [Contact](${abs(href('en', 'contact'))})

## Insights
${en.articles.map((a) => `- [${a.title}](${abs(href('en', `insights/${a.slug}`))}): ${a.description}`).join('\n')}
`);

writeFileSync(join(OUT, 'favicon.png'), readFileSync(join(SRC, 'assets/img/brand/favicon.png')));
console.log(`Built ${new Set(sitemap.map((s) => s.path)).size} routes × ${LANGS.length} languages → dist/`);
