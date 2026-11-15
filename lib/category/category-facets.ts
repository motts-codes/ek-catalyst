import type { BrandTile, ChipGroup, SubcategoryOverride, TileGroupLook } from './category-content';
import facets from './category-facets.json' with { type: 'json' };

// Brands and finishes the live catalogue actually holds per non-cabinet category, mined by
// scripts/build-category-facets.py (see the JSON's `_source`). Rendered as a "Shop by finish"
// swatch row and a "Shop by brand" row on the category page. A finish tile filters the listing on
// the "Product Finish" custom field (an enabled storefront filter), a brand tile on the brand id.
// Appliances have their own miner (appliance-facets.ts).

interface FacetBrand {
  name: string;
  entityId: number;
  count: number;
}

interface FacetFinish {
  label: string;
  value: string;
  count: number;
}

interface FacetEntry {
  count: number;
  brands: FacetBrand[];
  finishes: FacetFinish[];
}

const CATEGORIES: Record<string, FacetEntry | undefined> = facets.categories;

export interface CategoryFacets {
  tileGroups: Array<{ title: string; items: SubcategoryOverride[]; look?: TileGroupLook }>;
  /** No chip rows outside appliances; kept so both miners return the same shape. */
  chipGroups: ChipGroup[];
  brands: BrandTile[];
}

const FINISH_FIELD = 'Product Finish';

// Swatch per finish value: a photo tile in public/images/category/tiles/finishes, or a flat panel
// in the finish's colour. The metal tiles are tints of the stainless one.
const FINISH_IMAGES: Record<string, string> = {
  'Stainless Steel': 'stainless-steel',
  Chrome: 'polished-chrome',
  'Brushed Nickel': 'brushed-nickel',
  'Polished Chrome': 'polished-chrome',
  'Satin Gold': 'satin-gold',
  'Oil Rubbed Bronze': 'oil-rubbed-bronze',
  'Matte Black': 'black',
  Black: 'black',
  White: 'white',
  Biscuit: 'bisque',
};

// Cabinet hardware uses the handle photos (public/images/category/handles) for the finishes
// they cover; the Chrome tile is the polished-chrome metal.
const HANDLE_FINISH_IMAGES: Record<string, string> = {
  Nickel: 'nickel',
  'Gold & Champagne': 'brass',
  Brass: 'brass',
  Bronze: 'bronze',
  Black: 'black',
};

const FINISH_COLORS: Record<string, string> = {
  Bone: '#e6dccb',
  Gray: '#9a9a98',
  Ceramic: '#f4f2ee',
  'Fire Clay': '#f1ede4',
  'Light Brown': '#b08a5a',
  'Dark Brown': '#5a3f2a',
  'White & Almond': '#f1ebe0',
  'Pewter & Grey': '#8e8f91',
  'Glass & Crystal': '#e9f1f4',
  'Iron & Rustic': '#4b4642',
  Silver: '#c4c6c9',
  Natural: '#d9c3a0',
  Wood: '#c9a776',
};

// The tile shows the trade name; BigCommerce holds the legal one. The brand id does the filtering.
const BRAND_DISPLAY_NAMES: Record<string, string> = {
  'M S International': 'MSI',
  'Home Products Source Ltd': 'Home Products Source',
  'Infinity Design Co. Inc.': 'Infinity Design',
  'Rynone Manufacturing Corp.': 'Rynone',
  'Silver Line Building Products': 'Silver Line',
  'Hartson-Kennedy Cabinet Top': 'Hartson-Kennedy',
  'Rev-a-shelf': 'Rev-A-Shelf',
};

// Logos on file in public/images/brands, keyed by the BigCommerce brand name (the live store's
// uploads plus the brands' own, see docs). Brands without one render as a wordmark. Oakland, Paani,
// Amerock (and its Everyday Basics line), Swanstone, Infinity Design and Rynone publish none.
const BRAND_LOGOS: Record<string, string> = {
  'M S International': 'msi.svg',
  'Fine Fixtures': 'fine-fixtures.png',
  'Home Products Source Ltd': 'home-products-source.png',
  'Star Hardware': 'star-hardware.png',
  'Crystal Windows': 'crystal-windows.svg',
  'United Windows': 'united-windows.png',
  'Silver Line Building Products': 'silver-line.png',
  Richelieu: 'richelieu.png',
  'Rev-a-shelf': 'rev-a-shelf.png',
  'Star Cabinetry': 'star-cabinetry.png',
  'Hartson-Kennedy Cabinet Top': 'hartson-kennedy.png',
};

function brandTile(path: string, brand: FacetBrand): BrandTile {
  const name = BRAND_DISPLAY_NAMES[brand.name] ?? brand.name;
  const file = BRAND_LOGOS[brand.name];

  return {
    name,
    href: `${path}?brand=${brand.entityId}`,
    logo: file ? { src: `/images/brands/${file}`, alt: `${name} logo` } : undefined,
  };
}

const finishHref = (path: string, value: string) =>
  `${path}?${encodeURIComponent(`attr_${FINISH_FIELD}`)}=${encodeURIComponent(value)}`;

function finishImage(path: string, label: string) {
  const handle = path.startsWith('/cabinet-hardware') ? HANDLE_FINISH_IMAGES[label] : undefined;

  if (handle) return `/images/category/handles/${handle}.webp`;

  const finish = FINISH_IMAGES[label];

  return finish ? `/images/category/tiles/finishes/${finish}.webp` : undefined;
}

function finishTile(path: string, finish: FacetFinish): SubcategoryOverride {
  const src = finishImage(path, finish.label);

  return {
    name: finish.label,
    fallbackHref: finishHref(path, finish.value),
    image: src ? { src, alt: `${finish.label} finish` } : undefined,
    color: src ? undefined : (FINISH_COLORS[finish.label] ?? '#d9d9d9'),
  };
}

export function categoryFacetsFor(path: string): CategoryFacets | null {
  const entry = CATEGORIES[path];

  if (!entry) return null;

  const finishes = entry.finishes.map((finish) => finishTile(path, finish));

  return {
    tileGroups:
      finishes.length > 0 ? [{ title: 'Shop by finish', items: finishes, look: 'swatch' }] : [],
    chipGroups: [],
    brands: entry.brands.map((brand) => brandTile(path, brand)),
  };
}
