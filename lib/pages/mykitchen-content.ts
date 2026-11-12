import { type CabinetFaqData } from '@/vibes/soul/sections/cabinet-faq';
import { type FeatureRow } from '@/vibes/soul/sections/feature-rows';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';
import { type Metric } from '@/vibes/soul/sections/why-us-scroll';
import {
  ASSEMBLED_LISTING_HREF,
  GLASS_DOORS_HREF,
  INSTALLER_HREF,
  RTA_LISTING_HREF,
} from '~/lib/cabinets/cabinets-hub-content';
import { ESTIMATOR_HREF, FREE_DESIGN_HREF, SAMPLES_HREF } from '~/lib/home/home-content';

// Content for /mykitchen, the whole-kitchen hub, per EK's brief v3 (outcome-led) of 12 Nov 2026.
// Online shopping first, showrooms second; every headline answers "what do I get?" and the facts
// (stock, ship times, prices) sit underneath as proof. Stock figures are the website's product
// panel; lead times and policy lines are EK's Oct 27 answers.

export const MEASURING_GUIDE_HREF = '/resources/measuring-guide';

export const MYKITCHEN_HERO = {
  kicker: 'My kitchen',
  title: 'The kitchen you want, without the long wait',
  description:
    'Choose cabinets, countertops, appliances and a sink that all fit together. See your price before you talk to anyone, and have your cabinets on their way in as little as 2 weeks. Free shipping on orders over $2,500.',
  actions: [
    { label: 'Price my kitchen', href: ESTIMATOR_HREF, primary: true },
    { label: 'Shop cabinets', href: '/cabinets' },
  ],
  textLink: { label: 'Rather have a designer help? Book a free consult', href: FREE_DESIGN_HREF },
  image: {
    src: '/images/why-us/final.webp',
    // The photo's pendants are brushed nickel, so the alt says so (the brief's draft said black).
    alt: 'A finished white shaker kitchen with a stone countertop, stainless range and nickel pendant lights',
  },
};

// The ticker fits short labels, so these are the brief's short set.
export const MYKITCHEN_METRICS: Metric[] = [
  { icon: 'package', value: '50,000+', label: 'Cabinets in stock' },
  { icon: 'star', value: '5,000+', label: 'Customer reviews' },
  { icon: 'calendar', value: '110+', label: 'Years in kitchens' },
  { icon: 'pin', value: '6', label: 'Showrooms in CT' },
  { icon: 'shield', value: 'A+', label: 'BBB rating' },
];

const nav = (file: string, alt: string) => ({ src: `/images/nav/${file}.webp`, alt });
const category = (file: string, alt: string) => ({
  src: `/images/home/categories/${file}.webp`,
  alt,
});

export const EVERYTHING_SECTION = {
  kicker: 'One cart, one delivery',
  title: 'Everything for your kitchen, chosen to fit together',
  description: 'No juggling five stores and hoping it all lines up.',
};

// One row per category. The Prism tile's photo is filled in by the page from the live collections.
export const PRISM_TILE_NAME = 'Painted (Prism)';

