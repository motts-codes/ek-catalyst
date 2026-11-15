import facets from './appliance-facets.json' with { type: 'json' };
import type { BrandTile, ChipGroup, SubcategoryOverride } from './category-content';

// What the live appliance catalogue actually contains per sub-category, mined from product names
// and brands by scripts/appliances/build-appliance-facets.py (see the JSON's `_source`). Rendered
// as "Shop by type" tiles, width / finish chips and a brand row on each appliance sub-category
// page. Links narrow the same listing: kinds, widths and finishes by search term, brands by id.

interface FacetKind {
  label: string;
  term: string;
  count: number;
  image?: string;
  imageAlt?: string;
}

interface FacetChip {
  label: string;
  term: string;
  count: number;
  swatch?: string;
  image?: string;
}

interface FacetBrand {
  name: string;
  entityId: number;
  count: number;
  logo?: string;
}

interface FacetEntry {
  count: number;
  kinds: FacetKind[];
  widths: FacetChip[];
  finishes: FacetChip[];
  brands: FacetBrand[];
}

const CATEGORIES: Record<string, FacetEntry | undefined> = facets.categories;

export interface ApplianceFacets {
  tileGroups: Array<{ title: string; items: SubcategoryOverride[] }>;
  chipGroups: ChipGroup[];
  brands: BrandTile[];
}

const termHref = (path: string, term: string) => `${path}?term=${encodeURIComponent(term)}`;

// Disposals' second chip row is horsepower, not width.
const chipTitle = (path: string) =>
  path.endsWith('/garbage-disposals') ? 'Shop by horsepower' : 'Shop by width';

export function applianceFacetsFor(path: string): ApplianceFacets | null {
  const entry = CATEGORIES[path];

  if (!entry) return null;

  const kinds = entry.kinds.map((kind) => ({
    name: kind.label,
    fallbackHref: termHref(path, kind.term),
    image: { src: kind.image ?? '', alt: kind.imageAlt ?? kind.label },
  }));

  const chipGroups: ChipGroup[] = [];

  if (entry.widths.length > 0) {
    chipGroups.push({
      title: chipTitle(path),
      items: entry.widths.map((chip) => ({ label: chip.label, href: termHref(path, chip.term) })),
    });
  }

  // Finishes are cards like the kinds: the client's swatch photo, or a flat panel in the finish's
  // colour for the few without one.
  const finishes = entry.finishes.map((finish) => ({
    name: finish.label,
    fallbackHref: termHref(path, finish.term),
    image: finish.image ? { src: finish.image, alt: `${finish.label} finish` } : undefined,
    color: finish.image ? undefined : finish.swatch,
  }));

  const tileGroups = [
    ...(kinds.length > 0 ? [{ title: 'Shop by type', items: kinds }] : []),
    ...(finishes.length > 0 ? [{ title: 'Shop by finish', items: finishes }] : []),
  ];

  return {
    tileGroups,
    chipGroups,
    brands: entry.brands.map((brand) => ({
      name: brand.name,
      href: `${path}?brand=${brand.entityId}`,
      logo: brand.logo ? { src: brand.logo, alt: `${brand.name} logo` } : undefined,
    })),
  };
}
