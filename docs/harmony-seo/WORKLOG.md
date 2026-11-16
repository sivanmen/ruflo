# WORKLOG — HARMONY SEO + GEO

| תאריך | משימה | מה נעשה | איפה | בדיקה | פתוח |
|---|---|---|---|---|---|
| 16.11.2026 | A0 | גיבוי REST מלא: 77 עמודים, 41 פוסטים (כולל Elementor), מדיה, תפריטים, snippets, ‎.htaccess; HTML של 39 URLs | סשן Claude (scratchpad) | קבצים קיימים | גיבוי DB וקבצים מלא דרך האחסון — מומלץ לבצע גם ברמת השרת |
| 16.11.2026 | A1 | הוסר בלוק FinancialProduct ("debt fund", "€200M", "2015") | WPCode → Header | `curl … \| grep -c FinancialProduct` = 0 בבית ובמאמר | — |
| 16.11.2026 | A2 | גרף ישויות: HARMONY (Organization+FinancialService) ← Sivan Invest Group ← סיון מנחם; רק שדות מאומתים | WPCode → Header | JSON תקין, 3 ישויות, מאוחד עם ה-Organization של TSF | כתובת, טלפון, שנת ייסוד, LinkedIn — מחכים לשאלון. אותו בלוק צריך לעלות ל-sivaninvestgroup.com (אין גישה) |
| 16.11.2026 | A3 | כותרות ותיאורים חדשים ל-8 עמודים; מפריד `\|`; "קרן נאמנות"/"trust fund" הוחלפו בניסוח הזמני בבית HE+EN | TSF meta | סקריפט: אורכים 36–69, אין כפילויות | תיאור עמוד אודות אחרי B |
| 16.11.2026 | A5 | ‎/ty/‎ noindex + הוצא מה-sitemap | TSF | robots=noindex; ty=0 ב-sitemap | — |
| 16.11.2026 | A6 | hreflang x-default; robots.txt מצביע על `sitemap.xml?lang=en` (מכיל את 7 העמודים באנגלית) במקום ‎/en/sitemap.xml (404) | snippet | שני ה-Sitemap ב-robots מחזירים 200 | — |
| 16.11.2026 | A7 | Hero: PNG 1.57MB → WebP 40KB, ‏eager + fetchpriority=high, preload | snippet + media 988284 | HTML ו-preload מצביעים על ‎.webp | מדידת LCP ב-pagespeed (סיון) |
| 16.11.2026 | A8 | ‎/llms.txt‎ בעברית ובאנגלית, 20 מדריכים | אופציה `hb_llms_txt` | 200, text/plain | עמוד המייסד יתווסף אחרי B1 |
| 16.11.2026 | A9 | HSTS, nosniff, Referrer-Policy, Permissions-Policy | ‎.htaccess‎ + PHP | `curl -sI` מציג 4 כותרות | לוודא עם סיון שטופס ההתאמה נשלח |
| 16.11.2026 | A10 | ‎http→https‎ 301; ‎/wp/v2/users‎ חסום לאנונימיים (401); ‎?author=‎ מופנה לבית | ‎.htaccess‎ + snippet | 301 / 401 / 301 | מומלץ לשנות את שם המשתמש `admin` |
| 16.11.2026 | A12 | 20 הפוסטים הועברו למשתמש "סיון מנחם" (slug sivan-menahem); ‎/author/admin/‎ ‏404 | WP users | Article.author = Person של סיון | ביו + תמונת פרופיל (מתיקיית הפורטרטים) |
| 16.11.2026 | A13 | Article schema לכל 20 הפוסטים; FAQPage למדריך (2 שאלות — השאלה על "תשואה מובטחת" ממתינה ל-G2) | snippet | בדיקה על 20 פוסטים | — |
| 16.11.2026 | A14 | פוטר HE/EN: "HARMONY היא חלק מקבוצת Sivan Invest Group" + קישור ל-King Solomon | Elementor footer 3007 | מופיע בכל העמודים | קישור חוזר מ-sivaninvestgroup.com ומ-kingsolomoncrete.com — אין גישה |
| 16.11.2026 | B6 | ‎/press/‎: הוסר "נכתבו על ידי גורמים חיצוניים"/"תוכן עריכתי של גופי התקשורת"; נוסף גילוי נאות שהפורטלים בבעלות הקבוצה | Elementor page 988160 | grep | — |
| 16.11.2026 | G2 | סריקה: 130 הקשרים ייחודיים; קובץ לעו״ד עם 3 שאלות וחלופות | `G2-terminology-review.md` | — | **ממתין להחלטת עו״ד** |
| 16.11.2026 | C | 9 מאמרים מקוריים (#4–#12 בתדריך) עם תמונה, Yoast, קטגוריות, תגיות, גילוי נאות, מחבר אמיתי; 1 פורסם, 8 מתוזמנים שבועית | ראו `PORTALS.md` | עמוד חי נבדק (200, schema, og:image) | — |

## לא בוצע / חסום
- **A4** (שורת הסבר מעל ה-H1) ו-**B1–B5, B7–B8**: דורשים נתונים מהשאלון (ביוגרפיה, פרויקטים, נתונים, אנשי מקצוע, פרטי חברה).
- **A11** (Search Console, Bing, IndexNow): דורש את סיון.
- **sivaninvestgroup.com, kingsolomoncrete.com**: אין פרטי גישה תקפים (ה-Application Password המוזרק ל-sivaninvestgroup.com נדחה).
- **מאמרים #1–#3, #13–#14** בתוכנית C: באתרים שאין אליהם גישה / שלא צוינו.
