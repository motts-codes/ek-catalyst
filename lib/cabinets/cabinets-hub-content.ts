import { type RowCard } from '@/vibes/soul/sections/cards-row';
import { type FeatureRow } from '@/vibes/soul/sections/feature-rows';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';

// Default content for the Cabinets hub (/cabinets) — the education page between the home page and
// the two program listings. Every band is a Makeswift slot on the page; this is what renders until
// marketing replaces it. Copy follows the wireframe; "[X]" figures were left for the business.

export const ASSEMBLED_LISTING_HREF = '/cabinets/assembled-cabinets';
export const RTA_LISTING_HREF = '/cabinets/rta-cabinets';
export const INSTALLER_HREF = '/find-a-pro';

export const HUB_HERO = {
  kicker: 'Made for the room you live in',
  title: "The kitchen you've pictured, without the 14-week wait",
  description:
    '100+ door styles in 30+ colors, built in our Connecticut factory. Assembled or ready to assemble, same cabinet either way.',
  note: 'Twenty-three collections across four lines, every one on the same ¾-inch all-plywood box — made in Connecticut, stocked in Bristol.',
  imageLabel: 'A finished Connecticut kitchen, wide',
};

// "Find your style" — a look first, then the collections that carry it. The collection names map
// to live collections where they exist in the catalog; the rest show as placeholders until the
// collection is created (see docs/CABINET-REPLICATION.md).
export interface StyleRow extends Omit<FeatureRow, 'tiles'> {
  collections: string[];
}

export const STYLE_ROWS: StyleRow[] = [
  {
    kicker: 'The style most American kitchens are built in',
    title: 'Shaker',
    description:
      'A five-piece door with a flat center panel. Classic with a stain and a knob, modern in white with a bar pull — which is why it is the door people order most.',
    imageLabel: 'Shaker kitchen',
    collections: ['Avon', 'Cambridge', 'Mero', 'Tribeca Shaker'],
  },
  {
    kicker: 'Flat doors, clean lines',
    title: 'Modern slab',
    description:
      'No profile, no frame showing — full-overlay doors on a frameless box, with bar pulls or no handles at all. The European look, in stock in Bristol.',
    imageLabel: 'Modern slab kitchen',
    collections: ['Barcelona', 'Derry Stratus'],
  },
  {
    kicker: 'Traditional profile, stained or painted',
    title: 'Classic raised panel',
    description:
      'A raised center panel and a moulded edge — the look of a period house, in a stain or a painted finish.',
    imageLabel: 'Raised panel kitchen',
    collections: ['Beacon Hill', 'Lexington'],
  },
  {
    kicker: 'Wood grain and texture, without the upkeep',
    title: 'Natural & textured',
    description:
      'Textured and wood-look finishes that bring warmth to farmhouse, cabin and Scandinavian kitchens.',
    imageLabel: 'Natural textured kitchen',
    collections: ['Birmingham'],
  },
  {
    kicker: 'Navy, sage, greige and the two-tone island',
    title: 'Painted color',
    description:
      "A painted shaker in a color that isn't white — on the island, on the base run, or the whole room. The Prism line is custom-painted to your color.",
    imageLabel: 'Painted color kitchen',
    collections: ['Dover', 'Rochelle'],
  },
  {
    kicker: 'Glass doors, open shelves, floating uppers',
    title: 'Glass-front & accents',
    description:
      'Used inside any of the styles above to break up a run of doors — a glass upper, an open shelf, a floating cabinet.',
    imageLabel: 'Glass-front kitchen',
    collections: [],
  },
];

export const LINE_ROWS: FeatureRow[] = [
  {
    kicker: 'Framed · our own brand · RTA or assembled',
    title: 'Star Cabinetry',
    description:
      'Framed cabinets, 300+ SKUs in every door style, all stocked in Bristol, CT. The default for most kitchens — and the widest choice of doors and finishes.',
    imageLabel: 'Star Cabinetry kitchen',
    action: { label: 'See Star collections', href: `${ASSEMBLED_LISTING_HREF}?line=star` },
  },
  {
    kicker: 'Framed · custom-painted · assembled',
    title: 'Prism',
    description:
      'Custom-painted framed cabinets, 300+ SKUs per door style, stocked in Bristol, CT. For a painted finish matched to your color.',
    imageLabel: 'Prism kitchen',
    action: { label: 'See Prism collections', href: `${ASSEMBLED_LISTING_HREF}?line=prism` },
  },
  {
    kicker: 'Frameless · ¾-inch plywood · RTA or assembled',
    title: 'Euro Max',
    description:
      'Frameless cabinets on ¾-inch plywood boxes, 300+ SKUs per door style, stocked in Bristol, CT. Full-overlay doors and more drawer space.',
    imageLabel: 'Euro Max kitchen',
    action: { label: 'See Euro Max collections', href: `${ASSEMBLED_LISTING_HREF}?line=euro-max` },
  },
  {
    kicker: 'Frameless · ¾-inch plywood · assembled',
    title: 'Euro Value',
    description:
      'Frameless cabinets on ¾-inch plywood boxes, built in Bristol, CT. 300+ SKUs per door style at the entry price.',
    imageLabel: 'Euro Value kitchen',
    action: {
      label: 'See Euro Value collections',
      href: `${ASSEMBLED_LISTING_HREF}?line=euro-value`,
    },
  },
];

