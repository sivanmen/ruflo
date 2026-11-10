// King Solomon villa inventory — source: "Agents - Pricing King Solomon" sheet,
// price column "12.2026 Full Price + Design". Buyer names are deliberately not included.
// level: 'top' (Top Floor, rooftop) | 'ground' (Ground Floor, garden).
const v = (no, level, beds, net, balc, garden, total, pool, base, price, status, plans) =>
  ({ no, level, beds, net, balc, garden, total, pool, base, price, status, plans });

export const VILLAS = [
  v(1, 'ground', 5, 87.27, 90.7, null, 178.97, 14.83, 87.27, 1227250, 'reserved', ['ks-villa-1-3-5-7-plans', 'ks-villa-1-3-5-7-basement-plans']),
  v(2, 'top', 3, 87.27, 53.36, 63.24, 204.87, 17.65, null, 966402, 'sold', ['ks-villa-2-4-6-8-plans', 'ks-villa-2-4-6-8-roof-gardens']),
  v(3, 'ground', 5, 87.27, 32.19, null, 120.46, 14.52, 86.5, 1224883, 'sold', ['ks-villa-1-3-5-7-plans', 'ks-villa-1-3-5-7-basement-plans']),
  v(4, 'top', 3, 87.27, 24.9, 62.36, 175.53, 17.65, null, 966402, 'sold', ['ks-villa-2-4-6-8-plans', 'ks-villa-2-4-6-8-roof-gardens']),
  v(5, 'ground', 5, 87.87, 21.38, null, 110.25, 14.52, 87.38, 1233948, 'available', ['ks-villa-1-3-5-7-plans', 'ks-villa-1-3-5-7-basement-plans']),
  v(6, 'top', 3, 87.83, 29.04, 60.99, 178.86, 17.65, null, 972338, 'reserved', ['ks-villa-2-4-6-8-plans', 'ks-villa-2-4-6-8-roof-gardens']),
  v(7, 'ground', 5, 87.82, 23.75, null, 112.57, 11.75, 90.78, 1243870, 'available', ['ks-villa-1-3-5-7-plans', 'ks-villa-1-3-5-7-basement-plans']),
  v(8, 'top', 3, 87.86, 40.6, 76, 205.46, 17.65, null, 972656, 'available', ['ks-villa-2-4-6-8-plans', 'ks-villa-2-4-6-8-roof-gardens']),
  v(9, 'ground', 5, 69.34, 7.64, 27.59, 105.57, 13.33, 69.34, 982075, 'available', ['ks-villa-9-plan', 'ks-villa-9-basement-plan']),
  v(10, 'top', 3, 69.34, 35.59, 41.96, 147.89, 16.5, null, 778464, 'available', ['ks-villa-10-plan', 'ks-villa-10-roof-garden']),
  v(11, 'ground', 1, 42.23, null, 13.36, 56.59, 6.02, null, 502758, 'sold', ['ks-villa-11-13-plans']),
  v(12, 'top', 1, 49.55, 17.43, 22.52, 90.5, 12.73, null, 561270, 'reserved', ['ks-villa-12-14-plans', 'ks-villa-12-14-roof-garden']),
  v(13, 'ground', 1, 42.64, null, 13.36, 57, 6.02, null, 507104, 'available', ['ks-villa-11-13-plans']),
  v(14, 'top', 1, 49.62, 9.45, 40.98, 101.05, 12.73, null, 562012, 'reserved', ['ks-villa-12-14-plans', 'ks-villa-12-14-roof-garden']),
  v(15, 'ground', 2, 61.52, null, 30.6, 93.12, 12.72, null, 698752, 'available', ['ks-villa-15-plan']),
  v(16, 'top', 1, 42.64, null, 40.95, 84.59, 12.73, null, 500744, 'sold', ['ks-villa-16-plan', 'ks-villa-16-roof-garden']),
  v(17, 'ground', 2, 60.79, null, 31.95, 93.74, 11.26, null, 691014, 'available', ['ks-villa-17-18-19-plans']),
  v(18, 'ground', 2, 59.74, null, 32.57, 93.31, 12.32, null, 679884, 'reserved', ['ks-villa-17-18-19-plans']),
  v(19, 'ground', 2, 64.38, null, 20.15, 85.53, 14.56, null, 729068, 'sold', ['ks-villa-17-18-19-plans']),
  v(20, 'ground', 2, 60.62, null, 16.73, 78.35, 10.8, null, 699812, 'sold', ['ks-villa-20-21-plans']),
  v(21, 'ground', 2, 60.62, null, 28.01, 89.63, 13.14, null, 699812, 'sold', ['ks-villa-20-21-plans'])
];

