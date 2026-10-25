import { type ContentBlock } from '@/vibes/soul/sections/cabinet-program-content';
import { type ExplainerIcon } from '@/vibes/soul/sections/explainer/v2';
import { type Metric } from '@/vibes/soul/sections/why-us-scroll';

import { FREE_DESIGN_HREF } from '../home/home-content';

import { type CabinetProgram } from './cabinet-lines-data';
import { ASSEMBLED_LISTING_HREF, RTA_LISTING_HREF } from './cabinets-hub-content';
import { ASSEMBLED_BUILD_BLOCK, RTA_BUILD_BLOCK } from './program-content';

/**
 * The education-first explainers at /mykitchen/cabinets/{assembled|rta} (v2, Arun's brief of
 * 25 Oct 2026). Written for someone who knows what a cabinet is but has never met "RTA" or
 * "assembled": explain the idea, show what turns up, say where it fits in a remodel, help them
 * choose. Shopping comes last and softly. Prices in the cost table come from the live Avon
 * collection; everything else is here.
 */

/** The headline figures under each explainer hero (the Why Express Kitchens ticker). */
export const EXPLAINER_METRICS: Metric[] = [
  { icon: 'package', value: '50,000+', label: 'Assembled cabinets, ready to ship' },
  { icon: 'star', value: '5,000+', label: 'Happy customer reviews' },
  { icon: 'design', value: '100K+', label: 'Kitchens designed' },
  { icon: 'pin', value: '6', label: 'Showrooms to visit' },
  { icon: 'shield', value: 'A+', label: 'BBB rating' },
];

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
    /** A soft text link under the paragraph (e.g. to the other program). */
    link?: ExplainerLink;
    image?: { src: string; alt: string; width?: number; height?: number };
    imageLabel: string;
    /** A transparent render, shown whole with no frame at its own proportions (needs width and
     *  height so it can fill the column). */
    cutout?: boolean;
  };
  twoWays: {
    title: string;
    ways: Array<{
      key: CabinetProgram;
      name: string;
      summary: string;
      image?: { src: string; alt: string };
      visualLabel: string;
      link?: ExplainerLink;
    }>;
    line: string;
    /** The rule of thumb, one clause per entry ("RTA saves money.", "Assembled saves time."). */
    rules: string[];
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
    /** A clip under the steps; a placeholder until the video is supplied. */
    media?: {
      label: string;
      /** A YouTube video id (embedded privacy-enhanced; YouTube carries the captions). */
      youtubeId?: string;
      /** Or a self-hosted clip, with a WebVTT captions file (WCAG 1.2.2). */
      video?: { mp4?: string; webm?: string; poster?: string; captions: string };
      link?: ExplainerLink;
    };
  };
  sameCabinet: { title: string; description: string; note?: string };
  /** The program's "Build quality" red panel, shared with its listing page. */
  build: Extract<ContentBlock, { type: 'build' }>;
  cost: {
    title: string;
    description: string;
    /** First cell is the table's corner label; then the two program columns. */
    columns: [string, string, string];
    /** The collection the price row quotes (its live 10×10 price in each program, and its
     *  lead times for the "Ships in" row when the listing carries them). */
    priceCollection: string;
    /** The price row's label. */
    priceRow: string;
    rows: string[][];
    footnote: string;
    footnoteLink?: ExplainerLink;
    /** The collection whose kitchen photo sits beside the table (the table itself prices Avon). */
    imageCollection: string;
  };
  suits: { title: string; points: string[]; line: string; link: ExplainerLink };
  glossary: {
    title: string;
    terms: Array<{ term: string; definition: string }>;
    /** "See the full cabinet glossary". */
    link?: ExplainerLink;
  };
  faq: { headline: string; items: Array<{ q: string; a: string }> };
  next: {
    kicker: string;
    title: string;
    description: string;
    primary: ExplainerLink;
    secondary: ExplainerLink;
  };
}

