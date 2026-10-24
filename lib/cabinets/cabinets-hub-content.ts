import { type ContentBlock } from '@/vibes/soul/sections/cabinet-program-content';
import { type RowCard } from '@/vibes/soul/sections/cards-row';
import { type FeatureRow } from '@/vibes/soul/sections/feature-rows';
import { type ProgramCard } from '@/vibes/soul/sections/program-cards';

// Default content for the Cabinets hub (/cabinets) — the education page between the home page and
// the two program listings. Every band is a Makeswift slot on the page; this is what renders until
// marketing replaces it. Copy is Arun's v2 hub brief; "[…]" figures are left for the business.

export const ASSEMBLED_LISTING_HREF = '/cabinets/assembled-cabinets';
export const RTA_LISTING_HREF = '/cabinets/rta-cabinets';
export const INSTALLER_HREF = '/find-a-pro';
/** Glass-door wall cabinets are an option inside the collections, not a category: a search. */
export const GLASS_DOORS_HREF = '/search?term=glass%20door%20wall%20cabinet';

export const HUB_HERO = {
  kicker: 'Kitchen cabinets',
  title: "The kitchen you've pictured, without the 14-week wait",
  description:
    'Framed and frameless cabinets in shaker, modern and traditional styles, made in our own factory. Choose assembled or ready to assemble: same cabinet, your call.',
  note: 'Four lines, plywood boxes on Star, Prism and Euro Max, and 50,000+ cabinets in stock in Bristol.',
  imageLabel: 'A finished Connecticut kitchen, wide',
};

// "Find your style" — a look first, then the collections that carry it. Each collection is the
// catalog name (so the tile finds the live collection) with the short label shown on the tile.
export interface StyleCollection {
  name: string;
  label: string;
}

export interface StyleRow extends Omit<FeatureRow, 'tiles'> {
  collections: StyleCollection[];
}

const c = (name: string, label = name): StyleCollection => ({ name, label });

export const STYLE_ROWS: StyleRow[] = [
  {
    kicker: 'The door most kitchens are built around',
    title: 'Painted shaker',
    description:
      'A five-piece door with a flat recessed panel, in white or cream (Avon, Barcelona, Cambridge, Mero) or gray (Derry, Edinburgh).',
    imageLabel: 'Painted shaker kitchen',
    collections: [
      c('Avon Painted White', 'Avon'),
      c('Barcelona'),
      c('Cambridge'),
      c('Mero'),
      c('Derry Stratus', 'Derry'),
      c('Edinburgh'),
      c('Euro Max Tribeca Shaker', 'Tribeca Shaker'),
    ],
  },
  {
    kicker: 'Flat doors, clean lines',
    title: 'Modern slab',
    description:
      'Frameless slab doors built around texture: Eden in a natural, sleek finish, Madison in a deeper matte. Both resist stains, scratches and scuffs.',
    imageLabel: 'Modern slab kitchen',
    collections: [
      c('Euro Max Eden', 'EM Eden'),
      c('Euro Value Eden', 'EV Eden'),
      c('Euro Max Madison', 'EM Madison'),
      c('Euro Value Madison', 'EV Madison'),
      c('Euro Max Manhattan HG', 'Manhattan'),
      c('Euro Max Tribeca A', 'Tribeca'),
    ],
  },
  {
    kicker: 'Traditional, with more detail',
    title: 'Raised panel',
    description:
      'A raised center panel and a shaped edge, for a classic look: Beacon Hill in white, Lexington in French vanilla.',
    imageLabel: 'Raised panel kitchen',
    collections: [c('Beacon Hill'), c('Lexington')],
  },
  {
    kicker: 'Real wood grain',
    title: 'Stained wood',
    description:
      'Stained birch veneer, from driftwood gray and caramel to espresso, walnut and bordeaux.',
    imageLabel: 'Stained wood kitchen',
    collections: [
      c('Birmingham'),
      c('Dover'),
      c('Dublin'),
      c('Lasalle', 'LaSalle'),
      c('Rochelle'),
      c('Northampton'),
    ],
  },
  {
    kicker: 'Navy, sage, charcoal, the two-tone island',
    title: 'Painted color',
    description: 'Star doors painted in 10 colors, for the whole room or just the island.',
    imageLabel: 'Painted color kitchen',
    collections: [
      c('Prism Avon'),
      c('Prism Beacon Hill'),
      c('Prism Cambridge'),
      c('Prism Derry'),
      c('Prism Edinburgh'),
      c('Prism Lexington'),
      c('Prism Mero'),
    ],
  },
];

// Glass-door wall cabinets: a short band right after "Find your style" (an option inside the
// collections, not a style and not an accessory).
export const GLASS_BAND = {
  title: 'Add a glass door',
  description:
    'Break up a run of doors with a glass-front wall cabinet, in straight or diagonal-corner styles. Frosted glass comes in [all five collections]; clear glass with a finished interior comes in Rochelle, Derry and Barcelona.',
  note: 'Sizes: 15", 18", 24", 27", 30" and 36" wide, in 30", 36" or 42" heights.',
  // An Avon frosted-glass wall cabinet from the catalog, until marketing supplies a room shot.
  image: {
    src: 'https://cdn11.bigcommerce.com/s-4smdoosoqx/products/15437/images/41254/t_900_GDFW1542__31913__36615__24544__89217.1774356819__22907.1790167226.386.513.jpg?c=1',
    alt: 'Avon frosted glass door wall cabinet',
  },
  imageLabel: 'A glass-front wall cabinet in a run of shaker doors',
  actions: [{ label: 'See glass-door cabinets', href: GLASS_DOORS_HREF }],
};