// Villa collections (one page each) with the plan layouts from the investor deck.
export const TYPES = [
  { key: '1-bedroom', beds: 1, hero: 'ks-rooftop-pergola', images: ['ks-rooftop-pergola', 'ks-rooftop-sofa', 'ks-terrace-table', 'ks-interior-bedroom'],
    layouts: [
      { code: 'A1', plan: 'ks-plan-a1', floor: 'first-roof', areas: { internal: 49.55, external: 90.05, balconies: 9.45, pool: 12.73 } },
      { code: 'A2.1', plan: 'ks-plan-a2-1', floor: 'ground', areas: { internal: 41.0, external: 13.36, pool: 12.73 } },
      { code: 'A2.2', plan: 'ks-plan-a2-2', floor: 'first-roof', areas: { internal: 48.9, balconies: 9.45, rooftop: 48.9, pool: 12.73 } }
    ] },
  { key: '2-bedroom', beds: 2, hero: 'ks-facade-gardens', images: ['ks-facade-gardens', 'ks-villa-curves', 'ks-hillside', 'ks-interior-kitchen'],
    layouts: [
      { code: 'B1', plan: 'ks-plan-b1', floor: 'first', areas: { internal: 64.0, external: 20.15, pool: 14.56 } },
      { code: 'B2', plan: 'ks-plan-b2', floor: 'ground', areas: { internal: 60.0, rooftop: 31.96, pool: 11.26 } }
    ] },
  { key: '3-bedroom', beds: 3, hero: 'ks-rooftop-lounge', images: ['ks-rooftop-lounge', 'ks-terrace-horizon', 'ks-rooftop-sea', 'ks-living-room'],
    layouts: [
      { code: 'C2.1', plan: 'ks-plan-c2-1', floor: 'first-roof', areas: { internal: 87.0, balconies: 53.36, rooftop: 87.0, pool: 17.65 } },
      { code: 'C2.2', plan: 'ks-plan-c2-2', floor: 'first-roof', areas: { internal: 87.0, balconies: 53.36, rooftop: 87.0, pool: 17.65 } },
      { code: 'B3.1', plan: 'ks-plan-b3-1', floor: 'first-roof', areas: { internal: 134.0 } }
    ] },
  { key: '5-bedroom', beds: 5, hero: 'ks-resort-front', images: ['ks-resort-front', 'ks-aerial-terraces', 'ks-infinity-pool', 'ks-interior-kitchen'],
    layouts: [
      { code: 'C1.1', plan: 'ks-plan-c1-1', floor: 'ground-basement', areas: { internal: 174.0, external: 90.7, pool: 14.83 } },
      { code: 'C1.2', plan: 'ks-plan-c1-2', floor: 'ground-basement', areas: { internal: 174.0, external: 90.7, pool: 14.83 } },
      { code: 'B1.2', plan: 'ks-plan-b1-2', floor: 'ground-basement', areas: { internal: 69.34, balconies: 35.59, external: 41.96, pool: 16.5 } }
    ] }
];

export const villasOf = (beds) => VILLAS.filter((x) => x.beds === beds);

export function typeStats(beds) {
  const list = villasOf(beds);
  const avail = list.filter((x) => x.status === 'available');
  const range = (k) => { const a = list.map((x) => x[k]).filter((n) => n != null); return [Math.min(...a), Math.max(...a)]; };
  return {
    count: list.length,
    available: avail.length,
    from: avail.length ? Math.min(...avail.map((x) => x.price)) : null,
    net: range('net'), total: range('total'), pool: range('pool')
  };
}

export const euro = (n) => '€' + Math.round(n).toLocaleString('en-US');
export const sqm = (n) => (Math.round(n * 10) / 10).toLocaleString('en-US');
