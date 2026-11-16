# HARMONY — SEO + GEO: מצב עבודה ומקורות

מסמך עוגן לפרויקט הקידום של harmony-bonds.com במנועי חיפוש ובמנועי AI. נוצר 16.11.2026.
התדריך המקורי: "תדריך ביצוע ל-Claude Code: SEO + GEO ל-harmony-bonds.com". הדו״ח המלא: Claude Docs, "דו״ח SEO + GEO — harmony-bonds.com".

| קובץ | מה יש בו |
|---|---|
| `WORKLOG.md` | יומן עבודה: כל משימה, איפה, איך נבדקה, מה פתוח |
| `QUESTIONNAIRE.md` | השאלון לסיון (סעיף 2 בתדריך) — מה עדיין חסר |
| `G2-terminology-review.md` | סקירת מינוח משפטי לעו״ד, 130 הקשרים, 3 שאלות |
| `ASSETS.md` | איפה נמצאות התמונות והסרטונים, ואיך משתמשים בהם |
| `PORTALS.md` | פורטלי התוכן: מה פורסם, לוח הפרסום, וממצאים על תוכן קיים |
| `snippets/` | הקוד שרץ באתר (WPCode), ה-Schema, ה-llms.txt, והבלוק שהוסר |

## מבנה הישויות (החלטת סיון)
HARMONY ← שייכת ל ← Sivan Invest Group ← נוסדה על ידי ← סיון מנחם. שני אתרים נפרדים.
מזהי Schema קבועים (חייבים להיות זהים בכל האתרים):
- HARMONY: `https://harmony-bonds.com/#/schema/Organization` (המזהה שתוסף The SEO Framework כבר מייצר; מאוחד איתו)
- Sivan Invest Group: `https://sivaninvestgroup.com/#organization`
- סיון מנחם: `https://sivaninvestgroup.com/#sivan-menahem`

## איך המערכת בנויה באתר HARMONY
- **תוסף SEO:** The SEO Framework (לא Slim SEO כפי שנכתב בתדריך). מפריד כותרות: `|`.
- **WPCode → Header & Footer:** בלוק Schema של הישויות (`snippets/header-entity.html`).
- **WPCode → Snippet "HARMONY SEO CORE v1" (ID 988254, PHP, Run Everywhere):** `snippets/harmony-seo-core.php`.
  - שדות TSF זמינים ב-REST, חסימת `/wp/v2/users` לאנונימיים, robots.txt, hreflang x-default, hero WebP+eager, `/llms.txt` (מהאופציה `hb_llms_txt`), Article + FAQPage schema, כותרות אבטחה, 404 לארכיוני מחבר ריקים.
  - `.htaccess`: בלוק `HARMONY-SEO` בראש הקובץ (HTTPS 301 + 4 כותרות אבטחה). הגיבוי המקורי שמור באופציה `hb_htaccess_backup`. שחזור: להיכנס כמנהל ל-`/wp-admin/?hb_htaccess=restore`.
- **ניקוי מטמון:** סרגל הניהול → FlyingPress → Purge and Preload Cache.
- **פרטי גישה:** רק ב-`.env` מחוץ ל-git. לא בקבצים האלה.