// Shared across both pages: the core idea (the other program's card carries a link to its page,
// and the rule of thumb leads with the page's own program), the glossary, the soft next step.
const twoWays = (current: CabinetProgram): ExplainerV2['twoWays'] => {
  const ways: ExplainerV2['twoWays']['ways'] = [
    {
      key: 'assembled',
      name: 'Assembled',
      summary: 'Built in our factory and shipped whole. You unwrap it and it’s ready to install.',
      image: {
        src: '/images/explainers/assembled-cabinets-espresso.jpg',
        alt: 'A run of built espresso shaker base cabinets, with a tall pantry at one end',
      },
      visualLabel: 'A wrapped, built cabinet on a pallet',
      link: { label: 'Read about assembled', href: EXPLAINER_V2_HREF.assembled },
    },
    {
      key: 'rta',
      name: 'RTA (ready to assemble)',
      summary:
        'Shipped flat in a box, as finished panels, doors and hardware. You put it together first, then install it.',
      image: {
        src: '/images/explainers/rta-box-and-cabinet-espresso.jpg',
        alt: 'An opened flat RTA box with its espresso panels, doors and hardware, beside the same cabinet built',
      },
      visualLabel: 'A flat RTA box',
      link: { label: 'Read about RTA', href: EXPLAINER_V2_HREF.rta },
    },
  ];
  const rules = ['Assembled saves time.', 'RTA saves money.'];

  // The page's own program comes first; its card needs no link to itself, the other one does.
  const ordered = ways.map((way) => (way.key === current ? { ...way, link: undefined } : way));

  return {
    title: 'Every cabinet we sell comes one of two ways',
    ways: current === 'rta' ? [...ordered].reverse() : ordered,
    line: 'It’s the same cabinet either way. The only question is who builds it: us, or you.',
    rules: current === 'rta' ? [...rules].reverse() : rules,
  };
};

// The words every explainer defines; each page orders them and adds its own.
const TERM = {
  assembled: { term: 'Assembled', definition: 'Built in our factory, ready to install.' },
  rta: {
    term: 'RTA (ready to assemble)',
    definition: 'Shipped flat in boxes. You build each cabinet before it’s installed.',
  },
  installed: {
    term: 'Installed',
    definition: 'Fixed to your wall and floor. A separate step from assembly.',
  },
  box: { term: 'Cabinet box', definition: 'The body of the cabinet, behind the door.' },
  framed: {
    term: 'Framed / frameless',
    definition:
      'Framed cabinets have a solid wood frame around the front (traditional and shaker looks). Frameless cabinets don’t (a modern, European look).',
  },
  softClose: {
    term: 'Soft-close',
    definition: 'Doors and drawers that slow down and close quietly.',
  },
  tenByTen: {
    term: '10×10 price',
    definition:
      'The price of a standard sample kitchen, used to compare collections. Not the price of your kitchen.',
  },
  camLock: {
    term: 'Cam lock',
    definition: 'The round fitting that pulls two panels tightly together when you turn it.',
  },
  tall: {
    term: 'Tall cabinet',
    definition: 'A floor-to-ceiling unit, such as a pantry. Heavier, and best built by two people.',
  },
};

// No glossary page exists yet; this is the planned address.
const GLOSSARY_LINK: ExplainerLink = {
  label: 'See the full cabinet glossary',
  href: '/resources/cabinet-glossary',
};

const GLOSSARY: ExplainerV2['glossary'] = {
  title: 'Words you’ll see',
  terms: [
    TERM.assembled,
    TERM.rta,
    TERM.installed,
    TERM.box,
    TERM.framed,
    TERM.softClose,
    TERM.tenByTen,
  ],
  link: GLOSSARY_LINK,
};

