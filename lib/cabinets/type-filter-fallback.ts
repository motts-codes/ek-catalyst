import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { fetchFacetedSearch } from '~/app/[locale]/(default)/(faceted)/fetch-faceted-search';
import { type CurrencyCode } from '~/components/header/fragment';

type FacetedSearch = Awaited<ReturnType<typeof fetchFacetedSearch>>;
type SearchItem = FacetedSearch['products']['items'][number];

const PAGE_SIZE = 20;
// BigCommerce caps a products page at 50.
const FETCH_SIZE = 50;
const TTL_MS = 30 * 60 * 1000;

// The "Filter by type" tiles, the width / height / depth dropdowns and the finish chips on a
// cabinet collection are meant to narrow through search facets on the products' custom fields. BigCommerce has not indexed those
// facets (the fields are on every product, but the facets never appear and the attribute filters
// are ignored), so until it does, this narrows the collection in code: fetch every product in the
// collection (with the Program facet, which does work), keep the ones matching the selection, and
// page through those. The full list is kept for thirty minutes per collection/program, and every
// type / size / finish selection shares it (those params never reach the search). Next's own
// cache (`unstable_cache`) can't wrap the walk: the GraphQL client reads request headers, which
// is not allowed inside it; the walk's page fetches are data-cached for five minutes instead.
const listCache = new Map<string, { at: number; items: Promise<SearchItem[]> }>();

/** The in-code selection: any number of types, widths, heights and depths (each empty = no
 *  narrowing). */
export interface CabinetGridFilters {
  types: string[];
  widths: string[];
  heights: string[];
  depths: string[];
  /** The selected finish name on a per-finish (Prism) collection, else null. */
  finish?: string | null;
}

export interface SizeOption {
  /** The value as it appears in the URL and the custom field ("34.5"). */
  value: string;
  /** Shown on the chip ('34½"' style is left to the component; this is '34.5"'). */
  label: string;
  /** Products with this value, given the other active filters. */
  count: number;
}

export interface CabinetSizeOptions {
  widths: SizeOption[];
  heights: SizeOption[];
  depths: SizeOption[];
}

async function fetchAllItems(
  params: Record<string, unknown>,
  currencyCode?: CurrencyCode,
  customerAccessToken?: string,
): Promise<SearchItem[]> {
  const items: SearchItem[] = [];
  let after: string | undefined;

  // Sequential cursor walk; the collection is a few hundred products at most.
  let hasNextPage = true;

  while (hasNextPage) {
    // eslint-disable-next-line no-await-in-loop
    const page = await fetchFacetedSearch(
      { ...params, limit: FETCH_SIZE, after },
      currencyCode,
      customerAccessToken,
    );

    items.push(...page.products.items);
    hasNextPage = page.products.pageInfo.hasNextPage && page.products.pageInfo.endCursor != null;
    after = page.products.pageInfo.endCursor ?? undefined;
  }

  return items;
}

function customField(item: SearchItem, name: string): string | undefined {
  if (!('customFields' in item)) return undefined;

  return removeEdgesAndNodes(item.customFields)
    .find((field) => field.name === name)
    ?.value.trim();
}

const productTypeOf = (item: SearchItem) => customField(item, 'Product Type')?.toUpperCase();
// The numeric "Width" / "Height" custom fields ("34.5"); "Cabinets Width" carries the same value
// with an inch mark.
const widthOf = (item: SearchItem) => customField(item, 'Width');
const heightOf = (item: SearchItem) => customField(item, 'Height');
const depthOf = (item: SearchItem) => customField(item, 'Depth');
const finishOf = (item: SearchItem) => customField(item, 'Finish');

// Page cursors in this mode are plain page numbers ("p2"), carried in the same after/before
// params the real search uses, so the pagination component needs no changes.
export const isFallbackCursor = (cursor: unknown): cursor is string =>
  typeof cursor === 'string' && /^p\d+$/.test(cursor);

const pageFromCursor = (cursor: unknown): number =>
  isFallbackCursor(cursor) ? Math.max(1, Number(cursor.slice(1))) : 1;

export function hasProductTypeFacet(search: FacetedSearch): boolean {
  return search.facets.items.some((facet) => 'name' in facet && facet.name === 'Product Type');
}

/** The collection pages' default order: the way a kitchen is read — wall, base, sink base, tall,
 *  vanity, then trim and accessories — and within a type by width, height, then name. */
export const RECOMMENDED_SORT = 'recommended';

/** The built-in type order; the client can change it in /cabinet-admin → Attributes
 *  (attributes.recommended_type_order on 863). */
export const DEFAULT_TYPE_ORDER = [
  'WALL CABINET',
  'BASE CABINET',
  'SINK BASE CABINET',
  'TALL CABINET',
  'VANITY CABINET',
  'TRIM & DECORATIVE',
];

