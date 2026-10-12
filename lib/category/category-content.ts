// Per-category header copy for the category page (hero text, the points row under it, the heading
// over the subcategory tiles). Keyed by the category's storefront path. Everything is optional: a
// category with no entry uses its BigCommerce name + description and the default points.

export type CategoryPointIcon =
  'truck' | 'returns' | 'stock' | 'clock' | 'pickup' | 'price' | 'gift' | 'tag' | 'phone' | 'zap';

export interface CategoryPoint {
  icon: CategoryPointIcon;
  label: string;
}

export interface SubcategoryOverride {
  name: string;
  /** Used when BigCommerce has no matching child category yet (e.g. a search). */
  fallbackHref: string;
  image: { src: string; alt: string };
}

export interface CategoryContent {
  /**
   * The "shop by" tiles, in order, with their photos. Each one links to the BigCommerce child
   * category of the same name when it exists, otherwise to `fallbackHref`. Without this the tiles
   * are the BigCommerce children with their own images.
   */
  subcategories?: SubcategoryOverride[];
  /** More tile rows under the first (e.g. "Shop by finish"); same tile shape, links as given. */
  tileGroups?: Array<{ title: string; items: SubcategoryOverride[] }>;
  /** Overrides the BigCommerce category name in the hero. */
  heading?: string;
  /** Hero panel colour for a top-level category: brand red (default) or black. */
  heroTone?: 'black' | 'red';
  /** Overrides the BigCommerce category description in the hero. */
  lede?: string;
  /** What the hero photo should show — used as the placeholder label until an image is set. */
  imageLabel?: string;
  /** Heading over the subcategory tiles. */
  subTitle?: string;
  points?: CategoryPoint[];
  /** Small print at the right end of the points row. */
  fine?: string;
}

const SHIPPED_POINTS: CategoryPoint[] = [
  { icon: 'stock', label: 'In stock' },
  { icon: 'truck', label: 'Free & fast shipping' },
  { icon: 'returns', label: 'Easy returns' },
];

const PICKUP_POINTS: CategoryPoint[] = [
  { icon: 'stock', label: 'In stock' },
  { icon: 'pickup', label: 'Pickup from Bristol' },
  { icon: 'clock', label: 'Ready in 2 days' },
];

export const DEFAULT_CATEGORY_CONTENT: Required<Pick<CategoryContent, 'subTitle' | 'points'>> &
  Pick<CategoryContent, 'fine'> = {
  subTitle: 'Shop by type',
  points: SHIPPED_POINTS,
  fine: '*Free shipping on orders over $2,500. Conditions apply.',
};

const navImage = (file: string, alt: string) => ({ src: `/images/nav/${file}.webp`, alt });
const handleImage = (file: string, alt: string) => ({
  src: `/images/category/handles/${file}.webp`,
  alt,
});
const search = (term: string) => `/search?term=${encodeURIComponent(term)}`;

const APPLIANCE_TILES: SubcategoryOverride[] = [
  {
    name: 'Fridges & Freezers',
    fallbackHref: search('refrigerator'),
    image: navImage('fridges-freezers', 'Refrigerator'),
  },
  {
    name: 'Ranges & Cooktops',
    fallbackHref: search('range'),
    image: navImage('ranges-cooktops', 'Range'),
  },
  {
    name: 'Dishwashers',
    fallbackHref: search('dishwasher'),
    image: navImage('dishwashers', 'Dishwasher'),
  },
  {
    name: 'Microwaves',
    fallbackHref: search('microwave'),
    image: navImage('microwaves', 'Microwave'),
  },
  {
    name: 'Wall Ovens',
    fallbackHref: search('wall oven'),
    image: navImage('wall-ovens', 'Wall oven'),
  },
  {
    name: 'Range Hoods',
    fallbackHref: search('range hood'),
    image: navImage('range-hoods', 'Range hood'),
  },
  {
    name: 'Washers & Dryers',
    fallbackHref: search('washer'),
    image: navImage('washers-dryers', 'Washer and dryer'),
  },
  {
    name: 'Garbage Disposals',
    fallbackHref: search('garbage disposal'),
    image: navImage('garbage-disposals', 'Garbage disposal'),
  },
  {
    name: 'Air Conditioning',
    fallbackHref: search('air conditioner'),
    image: navImage('air-conditioning', 'Air conditioner'),
  },
  {
    name: 'Accessories',
    fallbackHref: search('appliance accessories'),
    image: navImage('appliance-accessories', 'Appliance accessories'),
  },
];

