import { type ContentBlock } from '@/vibes/soul/sections/cabinet-program-content';
import { type ExplainerIcon } from '@/vibes/soul/sections/explainer/v2';

import { FREE_DESIGN_HREF } from '../home/home-content';

import { type CabinetProgram } from './cabinet-lines-data';
import { ASSEMBLED_LISTING_HREF, RTA_LISTING_HREF } from './cabinets-hub-content';
import { ASSEMBLED_BUILD_BLOCK } from './program-content';

/**
 * The education-first explainers at /mykitchen/cabinets/{assembled|rta} (v2, Arun's brief of
 * 25 Oct 2026). Written for someone who knows what a cabinet is but has never met "RTA" or
 * "assembled": explain the idea, show what turns up, say where it fits in a remodel, help them
 * choose. Shopping comes last and softly. Prices in the cost table come from the live Avon
 * collection; everything else is here.
 */

export const EXPLAINER_V2_HREF = {
  assembled: '/mykitchen/cabinets/assembled',
  rta: '/mykitchen/cabinets/rta',
};

export interface ExplainerLink {
  label: string;
  href: string;
}

export interface ExplainerV2 {
  meta: { title: string; description: string };
  hero: {
    kicker: string;
    title: string;
    description: string;
    link: ExplainerLink;
    image?: { src: string; alt: string };
    imageLabel: string;
    /** A transparent render, shown whole with no frame. */
    cutout?: boolean;
  };
  twoWays: {
    title: string;
    ways: Array<{ key: CabinetProgram; name: string; summary: string; visualLabel: string }>;
    line: string;
    rule: string;
  };
  arrives: {
    title: string;
    description: string;
    items: string[];
    note: string;
    image?: { src: string; alt: string };
    imageLabel: string;
  };
  timeline: {
    title: string;
    description?: string;
    steps: Array<{ icon: ExplainerIcon; lead: string; text: string }>;
  };
  sameCabinet: { title: string; description: string; note?: string };
  /** The program's "Build quality" red panel, shared with its listing page. */
  build: Extract<ContentBlock, { type: 'build' }>;
  cost: {
    title: string;
    description: string;
    /** First cell is the table's corner label; then the two program columns. */
    columns: [string, string, string];
    /** The Avon price row's label; its two prices come from the live collection. */
    priceRow: string;
    rows: string[][];
    footnote: string;
    footnoteLink?: ExplainerLink;
  };
  suits: { title: string; points: string[]; line: string; link: ExplainerLink };
  glossary: { title: string; terms: Array<{ term: string; definition: string }> };
  faq: { headline: string; items: Array<{ q: string; a: string }> };
  next: {
    kicker: string;
    title: string;
    description: string;
    primary: ExplainerLink;
    secondary: ExplainerLink;
  };
}

// Shared across both pages: the core idea, the glossary, the soft next step.
const TWO_WAYS: ExplainerV2['twoWays'] = {
  title: 'Every cabinet we sell comes one of two ways',
  ways: [
    {
      key: 'assembled',
      name: 'Assembled',
      summary: 'Built in our factory and shipped whole. You unwrap it and it’s ready to install.',
      visualLabel: 'A wrapped, built cabinet on a pallet',
    },
    {
      key: 'rta',
      name: 'RTA (ready to assemble)',
      summary:
        'Shipped flat in a box, as finished panels, doors and hardware. You put it together first, then install it.',
      visualLabel: 'A flat RTA box',
    },
  ],
  line: 'It’s the same cabinet either way. The only question is who builds it: us, or you.',
  rule: 'RTA saves money. Assembled saves time.',
};

const GLOSSARY: ExplainerV2['glossary'] = {
  title: 'Words you’ll see',
  terms: [
    { term: 'Assembled', definition: 'Built in our factory, ready to install.' },
    { term: 'RTA', definition: 'Ready to assemble. Ships flat, and you build it.' },
    {
      term: 'Installed',
      definition: 'Fixed to your wall and floor. A separate step from assembly.',
    },
    { term: 'Cabinet box', definition: 'The body of the cabinet, behind the door.' },
    {
      term: 'Framed / frameless',
      definition:
        'Framed cabinets have a solid wood frame around the front (traditional and shaker looks). Frameless cabinets don’t (modern, European look).',
    },
    {
      term: 'Soft-close',
      definition: 'Doors and drawers that slow down and close quietly on their own.',
    },
    {
      term: '10×10 price',
      definition:
        'The price of a standard sample kitchen, used to compare collections. Not the price of your kitchen.',
    },
  ],
};

const NEXT_STEP: ExplainerV2['next'] = {
  kicker: 'Next step',
  title: 'Not sure what your kitchen needs?',
  description:
    'A designer can plan your room, tell you which option fits, and price it. Free, in a showroom or on a video call.',
  primary: { label: 'Book a free design consult', href: FREE_DESIGN_HREF },
  secondary: { label: 'Browse cabinet styles', href: ASSEMBLED_LISTING_HREF },
};

