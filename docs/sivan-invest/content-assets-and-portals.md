# Sivan Invest Group: content assets, portals and publishing playbook

Permanent reference for every content, SEO and GEO task for Sivan Invest Group (סיון השקעות).
Credentials are **never** stored here. WordPress application passwords live in the cloud
environment's network secrets (main site) or are supplied per session.

## 1. Media sources (in priority order)

### 1.1 Local media on Sivan's Mac (real photos: always preferred for project and brand content)

| Folder | Path | Size | Contents |
| --- | --- | --- | --- |
| Portrait photos of Sivan | `~/Documents/SivanInvest/תמונות פורטרט סיון` | ~110 MB, 64 items | Portraits of Sivan Menahem: author box, About page, Person schema image |
| Crete photos | `~/Documents/SivanInvest/תמונות כריתים` | ~1.16 GB, 196 items | Real photos of Crete, Chania and Kalyves: featured images, project pages |
| Crete videos | `~/Documents/SivanInvest/וידאו כריתים` | ~6.85 GB, 43 items | Raw Crete footage: reels, YouTube, page hero video |

Full path prefix: `/Users/sivanmenahem/Documents/SivanInvest/`.

Access from a cloud session: the folder must be served to the session via Remote Control
(Claude desktop app → Settings → Claude Code → Remote Control, then add the
`SivanInvest` folder). As of 16.11.2026 no folder was shared, so cloud sessions could not
read these files.

Use rules:
- Real project photos (King Solomon, Kalyves) must come from these folders, never from AI, so nothing misrepresents the project.
- Portraits of Sivan are only for content that is genuinely about or by Sivan.
- Strip EXIF GPS before upload; convert to WebP at a maximum width of 1536px; write a Hebrew alt text.

### 1.2 Online image libraries (skill: `openverse`)

- Openverse API: `https://api.openverse.org/v1/images/?q=...&license=cc0` (images), `/v1/audio/` (audio).
- Use only `license=cc0` (no credit needed) or `by` (credit line required in the post).
- Wikimedia originals returned **429** from the cloud on 16.11.2026. Download from the user's browser, or pick another source.
- Confirm the license on the item's own page before publishing.

### 1.3 AI image generation (for editorial or illustrative images only)

Style of all four sites: photorealistic, documentary/magazine look, natural light, Greek or Crete settings, **no text, letters, logos, icons or watermarks**, 16:9.

| Tool | How | Notes |
| --- | --- | --- |
| Porter (`creative.generate`, profile `image.text`, aspect `16:9`, `sync: true`) | Returns a downloadable PNG URL (~1376×768) | Paid credits; ran out after 7 images on 16.11.2026 |
| Canva `generate-image` | Returns only a thumbnail. For full resolution: `create-design` (Presentation 16:9, brief "full-bleed photo only, no text", reference = media id) → `export-design` PNG at width 1920 | Works; check the export for added text |
| Figma `generate_image` | Needs a design file (plan "moon") | AI credits reset daily (UTC) |

## 2. Sites

| Site | Role | Notes |
| --- | --- | --- |
| sivaninvestgroup.com | Brand home: pillar pages, guides, projects | Main site of the SEO/GEO report (16.11.2026) |
| alphaclub.online | Hebrew economics and real-estate portal | Categories: 70 נדל״ן ביוון, 74 נדל״ן בחאניה, 64 נדל״ן, 60 קרנות והשקעות, 215 קרן HARMONY |
| finansi.space | Hebrew finance portal | Categories: 68 מיסוי רגולציה ומימון, 70 נדל״ן ביוון, 72 נדל״ן בכריתים, 74 נדל״ן בחאניה, 66 שווקי נדל״ן בינלאומיים |
| betamind.online | Hebrew economics portal | Categories: 70 נדל״ן ביוון, 72 נדל״ן בכריתים, 74 נדל״ן בחאניה, 62 ניהול סיכונים ואסטרטגיה, 68 מיסוי רגולציה ומימון |

All three portals: WordPress + Elementor + Yoast. Author ID 2 (login `sivanmen`) is the existing byline.
A Code Snippets snippet ("Expose Yoast SEO fields to REST") exposes `_yoast_wpseo_title`,
`_yoast_wpseo_metadesc` and `_yoast_wpseo_focuskw` to the REST API on every portal.