const STOCKED_POINTS: CategoryPoint[] = [
  { icon: 'stock', label: 'Stocked in Bristol' },
  { icon: 'truck', label: 'Ships in 2 days' },
  { icon: 'pickup', label: 'Free pickup, any order' },
];

// Bath, Sinks & faucets and Cabinet hardware are code pages (app/…/bath etc.) until their
// BigCommerce categories exist at the same URLs; the proxy then routes to the category template,
// which reads the same entries below, so the handover changes nothing the visitor sees.
const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  '/bath': {
    lede: "Everything that goes on and around a vanity: tops in granite and quartz, matching side splashes, undermount and vessel sinks, faucets in the finishes people actually ask for, and the drains and accessories that finish the job. It's all stocked in Bristol and sized to go with our vanities, so it fits the first time.",
    imageLabel: 'A bathroom vanity with a quartz top, undermount sink and brushed-nickel faucet',
    points: STOCKED_POINTS,
    fine: 'Lead times to be confirmed.',
    subcategories: [
      {
        name: 'Vanity Tops',
        fallbackHref: search('vanity top'),
        image: navImage('vanity-tops', 'Bathroom vanity top'),
      },
      {
        name: 'Bathroom Sinks',
        fallbackHref: search('bathroom sink'),
        image: navImage('bathroom-sinks', 'Bathroom sink'),
      },
      {
        name: 'Bathroom Faucets',
        fallbackHref: search('bathroom faucet'),
        image: navImage('bathroom-faucets', 'Bathroom faucet'),
      },
      {
        name: 'Side Splashes',
        fallbackHref: search('side splash'),
        image: navImage('side-splashes', 'Vanity side splash'),
      },
      {
        name: 'Drains & Accessories',
        fallbackHref: search('drain'),
        image: navImage('drains-accessories', 'Drain and accessories'),
      },
    ],
  },
  '/sinks-faucets': {
    heading: 'Kitchen sinks & faucets',
    lede: "A sink that fits the base cabinet, a faucet that reaches the bowl, and the strainer, grid and soap dispenser that finish it off. Every sink here is sized to our sink bases, so if you're buying cabinets from us you won't be guessing at the cut-out. It all ships from Bristol in two days, or you can collect it free with your order.",
    imageLabel: 'A stainless double-bowl sink with a pull-down faucet, in a white shaker kitchen',
    points: STOCKED_POINTS,
    fine: 'Lead times to be confirmed.',
    subcategories: [
      {
        name: 'Kitchen Sinks',
        fallbackHref: search('kitchen sink'),
        image: navImage('kitchen-sinks', 'Kitchen sink'),
      },
      {
        name: 'Kitchen Faucets',
        fallbackHref: search('kitchen faucet'),
        image: navImage('kitchen-faucets', 'Kitchen faucet'),
      },
      {
        name: 'Accessories',
        fallbackHref: search('sink accessories'),
        image: navImage('sink-faucet-accessories', 'Sink and faucet accessories'),
      },
    ],
  },
  '/cabinet-hardware/handles-knobs': {
    // No fine print: "Free & fast shipping" is already one of the icon points.
    fine: '',
    // Until the products land (and a Finish facet with them), the tiles filter the category by
    // search term, which the category page already supports.
    subTitle: 'Shop by type',
    subcategories: [
      {
        name: 'Pulls',
        fallbackHref: '/cabinet-hardware/handles-knobs?term=pull',
        image: handleImage('pulls', 'Three bar pulls in nickel, brass and black'),
      },
      {
        name: 'Knobs',
        fallbackHref: '/cabinet-hardware/handles-knobs?term=knob',
        image: handleImage('knobs', 'Three knobs in brass, nickel and black'),
      },
    ],
    tileGroups: [
      {
        title: 'Shop by finish',
        items: [
          {
            name: 'Brass',
            fallbackHref: '/cabinet-hardware/handles-knobs?term=brass',
            image: handleImage('brass', 'Brass pulls and a knob on marble'),
          },
          {
            name: 'Nickel',
            fallbackHref: '/cabinet-hardware/handles-knobs?term=nickel',
            image: handleImage('nickel', 'Brushed nickel pulls and a knob on marble'),
          },
          {
            name: 'Bronze',
            fallbackHref: '/cabinet-hardware/handles-knobs?term=bronze',
            image: handleImage('bronze', 'Champagne bronze pulls and a knob on marble'),
          },
          {
            name: 'Black',
            fallbackHref: '/cabinet-hardware/handles-knobs?term=black',
            image: handleImage('black', 'Matte black pulls and a knob on marble'),
          },
        ],
      },
    ],
  },
  '/cabinet-hardware': {
    lede: 'The small things that change how a kitchen feels: handles and knobs in the finishes that go with our doors, backsplash tiles to carry the color up the wall, and the organizers that make a drawer earn its keep. Everything is stocked in Bristol and ships next business day, or you can collect it free. Handles are included with our Premium cabinets; here is where you choose them.',
    imageLabel: 'Brass handles on a navy shaker door, with a marble backsplash behind',
    points: [
      { icon: 'stock', label: 'Stocked in Bristol' },
      { icon: 'zap', label: 'Ships next business day' },
      { icon: 'pickup', label: 'Free pickup, any order' },
    ],
    fine: 'Lead times to be confirmed.',
    subcategories: [
      {
        name: 'Handles & Knobs',
        fallbackHref: search('cabinet handle'),
        image: navImage('handles', 'Cabinet door with a handle'),
      },
      { name: 'Tiles', fallbackHref: search('tile'), image: navImage('tiles', 'Backsplash tiles') },
      {
        name: 'Accessories',
        fallbackHref: search('drawer organizer'),
        image: navImage('accessories', 'Drawer organizer'),
      },
    ],
  },
  '/appliances': {
    subcategories: APPLIANCE_TILES,
    lede: 'Fridges, ranges, hoods, dishwashers and laundry. In stock in Bristol and priced below retail, because you collect.',
    imageLabel: 'A range and hood in a finished kitchen',
    subTitle: 'Shop by appliance',
    points: [...PICKUP_POINTS, { icon: 'price', label: 'Priced below retail' }],
    fine: undefined,
  },
  '/windows': {
    heading: 'Replacement windows — $179.99, any size up to 101 united inches',
    lede: 'United inches is width plus height. A 36 × 60 window is 96 united inches — it qualifies. Double hung, sliders and hoppers, at factory-direct pricing.',
    imageLabel: 'A white vinyl double-hung window, installed',
    subTitle: 'Shop by window type',
    points: [...PICKUP_POINTS, { icon: 'price', label: 'Factory-direct pricing' }],
    fine: undefined,
  },
  '/closets': {
    heading: 'Closet organizers',
    lede: 'Twelve closet pieces that fit together — hanging units, towers, shelves, drawers, panels and fillers. Buy the ones your closet needs and put them up in an afternoon. Installation not included.',
    imageLabel: 'A reach-in closet with hanging units, a tower and shelves',
  },
  '/cabinets': {
    heading: 'Kitchen cabinets',
    lede: '100+ door styles in 30+ colors, built in our own Connecticut factory. Buy them assembled or ready to assemble — same box, same door, same finish.',
    imageLabel: 'A finished shaker kitchen',
    subTitle: 'Shop by collection',
  },
};

