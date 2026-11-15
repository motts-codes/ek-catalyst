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
  'Brushed Nickel': 'brushed-nickel',
  'Polished Chrome': 'polished-chrome',
  'Satin Gold': 'satin-gold',
  'Oil Rubbed Bronze': 'oil-rubbed-bronze',
  'Matte Black': 'black',
  Black: 'black',
  White: 'white',
  Biscuit: 'bisque',
};

const FINISH_COLORS: Record<string, string> = {
  Bone: '#e6dccb',
  Gray: '#9a9a98',
  Ceramic: '#f4f2ee',
  'Fire Clay': '#f1ede4',
};

// The tile shows the trade name; BigCommerce holds the legal one. The brand id does the filtering.
const BRAND_DISPLAY_NAMES: Record<string, string> = {
  'M S International': 'MSI',
  'Home Products Source Ltd': 'Home Products Source',
  'Infinity Design Co. Inc.': 'Infinity Design',
  'Rynone Manufacturing Corp.': 'Rynone',
  'Silver Line Building Products': 'Silver Line',
};

const finishHref = (path: string, value: string) =>
  `${path}?${encodeURIComponent(`attr_${FINISH_FIELD}`)}=${encodeURIComponent(value)}`;

function finishTile(path: string, finish: FacetFinish): SubcategoryOverride {
  const image = FINISH_IMAGES[finish.label];

  return {
    name: finish.label,
    fallbackHref: finishHref(path, finish.value),
    image: image
      ? { src: `/images/category/tiles/finishes/${image}.webp`, alt: `${finish.label} finish` }
      : undefined,
    color: image ? undefined : (FINISH_COLORS[finish.label] ?? '#d9d9d9'),
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
    brands: entry.brands.map((brand) => ({
      name: BRAND_DISPLAY_NAMES[brand.name] ?? brand.name,
      href: `${path}?brand=${brand.entityId}`,
    })),
  };
}