export const CATEGORY_ROWS: FeatureRow[] = [
  {
    title: 'Cabinets that look right and last',
    description:
      'Shaker, modern, raised panel or real wood grain, with 50,000+ in stock. RTA ships in 2 weeks, assembled in 3.',
    image: category('cabinets', 'White shaker cabinets with brushed handles'),
    tilesLabel: 'Shop by',
    tileCtaLabel: 'Shop',
    tiles: [
      {
        name: 'Assembled',
        href: ASSEMBLED_LISTING_HREF,
        image: nav('assembled', 'Assembled kitchen cabinets'),
      },
      { name: 'RTA', href: RTA_LISTING_HREF, image: nav('rta', 'Ready-to-assemble cabinets') },
      { name: PRISM_TILE_NAME, href: `${ASSEMBLED_LISTING_HREF}?line=prism` },
      {
        name: 'Glass doors',
        href: GLASS_DOORS_HREF,
        image: { src: '/images/cabinets/glass-front-uppers.jpg', alt: 'Glass-front wall cabinets' },
      },
    ],
    action: { label: 'Explore cabinets', href: '/cabinets' },
  },
  {
    title: 'A countertop that fits the first time',
    description:
      'Granite from $49.99 a sq ft, quartz from $59.99, or laminate, cut to your measurements.',
    image: category('countertops', 'A quartz countertop with a waterfall edge'),
    tilesLabel: 'Shop by',
    tileCtaLabel: 'Shop',
    tiles: [
      {
        name: 'Granite',
        href: '/countertops/granite',
        image: nav('granite', 'Granite countertop'),
      },
      { name: 'Quartz', href: '/countertops/quartz', image: nav('quartz', 'Quartz countertop') },
      {
        name: 'Laminate',
        href: '/countertops/laminate',
        image: nav('laminate', 'Laminate countertop'),
      },
    ],
    action: { label: 'Explore countertops', href: '/countertops' },
  },
  {
    title: 'Appliances that fit the space you have',
    // Appliance delivery is limited to Connecticut zones; add "Delivery in Connecticut" here if
    // EK wants it up front.
    description:
      'Ranges, refrigerators, dishwashers and microwaves from Frigidaire, GE, Whirlpool, Samsung, LG and more, sized to sit flush with your cabinets. In stock, so there’s nothing to wait for.',
    image: category('appliances', 'A stainless range and refrigerator in a white kitchen'),
    tilesLabel: 'Shop by',
    tileCtaLabel: 'Shop',
    tiles: [
      {
        name: 'Ranges',
        href: '/appliances/ranges-cooktops',
        image: nav('ranges-cooktops', 'Range'),
      },
      {
        name: 'Refrigerators',
        href: '/appliances/fridges-freezers',
        image: nav('fridges-freezers', 'Refrigerator'),
      },
      {
        name: 'Dishwashers',
        href: '/appliances/dishwashers',
        image: nav('dishwashers', 'Dishwasher'),
      },
      { name: 'Microwaves', href: '/appliances/microwaves', image: nav('microwaves', 'Microwave') },
    ],
    action: { label: 'Shop appliances', href: '/appliances' },
  },
  {
    title: 'A sink that drops right in',
    description:
      '300+ sinks and 700+ faucets, sized for our sink base cabinets, so there’s no guessing at the cutout.',
    image: category('kitchen-sink', 'A stainless undermount kitchen sink with a pull-down faucet'),
    tilesLabel: 'Shop by',
    tileCtaLabel: 'Shop',
    tiles: [
      {
        name: 'Kitchen sinks',
        href: '/sinks-faucets/kitchen-sinks',
        image: nav('kitchen-sinks', 'Kitchen sink'),
      },
      {
        name: 'Faucets',
        href: '/sinks-faucets/kitchen-faucets',
        image: nav('kitchen-faucets', 'Kitchen faucet'),
      },
      { name: 'Bath', href: '/bath', image: nav('bathroom-faucets', 'Bathroom faucet') },
    ],
    action: { label: 'Shop sinks and faucets', href: '/sinks-faucets' },
  },
  {
    title: 'The finishing touches, and a place for everything',
    description:
      '2,000+ handles and pulls, plus roll-out trays and organizers that keep every drawer tidy.',
    image: category('handles', 'Brushed brass handles on a shaker door'),
    tilesLabel: 'Shop by',
    tileCtaLabel: 'Shop',
    tiles: [
      {
        name: 'Handles',
        href: '/cabinet-hardware/handles-knobs',
        image: nav('handles', 'Cabinet door with a handle'),
      },
      {
        name: 'Organizers',
        href: '/cabinet-hardware/accessories',
        image: nav('accessories', 'Drawer organizer'),
      },
      {
        name: 'Fillers and panels',
        href: '/cabinet-hardware',
        image: { src: '/images/cabinets/accessories.jpg', alt: 'A filler strip and end panel' },
      },
    ],
    action: { label: 'Shop hardware', href: '/cabinet-hardware' },
  },
];

// Online first, then the showroom path.
export const TWO_WAYS: ProgramCard[] = [
  {
    title: 'Do it yourself, and save the most',
    tag: 'Shop online',
    description:
      'Order everything online, at your own pace. Choose RTA to save even more, or assembled to install straight away.',
    points: [
      'RTA ships in 2 weeks',
      'Assembled ships in 3',
      'Free shipping over $2,500',
      'Installation not included',
    ],
    ctaLabel: 'Price my kitchen',
    href: ESTIMATOR_HREF,
    secondary: { label: 'RTA or assembled?', href: '/mykitchen/what-are-rta-cabinets' },
    image: {
      src: '/images/home/programs/rta.webp',
      alt: 'A kitchen in dark grey shaker cabinets',
    },
  },
  {
    title: 'Let us take it off your plate',
    tag: 'Showroom or video',
    description:
      'Visit a showroom or book a video consult. A designer goes through your kitchen with you and hands you one itemized quote for everything. In Connecticut, we can install it too.',
    points: [
      'Free design consult',
      'One quote for the whole kitchen',
      'Installation in CT',
      'Financing in our showrooms',
    ],
    ctaLabel: 'Book a free design consult',
    href: FREE_DESIGN_HREF,
    secondary: { label: 'Find a showroom', href: '/showrooms' },
    image: {
      src: '/images/pages/design-consult/hero-designer-couple-3.jpg',
      alt: 'A designer going through a kitchen plan with a couple at a showroom table',
    },
  },
];

