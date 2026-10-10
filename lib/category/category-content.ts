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
  /** Overrides the BigCommerce category name in the hero. */
  heading?: string;
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

const CATEGORY_CONTENT: Record<string, CategoryContent> = {
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

const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}`;

export function getCategoryContent(path: string): CategoryContent {
  return CATEGORY_CONTENT[normalize(path)] ?? {};
}