// The hero line under each category name: what to expect on the page, in two lines at most on a
// main category and one on a subcategory. Plain ad copy about the products, not about us.
const HERO_LEDES: Record<string, string> = {
  '/countertops':
    'Granite, quartz, laminate and prefabricated tops, measured to your cabinets and quoted to your kitchen.',
  '/countertops/granite': 'Natural stone, every slab unique. From $49.99 a square foot.',
  '/countertops/quartz':
    'Engineered stone, consistent and never needs sealing. From $59.99 a square foot.',
  '/countertops/laminate': 'The budget choice, in the widest range of colours and patterns.',
  '/countertops/prefabricated': 'Granite and quartz in standard lengths with a finished edge.',
  '/countertops/prefabricated/granite-prefabricated':
    'Granite in standard lengths with a finished front edge.',
  '/countertops/prefabricated/quartz-prefabricated':
    'Quartz in standard lengths with a finished front edge.',
  '/countertops/samples': 'Hold the real material in your own light before you decide.',
  '/appliances':
    'Fridges, ranges, hoods, dishwashers and laundry, in stock in Bristol and ready for pickup in two days.',
  '/appliances/fridges-freezers':
    'French door, side-by-side, top and bottom freezer and counter-depth.',
  '/appliances/ranges-cooktops': 'Gas, electric and induction, in 30 and 36 inches.',
  '/appliances/dishwashers': 'Built-in, sized to the standard 24-inch opening.',
  '/appliances/microwaves': 'Countertop, over-the-range and built-in.',
  '/appliances/wall-ovens': 'Single and double, in 24 and 30 inches.',
  '/appliances/range-hoods': 'Under-cabinet, wall-mount and insert, matched to your cooktop.',
  '/appliances/washers-dryers': 'Front-load, top-load and stackable pairs.',
  '/appliances/garbage-disposals': 'Half to one horsepower, sized to your sink.',
  '/appliances/air-conditioning': 'Window and portable units, sized by room.',
  '/appliances/accessories': 'Trim kits, hoses, vents and filters.',
  '/windows':
    'Double hung, sliders and hoppers from stock in Bristol. One price for any replacement size up to 101 united inches.',
  '/windows/replacement': '$179.99 in every size up to 101 united inches.',
  '/windows/replacement/double-hung-windows':
    'Vinyl, Low-E glass, tilt-in sashes. One price for any size.',
  '/windows/replacement/slider-windows':
    'Vinyl, Low-E glass, no cranks or hinges. One price for any size.',
  '/windows/replacement/hopper-windows':
    'Vinyl, Low-E glass, for basements and utility rooms. One price for any size.',
  '/windows/new-construction': 'With a nailing fin, for a brand-new opening.',
  '/closets':
    'Twelve organizer pieces in three colours that fit together. Buy what your closet needs and put it up in an afternoon.',
  '/bath':
    'Vanity tops, side splashes, sinks, faucets and drains, sized to our vanities and stocked in Bristol.',
  '/bath/vanity-tops': 'Cultured marble and quartz, sized to our vanities.',
  '/bath/side-splashes': 'Sold by the piece to match your top.',
  '/bath/bathroom-sinks': 'Vessel, undermount and integrated.',
  '/bath/bathroom-faucets': 'Single-hole, centerset and widespread.',
  '/bath/drains-accessories': 'Pop-up drains, traps, supply lines and more.',
  '/sinks-faucets':
    'Kitchen sinks sized to our sink bases, faucets to match, and the accessories that finish them.',
  '/sinks-faucets/kitchen-sinks':
    'Single, double, farmhouse and workstation, sized to our sink bases.',
  '/sinks-faucets/kitchen-faucets': 'Pull-down, pull-out, single and double handle.',
  '/sinks-faucets/accessories': 'Strainers, grids, soap dispensers and sprays.',
  '/cabinet-hardware':
    'Handles and knobs, backsplash tile and drawer organizers, in finishes that go with our doors.',
  '/cabinet-hardware/handles-knobs': 'Knobs and pulls in every finish we make doors in.',
  '/cabinet-hardware/tiles': 'Ceramic, porcelain, glass and stone, by the square foot.',
  '/cabinet-hardware/accessories':
    'Organizers, trim, fillers and end panels, sized to our cabinets.',
};

