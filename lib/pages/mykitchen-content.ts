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
import { ESTIMATOR_HREF, FREE_DESIGN_HREF } from '~/lib/home/home-content';

// Content for /mykitchen, the whole-kitchen hub, per EK's brief of 12 Nov 2026. Stock figures are
// the website's product panel (the same ones the multifamily page uses); lead times and policy
// lines are EK's Oct 27 answers.

export const MYKITCHEN_HERO = {
  kicker: 'My kitchen',
  title: 'Your whole kitchen, from one place',
  description:
    'Cabinets, countertops, appliances, sinks and hardware, all chosen together and priced on one quote. Sit down with a designer in a showroom or by video, free. On showroom orders in Connecticut, we can install it too.',
  image: {
    src: '/images/why-us/final.webp',
    alt: 'A finished white shaker kitchen with a dark stone countertop, stainless range and nickel pendant lights',
  },
};

export const MYKITCHEN_METRICS: Metric[] = [
  { icon: 'calendar', value: '110+', label: 'Years making kitchens' },
  { icon: 'package', value: '50,000+', label: 'Cabinets in stock' },
  { icon: 'star', value: '5,000+', label: 'Customer reviews' },
  { icon: 'pin', value: '6', label: 'Showrooms in Connecticut' },
  { icon: 'shield', value: 'A+', label: 'BBB rating' },
];

const nav = (file: string, alt: string) => ({ src: `/images/nav/${file}.webp`, alt });
const category = (file: string, alt: string) => ({
  src: `/images/home/categories/${file}.webp`,
  alt,
});

// One row per category. The Prism tile's photo is filled in by the page from the live collections.
export const PRISM_TILE_NAME = 'Painted (Prism)';

export const CATEGORY_ROWS: FeatureRow[] = [
  {
    title: 'Cabinets',
    description:
      'Shaker, modern, raised panel or stained wood, framed or frameless. 50,000+ in stock. RTA ships in 2 weeks, assembled in 3.',
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
    title: 'Countertops',
    description:
      'Granite from $49.99 a sq ft, quartz from $59.99, and laminate. Cut to your measurements. On showroom orders, we template and install.',
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
    title: 'Appliances',
    description:
      'Ranges, refrigerators, dishwashers, microwaves and hoods from Frigidaire, GE, Whirlpool, Samsung, LG and more, sized to fit your cabinets. Online, we show what’s in stock.',
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
    title: 'Sinks and faucets',
    description: '300+ sinks and 700+ faucets in stock, sized for our sink base cabinets.',
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
    title: 'Hardware and accessories',
    description:
      '2,000+ handles and pulls, plus roll-out trays, organizers, fillers and panels to finish the job.',
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

export const TWO_WAYS: ProgramCard[] = [
  {
    title: 'We handle it',
    tag: 'Showroom or video',
    description:
      'Visit a showroom or book a video consult. A designer goes through your whole kitchen with you and gives you one itemized quote: cabinets, countertop, appliances and the rest. In Connecticut, we can install it.',
    points: [
      'Free design consult',
      'One quote for everything',
      'Installation in CT',
      'Financing in our showrooms',
    ],
    ctaLabel: 'Book a free design consult',
    href: FREE_DESIGN_HREF,
    image: {
      src: '/images/pages/design-consult/hero-designer-couple-3.jpg',
      alt: 'A designer going through a kitchen plan with a couple at a showroom table',
    },
  },
  {
    title: 'You do it',
    tag: 'Shop online',
    description:
      'Shop online and save. Choose RTA to save even more, or assembled to install straight away. Your installer handles the rest.',
    points: [
      'RTA ships in 2 weeks',
      'Assembled ships in 3',
      'Free shipping over $2,500',
      'Installation not included',
    ],
    ctaLabel: 'How RTA works',
    href: '/mykitchen/what-are-rta-cabinets',
    secondary: { label: 'How assembled works', href: '/mykitchen/what-are-assembled-cabinets' },
    image: {
      src: '/images/home/programs/rta.webp',
      alt: 'A kitchen in dark grey shaker cabinets',
    },
  },
];

export interface KitchenStep {
  title: string;
  description: string;
  link?: { label: string; href: string };
}

export const KITCHEN_STEPS: KitchenStep[] = [
  {
    title: 'Share your space',
    description:
      'Send your measurements, photos or a wish list. No measurements yet? Start anyway.',
  },
  {
    title: 'Choose your style',
    description:
      'Pick a door, a countertop and your appliances. Your first two door samples are free.',
  },
  {
    title: 'Get your quote',
    description: 'A designer prices the whole kitchen, itemized, RTA and assembled. Free.',
  },
  {
    title: 'Order',
    description: 'RTA ships in 2 weeks, assembled in 3, plus 7–10 days of transit.',
  },
  {
    title: 'Install',
    description:
      'On showroom orders in Connecticut, we install. Ordering online? Here’s how to find an installer.',
    link: { label: 'Find an installer', href: INSTALLER_HREF },
  },
];

export const MEASURING_NOTE =
  'In CT and greater-CT zip codes, we can measure your kitchen for $85.';

// The cost band. The estimator covers cabinets only, so the range it gives is for the cabinets;
// the countertop and appliances are priced in the consult.
export const COST_BAND_INTRO =
  'Kitchens are priced on a “10×10”: two 10-foot walls in an L shape, 13 cabinets.';
export const COST_BAND_OUTRO =
  'The estimator gives you a range for your cabinets in four steps, and a designer prices the countertop and appliances with you, free.';
export const COST_BAND_ACTIONS = [
  { label: 'Price my kitchen', href: ESTIMATOR_HREF, primary: true },
  { label: 'What’s a 10×10?', href: '/resources/ten-by-ten-kitchen' },
];

export const MYKITCHEN_FAQ: CabinetFaqData = {
  headline: 'Questions before you start',
  items: [
    {
      q: 'Can you do my whole kitchen?',
      a: 'Yes. Cabinets, countertops, appliances, sinks, faucets and hardware, all on one quote. On showroom orders in Connecticut, we install the cabinets and template and install the countertop. Plumbing and electrical aren’t included.',
    },
    {
      q: 'How much will my kitchen cost?',
      a: `Cabinets for a 10×10 kitchen start at the prices above, and every collection shows its own 10×10 price. For your kitchen, use [the estimator](${ESTIMATOR_HREF}), or get a free itemized quote from [a designer](${FREE_DESIGN_HREF}).`,
    },
    {
      q: 'What happens in a free design consult?',
      a: 'You go through your kitchen with a designer, in a showroom or by video, and leave with an itemized quote. No deposit, nothing to sign up for.',
    },
    {
      q: 'How long does it take?',
      a: 'RTA ships in 2 weeks and assembled in 3, plus 7–10 days of transit. Painted Prism cabinets ship in 8 weeks.',
    },
    {
      q: 'Can I pay over time?',
      a: 'Yes, on showroom orders. Financing is through GreenSky, from 9.99% APR.',
    },
  ],
};

export const MYKITCHEN_CLOSING = {
  title: 'Let’s plan your kitchen',
  description:
    'Book a free design consult in a showroom or by video, and get one quote for the whole kitchen.',
  primary: { label: 'Book a free design consult', href: FREE_DESIGN_HREF },
  secondary: { label: 'Find a showroom', href: '/showrooms' },
};