export const HUB_PROGRAM_CARDS: ProgramCard[] = [
  {
    title: 'Assembled cabinets',
    tag: 'Most hands-off',
    description:
      'Ready to install when they arrive. The smoother handoff and the faster path to finished.',
    points: ['Built and checked in our Connecticut shop', 'Delivered ready to hang in three weeks'],
    ctaLabel: 'Browse assembled cabinets',
    href: ASSEMBLED_LISTING_HREF,
  },
  {
    title: 'RTA cabinets',
    tag: 'Built for flexibility',
    description:
      'Flat-packed for efficient delivery and value. The route for confident DIYers and trade crews.',
    points: ['Ships from Bristol in two weeks', 'Lower price than the same cabinet assembled'],
    ctaLabel: 'Browse ready to assemble',
    href: RTA_LISTING_HREF,
  },
];

export const COMPARISON_COLUMNS = ['', 'Ready to assemble', 'Factory assembled'];

export const COMPARISON_ROWS: string[][] = [
  [
    '!What arrives',
    'Flat-packed boxes, doors and hardware',
    'Built cabinets, wrapped for transport',
  ],
  ['!Who assembles the box', 'You, or your installer', 'Our shop, in Connecticut'],
  [
    '!Who installs it in your kitchen',
    'Your installer or contractor — Express Kitchens does not install cabinets',
    'Your installer or contractor — Express Kitchens does not install cabinets',
  ],
  ['!Time per cabinet', 'About [X] minutes', 'None'],
  ['!Lead time', '2 weeks', '3 weeks'],
  ['!Price', 'Lower — about [X]% less', 'Higher — the build is done'],
  [
    '!Box, door, finish, warranty',
    'Identical on the lines offered both ways',
    'Identical — plus more options',
  ],
  ['!Lines available', 'Star · Euro Max', 'Star · Euro Max · Prism (custom-painted) · Euro Value'],
  [
    '!Best for',
    'Handy homeowners, tight budgets, DIY',
    'Anyone who wants the build done, contractors on a schedule',
  ],
];

export const BUILD_POINTS: RowCard[] = [
  {
    title: '1. All-plywood box',
    description: '¾-inch plywood sides, top and bottom. No particle board, anywhere.',
  },
  {
    title: '2. Soft-close doors',
    description: 'Soft-close hinges on every door, fitted and adjusted before it leaves us.',
  },
  {
    title: '3. Dovetail drawer boxes',
    description: 'Solid-wood drawers with dovetail joints — the corner that never loosens.',
  },
  {
    title: '4. Full-extension drawers',
    description: 'Undermount glides, so you reach the back of every drawer.',
  },
  {
    title: '5. Adjustable shelving',
    description: '¾-inch shelves on metal pins; move them as your kitchen changes.',
  },
  {
    title: '6. [X]-year warranty',
    description: 'On the box and the door, whether you build it or we do.',
  },
  {
    title: '7. Precision manufacturing',
    description:
      'Cut and drilled by machine in our own Connecticut factory, so every box matches the last one.',
  },
  {
    title: '8. Free design help',
    description: 'A designer draws your kitchen with you and prices it — before you buy anything.',
  },
];

export const ACCESSORIES_BAND = {
  title: 'Handles, tiles, fillers and organizers',
  description:
    'Matched to each collection. Handles are the deepest part of the catalog — knobs and pulls in every finish we make doors in.',
  imageLabel: 'A pull, a knob, a backsplash tile',
  actions: [
    { label: 'Cabinet accessories', href: '/cabinet-hardware' },
    { label: 'Handles', href: '/cabinet-hardware/handles-knobs' },
  ],
};
