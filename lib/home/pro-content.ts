// Default (fallback) content for the Pro / contractor home (wireframe `/pro`). Same convention as
// home-content.ts: each band on the page is a Makeswift slot whose fallback renders this.
// `href: '#'` = page not built yet. "[X]" figures from the wireframe replaced with neutral copy.

import { type RowCard } from '@/vibes/soul/sections/cards-row';
import { type QuickShipTile } from '@/vibes/soul/sections/delivery-ladder';
import { type HeroSlide } from '@/vibes/soul/sections/home-hero-split';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';
import { type ProgramTier } from '@/vibes/soul/sections/program-tiers';
import { type CustomerReview } from '@/vibes/soul/sections/review-carousel';

export const PRO_PROGRAM_HREF = '/pro-program';
export const FACTORY_OUTLET_URL = 'https://expresskitchensfactoryoutlet.com/';
export const WHOLESALE_URL = 'https://kunalkitchens.com/';

// The wireframe rotates the audience word in one headline; here each audience is its own slide.
export const PRO_HERO_SLIDES: HeroSlide[] = [
  {
    title: 'Built for contractors.\nTrade pricing, dates you can quote.',
    image: { src: '', alt: 'a job site or warehouse racking' },
    href: PRO_PROGRAM_HREF,
    ctaLabel: 'Join Pro',
  },
  {
    title: 'Built for interior designers.\nSpec it, price it, ship it.',
    image: { src: '', alt: 'a designer reviewing a kitchen plan' },
    href: PRO_PROGRAM_HREF,
    ctaLabel: 'Join Pro',
  },
  {
    title: 'Built for multifamily and commercial.\nOne spec per unit, delivered floor by floor.',
    image: { src: '', alt: 'cabinets staged on a multifamily floor' },
    href: PRO_PROGRAM_HREF,
    ctaLabel: 'Join Pro',
  },
];

export const PRO_AUDIENCES: RowCard[] = [
  {
    title: 'I build and remodel kitchens',
    description:
      'Contractors, remodelers and installers — trade pricing from your first $5,000 invoice, a text line that answers, dates you can quote.',
    ctaLabel: 'Contractor Program',
    href: '#pro-program',
    primary: true,
    imageLabel: 'A contractor at will-call',
  },
  {
    title: 'I furnish whole buildings',
    description:
      'Apartments, condos and senior living — one spec per unit type, priced per unit, delivered floor by floor on your schedule.',
    ctaLabel: 'Multifamily',
    href: '/industry/multifamily',
    imageLabel: 'An apartment kitchen, one of many',
  },
  {
    title: 'I fit out commercial spaces',
    description:
      'Offices, medical, hospitality and institutional — spec-sheet ready, delivery dates locked to your build, WBE/MBE certified.',
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
    title: 'RTA — 2 weeks',
    tag: 'Ready to assemble',
    description: 'Flat-packed, lowest cost per box, fastest to ship.',
    points: ['Ships from Bristol in two weeks', 'Priced per 10×10 on every collection'],
    ctaLabel: 'Shop RTA',
    href: '/cabinets/rta-cabinets',
  },
  {
    title: 'Assembled — 3 weeks',
    tag: 'Factory assembled',
    description: 'Built in our Connecticut shop, delivered ready to hang.',
    points: ['Built and checked before it leaves', 'Priced per 10×10 on every collection'],
    ctaLabel: 'Shop Assembled',
    href: '/cabinets/assembled-cabinets',
  },
];

export const WINDOWS_OFFER = {
  kicker: 'Windows offer',
  title: 'Replacement windows — $179.99, any size up to 101 united inches',
  description:
    "Double hung, sliders and hoppers, in stock in Bristol. Measure the opening, add width and height; if it's 101 or under, it's $179.99. Ready for pickup in 2 days. Contractor pricing applies on top for orders of five or more.",
  actions: [
    { label: 'Shop windows', href: '/windows', primary: true },
    { label: 'See the double hung', href: '#' },
  ],
  imageLabel: 'White vinyl double-hung windows on a pallet',
};

