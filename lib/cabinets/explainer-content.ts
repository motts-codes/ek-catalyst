import { type RowCard } from '@/vibes/soul/sections/cards-row';
import { type ExplainerStep, type PairCard } from '@/vibes/soul/sections/explainer';

import { ESTIMATOR_HREF, FREE_DESIGN_HREF } from '../home/home-content';

import { type CabinetProgram } from './cabinet-lines-data';
import { ASSEMBLED_LISTING_HREF, INSTALLER_HREF, RTA_LISTING_HREF } from './cabinets-hub-content';

// Copy for the two guided explainers at /mykitchen/cabinets/{rta|assembled}. Linked from the
// program listing banners ("New to RTA? Watch the explainer"). "[X]" figures are the business's
// to fill in. Prices in the honest-math table come from the live Avon collection.

export const EXPLAINER_HREF = {
  rta: '/mykitchen/cabinets/rta',
  assembled: '/mykitchen/cabinets/assembled',
};
export const LISTING_HREF = { rta: RTA_LISTING_HREF, assembled: ASSEMBLED_LISTING_HREF };
export const PROGRAM_NAME = { rta: 'RTA', assembled: 'Assembled' };

export interface ExplainerContent {
  title: string;
  description: string;
  otherLabel: string;
  math: { description: string; rows: string[][]; footnote: string };
  steps: {
    title: string;
    description: string;
    steps?: ExplainerStep[];
    schedule?: Array<[string, string]>;
    mediaLabel: string;
  };
  escape: PairCard;
  install: { title: string; description: string };
  faqFallback: Array<{ q: string; a: string }>;
}

export const SAME_FACTORY: RowCard[] = [
  { title: 'Same factory', description: 'Both programs come out of the same Connecticut shop.' },
  { title: 'Same materials', description: 'Same box, same door, same finish process.' },
  { title: 'Same warranty', description: '[X] years on the box and the door, either way.' },
];

export const DESIGN_CARD: PairCard = {
  kicker: 'Or',
  title: 'Have us design it',
  description:
    'A designer plans your room, prices it both ways, and tells you which makes sense for you. Free.',
  cta: { label: 'Book a design consult', href: FREE_DESIGN_HREF, primary: true },
};

export const PRICE_MY_KITCHEN = { label: 'Price my kitchen in 2 minutes', href: ESTIMATOR_HREF };
export { INSTALLER_HREF };

export const EXPLAINER: Record<CabinetProgram, ExplainerContent> = {
  rta: {
    title: 'The same cabinets, in boxes — you assemble, you save about $[X] on a typical kitchen',
    description:
      "Same finish, same warranty, same Star Cabinetry box. It just turns up flat, in about [X] boxes, and you put it together. Here's honestly what that involves.",
    otherLabel: 'Rather they arrived built?',
    math: {
      description: 'Avon, priced both ways. This is what you save.',
      rows: [
        ['!Lead time', '2 weeks', '3 weeks'],
        ['!Your labor', 'About [X] hours', 'None'],
        ['!What arrives', 'Flat boxes on a pallet', 'Built cabinets, wrapped'],
        ['!Warranty', '[X] years', '[X] years'],
      ],
      footnote:
        "Assembled isn't the premium option. It's the same cabinet with the labor already done.",
    },
    steps: {
      title: 'Can I do this?',
      description:
        "Doors arrive finished and hung. You fix the box together, fit the shelf, and hang it. If an IKEA wardrobe didn't defeat you, a cabinet won't.",
      steps: [
        { label: 'Time', value: 'About [X] min per cabinet' },
        { label: 'Tools', value: 'Screwdriver, mallet, set square' },
        { label: 'People', value: 'One. Two for tall units.' },
      ],
      mediaLabel: 'Video — one base cabinet assembled, 90 seconds, unedited',
    },
    escape: {
      kicker: 'Escape hatch',
      title: 'Not sure? Get it assembled.',
      description: 'Same cabinets, one more week, no weekend.',
      cta: { label: 'See assembled', href: '/mykitchen/cabinets/assembled' },
    },
    install: {
      title: 'RTA ≠ installed',
      description:
        'Installation not included. You build them and you hang them, or your installer does.',
    },
    faqFallback: [
      {
        q: 'What tools do I need?',
        a: 'A screwdriver, a mallet and a set square. No power tools are required.',
      },
      {
        q: 'How long does one cabinet take?',
        a: 'About [X] minutes once you have done the first one.',
      },
      {
        q: 'What if a part arrives damaged?',
        a: 'Tell us within [X] days and we ship the replacement part from Bristol.',
      },
      {
        q: 'Can I mix RTA and assembled?',
        a: 'Yes — the box, door and finish are identical, so they sit side by side.',
      },
    ],
  },
  assembled: {
    title: 'Built in our Connecticut shop, delivered ready to hang',
    description:
      'Same collections, same finishes, same price list as RTA — with the building already done. Three weeks instead of two, and no weekend on the floor.',
    otherLabel: 'Rather save and assemble?',
    math: {
      description: 'Avon, priced both ways. This is what the upgrade buys.',
      rows: [
        ['!Lead time', '2 weeks', '3 weeks'],
        ['!Your labor', 'About [X] hours', 'None'],
        ['!What arrives', 'Flat boxes on a pallet', 'Built cabinets, wrapped'],
        ['!Warranty', '[X] years', '[X] years'],
      ],
      footnote:
        "Assembled isn't the premium option. It's the same cabinet with the labor already done.",
    },
    steps: {
      title: 'What factory assembly includes',
      description:
        'Box built and squared, doors hung and adjusted, drawers fitted and soft-close checked. Wrapped for transport. Delivered in three weeks, or will-call from Bristol.',
      schedule: [
        ['Order', 'Day 0'],
        ['Built and checked', 'Week 2'],
        ['Wrapped and delivered', 'Week 3'],
      ],
      mediaLabel: 'Photo — the assembly shop floor',
    },
    escape: {
      kicker: 'Escape hatch',
      title: 'Want to save? Get it RTA.',
      description: 'Same cabinets, one week sooner, about [X]% less.',
      cta: { label: 'See RTA', href: '/mykitchen/cabinets/rta' },
    },
    install: {
      title: 'Assembled ≠ installed',
      description: 'Installation not included. They arrive built; you or your installer hang them.',
    },
    faqFallback: [
      {
        q: 'Is assembled the same quality as RTA?',
        a: 'Identical — same box, door and finish. The only difference is who builds the box.',
      },
      {
        q: 'Does assembled mean installed?',
        a: 'No. Assembled means the cabinet box is built. Hanging and levelling is your installer’s job.',
      },
      {
        q: 'Can I collect assembled cabinets myself?',
        a: 'Yes — will-call from Bristol once your order is built.',
      },
      { q: 'What if a cabinet arrives damaged?', a: 'Tell us within [X] days and we replace it.' },
    ],
  },
};
