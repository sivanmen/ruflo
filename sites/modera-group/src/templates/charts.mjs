import { CHARTS } from '../config/site.mjs';
import { esc } from './util.mjs';

const nf = (lang) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : lang);

/** Floating range bars: € / m² by building type (HTML, fully responsive). */
export function costChart(t, lang) {
  const max = 4500;
  const f = nf(lang);
  const pct = (v) => ((v / max) * 100).toFixed(2);
  const rows = CHARTS.cost.map(([a, b], i) => `<li class="hb-row" style="--d:${i * 90}ms">
    <span class="hb-label">${esc(t.charts.costTypes[i])}</span>
    <span class="hb-track"><span class="hb-bar${i === 3 ? ' is-key' : ''}" style="--a:${pct(a)}%;--b:${pct(b)}%"></span></span>
    <span class="hb-val">€${f.format(a)}–${f.format(b)}</span>
  </li>`).join('');
  const ticks = [0, 1000, 2000, 3000, 4000].map((v) => `<span style="--x:${pct(v)}%">${f.format(v)}</span>`).join('');
  return `<div class="hb" role="img" aria-label="${esc(t.home.charts.costTitle)}"><ol>${rows}</ol><div class="hb-axis" aria-hidden="true">${ticks}</div></div>`;
}

/** Gantt-style programme (HTML). */
export function timelineChart(t) {
  const months = 24;
  const pct = (m) => ((m / months) * 100).toFixed(2);
  const rows = CHARTS.timeline.map(([a, b], i) => `<li class="hb-row hb-gantt" style="--d:${i * 110}ms">
    <span class="hb-label">${esc(t.charts.phases[i])} <em>${a}–${b}</em></span>
    <span class="hb-track"><span class="hb-bar${i === 3 ? ' is-key' : ''}" style="--a:${pct(a)}%;--b:${pct(b)}%"></span></span>
  </li>`).join('');
  const ticks = [0, 6, 12, 18, 24].map((m) => `<span style="--x:${pct(m)}%">${m}</span>`).join('');
  return `<div class="hb" role="img" aria-label="${esc(t.home.charts.timelineTitle)}"><ol>${rows}</ol><div class="hb-axis" aria-hidden="true">${ticks}</div><p class="hb-unit">${esc(t.charts.month)}</p></div>`;
}

/** Donut with legend. */
export function splitChart(t) {
  const data = CHARTS.split;
  const r = 70, c = 2 * Math.PI * r;
  let acc = 0;
  const arcs = data.map((v, i) => {
    const len = (v / 100) * c;
    const seg = `<circle r="${r}" cx="100" cy="100" class="c-arc c-arc-${i}" stroke-dasharray="${len - 2} ${c}" stroke-dashoffset="${-acc}" style="--d:${i * 120}ms"/>`;
    acc += len;
    return seg;
  }).join('');
  const legend = data.map((v, i) => `<li><i class="sw sw-${i}"></i><span>${esc(t.charts.split[i])}</span><b>${v}%</b></li>`).join('');
  return `<div class="donut"><svg class="chart chart-split" viewBox="0 0 200 200" role="img" aria-label="${esc(t.home.charts.mixTitle)}"><g transform="rotate(-90 100 100)">${arcs}</g><text x="100" y="110" text-anchor="middle" class="c-big">100%</text></svg><ul class="legend">${legend}</ul></div>`;
}

/** Column chart: tourist arrivals. */
export function arrivalsChart(t, lang) {
  const { years, values } = CHARTS.arrivals;
  const W = 600, H = 260, top = 24, bottom = 30, max = 40;
  const bw = W / years.length;
  const f = nf(lang);
  const cols = years.map((yr, i) => {
    const h = (values[i] / max) * (H - top - bottom);
    const x = i * bw + bw * 0.2;
    const y = H - bottom - h;
    return `<g class="c-col" style="--d:${i * 90}ms"><rect x="${x}" y="${y}" width="${bw * 0.6}" height="${h}" rx="6" class="c-range ${i === years.length - 1 ? 'is-key' : ''}"/><text x="${x + bw * 0.3}" y="${y - 8}" text-anchor="middle" class="c-val">${f.format(values[i])}</text><text x="${x + bw * 0.3}" y="${H - 8}" text-anchor="middle" class="c-tick">${yr}</text></g>`;
  }).join('');
  return `<svg class="chart chart-arrivals" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.charts.arrivals)}"><line x1="0" x2="${W}" y1="${H - bottom}" y2="${H - bottom}" class="c-grid"/>${cols}</svg>`;
}

/** Figure wrapper used in articles and pages. */
export function chartFigure(id, t, lang) {
  const map = {
    cost: [t.home.charts.costTitle, () => costChart(t, lang), t.common.indicative],
    timeline: [t.home.charts.timelineTitle, () => timelineChart(t), t.common.indicative],
    split: [t.home.charts.mixTitle, () => splitChart(t), t.common.indicative],
    arrivals: [t.charts.arrivals, () => arrivalsChart(t, lang), `${t.common.source}: Bank of Greece, INSETE (rounded).`],
  };
  const [title, render, note] = map[id] || [];
  if (!render) return '';
  return `<figure class="chart-card reveal" data-chart><figcaption>${esc(title)}</figcaption>${render()}<p class="chart-note">${esc(note)}</p></figure>`;
}
