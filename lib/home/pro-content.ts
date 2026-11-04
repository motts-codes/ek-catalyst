// Default (fallback) content for the Pro / contractor home (wireframe `/pro`). Same convention as
// home-content.ts: each band on the page is a Makeswift slot whose fallback renders this.
// Checked against EK's rules (Nov 2026): no Pro Program on the site, no quick-ship or rush
// promises, no installation mentions, a consult gives a quote (not a layout), Euro Value is an
// engineered-board box, Prism is made to order (8 weeks), the $179.99 window offer is double hung
// only, phones are answered 24/7 and texting works.

import { type RowCard } from '@/vibes/soul/sections/cards-row';
import { type HeroSlide } from '@/vibes/soul/sections/home-hero-split';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';
import { type ProgramTier } from '@/vibes/soul/sections/program-tiers';
import { type CustomerReview } from '@/vibes/soul/sections/review-carousel';

/** The Pro Program page is hidden at the client's request (27 Oct 2026); nothing links to it. */
export const PRO_PROGRAM_HREF = '/pro-program';
/** Where trade calls to action go while the program page is hidden. */
export const TRADE_CONTACT_HREF = '/contact';
export const FACTORY_OUTLET_URL = 'https://expresskitchensfactoryoutlet.com/';
export const WHOLESALE_URL = 'https://kunalkitchens.com/';
export const DOUBLE_HUNG_HREF = '/windows/replacement/double-hung-windows';

// The wireframe rotates the audience word in one headline; here each audience is its own slide.
export const PRO_HERO_SLIDES: HeroSlide[] = [
  {
    title: 'Built for contractors.\nSpecial pricing, and ship dates you can quote.',
    image: { src: '', alt: 'a job site or warehouse racking' },
    href: TRADE_CONTACT_HREF,
    ctaLabel: 'Talk to the trade team',
  },
  {
    title: 'Built for interior designers.\nSpec it, price it, ship it.',
    image: { src: '', alt: 'a designer reviewing a kitchen plan' },
    href: TRADE_CONTACT_HREF,
    ctaLabel: 'Talk to the trade team',
  },
  {
    title: 'Built for multifamily and commercial.\nOne spec per unit, delivered on your schedule.',
    image: { src: '', alt: 'cabinets staged on a multifamily floor' },
    href: TRADE_CONTACT_HREF,
    ctaLabel: 'Talk to the trade team',
  },
];

export const PRO_AUDIENCES: RowCard[] = [
  {
    title: 'I build and remodel kitchens',
    description:
      'Contractors, remodelers and installers. Special pricing for the trade, 50,000+ cabinets in stock, and a phone line that answers, call or text, 24/7.',
    ctaLabel: 'Talk to the trade team',
    href: TRADE_CONTACT_HREF,
    primary: true,
    imageLabel: 'A contractor at will-call',
  },
  {
    title: 'I furnish whole buildings',
    description:
      'Apartments, condos and senior living. One spec per unit type, priced per unit, delivered on your schedule.',
    ctaLabel: 'Multifamily',
    href: '/industry/multifamily',
    imageLabel: 'An apartment kitchen, one of many',
  },
  {
    title: 'I fit out commercial spaces',
    description:
      'Offices, medical, hospitality and institutional. Spec sheets ready, and delivery dates set to your build.',
    ctaLabel: 'Commercial',
    href: '/industry/commercial',
    imageLabel: 'A commercial break room fit-out',
  },
  {
    title: 'I buy by the pallet',
    description:
      'Wholesale supply for dealers and distributors — full-line pricing, container and pallet quantities, through Kunal Kitchens.',
    ctaLabel: 'Wholesale ↗',
    href: WHOLESALE_URL,
    imageLabel: 'Pallets of cabinets in the warehouse',
  },
];

export const PRO_PROGRAM_CARDS: ProgramCard[] = [
  {
    title: 'RTA: ships in 2 weeks',
    tag: 'Ready to assemble',
    description: 'Flat-packed, the lowest cost per box. Your crew builds it on site.',
    points: ['Star RTA ships in 2 weeks, Euro Max in 4', 'A 10×10 price on every collection'],
    ctaLabel: 'Shop RTA',
    href: '/cabinets/rta-cabinets',
    image: {
      src: '/images/home/programs/rta.webp',
      alt: 'A kitchen in dark grey shaker cabinets',
    },
  },
  {
    title: 'Assembled: ships in 3 weeks',
    tag: 'Factory assembled',
    description: 'Built and checked in our factory, ready to install.',
    points: ['Star ships in 3 weeks, Euro in 4, Prism in 8', 'A 10×10 price on every collection'],
    ctaLabel: 'Shop Assembled',
    href: '/cabinets/assembled-cabinets',
    image: {
      src: '/images/home/programs/assembled.webp',
      alt: 'A finished kitchen in sage-green shaker cabinets with a white quartz island and black pendants',
    },
  },
];

// Under the two panels: the same cabinet either way, and the trade pricing line EK asked for.
export const PRO_PROGRAM_FOOTNOTE =
  'Same box, same door, same finish either way. Special pricing for contractors and builders applies to both: call us for details.';

