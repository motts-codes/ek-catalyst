import { dollars, LINES, rowFor, TEN_BY_TEN_CABINETS } from '~/lib/estimator/ten-by-ten';
import { TEN_BY_TEN_LINEAR_FEET, TEN_BY_TEN_ROWS } from '~/lib/estimator/ten-by-ten-prices';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF } from '~/lib/home/home-content';

// /resources/ten-by-ten-kitchen: Arun's copy of 25 Oct 2026. The cabinet list and every price
// come from the estimator's data (lib/estimator), so this page and the estimator can't drift.

export const TEN_BY_TEN_PAGE_HREF = '/resources/ten-by-ten-kitchen';
export const PRICES_AS_OF = 'October 16, 2026';

export const TEN_BY_TEN_META = {
  title: 'What is a 10×10 kitchen?',
  description:
    'A 10×10 is the standard sample kitchen used to compare cabinet prices: two 10-foot walls in an L shape, 13 cabinets, cabinets only. See what’s in it and how to scale it to your room.',
};

export const TEN_BY_TEN_HERO = {
  kicker: 'What is a 10×10 kitchen?',
  title: 'The kitchen behind every price',
  description:
    'When you see a kitchen cabinet price, it’s almost always for the same sample room: two 10-foot walls in an L shape, about 20 feet of cabinets. It’s called a 10×10, and the whole industry uses it to compare prices. Every 10×10 price on our site is that kitchen, cabinets only, in that collection. Ours has 13 cabinets.',
  image: {
    src: '/images/estimator/layout-l-shaped.jpg',
    alt: 'The 10×10 kitchen: white shaker cabinets along two walls meeting in a corner',
  },
  imageLabel: 'The 10×10 kitchen, Avon in white',
  actions: [
    { label: 'Price my kitchen', href: ESTIMATOR_HREF, primary: true },
    { label: 'Browse collections', href: '/cabinets/assembled-cabinets' },
  ],
};

export const TEN_BY_TEN_LIST = {
  kicker: 'What’s in it',
  title: 'The 13 cabinets in our 10×10',
  description:
    'The same 13 cabinets, priced in every door style, so the only thing that changes is the door and the line.',
  columns: ['#', 'Cabinet', 'Qty'],
  rows: [
    ...TEN_BY_TEN_CABINETS.map((c, i) => [`!${i + 1}`, c.label, String(c.qty)]),
    ['!Total', '', `!${TEN_BY_TEN_CABINETS.reduce((n, c) => n + c.qty, 0)}`],
  ],
  renderLabel: 'The 10×10 kitchen as an L: two 10-foot walls, about 20 feet of cabinets',
};

export const TEN_BY_TEN_COVERS = {
  title: 'What the price covers',
  included: {
    title: 'Included',
    body: 'The 13 cabinets above, in the door style, color and line you choose. Every cabinet comes with soft-close hinges and dovetail drawer boxes. Assembled prices include factory assembly.',
  },
  excluded: {
    title: 'Not included',
    body: 'Countertops, appliances, the sink, knobs and pulls, crown molding and other trim, finished end panels, extra fillers, organizers and pull-outs, delivery, tax and installation.',
    note: 'In Connecticut, installation is available on showroom orders.',
  },
};

// The worked example: an assembled Avon 10×10, its per-foot rate, and a 30-foot kitchen.
const AVON = rowFor('star', 'Framed Star Assembled', 'Avon', 'Standard finish (single color)');
const AVON_PRICE = AVON?.price ?? 0;
const AVON_PER_FOOT = AVON_PRICE / TEN_BY_TEN_LINEAR_FEET;
const EXAMPLE_FEET = 30;
const roughly = (n: number) => dollars(Math.round(n / 100) * 100);