// The RTA page's glossary: the same words, RTA first, plus the two a builder meets.
const RTA_GLOSSARY: ExplainerV2['glossary'] = {
  title: 'Words you’ll see',
  terms: [
    TERM.rta,
    TERM.assembled,
    TERM.installed,
    TERM.box,
    TERM.camLock,
    TERM.tall,
    TERM.framed,
    TERM.tenByTen,
  ],
  link: GLOSSARY_LINK,
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
    // A rendered L-shaped kitchen of assembled cabinets, on a transparent background.
    image: {
      src: '/images/explainers/assembled-kitchen-render.png',
      alt: 'A rendered L-shaped kitchen of light wood assembled cabinets with a hood, sink and fridge',
      width: 1600,
      height: 866,
    },
    imageLabel: 'A finished kitchen, assembled cabinets installed',
    cutout: true,
  },
  twoWays: twoWays('assembled'),
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
    note: 'Delivery is curbside: the driver unloads the pallet at the curb or the end of your driveway. Getting the cabinets inside is up to you, unless you’ve added a delivery service, so line up a hand or two for delivery day. Built cabinets take up room, too, so clear space in a garage or spare room to keep them until installation.',
    image: {
      src: '/images/explainers/assembled-wrapped-cabinet.jpg',
      alt: 'A built white base cabinet wrapped in bubble wrap with corner protectors, standing in its opened carton',
    },
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
    priceCollection: 'Avon',
    priceRow: 'Avon (white shaker)',
    rows: [
      ['!Assembly time', 'About 5–6 hours (around 12 cabinets)', 'None'],
      ['!Ships in', '2 weeks', '3 weeks'],
    ],
    footnote:
      'A 10×10 is a standard comparison kitchen: two 10-foot walls in an L shape. A real kitchen with an island or a pantry will cost more.',
    footnoteLink: { label: 'What’s a 10×10?', href: '#glossary' },
    imageCollection: 'Avon',
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

