import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { fetchFacetedSearch } from '~/app/[locale]/(default)/(faceted)/fetch-faceted-search';
import { type CurrencyCode } from '~/components/header/fragment';

type FacetedSearch = Awaited<ReturnType<typeof fetchFacetedSearch>>;
type SearchItem = FacetedSearch['products']['items'][number];

const PAGE_SIZE = 12;
// BigCommerce caps a products page at 50.
const FETCH_SIZE = 50;
const TTL_MS = 10 * 60 * 1000;

// The "Filter by type" tiles on a cabinet collection are meant to narrow through the Product Type
// search facet. BigCommerce has not indexed that facet (the filter is enabled, the field is on
// every product, but the facet never appears and the attribute filter is ignored), so until it
// does, this narrows the collection in code: fetch every product in the collection (with the
// Program facet, which does work), keep the ones whose Product Type matches, and page through
// those. The full list is kept for ten minutes per collection/program.
const listCache = new Map<string, { at: number; items: Promise<SearchItem[]> }>();

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

function productTypeOf(item: SearchItem): string | undefined {
  if (!('customFields' in item)) return undefined;

  return removeEdgesAndNodes(item.customFields)
    .find((field) => field.name === 'Product Type')
    ?.value.trim()
    .toUpperCase();
}

// Page cursors in this mode are plain page numbers ("p2"), carried in the same after/before
// params the real search uses, so the pagination component needs no changes.
export const isFallbackCursor = (cursor: unknown): cursor is string =>
  typeof cursor === 'string' && /^p\d+$/.test(cursor);

const pageFromCursor = (cursor: unknown): number =>
  isFallbackCursor(cursor) ? Math.max(1, Number(cursor.slice(1))) : 1;

export function hasProductTypeFacet(search: FacetedSearch): boolean {
  return search.facets.items.some((facet) => 'name' in facet && facet.name === 'Product Type');
}

export async function fetchCabinetProductsByType({
  searchParams,
  type,
  search,
  currencyCode,
  customerAccessToken,
}: {
  /** The search params the real query used, minus pagination and the type attribute. */
  searchParams: Record<string, unknown>;
  type: string;
  /** The real (un-narrowed) result; its facets are kept for the sidebar. */
  search: FacetedSearch;
  currencyCode?: CurrencyCode;
  customerAccessToken?: string;
}): Promise<FacetedSearch> {
  const { after, before, page: _page, ...rest } = searchParams;
  const key = JSON.stringify([rest, currencyCode, Boolean(customerAccessToken)]);
  const cached = listCache.get(key);
  const fresh = cached != null && Date.now() - cached.at < TTL_MS;
  const all = fresh ? cached.items : fetchAllItems(rest, currencyCode, customerAccessToken);

  if (!fresh) listCache.set(key, { at: Date.now(), items: all });

  const wanted = type.trim().toUpperCase();
  const matching = (await all).filter((item) => productTypeOf(item) === wanted);
  const page = pageFromCursor(before ?? after);
  const start = (page - 1) * PAGE_SIZE;
  const items = matching.slice(start, start + PAGE_SIZE);
  const hasNextPage = start + PAGE_SIZE < matching.length;
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