export const TEN_BY_TEN_HOW = {
  title: 'How to use a 10×10 price',
  steps: [
    {
      title: 'Compare styles.',
      body: 'Every door style is priced on the same 13 cabinets, so a higher 10×10 price means a pricier door or line, not more cabinets.',
    },
    {
      title: 'Scale it to your room.',
      body: `Cabinet cost follows the length of your cabinet run. Divide the 10×10 price by ${TEN_BY_TEN_LINEAR_FEET} for a price per foot, then multiply it by your own run. The estimator does this for you.`,
    },
    {
      title: 'Get the real number.',
      body: 'An island, a pantry or extra trim changes the total. A designer prices your exact layout for free.',
    },
  ],
  example: `An assembled Avon 10×10 is ${dollars(AVON_PRICE)}, or about ${dollars(AVON_PER_FOOT)} per foot. For a kitchen with ${EXAMPLE_FEET} feet of cabinets, that’s roughly ${roughly(AVON_PER_FOOT * EXAMPLE_FEET)} in cabinets.`,
  actions: [
    { label: 'Price my kitchen', href: ESTIMATOR_HREF, primary: true },
    { label: 'Book a free design consult', href: FREE_DESIGN_HREF },
  ],
};

// The lowest 10×10 price in a workbook program, as "$2,370"; "n/a" when the program isn't sold.
function fromPrice(program: string): string {
  const prices = TEN_BY_TEN_ROWS.filter((r) => r.program === program).map((r) => r.price);

  return prices.length > 0 ? dollars(Math.min(...prices)) : 'n/a';
}

export const TEN_BY_TEN_LINES = {
  title: 'The 10×10, priced across the lines',
  description:
    'These are the lowest 10×10 prices in each line. Every collection shows its own 10×10 price.',
  columns: ['Line', 'Construction', 'RTA, from', 'Assembled, from'],
  rows: [
    [
      '!Star',
      'Framed, plywood box',
      fromPrice('Framed Star RTA'),
      fromPrice('Framed Star Assembled'),
    ],
    [
      '!Prism',
      'Framed, painted in 10 colors',
      fromPrice('Framed Prism RTA'),
      fromPrice('Framed Prism'),
    ],
    [
      '!Euro Max',
      'Frameless, plywood box',
      fromPrice('Frameless Euro Max RTA'),
      fromPrice('Frameless Euro Max'),
    ],
    [
      '!Euro Value',
      'Frameless, engineered board box',
      fromPrice('Frameless Euro Value RTA'),
      fromPrice('Frameless Euro Value'),
    ],
  ],
  footnote: `Prices as of ${PRICES_AS_OF}, cabinets only.`,
  /** Where each line's "Browse" goes, for anyone who wants the collections. */
  lineHrefs: Object.fromEntries(LINES.map((l) => [l.label, l.href])),
};

export const TEN_BY_TEN_FAQ = {
  headline: 'Questions about the 10×10',
  items: [
    {
      q: 'Is a 10×10 kitchen small?',
      a: 'It’s about average. Most kitchens are between 8×10 and 12×14. The 10×10 is a way of pricing, not a floor plan, so use the price per foot to scale it to your room.',
    },
    {
      q: 'Does the shape of my kitchen change the price?',
      a: 'No. L-shape, U-shape, galley or single wall, the estimator uses the same 13 cabinets. What changes the price is the length of your cabinet run, and the cabinets your designer picks for your layout.',
    },
    {
      q: 'Why do other sites’ 10×10 prices look different?',
      a: 'Every company uses its own cabinet list. Some count fewer cabinets, or smaller ones. Compare the cabinet list, not just the number.',
    },
    {
      q: 'Can I buy the 10×10 kitchen as shown?',
      a: 'Yes, in any collection, RTA or assembled. Most people change a few cabinets to fit their room, and a designer does that with you for free.',
    },
    {
      q: 'Does the price include the countertop?',
      a: 'No. Countertops are quoted separately. See the Countertops page or call us.',
    },
    {
      q: 'Can I finance it?',
      a: 'Yes, in our showrooms, through GreenSky. The estimator shows a monthly figure based on 11.99% APR over 180 months. Financing isn’t available online or at our Factory Outlet.',
    },
  ],
};

export const TEN_BY_TEN_CLOSING = {
  title: 'Now price yours',
  description:
    'Pick a style in the estimator for a ballpark, or measure your kitchen and a designer will price it exactly.',
  primary: { label: 'Price my kitchen', href: ESTIMATOR_HREF },
  secondary: { label: 'Measuring guide', href: '/resources/measuring-guide' },
};