export const WINDOWS_OFFER = {
  kicker: 'Windows offer',
  title: 'Double hung windows, $179.99, any size up to 101 united inches',
  description:
    "In stock in Bristol and ready for pickup in 2 days. Measure the opening, then add the width and height: if it's 101 or under, it's $179.99.",
  actions: [
    { label: 'Shop windows', href: '/windows', primary: true },
    { label: 'See the double hung', href: DOUBLE_HUNG_HREF },
  ],
  imageLabel: 'White vinyl double-hung windows on a pallet',
};

// "Ship times you can quote": every line, with no quick-ship column. Transit is on top (7–10 days)
// unless the order is picked up in Bristol.
export const DELIVERY_COLUMNS = ['Product', 'Ships in', 'How you get it'];
export const DELIVERY_ROWS: string[][] = [
  ['!Star RTA', '2 weeks', 'Ship or pick up'],
  ['!Euro Max RTA', '4 weeks', 'Ship or pick up'],
  ['!Star assembled', '3 weeks', 'Ship or pick up'],
  ['!Euro assembled', '4 weeks (Tribeca Shaker 2)', 'Ship or pick up'],
  ['!Prism (painted)', '8 weeks', 'Ship or pick up'],
  // The closets ship time is still to be confirmed by EK; "ask us" until then.
  ['!Closets', 'Ask us for a date', 'Ships nationwide, or pick up'],
  ['!Windows and appliances', 'Ready in 2 days', 'Pickup only, Bristol'],
];

// Kept in code in case the Contractor Program comes back; not rendered anywhere (EK, Nov 2026).
export const PROGRAM_TIERS: ProgramTier[] = [
  {
    name: 'Silver',
    qualifier: 'From your first $5,000 invoice',
    perks: [
      '10% off in-stock Star cabinets',
      '15% off quick-ship',
      '10% off in-stock sinks, faucets and hardware',
      '5% off stone countertops',
      'Measurement fees waived',
      '25% off delivery',
      'Dedicated text-enabled support line',
      'Free design and design audits',
      'Sales-tax exemption with your form on file',
    ],
  },
  {
    name: 'Diamond',
    qualifier: 'From $50,000 a year',
    highlighted: true,
    perks: [
      '15% off in-stock Star cabinets',
      '25% off quick-ship',
      '15% off in-stock sinks, faucets and hardware',
      '10% off stone countertops',
      'Measurement fees waived',
      'Half-price delivery · rush fees waived',
      'Dedicated text-enabled support line',
      'Free design and design audits',
      'Sales-tax exemption · quarterly prizes',
    ],
  },
];
export const PROGRAM_TIERS_FOOTNOTE =
  'Joining is a two-minute form. Our trade team calls to verify your trade license or resale certificate and sets up the account. Everything after that is handled by your trade team, not a portal.';

// Not rendered: the spec shelf came off the Pro page (Arun, 4 Nov 2026); kept in case it returns.
export const SPEC_SHELF: RowCard[] = [
  {
    title: 'Spec sheets',
    description: 'One per collection, on each collection page.',
    ctaLabel: 'Browse collections',
    href: '/cabinets/assembled-cabinets',
    imageLabel: 'PDF stack',
  },
  {
    title: 'Door samples',
    description: 'First two quarter doors free with FREESAMPLES.',
    ctaLabel: 'Order samples',
    href: '/samples',
    imageLabel: 'Sample doors',
  },
];

export const FOUR_LINES: RowCard[] = [
  {
    title: 'Star',
    description:
      'Framed, with a plywood box and a solid birch face frame. Our widest choice of doors, kept in stock in Bristol. RTA or assembled.',
    imageLabel: 'Star kitchen',
  },
  {
    title: 'Prism',
    description:
      "Star's framed cabinets, painted in 10 colors. Made to order, ships in 8 weeks. Assembled.",
    imageLabel: 'Prism kitchen',
  },
  {
    title: 'Euro Max',
    description: 'Frameless, full overlay, with a ¾" plywood box. RTA or assembled.',
    imageLabel: 'Euro Max kitchen',
  },
  {
    title: 'Euro Value',
    description:
      'The same frameless doors as Euro Max, with an engineered board box, at a lower price. Assembled.',
    imageLabel: 'Euro Value kitchen',
  },
];

// "How every cabinet is built" shows the assembled listing's Build quality panel as it is
// (lib/cabinets/program-content.ts, ASSEMBLED_BUILD_BLOCK).

export const DESIGN_BAND = {
  title: 'We price it, you win the job',
  description:
    "Send us your plans or measurements. We'll price every cabinet, RTA and assembled, so you can put a number in front of your client. Free.",
  actions: [{ label: 'Get a free quote', href: '/mykitchen/free-design-consult', primary: true }],
  imageLabel: 'A priced cabinet list beside a set of plans',
};

// Not rendered: EK has not supplied real contractor reviews yet (the old site's look made up).
export const PRO_REVIEWS: CustomerReview[] = [];