const numeric = (value: string | undefined) => {
  const n = Number.parseFloat(value ?? '');

  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

// A product's "__sort" custom field pins it ahead of the type order (lower first); products
// without it follow in the type / width / height order.
const pinOf = (item: SearchItem) => numeric(customField(item, '__sort'));

function recommendedOrder(items: SearchItem[], typeOrder: string[]): SearchItem[] {
  const order = typeOrder.map((t) => t.trim().toUpperCase());
  const rank = (item: SearchItem) => {
    const index = order.indexOf(productTypeOf(item) ?? '');

    return index === -1 ? order.length : index;
  };

  return [...items].sort(
    (a, b) =>
      pinOf(a) - pinOf(b) ||
      rank(a) - rank(b) ||
      numeric(widthOf(a)) - numeric(widthOf(b)) ||
      numeric(heightOf(a)) - numeric(heightOf(b)) ||
      a.name.localeCompare(b.name),
  );
}

export const hasGridFilters = (filters: CabinetGridFilters): boolean =>
  filters.types.length > 0 ||
  filters.widths.length > 0 ||
  filters.heights.length > 0 ||
  filters.depths.length > 0 ||
  Boolean(filters.finish);

// The URL params the in-code narrowing handles itself; they never reach the search, and they
// must stay out of the cache key or every type click walks the collection again.
const IN_CODE_PARAMS = [
  'after',
  'before',
  'page',
  'width',
  'height',
  'depth',
  'finish',
  'attr_Product Type',
];

// Every product in the collection (for the given program), cached thirty minutes. The pagination
// and in-code filter params are dropped from the key, so one walk serves every type / size /
// finish selection.
export function fetchCabinetCollectionItems(
  searchParams: Record<string, unknown>,
  currencyCode?: CurrencyCode,
  customerAccessToken?: string,
): Promise<SearchItem[]> {
  const rest = Object.fromEntries(
    Object.entries(searchParams).filter(([name]) => !IN_CODE_PARAMS.includes(name)),
  );
  const key = JSON.stringify([rest, currencyCode, Boolean(customerAccessToken)]);
  const cached = listCache.get(key);
  const fresh = cached != null && Date.now() - cached.at < TTL_MS;

  if (fresh) return cached.items;

  const all = fetchAllItems(rest, currencyCode, customerAccessToken);

  listCache.set(key, { at: Date.now(), items: all });
  // A failed walk must not be served for the next thirty minutes.
  all.catch(() => listCache.delete(key));

  return all;
}

const inSet = (value: string | undefined, wanted: string[]) =>
  wanted.length === 0 || (value != null && wanted.includes(value));

function matches(item: SearchItem, filters: CabinetGridFilters): boolean {
  return (
    inSet(
      productTypeOf(item),
      filters.types.map((t) => t.toUpperCase()),
    ) &&
    inSet(widthOf(item), filters.widths) &&
    inSet(heightOf(item), filters.heights) &&
    inSet(depthOf(item), filters.depths) &&
    (!filters.finish || finishOf(item)?.toLowerCase() === filters.finish.toLowerCase())
  );
}

// Distinct values of one dimension, counted over the items that match every OTHER filter (the
// usual facet behaviour: picking a width never empties the width row), sorted numerically.
function options(
  items: SearchItem[],
  read: (item: SearchItem) => string | undefined,
  others: CabinetGridFilters,
): SizeOption[] {
  const counts = new Map<string, number>();

  items
    .filter((item) => matches(item, others))
    .forEach((item) => {
      const value = read(item);

      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    });

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: `${value}"`, count }))
    .sort((a, b) => Number(a.value) - Number(b.value));
}

// The width, height and depth options for a collection, counted against the other filters.
export async function cabinetSizeOptions({
  searchParams,
  filters,
  currencyCode,
  customerAccessToken,
}: {
  searchParams: Record<string, unknown>;
  filters: CabinetGridFilters;
  currencyCode?: CurrencyCode;
  customerAccessToken?: string;
}): Promise<CabinetSizeOptions> {
  const items = await fetchCabinetCollectionItems(searchParams, currencyCode, customerAccessToken);

  return {
    widths: options(items, widthOf, { ...filters, widths: [] }),
    heights: options(items, heightOf, { ...filters, heights: [] }),
    depths: options(items, depthOf, { ...filters, depths: [] }),
  };
}

export async function fetchCabinetProductsFiltered({
  searchParams,
  filters,
  order,
  typeOrder = DEFAULT_TYPE_ORDER,
  search,
  currencyCode,
  customerAccessToken,
  pageSize = PAGE_SIZE,
}: {
  /** The search params the real query used, minus pagination and the in-code filter params. */
  searchParams: Record<string, unknown>;
  filters: CabinetGridFilters;
  /** "recommended" sorts the matches into the cabinet order; otherwise the search's own order. */
  order?: typeof RECOMMENDED_SORT;
  /** The cabinet type order for "recommended" (the client's, from 863, else the default). */
  typeOrder?: string[];
  /** The real (un-narrowed) result; its facets are kept for the sidebar. */
  search: FacetedSearch;
  currencyCode?: CurrencyCode;
  customerAccessToken?: string;
  /** Products per page (the listing's page size). */
  pageSize?: number;
}): Promise<FacetedSearch> {
  const { after, before, page: pageParam } = searchParams;
  const all = await fetchCabinetCollectionItems(searchParams, currencyCode, customerAccessToken);
  const matched = all.filter((item) => matches(item, filters));
  const matching = order === RECOMMENDED_SORT ? recommendedOrder(matched, typeOrder) : matched;
  // ?page=N (numbered pagination) wins; the older "p2"-style cursors still work.
  const requested =
    typeof pageParam === 'string' && /^\d+$/.test(pageParam) ? Number(pageParam) : 0;
  const page = requested > 0 ? requested : pageFromCursor(before ?? after);
  const start = (page - 1) * pageSize;
  const items = matching.slice(start, start + pageSize);
  const hasNextPage = start + pageSize < matching.length;
  const hasPreviousPage = page > 1;

  return {
    ...search,
    products: {
      items,
      collectionInfo: { totalItems: matching.length },
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: hasPreviousPage ? `p${page - 1}` : null,
        endCursor: hasNextPage ? `p${page + 1}` : null,
      },
    },
  };
}
