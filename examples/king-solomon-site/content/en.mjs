// English copy. Adapted from the King Solomon investor deck. No em dashes in visible text.
export default {
  lang: 'en', dir: 'ltr', base: '/en/kingsolomonproject', otherBase: '/kingsolomonproject', otherLabel: 'עב',
  nav: { project: 'The Project', villas: 'Villas', gallery: 'Gallery', developer: 'Developer', contact: 'Contact', cta: 'Private presentation', menu: 'Menu', close: 'Close' },
  c: {
    explore: 'Explore the villas', enquire: 'Enquire', enquireVilla: 'Enquire about this villa', download: 'Download', plan: 'Plan', plans: 'Plans',
    from: 'From', villa: 'Villa', villas: 'Villas', available: 'Available', reserved: 'Reserved', sold: 'Sold', all: 'All',
    bedrooms: (n) => (n === 1 ? '1 bedroom' : `${n} bedrooms`), bedShort: (n) => `${n} BR`, interior: 'Interior', outdoor: 'Outdoor',
    total: 'Total incl. garden / roof', pool: 'Private pool', basement: 'Basement', balconies: 'Balconies', garden: 'Garden / roof garden',
    price: 'Price', status: 'Status', level: 'Level', top: 'Rooftop residence', ground: 'Garden residence', sqm: 'm²',
    availableOf: (a, n) => `${a} of ${n} available`, onRequest: 'On request', viewAll: 'View all', back: 'Back', next: 'Next', prev: 'Previous'
  },
  titles: {
    home: 'King Solomon | Luxury Cliffside Villas, Kalyves Crete', villas: 'The Villas', project: 'The Project', gallery: 'Gallery & Downloads',
    developer: 'The Developer', contact: 'Contact', type: (n) => `${n === 1 ? 'One' : n === 2 ? 'Two' : n === 3 ? 'Three' : 'Five'} Bedroom Villas`
  },
  hero: {
    h1: 'Own the horizon', sub: 'Luxury cliffside villas & spa resort · Kalyves, Crete',
    s2Lead: '21 private villas, each with its own pool, ', s2Mid: '34 metres above the sea', s2Tail: 'on the first line of Crete',
    eyebrow: 'King Solomon · Kalyves | Creta', l1: 'A home above the sea.', l2: 'A life above expectation.', cta: 'Explore the villas'
  },
  home: {
    intro: {
      eyebrow: 'Own the horizon',
      title: 'There are places you visit. And places that <em>change the way you feel.</em>',
      p1: 'King Solomon was born from a rare meeting point between height, light and sea. The mountain rises behind you, the Mediterranean opens in front of you, and every sunset feels as if it was designed for you alone.',
      p2: 'This is not simply a residence by the water. It is a private cliffside world above the coastline, shaped by architecture, nature and silence. Mornings begin with the sound of the sea below, afternoons drift into infinity-pool calm, evenings are painted gold over the horizon.'
    },
    stats: [
      { n: 21, label: 'Private villas' }, { n: 34, unit: 'm', label: 'Above sea level' }, { n: 70, unit: 'm', label: 'Aerial distance to the sea' },
      { n: 270, unit: '°', label: 'Panoramic sea views' }, { n: 12, unit: 'min', label: 'To Chania' }, { n: 22, unit: 'min', label: 'To Chania airport' }
    ],
    concept: {
      title: 'Where elevation becomes <em>emotion</em>',
      p1: 'King Solomon is designed around one idea: the feeling of rising above everything. Above noise, above routine, above ordinary coastal living. Set on a dramatic first-line cliff in Kalyves, the project captures the rare energy of a place where land, sky and sea meet in one uninterrupted panorama.',
      p2: 'Every residence is a private Mediterranean sanctuary, with its own pool, outdoor living, independent entrance and an open connection to the sea. The architecture does not compete with nature. It frames it.',
      quote: 'Luxury with soul. Not loud, not artificial. Because true exclusivity is what no one else can <em>recreate.</em>'
    },
    collection: { title: 'Four ways to <em>live above the sea</em>', lead: 'From a one bedroom rooftop retreat to a five bedroom garden villa with a private basement level. Every villa is delivered fully designed, furnished and ready.' },
    living: {
      title: 'Two ways of <em>being outside</em>',
      top: { name: 'Rooftop residences', text: 'Your private sky terrace above the sea. Pool, outdoor kitchen and lounge on a rooftop that turns every evening into an occasion.' },
      ground: { name: 'Garden residences', text: 'Private garden living with direct outdoor flow, a pool steps from the living room and planted terraces that hold the privacy of the slope.' }
    },
    facilities: {
      title: 'A private resort, <em>on the edge of the sea</em>',
      items: [
        { k: 'ks-infinity-pool', t: 'Infinity pool', d: 'A 10 × 4 m shared infinity pool on the cliff edge, oriented straight to the sea, with sunbeds, lounges and an eight person jacuzzi.' },
        { k: 'ks-gym', t: 'Spa & wellness', d: 'Fitness room, glass walled dry sauna, treatment room and a flexible space for yoga, pilates and meditation.' },
        { k: 'ks-entrance', t: 'Glass elevator', d: 'A panoramic glass elevator connects the upper entrance with the pool and resort level. A dramatic arrival, and real comfort on a cliff.' },
        { k: 'ks-location-sea-path', t: 'Direct sea access', d: 'Around 30 to 40 steps lead from the resort level to the seafront, the Kalyves promenade and the tavernas. No car, no detour.' },
        { k: 'ks-rooftop-sofa', t: 'Sun deck & lounges', d: 'Shared outdoor lounges, sunbathing areas and hosting zones designed for slow afternoons and golden light.' },
        { k: 'ks-aerial-pools', t: 'Gated community', d: 'Three controlled entrances, cameras and facial recognition access. Independent villa entrances, closed to the general public.' }
      ]
    },
    location: {
      title: 'Kalyves. Not overcrowded, not artificial. <em>Simply Crete, elevated.</em>',
      p: 'A real Cretan village with calm beaches, local tavernas and everyday comfort, and a short drive to the Venetian harbour of Chania. Private enough to disappear. Connected enough to arrive with ease.',
      dist: [{ t: 'Kalyves village centre', v: 2 }, { t: 'Souda port', v: 8 }, { t: 'Chania old town', v: 12 }, { t: 'Chania international airport', v: 22 }],
      unit: 'min', flights: 'Flight times · Israel 1:30 · Poland 2:45 · France 3:10 · Great Britain 3:40 · Sweden 3:45'
    },
    turnkey: {
      title: 'Not an empty shell. <em>A complete villa.</em>',
      p: 'Every villa is delivered with a full interior design by an architect and interior designer, imported furniture, a real residential kitchen, smart access and a hotel level furnishing package. Ready for your first evening, or for your first guest.',
      list: ['Floor to ceiling glazing toward the sea', 'Private infinity style pool', 'Outdoor kitchen with grill and lounge', 'Full imported furniture package', 'Premium appliances (Bosch, Sauter or equivalent)', 'Semi smart, Wi-Fi managed systems', 'Reinforced entrance with smart lock', 'Energy efficient insulation and glazing']
    },
    managed: {
      title: 'Own it. <em>We take care of the rest.</em>',
      p: 'King Solomon is managed by Sivan Management with a local team available 24/7. Shared facilities, villa maintenance, housekeeping and optional short-term rental management, with transparent owner reporting in an app.',
      list: [['Rental & yield management', 'Optional listing on Booking and Airbnb, dynamic pricing, guest communication and check-in.'], ['Villa care', 'Routine inspections of pools, systems and smart access, so every villa is always ready.'], ['Owner transparency', 'Bookings, income reports and maintenance status, online.'], ['Concierge', 'Private chef, transfers, car rental, restaurant bookings and wellness treatments on request.']]
    },
    gallery: { title: 'Every angle, <em>every hour</em>', cta: 'Open the gallery' },
    downloads: { title: 'Take it with you', lead: 'The full investor brochure and the architectural plans of every villa.' },
    contact: { title: 'Arrange a private presentation', lead: 'Leave your details and the project team will contact you with availability, prices and a personal presentation, in person in Chania or online.' }
  },
  villas: {
    heroTitle: 'The villas', heroLead: 'Twenty one private residences on two levels of the cliff. Choose a villa, check its status and download its plans.',
    explorerTitle: 'Availability', explorerLead: 'Live inventory with the current price list. Select a villa number to jump to its details.',
    filterBeds: 'Bedrooms', filterStatus: 'Status',
    levels: { top: ['Rooftop residences', 'Top floor · roof garden & pool'], ground: ['Garden residences', 'Ground floor · garden & pool'] },
    note: 'Prices are per the 12.2026 price list, include the full design and furnishing package and are subject to availability and change. Areas are indicative. Final terms are set only in the signed purchase agreement.',
    masterTitle: 'The masterplan', masterLead: 'Twenty one villas arranged to preserve privacy, views and a direct connection to the sea.'
  },
  types: {
    1: { name: 'One bedroom villas', tag: 'Rooftop & garden', title: 'A private retreat <em>above the sea</em>', p: 'The most intimate expression of King Solomon. A master bedroom, open living and dining, and a private pool on a garden terrace or a rooftop garden. Ideal as a personal hideaway or a premium short-term stay.' },
    2: { name: 'Two bedroom villas', tag: 'Garden residences', title: 'Garden living, <em>pool steps away</em>', p: 'Ground level villas with two bedrooms, independent entrances and private gardens that open the living space to the outdoors. Each villa has its own pool and outdoor kitchen and lounge area.' },
    3: { name: 'Three bedroom villas', tag: 'Rooftop residences', title: 'A sky terrace <em>for every evening</em>', p: 'Top floor villas with three bedrooms, generous balconies and a private roof garden with pool and outdoor kitchen. Built for families and for hosting, with the horizon as the main room.' },
    5: { name: 'Five bedroom villas', tag: 'Garden residences + lower level', title: 'The grand villas, <em>on two levels</em>', p: 'The largest residences at King Solomon. A ground floor with living spaces, kitchen and garden pool, plus a full lower level with additional bedrooms. Space for a large family, or for a premium rental product.' },
    layoutsTitle: 'Layouts', villasTitle: 'Villas in this collection', floor: { first: 'First floor', 'first-roof': 'First floor with roof garden', ground: 'Ground floor', 'ground-basement': 'Ground floor + lower level' },
    areaLabels: { internal: 'Internal', external: 'External / garden', balconies: 'Balconies', rooftop: 'Roof top', pool: 'Pool' },
    included: 'Included in every villa', others: 'Other collections'
  },
  project: {
    heroTitle: 'The project', heroLead: 'A private luxury villa resort on the edge of the sea, in Kalyves, Crete.',
    architecture: { title: 'Designed to be lived, <em>felt and remembered</em>', p1: 'King Solomon was designed by the international architecture studio 314 Architects as a private cliffside retreat where architecture, landscape and lifestyle work as one. Curved lines, terraces, rooftops and pool decks turn the view into a permanent part of daily life.', p2: 'The villas are placed across the slope to give every residence privacy, open sightlines and a powerful relationship with the landscape. Many enjoy close to 270 degree views of the sea and coastline.' },
    arrival: { title: 'The arrival', steps: [['Upper entrance', 'Electric gate, keypad and facial recognition access, cameras and architectural lighting beside the main parking.'], ['The bridge & glass elevator', 'A panoramic glass elevator facing the cliff and the sea carries you to the pool and resort level.'], ['The resort level', 'Infinity pool, jacuzzi, bar, outdoor kitchen and lounges at the heart of the project.'], ['Down to the sea', 'A controlled path of 30 to 40 steps to the seafront, the promenade and the tavernas of Kalyves.']] },
    interior: { title: 'Quiet luxury, <em>made livable</em>', p: 'Calm materials, natural tones and Mediterranean light. Interiors designed to feel warm, refined and hotel inspired, elegant enough for premium guests and comfortable enough to feel like home.' },
    specsTitle: 'Private villa specifications', specsLead: 'A fully designed, fully equipped villa. Every element planned to the standard of a boutique hotel.',
    specs: [
      ['Architecture, views & openings', 'Each villa is positioned for privacy, natural light and panoramic sea views, with large floor to ceiling insulated glass openings and wide façades. The cliffside layout gives many villas around 270 degree views.'],
      ['Private pool & outdoor living', 'Every villa includes a private infinity style pool facing the view, with sunbeds, lounge seating and premium garden furniture. Depending on the type, a garden, terrace, balcony or rooftop.'],
      ['Outdoor kitchen', 'A fully equipped outdoor kitchen for hosting: built in grill, sink, outdoor refrigerator, worktop, storage, lighting and shading by pergolas or architectural elements.'],
      ['Interior design & furniture', 'A full interior concept by an architect and interior designer. Furnished and equipped throughout with premium imported selections: beds, wardrobes, bedding, curtains, lighting, rugs and décor.'],
      ['Living room & entertainment', 'A hospitality grade living space with a custom TV wall, decorative lighting and cladding. A TV of over 50 inches in the living room and over 45 inches in every bedroom, LED atmosphere lighting and dimmers.'],
      ['Kitchen', 'A full size custom kitchen, not a holiday kitchenette: soft close cabinetry, porcelain granite worktops, kitchenware and premium appliances such as Bosch or Sauter, subject to availability.'],
      ['Bedrooms & bathrooms', 'Boutique hotel bedrooms with premium mattresses and fitted storage. Hotel style bathrooms with wall hung sanitaryware, concealed systems, walk in glass showers and full accessories.'],
      ['Finishes & energy performance', 'Large format 120 × 60 porcelain granite flooring, decorative cladding and recessed lighting. Thermal insulation in walls, roofs and glazing, well above standard local construction.'],
      ['Climate, smart systems & security', 'Inverter air conditioning in every room, electric water heating, semi smart Wi-Fi control of lighting and access, a reinforced multi point entrance door with fingerprint, keypad or face recognition, and exterior cameras that preserve privacy inside.'],
      ['Short-term rental readiness', 'Delivered with furniture, appliances, kitchenware, bedding, Wi-Fi and management compatible systems: ready for private use, hospitality use and professional operation.']
    ],
    crete: { title: 'Crete, <em>beyond the horizon</em>', p: 'Greece\'s largest island, with a scale unmatched in the Mediterranean. Minoan palaces, Venetian harbours, the White Mountains, Samaria Gorge and the lagoons of Balos. Every day can be a different experience, then back to your private cliffside retreat.', places: ['Chania old harbour', 'Balos lagoon', 'Samaria gorge', 'The White Mountains'] },
    disclaimer: 'All specifications, materials, brands, systems, facilities and design elements are for marketing and information purposes only and may change subject to final planning, engineering, licensing, approvals and availability. Binding specifications are set only by the signed notarial purchase agreement. The developer may replace any item with one of equal or higher quality.'
  },
  gallery: {
    heroTitle: 'Gallery', heroLead: 'Renders, film, plans and the investor brochure.',
    cats: { all: 'All', exterior: 'Architecture', pools: 'Pools & terraces', rooftop: 'Rooftops', interior: 'Interiors', location: 'Location' },
    filmTitle: 'The film', filmLead: 'From the first light over the cliff to dusk over Kalyves.',
    dlTitle: 'Downloads', brochure: ['Investor brochure', 'PDF · 51 pages'], plansGroup: 'Architectural plans', masterplan: 'Masterplan'
  },
  developer: {
    heroTitle: 'The developer', heroLead: 'King Solomon is developed by SivanInvest Group and managed by Sivan Management.',
    story: { title: 'We do not start from the market. <em>We start from you.</em>', p1: 'SivanInvest is a boutique investment house specialising in selecting, managing and accompanying real estate investments in Israel and above all in Greece. With almost twenty years of experience, we have accompanied hundreds of investors step by step on a personal investment path.', p2: 'Every opportunity we bring passes the same discipline: market research, deep due diligence, a careful look at partners and developers, cash flow simulations and stress scenarios. Capital preservation comes before return maximisation.' },
    values: [['Personal guidance', 'One account manager who coordinates the financial, legal and operational sides of your investment.'], ['Full transparency', 'You know what we examine, which metrics we use, what it costs and what protects your capital.'], ['A multidisciplinary team', 'Real estate, development, private credit and funds, alongside lawyers, accountants, appraisers and asset managers.'], ['On the ground in Crete', 'An office in Chania and a local operating team with 24/7 availability.']],
    group: { title: 'One group, <em>three disciplines</em>', items: [['SivanInvest', 'Develops King Solomon and leads acquisition, planning, partners and investor relations.'], ['Sivan Management', 'Operates the resort: shared facilities, villa care, housekeeping, rental and yield management.'], ['HARMONY', 'The group\'s real estate backed bond fund, for investors who prefer a fixed income route into Greek real estate.']] },
    process: { title: 'From first conversation <em>to the keys</em>', steps: [['Introduction', 'A personal conversation about goals, budget and timing.'], ['Private presentation', 'The project, the villas and the current price list, in Chania or online.'], ['Reservation', 'Choose your villa and secure it with a reservation agreement.'], ['Legal & finance', 'Coordination with Greek lawyers, notary and, if needed, local bank financing.'], ['Design & delivery', 'Your villa is completed with its full design and furnishing package.'], ['Management', 'Optional management and rental by Sivan Management, with app based reporting.']] },
    architect: { title: '314 Architects', p: 'The project was designed by the international architecture studio 314 Architects, combining contemporary Mediterranean design with the natural landscape of the Cretan coast.' }
  },
  contact: {
    heroTitle: 'Contact', heroLead: 'A private presentation, availability and prices. We will be glad to hear from you.',
    formTitle: 'Send an enquiry', formLead: 'We reply within one business day.',
    fields: { name: 'Full name', phone: 'Phone', email: 'Email', type: 'Villa type', notes: 'Notes', send: 'Send enquiry', types: ['1 bedroom villa', '2 bedroom villa', '3 bedroom villa', '5 bedroom villa', 'Not sure yet'] },
    success: 'Thank you. The King Solomon team will be in touch shortly.',
    faqTitle: 'Investor questions',
    faq: [
      ['What is included in the villa price?', 'Prices on the 12.2026 price list include the full design and furnishing package: interior design by an architect and interior designer, imported furniture, a fully equipped kitchen with premium appliances, a private pool and an outdoor kitchen. Your villa is handed over ready to live in, or ready for its first guest.'],
      ['Can I rent the villa out when I am away?', 'Yes, if you choose to. Sivan Management operates the resort with a local team available 24/7 and offers short-term rental management: listing on Booking and Airbnb, dynamic pricing, guest check-in, housekeeping and transparent owner reporting in an app.'],
      ['How does the purchase process work?', 'An introduction call, a private presentation with the current price list, a reservation agreement for your villa, then coordination with Greek lawyers and a notary and, if needed, local bank financing. We accompany you at every step, all the way to the keys.'],
      ['Can I see the project in person?', 'Of course. We will arrange a private presentation at our office in Chania or online. The project is about 22 minutes from Chania International Airport and 12 minutes from the old town.'],
      ['Is there a tax treaty with Israel?', 'Yes. Israel and Greece have a tax treaty designed to prevent double taxation, which can improve the net return on the investment. The implications depend on each investor, so our team coordinates the review with professional accountants and lawyers.']
    ],
    detailsTitle: 'Our details',
    labels: { email: 'Email', chania: 'Office in Chania', greecePhone: 'Phone in Greece', israel: 'Office in Israel', israelPhone: 'Phone in Israel' },
    israelAddress: '',
    details: { title: 'Project office', address: '2 Plateia Eleftherias, 73132 Chania, Crete', phones: ['+972 52 451 8134', '+30 698 392 4820'], email: 'support@sivaninvestgroup.com', whatsapp: 'WhatsApp', site: 'Kalyves, Chania, Crete' }
  },
  footer: { tagline: 'A home above the sea. A life above expectation.', explore: 'Explore', contact: 'Contact', follow: 'Downloads', rights: '© SivanInvest Group. All rights reserved.', developed: 'Developed by SivanInvest Group · Managed by Sivan Management',
    legal: 'The information on this website is indicative only and does not constitute an offer, contract or warranty. Visuals are artist impressions. Layouts, areas, specifications and prices may change as the development progresses. Please rely on your own verification and on the signed purchase agreement.' }
};
