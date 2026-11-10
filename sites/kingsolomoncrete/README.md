# King Solomon · www.kingsolomoncrete.com

Static, multilingual marketing website for the King Solomon cliffside villas in Kalyves, Crete.
Hand-written code with no CMS and no runtime dependencies. The `dist/` folder **is the website**: upload it as-is.

## Languages and URLs
English is the default at `/`. Other languages: `/he/`, `/ar/`, `/fr/`, `/de/`, `/es/`, `/el/`.

| Page | Path |
|---|---|
| Home | `/` |
| Villas & availability | `/villas/` |
| 1 / 2 / 3 / 5 bedroom villas | `/villas/1-bedroom/` … `/villas/5-bedroom/` |
| The project | `/the-project/` |
| Gallery & downloads | `/gallery/` |
| Developer | `/developer/` |
| Contact | `/contact/` |
| Paid-ads landing page (footer only, `noindex`) | `/private-offer/` |
| Privacy, Cookies, Terms, Accessibility | `/privacy-policy/`, `/cookie-policy/`, `/terms/`, `/accessibility/` |

## Upload to the server
1. Point `www.kingsolomoncrete.com` to the hosting and enable HTTPS (Let's Encrypt).
2. Upload the **contents** of `dist/` to the web root (`public_html`).
3. Apache reads `dist/.htaccess` (HTTPS + www redirect, caching, compression, security headers, CSP).
   For nginx, use `dist/nginx.conf.example`.
4. The forms post to `/api/lead.php` (PHP 8+). Set the server environment variables, or create
   `api/config.local.php` returning an array (never commit it):
   - `KS_LEAD_TO`: who receives leads (default `support@sivaninvestgroup.com`)
   - `KS_LEAD_FROM`: a sender on the domain, e.g. `no-reply@kingsolomoncrete.com`
   - `KS_LEAD_WEBHOOK` (optional): HTTPS URL of a CRM / Make / Zapier hook receiving each lead as JSON
5. Submit `https://www.kingsolomoncrete.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Edit content
- Texts: `content/<lang>/*.json` (same keys in every language).
- Prices, availability, areas, plans: `data/project.json` (status: `available` / `reserved` / `sold`).
- Contacts, analytics IDs, legal entity: `data/config.json`.
  Fill `tracking.ga4`, `tracking.googleAds`, `tracking.metaPixel` or `tracking.gtm`. They load **only after cookie consent** (Google Consent Mode v2).

Then rebuild (Node 20+):

```bash
npm run build && npm run check
```

## Structure
- `build/`: zero-dependency generator (templates, SEO, sitemap, hreflang, JSON-LD, llms.txt, server config)
- `static/`: CSS, JS and PHP sources (bundled into `dist/assets/`)
- `scripts/`: image optimisation (AVIF/WebP), font self-hosting, brand assets, QA checker
- `assets-src/` (not in git): original downloads; restore them with `scripts/fetch-assets.sh`
