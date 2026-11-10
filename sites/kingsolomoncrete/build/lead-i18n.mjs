// Translation table for the lead e-mail (read by api/lead.php): labels and option texts per language.
import { writeFile } from './lib/util.mjs';
import { createContext, config, project } from './lib/context.mjs';

export function writeLeadI18n() {
  const out = {};
  for (const L of config.languages) {
    const ctx = createContext(L.code);
    const villa = {};
    project.collections.forEach((c) => (villa[c.slug] = ctx.tr(`common.collections.${c.slug}.name`)));
    project.villas.forEach((v) => {
      villa[`villa-${v.no}`] = `${ctx.tr('common.labels.villa')} ${v.no} · ${ctx.tr(v.bedrooms > 1 ? 'common.labels.bedroomsN' : 'common.labels.bedroomN', { n: v.bedrooms })}`;
    });
    out[L.code] = {
      langName: ctx.tr('common.langName'),
      dir: L.dir,
      labels: {
        name: ctx.tr('common.form.name'), phone: ctx.tr('common.form.phone'), email: ctx.tr('common.form.email'),
        country: ctx.tr('common.form.country'), villa: ctx.tr('common.form.villa'), budget: ctx.tr('common.form.budget'),
        pref: ctx.tr('common.form.contactPref'), message: ctx.tr('common.form.message').replace(/\s*\(.*?\)\s*$/, ''),
      },
      villaAny: ctx.tr('common.form.villaAny'),
      budget: ctx.raw('common.form.budgetOptions'),
      pref: ctx.raw('common.form.contactPrefOptions'),
      villa,
      email: ctx.raw('common.leadEmail'),
      request: { label: ctx.tr('common.form.requestLabel'), options: ctx.raw('common.form.requestOptions') },
    };
  }
  writeFile('api/lead-i18n.json', JSON.stringify(out));
}
