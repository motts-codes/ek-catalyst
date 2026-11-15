// Per-category header copy for the category page (hero text, the points row under it, the heading
// over the subcategory tiles). Keyed by the category's storefront path. Everything is optional: a
// category with no entry uses its BigCommerce name + description and the default points.

import { applianceFacetsFor } from './appliance-facets';

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
  image?: { src: string; alt: string };
  /** A flat colour panel instead of a photo (a finish with no swatch image). */
  color?: string;
}

export interface CategoryContent {
  /**
   * The "shop by" tiles, in order, with their photos. Each one links to the BigCommerce child
   * category of the same name when it exists, otherwise to `fallbackHref`. Without this the tiles
   * are the BigCommerce children with their own images.
   */
  subcategories?: SubcategoryOverride[];
  /** More tile rows under the first (e.g. "Shop by finish"); same tile shape, links as given. */
  tileGroups?: Array<{ title: string; items: SubcategoryOverride[]; look?: TileGroupLook }>;
  /** "Shop by brand": equal logo boxes linking to the brand pages. */
  brands?: BrandTile[];
  /** Chip rows after the tiles (widths, finishes). */
  chipGroups?: ChipGroup[];
  /** Overrides the BigCommerce category name in the hero. */
  heading?: string;
  /** Hero panel colour for a top-level category: brand red (default) or black. */
  heroTone?: 'black' | 'red';
  /** A subcategory that is a major landing page gets the full top-level hero instead of the compact one. */
  hero?: 'full';
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

// Windows and appliances are collected, never shipped: the shipping promise and the free-shipping
// small print come off, and the two-day pickup takes its place (client, 15 Nov 2026).
const PICKUP_ONLY_POINTS: CategoryPoint[] = [
  { icon: 'stock', label: 'In stock' },
  { icon: 'zap', label: '2 Day Pickup' },
  { icon: 'returns', label: 'Easy returns' },
];

// Swatch tiles for the top-level appliances page (public/images/category/tiles/finishes), linking
// to the whole appliance listing narrowed by the finish term.
const applianceFinish = (name: string, term: string, file: string): SubcategoryOverride => ({
  name,
  fallbackHref: `/appliances?term=${encodeURIComponent(term)}`,
  image: { src: `/images/category/tiles/finishes/${file}.webp`, alt: `${name} finish` },
});

const APPLIANCE_FINISH_TILES: SubcategoryOverride[] = [
  applianceFinish('Stainless Steel', 'stainless steel', 'stainless-steel'),
  applianceFinish(
    'Fingerprint Resistant',
    'fingerprint resistant',
    'fingerprint-resistant-stainless',
  ),
  applianceFinish('White', 'white', 'white'),
  applianceFinish('Black', 'black', 'black'),
];

const isPickupOnlyPath = (key: string) =>
  key === '/windows' ||
  key.startsWith('/windows/') ||
  key === '/appliances' ||
  key.startsWith('/appliances/');

const PICKUP_POINTS: CategoryPoint[] = [
  { icon: 'stock', label: 'In stock' },
  { icon: 'pickup', label: 'Pickup from Bristol' },
  { icon: 'clock', label: 'Ready in 2 days' },
];

// Countertops are quoted, not carted: no stock / shipping / returns promises. The points row
// carries the per-square-foot prices and the quote path instead (every countertop category
// except Samples, which are ordered from the cart like anything else).
const COUNTERTOP_POINTS: CategoryPoint[] = [
  { icon: 'price', label: 'Granite from $49.99 · Quartz from $59.99 per sq ft' },
  { icon: 'clock', label: 'Quotes back within 1 business day' },
  { icon: 'phone', label: 'Or call 860-247-1000 and order by phone' },
];

const COUNTERTOP_FINE =
  'Per square foot, supplied and delivered; your installer fits it. Every top is quoted to your kitchen.';

const isQuotedCountertopPath = (key: string) =>
  key.startsWith('/countertops') && !key.startsWith('/countertops/samples');

export const DEFAULT_CATEGORY_CONTENT: Required<Pick<CategoryContent, 'subTitle' | 'points'>> &
  Pick<CategoryContent, 'fine'> = {
  subTitle: 'Shop by type',
  points: SHIPPED_POINTS,
  fine: '*Free shipping on orders over $2,500. Conditions apply.',
};

const navImage = (file: string, alt: string) => ({ src: `/images/nav/${file}.webp`, alt });
// 4:3 photo cards made for the "shop by" tiles (800 x 600).
const tileImage = (file: string, alt: string) => ({
  src: `/images/category/tiles/${file}.webp`,
  alt,
});

export interface BrandTile {
  name: string;
  href: string;
  /** Without a logo the tile shows the name. */
  logo?: { src: string; alt: string };
}

/** Photo tiles (default) or the brand-row-sized swatch boxes with the name on them. */
export type TileGroupLook = 'photo' | 'swatch';

export interface ChipItem {
  label: string;
  href: string;
  /** A colour behind the label's dot (finishes). */
  swatch?: string;
}

/** A row of small link chips under a heading ("Shop by width", "Shop by finish"). */
export interface ChipGroup {
  title: string;
  items: ChipItem[];
}

const brand = (name: string, file: string, href: string): BrandTile => ({
  name,
  href,
  logo: { src: `/images/brands/${file}.svg`, alt: `${name} logo` },
});

// Appliance brands stocked in Bristol, linking to their BigCommerce brand pages (Maytag has no
// brand record yet, so it searches).
const APPLIANCE_BRANDS: BrandTile[] = [
  brand('GE Appliances', 'ge-appliances', '/ge/'),
  brand('Frigidaire', 'frigidaire', '/frigidaire/'),
  brand('Whirlpool', 'whirlpool', '/whirlpool/'),
  brand('Samsung', 'samsung', '/samsung/'),
  brand('LG', 'lg', '/lg-electronics/'),
  brand('Maytag', 'maytag', '/search?term=maytag'),
  brand('Amana', 'amana', '/amana/'),
  brand('Haier', 'haier', '/haier/'),
];
const handleImage = (file: string, alt: string) => ({
  src: `/images/category/handles/${file}.webp`,
  alt,
});
const search = (term: string) => `/search?term=${encodeURIComponent(term)}`;

// The three replacement-window types: the volume line, so they lead on /windows as well as on
// /windows/replacement. Client photos (15 Nov 2026).
const WINDOW_TYPE_TILES: SubcategoryOverride[] = [
  {
    name: 'Double Hung',
    fallbackHref: '/windows/replacement/double-hung-windows',
    image: tileImage('windows-double-hung', 'White vinyl double-hung window'),
  },
  {
    name: 'Hopper',
    fallbackHref: '/windows/replacement/hopper-windows',
    image: tileImage('windows-hopper', 'White vinyl hopper window, tilted open'),
  },
  {
    name: 'Slider',
    fallbackHref: '/windows/replacement/slider-windows',
    image: tileImage('windows-slider', 'White vinyl slider window'),
  },
  {
    name: 'REP Vinyl',
    fallbackHref: '/windows/replacement/rep-vinyl-windows',
    image: tileImage('windows-rep-vinyl', 'White REP vinyl replacement window'),
  },
];

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
    heading: 'Your whole vanity in one order',
    lede: 'Tops, sinks, faucets and drains, sized to our vanities so everything fits.',
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
    heading: 'The sink that fits, the first time',
    lede: 'Kitchen sinks sized to our sink cabinets, faucets to match, and the accessories that finish the job.',
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
    lede: 'Pulls and knobs in every finish we make doors in.',
    heading: 'Change the handles, change the kitchen',
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
    heading: 'Small changes, whole new kitchen',
    lede: 'Handles, knobs, backsplash tile and organizers in finishes that match our doors. Ships next business day.',
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
    brands: APPLIANCE_BRANDS,
    heading: 'Appliances you can take home this week',
    subcategories: APPLIANCE_TILES,
    // The four finishes every kitchen category carries, across all appliances (a matching fridge,
    // range and dishwasher). The rarer finishes stay on the sub-category pages.
    tileGroups: [{ title: 'Shop by finish', look: 'swatch', items: APPLIANCE_FINISH_TILES }],
    lede: 'Fridges, ranges, dishwashers and laundry, in stock below retail. Pick up in Bristol in two days.',
    imageLabel: 'A range and hood in a finished kitchen',
    subTitle: 'Shop by appliance',
    points: [...PICKUP_POINTS, { icon: 'price', label: 'Priced below retail' }],
    fine: undefined,
  },
  '/windows': {
    heading: 'New windows without the custom-order wait',
    lede: 'Double hung, sliders and hoppers, in stock in Bristol. Double hung windows are $179.99 in almost any size.',
    imageLabel: 'A white vinyl double-hung window, installed',
    subTitle: 'Shop by window type',
    subcategories: [
      ...WINDOW_TYPE_TILES,
      {
        name: 'New Construction',
        fallbackHref: '/windows/new-construction',
        image: navImage('windows-new-construction', 'New-construction window in a framed wall'),
      },
      {
        name: 'Accessories',
        fallbackHref: '/windows/accessories',
        image: navImage('windows-accessories', 'Window accessories'),
      },
    ],
    points: [...PICKUP_POINTS, { icon: 'price', label: 'Factory-direct pricing' }],
    fine: undefined,
  },
  '/closets': {
    heading: 'Build the closet you keep meaning to sort out',
    lede: '12 pieces that fit together, in three colors. Buy what your space needs and put it up in an afternoon.',
    imageLabel: 'A reach-in closet with hanging units, a tower and shelves',
  },
  '/cabinets': {
    heading: "The kitchen you've pictured, without the 14-week wait",
    lede: '100+ door styles in 30+ colors, built in our Connecticut factory. Assembled or ready to assemble, same cabinet either way.',
    imageLabel: 'A finished shaker kitchen',
    subTitle: 'Shop by collection',
  },
  '/countertops': {
    heading: 'The surface your kitchen is built around',
    lede: 'Granite, quartz and laminate, cut to fit your cabinets, with the price per square foot up front.',
  },
  '/countertops/granite': {
    heading: 'One of a kind, like your kitchen',
    lede: 'Natural stone, every slab unique. From $49.99 a sq ft.',
  },
  '/countertops/quartz': {
    heading: 'Good looks, no upkeep',
    lede: 'Engineered stone that never needs sealing. From $59.99 a sq ft.',
  },
  '/countertops/laminate': {
    heading: 'The look you want, for less',
    lede: 'The budget choice, in the widest range of colors and patterns.',
  },
  '/countertops/prefabricated': {
    heading: 'Stone tops, ready to go',
    lede: 'Granite and quartz in standard lengths with a finished edge.',
  },
  '/countertops/prefabricated/granite-prefabricated': {
    heading: 'Granite, ready to install',
    lede: 'Standard lengths with a finished front edge.',
  },
  '/countertops/prefabricated/quartz-prefabricated': {
    heading: 'Quartz, ready to install',
    lede: 'Standard lengths with a finished front edge.',
  },
  '/countertops/samples': {
    heading: 'See it in your own light',
    lede: 'Hold the real material against your cabinets before you decide.',
  },
  '/appliances/fridges-freezers': {
    heading: "Room for the whole week's groceries",
    lede: 'French door, side-by-side, top and bottom freezer, and counter-depth.',
  },
  '/appliances/ranges-cooktops': {
    heading: 'Cook the way you like',
    lede: 'Gas, electric and induction, in 30 and 36 inches.',
  },
  '/appliances/dishwashers': {
    heading: 'Less time at the sink',
    lede: 'Built-in, fits the standard 24-inch opening.',
  },
  '/appliances/microwaves': {
    heading: 'Reheat, defrost, done',
    lede: 'Countertop, over-the-range and built-in.',
  },
  '/appliances/wall-ovens': {
    heading: 'Bake at eye level',
    lede: 'Single and double, in 24 and 30 inches.',
  },
  '/appliances/range-hoods': {
    heading: 'Keep the cooking smell in the kitchen',
    lede: 'Under-cabinet, wall-mount and insert, matched to your cooktop.',
  },
  '/appliances/washers-dryers': {
    heading: 'Make laundry day shorter',
    lede: 'Front-load, top-load and stackable pairs.',
  },
  '/appliances/garbage-disposals': {
    heading: 'No more scraping plates into the trash',
    lede: '½ to 1 horsepower, matched to your sink.',
  },
  '/appliances/air-conditioning': {
    heading: "Cool the room you're in",
    lede: 'Window and portable units, sized by room.',
  },
  '/appliances/accessories': {
    heading: 'The parts that finish the install',
    lede: 'Trim kits, hoses, vents and filters.',
  },
  '/windows/replacement': {
    hero: 'full',
    heading: 'Swap old windows without reframing',
    lede: 'Double hung, sliders and hoppers made to fit your existing opening.',
    subTitle: 'Shop by window type',
    subcategories: WINDOW_TYPE_TILES,
  },
  '/windows/replacement/double-hung-windows': {
    heading: '$179.99, almost any size',
    lede: 'Any size up to 101 inches (width + height). A 36 x 60 window is 96, so it qualifies. Energy-saving Low-E glass, and sashes that tilt in for cleaning.',
  },
  '/windows/replacement/slider-windows': {
    heading: 'Glide open, nothing to crank',
    lede: 'Vinyl, energy-saving Low-E glass, no hinges to break.',
  },
  '/windows/replacement/hopper-windows': {
    heading: 'Light and air for the basement',
    lede: 'Vinyl, energy-saving Low-E glass, for basements and utility rooms.',
  },
  '/windows/new-construction': {
    heading: 'Windows for a brand-new opening',
    lede: 'With a nailing fin for framing.',
  },
  '/sinks-faucets/kitchen-sinks': {
    heading: 'Big enough for the roasting pan',
    lede: 'Single, double, farmhouse and workstation, sized to our sink cabinets.',
  },
  '/sinks-faucets/kitchen-faucets': {
    heading: 'Reach every corner of the sink',
    lede: 'Pull-down, pull-out, single and double handle.',
  },
  '/sinks-faucets/accessories': {
    heading: 'Finish the sink',
    lede: 'Strainers, grids, soap dispensers and sprays.',
  },
  '/bath/vanity-tops': {
    heading: 'The top that fits your vanity',
    lede: 'Cultured marble and quartz, sized to our vanities.',
  },
  '/bath/side-splashes': {
    heading: 'Finish the edge',
    lede: 'Sold by the piece to match your top.',
  },
  '/bath/bathroom-sinks': {
    heading: 'Pick your basin',
    lede: 'Vessel, undermount and integrated.',
  },
  '/bath/bathroom-faucets': {
    heading: 'The finishing touch',
    lede: 'Single-hole, centerset and widespread.',
  },
  '/bath/drains-accessories': {
    heading: 'The parts that make it work',
    lede: 'Pop-up drains, traps, supply lines and more.',
  },
  '/cabinet-hardware/tiles': {
    heading: 'Carry the color up the wall',
    lede: 'Ceramic, porcelain, glass and stone, by the square foot.',
  },
  '/cabinet-hardware/accessories': {
    heading: 'Make every drawer earn its keep',
    lede: 'Organizers, trim, fillers and end panels, sized to our cabinets.',
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
  '/windows/replacement/rep-vinyl-windows':
    'Vinyl replacement windows sized to your existing opening.',
  '/windows/new-construction': 'With a nailing fin, for a brand-new opening.',
  '/windows/accessories': 'Screens, locks, balances and trim for your windows.',
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

// The points row and its small print by family: quoted countertops, pickup-only windows and
// appliances, otherwise whatever the entry says (or the shipped defaults).
function resolvePoints(key: string, base: CategoryContent): CategoryContent {
  if (isQuotedCountertopPath(key) && base.points == null) {
    return { ...base, points: COUNTERTOP_POINTS, fine: base.fine ?? COUNTERTOP_FINE };
  }

  if (isPickupOnlyPath(key)) {
    return { ...base, points: base.points ?? PICKUP_ONLY_POINTS, fine: base.fine };
  }

  return base;
}

// Appliance sub-categories: the kinds, widths, finishes and brands the live catalogue holds
// (lib/category/appliance-facets.json), unless the entry authors its own.
function withApplianceFacets(key: string, base: CategoryContent): CategoryContent {
  const facets = key.startsWith('/appliances/') ? applianceFacetsFor(key) : null;

  if (!facets) return base;

  return {
    ...base,
    tileGroups: base.tileGroups ?? facets.tileGroups,
    chipGroups: base.chipGroups ?? facets.chipGroups,
    brands: base.brands ?? facets.brands,
  };
}

export function getCategoryContent(path: string): CategoryContent {
  const key = normalize(path);
  const base = CATEGORY_CONTENT[key] ?? {};
  const content = withApplianceFacets(key, resolvePoints(key, base));
  // The authored lede (client copy, Oct 2026) wins; HERO_LEDES is the older fallback set.
  const lede = content.lede ?? HERO_LEDES[key];

  return lede ? { ...content, lede } : content;
}

// Hero photos by category path (public/images/category/heroes; 1424×640 for a category, 1424×380
// for a subcategory — both 2× of the hero panel). Used when BigCommerce has no category image.
const heroImage = (file: string, alt: string) => ({
  src: `/images/category/heroes/${file}.webp`,
  alt,
});

const HERO_IMAGES: Record<string, { src: string; alt: string }> = {
  '/appliances': heroImage(
    'cat-appliances',
    'A white kitchen with a stainless fridge, range and hood beside an oak island',
  ),
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
  // The parent has no photo of its own yet; the handles shot stands in until one arrives.
  '/cabinet-hardware': heroImage('sub-handles', 'Brass handles on a navy shaker door'),
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