// "What's behind the door" — the four lines as compact cards.
export const LINE_CARDS: RowCard[] = [
  {
    title: 'Star',
    meta: 'Framed · RTA or assembled',
    description:
      'Our core line: classic framed cabinets with a plywood box, a solid birch face frame, and painted or birch veneer doors. The widest choice of doors and finishes, kept in stock.',
    ctaLabel: 'See Star collections',
    href: `${ASSEMBLED_LISTING_HREF}?line=star`,
  },
  {
    title: 'Prism',
    meta: 'Framed · Painted · Assembled',
    description: 'Star’s framed cabinets, painted in 10 designer colors. Ships in about 8 weeks.',
    ctaLabel: 'See Prism collections',
    href: `${ASSEMBLED_LISTING_HREF}?line=prism`,
  },
  {
    title: 'Euro Max',
    meta: 'Frameless · Plywood box · RTA or assembled',
    description:
      'European-style frameless cabinets with a ¾" plywood box: full-overlay doors and more room inside.',
    ctaLabel: 'See Euro Max collections',
    href: `${ASSEMBLED_LISTING_HREF}?line=euro-max`,
  },
  {
    title: 'Euro Value',
    meta: 'Frameless · Engineered box · Assembled',
    description:
      'The same frameless doors as Euro Max, with an engineered board box, at a lower price.',
    ctaLabel: 'See Euro Value collections',
    href: `${ASSEMBLED_LISTING_HREF}?line=euro-value`,
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

export const COMPARISON_COLUMNS = ['', 'Ready to assemble', 'Assembled'];

// "!" marks the row-heading cell. The installation row keeps Arun's bracketed line until EK
// settles the installation question.
export const COMPARISON_ROWS: string[][] = [
  [
    '!What arrives',
    'Flat-packed boxes, doors and hardware',
    'Built cabinets, wrapped for shipping',
  ],
  ['!Who builds the box', 'You, or your installer', 'We do, in our factory'],
  [
    '!Installation',
    'By your installer, or [ask about EK installation for showroom orders]',
    'By your installer, or [ask about EK installation for showroom orders]',
  ],
  ['!Time per cabinet', 'About 45 minutes or more', 'None'],
  ['!Ships in', '2 weeks (Star)', '3 weeks (Star)'],
  ['!Price', 'Lower', 'Higher, because the building is done'],
  ['!Lines', 'Star, Euro Max', 'Star, Prism, Euro Max, Euro Value'],
  [
    '!Best for',
    'Handy homeowners, tighter budgets, crews who assemble on site',
    'Anyone who wants it ready to install',
  ],
];

// "How our cabinets are built" — a bento grid (the program pages' Why cards) with a photo slot on
// each card; the KCMA card is the tall one. Photos to come from EK; the labels mark the slots.
export const HUB_BUILD_BLOCK: ContentBlock = {
  type: 'why',
  title: 'How our cabinets are built',
  intro: 'The same build sits behind every door style. What changes is the door and the finish.',
  reasons: [
    {
      icon: 'layers',
      title: 'Plywood box',
      detail:
        'Not particleboard, so it holds screws and stands up to moisture. (Star, Prism and Euro Max.)',
      imageLabel: 'Plywood box, cut away',
    },
    {
      icon: 'volume-x',
      title: 'Soft-close doors',
      detail: 'Every door closes quietly on its own.',
      imageLabel: 'Soft-close hinge',
    },
    {
      icon: 'badge-check',
      title: 'Tested to KCMA standards',
      detail:
        'Doors and drawers are opened and closed 25,000 times, and wall cabinets carry a 600 lb load. CARB2 compliant.',
      span: 'tall',
      imageLabel: 'KCMA test rig',
    },
    {
      icon: 'blocks',
      title: 'Dovetail drawers',
      detail: 'Solid wood, joined like fine furniture.',
      imageLabel: 'Dovetail joint, close up',
    },
    {
      icon: 'move-horizontal',
      title: 'Full-extension, soft-close drawers',
      detail: 'Reach the back of every drawer, and it closes quietly, as standard.',
      imageLabel: 'Drawer pulled fully out',
    },
    {
      icon: 'archive',
      title: 'Adjustable shelves',
      detail: 'Thick plywood shelves you can move as your needs change.',
      imageLabel: 'Shelf on its pins',
    },
    {
      icon: 'bot',
      title: 'Robotic manufacturing',
      detail: 'Cut and finished by robots, so every cabinet fits the next.',
      imageLabel: 'Robot cell in the factory',
    },
    {
      icon: 'shield-check',
      title: '1-year warranty',
      detail: 'On every cabinet, against defects in materials and workmanship.',
      imageLabel: 'Finished cabinet, front on',
    },
  ],
};

// "What will my kitchen cost?" — sets the 10×10 expectation before the collection cards.
export const COST_BAND = {
  title: 'What will my kitchen cost?',
  description:
    'Every collection shows a 10×10 price: cabinets only, for a standard L-shaped kitchen with two 10-foot walls. It’s the easiest way to compare collections. Your kitchen, with an island, a pantry, countertops or installation, will cost more.',
  note: '[Most finished kitchens run $X–$Y.]',
  // The 10×10 drawing the collection price cards use.
  image: { src: '/images/cabinets/10x10-kitchen.svg', alt: 'A 10×10 L-shaped kitchen plan' },
  imageLabel: 'A 10×10 kitchen drawing with the price beside it',
};

export const ACCESSORIES_BAND = {
  title: 'Handles, fillers and organizers',
  description:
    'Knobs and pulls in every finish we make doors in, plus fillers, panels and organizers to finish the room.',
  imageLabel: 'A pull, a knob, a filler strip',
  actions: [
    { label: 'Cabinet accessories', href: '/cabinet-hardware' },
    { label: 'Handles', href: '/cabinet-hardware/handles-knobs' },
  ],
};