export interface KitchenStep {
  title: string;
  description: string;
  link?: { label: string; href: string };
}

export const STEPS_SECTION = {
  kicker: 'How it goes',
  title: 'From empty room to finished kitchen',
};

export const KITCHEN_STEPS: KitchenStep[] = [
  {
    title: 'Know your space',
    description: 'Twenty minutes with a tape measure. Our measuring guide shows you how.',
    link: { label: 'Measuring guide', href: MEASURING_GUIDE_HREF },
  },
  {
    title: 'See it before you buy',
    description:
      'Your first two door samples are free, so you can check the finish in your own light.',
    link: { label: 'Order samples', href: SAMPLES_HREF },
  },
  {
    title: 'Know your price',
    description:
      'The estimator gives you a range in four steps. Want it itemized? A designer will quote it, free.',
  },
  {
    title: 'Get it on its way',
    description: 'RTA ships in 2 weeks and assembled in 3, plus 7–10 days of transit.',
  },
  {
    title: 'Get it installed',
    description:
      'By you or your installer. Ordered through a showroom in Connecticut? We can install it.',
    link: { label: 'Find an installer', href: INSTALLER_HREF },
  },
];

export const MEASURING_NOTE =
  'In CT and greater-CT zip codes, we can measure your kitchen for $85.';

// The cost band. The "ours start at" sentence is added by the page only when both prices load.
export const COST_BAND_COPY = {
  kicker: 'Prices, up front',
  title: 'Know your budget before you start',
  intro: 'Kitchens are priced on a “10×10”: two 10-foot walls in an L shape, 13 cabinets.',
  // With prices: "...so you know where you stand before you spend anything."
  withPrices: (rta: string, assembled: string) =>
    ` Ours start at ${rta} RTA and ${assembled} assembled, so you know where you stand before you spend anything. The estimator scales that to your kitchen in four steps.`,
  withoutPrices: ' The estimator gives you a range for your kitchen in four steps.',
  actions: [
    { label: 'Price my kitchen', href: ESTIMATOR_HREF, primary: true },
    { label: 'What’s a 10×10?', href: '/resources/ten-by-ten-kitchen' },
  ],
};

export const REVIEWS_TITLE = 'Kitchens our customers love';

export const MYKITCHEN_FAQ: CabinetFaqData = {
  headline: 'Questions before you start',
  items: [
    {
      q: 'Can I get my whole kitchen here?',
      a: 'Yes. Cabinets, countertops, appliances, sinks, faucets and hardware, in one cart. Order online, or through a showroom if you’d like a designer’s help.',
    },
    {
      q: 'How much will my kitchen cost?',
      a: `Cabinets for a 10×10 kitchen start at the prices above, and every collection shows its own 10×10 price. For your kitchen, [the estimator](${ESTIMATOR_HREF}) gives you a range in four steps.`,
    },
    {
      q: 'How soon can I have it?',
      a: 'RTA ships in 2 weeks and assembled in 3, plus 7–10 days of transit. Painted Prism cabinets ship in 8 weeks.',
    },
    {
      q: 'Will you install it?',
      a: 'Online orders don’t include installation. On showroom orders in Connecticut, we install the cabinets and template and install the countertop. Plumbing and electrical aren’t included.',
    },
    {
      q: 'Can I talk to someone first?',
      a: `Yes. [Book a free design consult](${FREE_DESIGN_HREF}) in a showroom or by video, and leave with an itemized quote. Or call or text us any time on 860-247-1000.`,
    },
  ],
};

export const MYKITCHEN_CLOSING = {
  title: 'Your new kitchen starts here',
  description: 'Price it online in four steps, or get a free itemized quote from a designer.',
  primary: { label: 'Price my kitchen', href: ESTIMATOR_HREF },
  secondary: { label: 'Book a free design consult', href: FREE_DESIGN_HREF },
};