export const DELIVERY_COLUMNS = [
  'Program / category',
  'In stock',
  'Quick-ship',
  'Made to order',
  'How you get it',
];
export const DELIVERY_ROWS: string[][] = [
  ['RTA cabinets', 'Days', '≤ 2 weeks', '2 weeks', 'Ship or will-call'],
  ['Assembled cabinets', '—', '—', '3 weeks', 'Ship or will-call'],
  ['Closets (Star)', 'Ships from stock', '—', 'Made to order', 'Ship or will-call'],
  ['Windows', 'Pick up in 2 days', '—', 'Made to order', '!Pickup only'],
  ['Appliances', 'Pick up in 2 days', '—', 'Available to order', '!Pickup only'],
];
export const QUICK_SHIP_TILES: QuickShipTile[] = [
  { name: 'Cambridge', meta: 'Quick-ship · ≤ 2 weeks', href: '#' },
  { name: 'Tribeca Shaker', meta: 'Quick-ship · ≤ 2 weeks', href: '#' },
  { name: 'Avon', meta: 'Quick-ship · ≤ 2 weeks', href: '/cabinets/rta-cabinets' },
  { name: 'Dover', meta: 'Quick-ship · ≤ 2 weeks', href: '/cabinets/rta-cabinets' },
];

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

export const SPEC_SHELF: RowCard[] = [
  {
    title: 'Download brochure',
    description: 'Full range, one PDF.',
    ctaLabel: 'Download',
    href: '#',
    imageLabel: 'Brochure cover',
  },
  {
    title: 'Spec sheets',
    description: 'One per collection, on each collection page.',
    ctaLabel: 'Browse collections',
    href: '/cabinets/assembled-cabinets',
    imageLabel: 'PDF stack',
  },
  {
    title: 'Door samples',
    description: 'First two quarter doors free.',
    ctaLabel: 'Order samples',
    href: '/samples',
    imageLabel: 'Sample doors',
  },
];

export const FOUR_LINES: RowCard[] = [
  {
    title: 'Star',
    description:
      'Framed cabinets, 300+ SKUs in every door style, all stocked in Bristol, CT. RTA or assembled.',
    imageLabel: 'Star kitchen',
  },
  {
    title: 'Prism',
    description:
      'Custom-painted framed cabinets, 300+ SKUs per door style, stocked in Bristol, CT. Assembled.',
    imageLabel: 'Prism kitchen',
  },
  {
    title: 'Euro Max',
    description:
      'Frameless cabinets on ¾-inch plywood boxes, 300+ SKUs per door style, stocked in Bristol, CT. RTA or assembled.',
    imageLabel: 'Euro Max kitchen',
  },
  {
    title: 'Euro Value',
    description:
      'Frameless cabinets on ¾-inch plywood boxes, built in Bristol, CT. 300+ SKUs per door style. Assembled.',
    imageLabel: 'Euro Value kitchen',
  },
];

const QUALITY_PAIRS: Array<[string, string]> = [
  ['All-plywood box', '¾-inch plywood sides, top and bottom. No particle board.'],
  ['Soft-close hardware', 'Soft-close hinges on every door, fitted and adjusted.'],
  ['Dovetail drawer boxes', 'Solid-wood drawer boxes with dovetail joints.'],
  ['Full-extension slides', 'Undermount glides — the full depth of every drawer.'],
  ['Adjustable shelving', '¾-inch shelves on metal pins, set where you need them.'],
  ['Warranty on box and door', 'RTA or assembled, the same cover either way.'],
  [
    'Precision manufacturing',
    'Robotic cutting and drilling in our own Connecticut factory — the same tolerance in box one and box four hundred.',
  ],
  [
    'Free design help and quote',
    'Send the plan; our design team returns a layout, a cut list and a price you can put in front of your client.',
  ],
];

export const QUALITY_POINTS: RowCard[] = QUALITY_PAIRS.map(([title, description], index) => ({
  title: `${index + 1}. ${title}`,
  description,
}));

export const DESIGN_BAND = {
  title: 'We design, you win the job',
  description:
    'Send us your homeowner. We do the layout, the renderings and the itemized quote for free — under your name if you want. You close the job, we supply it.',
  actions: [{ label: 'Book a design for your client', href: '/free-design', primary: true }],
  imageLabel: "A rendering with the contractor's name on the title block",
};

// Placeholders until real contractor quotes are supplied (the wireframe leaves these bracketed).
export const PRO_REVIEWS: CustomerReview[] = [
  {
    stars: 5,
    quote: '[Quote — about lead-time reliability.]',
    name: '[Name]',
    location: 'Remodeler, [Town] CT',
  },
  {
    stars: 5,
    quote: '[Quote — about the account rep.]',
    name: '[Name]',
    location: 'GC, [Town] CT',
  },
  {
    stars: 5,
    quote: '[Quote — a multifamily job.]',
    name: '[Name]',
    location: '[Company] · [X] units',
  },
];