export const RTA_EXPLAINER: ExplainerV2 = {
  meta: {
    title: 'What are RTA cabinets? Ready-to-assemble explained',
    description:
      'RTA cabinets ship flat for you to build. What’s in the box, how long it takes, what you save, and whether it suits your kitchen.',
  },
  hero: {
    kicker: 'Cabinets explained',
    title: 'What are RTA cabinets?',
    description:
      'RTA stands for ready to assemble. The cabinets arrive flat in boxes, with finished doors and every part labeled, and you put them together before they’re installed. It takes time, but because you do the building, you pay less.',
    // A homeowner on the floor mid-build, fitting a shaker door, on white (shown as a cut-out).
    image: {
      src: '/images/explainers/rta-hero-v2.jpg',
      alt: 'A man sitting on the floor fitting a white shaker door to a base cabinet, parts and hardware around him',
      width: 1600,
      height: 1000,
    },
    imageLabel: 'A flat RTA box beside the same cabinet built',
    cutout: true,
  },
  twoWays: twoWays('rta'),
  arrives: {
    title: 'What’s in the box',
    description: 'Each cabinet comes in its own labeled box, delivered on a pallet.',
    items: [
      'Finished side, back and bottom panels',
      'Doors and drawer fronts, already painted or stained',
      'Drawer boxes and shelves',
      'Hinges, already attached to the doors',
      'Screws, fittings and instructions, with every part labeled',
    ],
    note: 'Delivery is curbside: the driver unloads the pallet at the curb or the end of your driveway. Getting the boxes inside is up to you, unless you’ve added a delivery service, so line up a hand or two for delivery day. Flat boxes stack, so they take less room than built cabinets while they wait.',
    image: {
      src: '/images/explainers/rta-flatlay-espresso.jpg',
      alt: 'An opened RTA carton laid flat: espresso shaker door and drawer front, panels, a handle, hinges, dowels and an Allen key',
    },
    imageLabel: 'A flat-lay of one opened RTA box',
  },
  timeline: {
    title: 'Where building fits in your remodel',
    steps: [
      {
        icon: 'cart',
        lead: 'Order',
        text: 'Star RTA ships in 2 weeks, Euro Max RTA in 4, then 7–10 days in transit.',
      },
      {
        icon: 'package-check',
        lead: 'Check every box',
        text: 'Before building anything, make sure all the parts are there and undamaged. Once a cabinet is built, it can’t be returned.',
      },
      {
        icon: 'wrench',
        lead: 'Build',
        text: 'Put each cabinet together: about 45 minutes for the first, then 20–30 minutes each, longer for tall pantry units. Plan on a second person for the big ones.',
      },
      {
        icon: 'hammer',
        lead: 'Install',
        text: 'Fix the cabinets to the wall and floor, then level and join them. You can do this yourself, or hire an installer. In Connecticut, showroom orders can include installation.',
      },
      {
        icon: 'ruler',
        lead: 'Countertops, then finishing',
        text: 'Countertops are measured once the cabinets are in. Handles, trim and fillers go on last.',
      },
    ],
    media: {
      label: 'One wall cabinet being built, start to finish.',
      // "How to assemble a wall cabinet", from EK's YouTube channel.
      youtubeId: 'LrShEET4g20',
      // EK's "Installation Guide" playlist on YouTube: assembly and installation, every cabinet.
      link: {
        label: 'Watch all assembly and installation videos',
        href: 'https://www.youtube.com/watch?v=tYEPnjp9-w8&list=PLvW4V4-1I9cHk3a7Szu-CCISzmlaHmgvb',
      },
    },
  },
  sameCabinet: {
    title: 'Same cabinet, either way',
    description:
      'RTA isn’t a cheaper cabinet. It’s the same one we sell assembled, from the same factory, with the same 1-year warranty. You save because you’re doing the building.',
  },
  build: RTA_BUILD_BLOCK,
  cost: {
    title: 'Money or time',
    description:
      'RTA costs less because you put each cabinet together yourself. The trade-off is time: about 45 minutes for the first cabinet and 20–30 minutes for each one after.',
    columns: ['A 10×10 kitchen, cabinets only', 'RTA', 'Assembled'],
    priceCollection: 'Northampton',
    priceRow: 'Northampton (walnut)',
    rows: [
      ['!Assembly time', 'About 5–6 hours (around 12 cabinets)', 'None'],
      ['!Ships in', '2 weeks', '3 weeks'],
    ],
    footnote:
      'A 10×10 kitchen is about 12 cabinets, so plan on most of a day. The bigger the kitchen, the more you save, and the more hours you’ll spend building.',
    footnoteLink: { label: 'What’s a 10×10?', href: '#glossary' },
    imageCollection: 'Northampton',
  },
  suits: {
    title: 'RTA is usually the right call if…',
    points: [
      'You’ve built flat-pack furniture or cabinets before and enjoyed it.',
      'You have a few free days before installation.',
      'You’re installing the cabinets yourself.',
      'You want the lowest price on a Star or Euro Max kitchen.',
    ],
    line: 'Worth knowing: if you’d pay someone to build them, most of the saving goes, and assembled is usually the better deal. Hiring an installer, or short on time?',
    link: { label: 'Read about assembled', href: EXPLAINER_V2_HREF.assembled },
  },
  glossary: RTA_GLOSSARY,
  faq: {
    headline: 'Questions people ask',
    items: [
      {
        q: 'What does RTA stand for?',
        a: 'Ready to assemble. The cabinets ship flat and you put them together.',
      },
      {
        q: 'Is RTA lower quality than assembled?',
        a: 'No. It’s the same cabinet, built by you instead of us.',
      },
      {
        q: 'How hard is it?',
        a: 'If you’ve built flat-pack furniture, you can do it. It’s not difficult, but it takes time: plan on about 45 minutes for your first cabinet, and about 20–30 minutes each once you’ve got the hang of it.',
      },
      {
        q: 'What tools do I need?',
        a: 'A cordless drill or screwdriver, a rubber mallet and a tape measure. No saw or glue needed.',
      },
      {
        q: 'Which collections come RTA?',
        a: 'Star and Euro Max. Prism and Euro Value come assembled only.',
      },
      {
        q: 'What if a part is missing or damaged?',
        a: 'Check every box before you build. Tell us within 3 days of delivery, with photos, and we’ll send a replacement part.',
      },
      {
        q: 'Can I return RTA cabinets?',
        a: 'Yes, unopened boxes within 30 days, with a 30% restocking fee. Not once they’re built.',
      },
    ],
  },
  next: { ...NEXT_STEP, secondary: { label: 'Browse cabinet styles', href: RTA_LISTING_HREF } },
};

/** The v2 explainers, by program. */
export const EXPLAINER_V2: Record<CabinetProgram, ExplainerV2> = {
  assembled: ASSEMBLED_EXPLAINER,
  rta: RTA_EXPLAINER,
};