export const ASSEMBLED_EXPLAINER: ExplainerV2 = {
  meta: {
    title: 'What are assembled kitchen cabinets?',
    description:
      'Assembled cabinets arrive built and ready to install. What arrives, how it differs from RTA, what it costs, and where it fits in your remodel.',
  },
  hero: {
    kicker: 'Cabinets explained',
    title: 'What are assembled cabinets?',
    description:
      'Kitchen cabinets that arrive already built. We put each one together in our factory (box, doors, drawers and shelves), so when it reaches you, it’s ready to install. It costs a little more than building them yourself, but it saves you days of work and gets your kitchen finished sooner.',
    link: {
      label: 'Or read about RTA cabinets, the build-it-yourself option',
      href: EXPLAINER_V2_HREF.rta,
    },
    // A rendered L-shaped kitchen of assembled cabinets, on a transparent background.
    image: {
      src: '/images/explainers/assembled-kitchen-render.png',
      alt: 'A rendered L-shaped kitchen of light wood assembled cabinets with a hood, sink and fridge',
    },
    imageLabel: 'A finished kitchen, assembled cabinets installed',
    cutout: true,
  },
  twoWays: TWO_WAYS,
  arrives: {
    title: 'What arrives',
    description:
      'Your cabinets arrive on a pallet, each one wrapped and labeled so you know which goes where.',
    items: [
      'Built cabinet boxes, square and ready',
      'Doors already hung and adjusted',
      'Drawers already fitted',
      'Shelves in place',
    ],
    note: 'Delivery is to the ground floor. Getting them inside or upstairs is up to you, unless you’ve added a delivery service. Built cabinets take up room, so clear space in a garage or spare room to keep them until installation.',
    imageLabel: 'An unwrapped assembled base cabinet',
  },
  timeline: {
    title: 'Where cabinets fit in your remodel',
    description:
      'Assembled means the cabinet is built. It doesn’t mean it’s installed. Here’s what usually happens:',
    steps: [
      {
        icon: 'cart',
        lead: 'Order',
        text: 'Most collections ship in 3 weeks (Euro in 4, Prism painted colors in 8), then spend 7–10 days in transit.',
      },
      {
        icon: 'truck',
        lead: 'Delivery',
        text: 'Check each cabinet before you sign, and write any damage on the delivery receipt.',
      },
      {
        icon: 'hammer',
        lead: 'Installation',
        text: 'An installer fixes the cabinets to the wall and floor, levels them and joins them together. In Connecticut, we can install when you order through a showroom. Elsewhere, you hire your own installer.',
      },
      {
        icon: 'ruler',
        lead: 'Countertops',
        text: 'Countertops are measured after the cabinets are in, so they fit exactly.',
      },
      {
        icon: 'sparkles',
        lead: 'Finishing',
        text: 'Handles, trim and fillers go on last.',
      },
    ],
  },
  sameCabinet: {
    title: 'Same cabinet, either way',
    description:
      'Assembled isn’t a premium version. It’s the same cabinet as RTA, from the same factory, with the same 1-year warranty. You’re paying for the building time, not for better materials.',
    note: 'Most of our lines have plywood boxes (Euro Value uses an engineered board box), dovetail drawers and soft-close doors.',
  },
  build: ASSEMBLED_BUILD_BLOCK,
  cost: {
    title: 'Money or time',
    description:
      'Because we do the building, assembled costs more than RTA. RTA costs less, but you or your installer spend time putting each cabinet together, about 45 minutes for the first cabinet and 20–30 minutes for each one after.',
    columns: ['A 10×10 kitchen, cabinets only', 'RTA', 'Assembled'],
    priceRow: 'Avon (white shaker)',
    rows: [
      ['!Assembly time', 'About 5–6 hours (around 12 cabinets)', 'None'],
      ['!Ships in', '2 weeks', '3 weeks'],
    ],
    footnote:
      'A 10×10 is a standard comparison kitchen: two 10-foot walls in an L shape. A real kitchen with an island or a pantry will cost more.',
    footnoteLink: { label: 'What’s a 10×10?', href: '#glossary' },
  },
  suits: {
    title: 'Assembled is usually the right call if…',
    points: [
      'You’re hiring an installer. Paying them by the hour to build boxes usually costs more than the difference.',
      'You haven’t built flat-pack furniture or cabinets before.',
      'You want the kitchen done sooner, with no assembly days.',
      'You want Prism painted colors or Euro Value. Both come assembled only.',
    ],
    line: 'Handy, with time to spare? RTA may suit you better.',
    link: { label: 'Read about RTA', href: EXPLAINER_V2_HREF.rta },
  },
  glossary: GLOSSARY,
  faq: {
    headline: 'Questions people ask',
    items: [
      {
        q: 'Does assembled mean installed?',
        a: 'No. Assembled means built. Installing is a separate step, done by an installer (or by us, for Connecticut showroom orders).',
      },
      {
        q: 'Is assembled better quality than RTA?',
        a: 'No. It’s the same cabinet. Only who builds it changes.',
      },
      {
        q: 'How long does it take to arrive?',
        a: 'Most collections ship in 3 weeks, then 7–10 days in transit.',
      },
      {
        q: 'Can I return assembled cabinets?',
        a: 'No, because they’re built for your order. Order free door samples and have a designer check your list before you buy.',
      },
      {
        q: 'What if a cabinet arrives damaged?',
        a: 'Tell us within 3 days of delivery, with photos, and write the damage on the delivery receipt. We’ll replace it.',
      },
      {
        q: 'Can I mix assembled and RTA in one kitchen?',
        a: 'Yes, on lines offered both ways. They match.',
      },
    ],
  },
  next: NEXT_STEP,
};

/** The v2 explainers that exist so far; a program without one keeps the v1 page. */
export const EXPLAINER_V2: Partial<Record<CabinetProgram, ExplainerV2>> = {
  assembled: ASSEMBLED_EXPLAINER,
};

export { RTA_LISTING_HREF };