## 3. Canonical facts (only these may be published)

| Fact | Value |
| --- | --- |
| Brand name | Sivan Invest Group (סיון השקעות) |
| Founder & CEO | סיון מנחם (Sivan Menahem) |
| Experience | 20+ years in investments and real estate |
| Office | Pl. Eleftherias 2, 73132 Chania |
| Entities | SivanInvest King Solomon (development), Sivan Menahem Management (property management) |
| King Solomon | 21 villas, Kalyves, Apokoronas, Chania; 1, 2, 3 and 5 bedrooms |
| Transfer tax | 3% + 3% municipal surcharge on the tax = 3.09% |
| Capital gains tax | 15%, suspended for individuals until 31.12.2026 (recheck on 2.1.2027) |
| Bank financing (LTV) | Usually 50%–60% for foreign investors |
| Golden Visa | €800K (Attica, Thessaloniki, Mykonos, Santorini, islands >3,100 residents incl. Crete); €400K elsewhere; €250K only for commercial-to-residential conversion or listed-building restoration; single property ≥120 m² |
| Golden Visa status | 5-year renewable residence permit. Not citizenship, not permanent residency |
| Golden Visa STR | Short-term rental prohibited (Circular 1/2026) |

Pending Sivan's approval (do **not** publish yet): number of projects (54 vs 10), clients (248 vs 1,200),
assets under management (₪107M vs ₪100M), King Solomon prices and delivery date, HARMONY minimum and yield.

Never write: "guaranteed return", "risk-free", "citizenship" for the Golden Visa, or "0% tax" without its condition and date.

## 4. Article spec (portals)

- 600–1,400 words (first wave: ~550–800); one H1 (the title); 40–60-word direct-answer paragraph at the top, with a number and the brand.
- Question-style H2s; at least one data table with source and date; a "risks / what to check" section.
- 3–5 FAQs + `FAQPage` JSON-LD in the content.
- 1–2 natural links to sivaninvestgroup.com pillar pages, with varied anchor text.
- Visible "updated" line and disclosure: *"הפורטל פועל בשיתוף תוכן עם Sivan Invest Group, המוזכרת בכתבה. המידע כללי ואינו מהווה ייעוץ השקעות, מס או משפט."*
  The portals share an owner with the group, so the disclosure stays. Hiding the relationship breaks Google's link-spam policy and Israeli investment-marketing rules, and it lowers trust with AI engines.
- Yoast title ≤60 characters, meta description 140–155 characters, focus keyword, Latin slug ≤5 words, 5 tags.
- Every article gets its own unique image; a different angle per site, and no duplicated text across sites.

## 5. Publishing log

| Date | Site | Post | Title | Scheduled |
| --- | --- | --- | --- | --- |
| 16.11.2026 | alphaclub.online | 3832 | השקעות נדל״ן ביוון 2026: המספרים שכל משקיע ישראלי צריך לדעת | 18.11 09:00 |
| 16.11.2026 | alphaclub.online | 3834 | ויזת זהב ביוון 2026: הספים החדשים, הטעויות הנפוצות ומה היא לא נותנת | 19.11 09:00 |
| 16.11.2026 | alphaclub.online | 3836 | יזם ישראלי בכרתים: איך עובד מודל "הכול תחת קורת גג אחת" | 20.11 09:00 |
| 16.11.2026 | finansi.space | 3428 | מיסוי נדל״ן ביוון לישראלים: מס העברה, ENFIA, שכירות ומס רווחי הון | 19.11 09:00 |
| 16.11.2026 | finansi.space | 3430 | קאליבס ואפוקורונאס: מדריך אזור | 20.11 09:00 |
| 16.11.2026 | finansi.space | 3432 | יוון, קפריסין, פורטוגל או ספרד: איפה להשקיע ב-2026 | 21.11 09:00 |
| 16.11.2026 | betamind.online | 5903 | קנייה על הנייר ביוון: נאמנות, ערבויות ומה מגן על הרוכש | 19.11 09:00 |
| 16.11.2026 | betamind.online | 5901 | השכרה לטווח קצר ביוון 2026 | 20.11 09:00 |
| 16.11.2026 | betamind.online | 5905 | הסיכונים בהשקעת נדל״ן ביוון ואיך מנהלים אותם | 21.11 09:00 |