const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}`;

export function getCategoryContent(path: string): CategoryContent {
  const key = normalize(path);
  const content = CATEGORY_CONTENT[key] ?? {};
  const lede = HERO_LEDES[key];

  return lede ? { ...content, lede } : content;
}

// Hero photos by category path (public/images/category/heroes; 1424×640 for a category, 1424×380
// for a subcategory — both 2× of the hero panel). Used when BigCommerce has no category image.
const heroImage = (file: string, alt: string) => ({
  src: `/images/category/heroes/${file}.webp`,
  alt,
});

const HERO_IMAGES: Record<string, { src: string; alt: string }> = {
  '/appliances': heroImage('cat-appliances', 'Stainless appliances in a white kitchen'),
  '/bath': heroImage('cat-bath', 'A vanity with a white top, sink and faucet'),
  '/cabinets': heroImage('cat-cabinets', 'A finished shaker kitchen'),
  '/closets': heroImage('cat-closets', 'A fitted closet with shelves and hanging rails'),
  '/countertops': heroImage('cat-countertops', 'A stone countertop on an island'),
  '/doors': heroImage('cat-doors', 'An interior door in a hallway'),
  '/siding': heroImage('cat-siding', 'Siding on a house exterior'),
  '/sinks-faucets': heroImage('cat-sinks-faucets', 'A kitchen sink with a pull-down faucet'),
  '/windows': heroImage('cat-windows', 'Windows in a bright room'),
  '/appliances/air-conditioning': heroImage('sub-air-conditioning', 'An air conditioner'),
  '/appliances/accessories': heroImage('sub-appliance-accessories', 'Appliance accessories'),
  '/appliances/dishwashers': heroImage('sub-dishwashers', 'A dishwasher'),
  '/appliances/fridges-freezers': heroImage('sub-fridges-freezers', 'A refrigerator'),
  '/appliances/garbage-disposals': heroImage('sub-garbage-disposals', 'A garbage disposal'),
  '/appliances/microwaves': heroImage('sub-microwaves', 'A microwave'),
  '/appliances/range-hoods': heroImage('sub-range-hoods', 'A range hood'),
  '/appliances/ranges-cooktops': heroImage('sub-ranges-cooktops', 'A range and cooktop'),
  '/appliances/wall-ovens': heroImage('sub-wall-ovens', 'A wall oven'),
  '/appliances/washers-dryers': heroImage('sub-washers-dryers', 'A washer and dryer'),
  '/bath/bathroom-faucets': heroImage('sub-bathroom-faucets', 'A bathroom faucet'),
  '/bath/bathroom-sinks': heroImage('sub-bathroom-sinks', 'A bathroom sink'),
  '/bath/drains-accessories': heroImage('sub-drains-accessories', 'A drain and accessories'),
  '/bath/side-splashes': heroImage('sub-side-splashes', 'A vanity side splash'),
  '/bath/vanity-tops': heroImage('sub-vanity-tops', 'A vanity top'),
  '/cabinet-hardware/accessories': heroImage('sub-cabinet-accessories', 'Cabinet accessories'),
  '/cabinet-hardware/handles-knobs': heroImage('sub-handles', 'Cabinet handles'),
  '/cabinet-hardware/tiles': heroImage('sub-backsplash-tiles', 'Backsplash tiles'),
  '/countertops/granite': heroImage('sub-granite', 'A granite countertop'),
  '/countertops/laminate': heroImage('sub-laminate', 'A laminate countertop'),
  '/countertops/prefabricated': heroImage('sub-prefabricated', 'A prefabricated countertop'),
  '/countertops/quartz': heroImage('sub-quartz', 'A quartz countertop'),
  '/sinks-faucets/accessories': heroImage('sub-sink-accessories', 'Sink accessories'),
  '/sinks-faucets/kitchen-faucets': heroImage('sub-kitchen-faucets', 'A kitchen faucet'),
  '/sinks-faucets/kitchen-sinks': heroImage('sub-kitchen-sinks', 'A kitchen sink'),
  '/windows/new-construction': heroImage(
    'sub-windows-new-construction',
    'A new-construction window',
  ),
  '/windows/replacement': heroImage('sub-windows-replacement', 'A replacement window'),
};

// The hero photo for a category path ("/bath/", "/countertops/granite"), if one is supplied.
export function heroImageFor(path: string): { src: string; alt: string } | undefined {
  return HERO_IMAGES[`/${path.split('/').filter(Boolean).join('/')}`];
}

// Hero photos for the code-owned pages, keyed the same way.
export const CODE_PAGE_HERO_IMAGES = {
  cabinets: HERO_IMAGES['/cabinets'],
  doors: HERO_IMAGES['/doors'],
  siding: HERO_IMAGES['/siding'],
  quickShip: heroImage('sub-quick-ship', 'Cabinets wrapped on a pallet, ready to ship'),
} as const;
