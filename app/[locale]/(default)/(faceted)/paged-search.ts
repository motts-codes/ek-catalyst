import { z } from 'zod';

import { type NumberedPaginationInfo } from '@/vibes/soul/primitives/numbered-pagination';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { type CurrencyCode } from '~/components/header/fragment';

import { PublicSearchParamsSchema, PublicToPrivateParams } from './fetch-faceted-search';

// Numbered pagination (?page=N) over BigCommerce's cursor-only product connection.
//
// BigCommerce cursors are keyset cursors (sort key + id), not offsets, so page N can't be
// computed. Instead we walk the result set once with an ids-only query (50 per request, the
// API's cap), remember every edge cursor, and use the cursor of the last item on page N-1 as the
// `after` for page N. The walk is cached per filters/sort for a few minutes, so a listing of a
// few hundred products costs a handful of light requests once, then nothing.

export const PAGE_PARAM = 'page';
// 20 per page: divides by 4 and by 5, the listing grid's column counts with the filter sidebar
// open and hidden, so every full page fills its last row.
export const DEFAULT_PAGE_SIZE = 20;

const FETCH_SIZE = 50;
const TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

const GetProductCursorsQuery = graphql(`
  query GetProductCursorsQuery(
    $first: Int
    $after: String
    $filters: SearchProductsFiltersInput!
    $sort: SearchProductsSortInput
  ) {
    site {
      search {
        searchProducts(filters: $filters, sort: $sort) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            collectionInfo {
              totalItems
            }
            edges {
              cursor
            }
          }
        }
      }
    }
  }
`);

interface CursorWalk {
  at: number;
  cursors: string[];
  endCursor: string | null;
  hasNextPage: boolean;
  totalItems: number;
}

const walks = new Map<string, CursorWalk>();

const PageSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value[0] : value),
  z.coerce.number().int().min(1),
);

// The 1-based page from a raw query value; anything odd is page one.
export function pageNumber(raw: unknown): number {
  const parsed = PageSchema.safeParse(raw);

  return parsed.success ? parsed.data : 1;
}

export async function resolvePageCursor(
  params: z.input<typeof PublicSearchParamsSchema>,
  page: number,
  {
    currencyCode,
    customerAccessToken,
  }: { currencyCode?: CurrencyCode; customerAccessToken?: string } = {},
): Promise<{ after: string | undefined; page: number }> {
  if (page <= 1) return { after: undefined, page: 1 };

  const { limit, sort, filters } = PublicToPrivateParams.parse({
    ...params,
    after: undefined,
    before: undefined,
    page: undefined,
  });
  const pageSize = limit ?? DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * pageSize;
  const key = JSON.stringify([filters, sort, pageSize, currencyCode, Boolean(customerAccessToken)]);

  let walk = walks.get(key);

  if (walk != null && Date.now() - walk.at > TTL_MS) walk = undefined;

  if (walk == null) {
    walk = { at: Date.now(), cursors: [], endCursor: null, hasNextPage: true, totalItems: 0 };
  }

  while (walk.cursors.length < skip && walk.hasNextPage) {
    // Sequential by nature: each request's end cursor is the next request's start.
    // eslint-disable-next-line no-await-in-loop
    const { data } = await client.fetch({
      document: GetProductCursorsQuery,
      variables: { first: FETCH_SIZE, after: walk.endCursor ?? undefined, filters, sort },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate: 300 } },
    });

    const products = data.site.search.searchProducts.products;
    const edges = products.edges ?? [];

    walk.cursors.push(...edges.map((edge) => edge.cursor));
    walk.totalItems = products.collectionInfo?.totalItems ?? walk.cursors.length;
    walk.hasNextPage = products.pageInfo.hasNextPage && products.pageInfo.endCursor != null;
    walk.endCursor = products.pageInfo.endCursor ?? null;

    if (edges.length === 0) break;
  }

  if (walks.size >= MAX_CACHE_ENTRIES) walks.clear();

  walks.set(key, walk);

  // Past the end (stale link, hand-edited URL): land on the last page instead of an empty grid.
  const lastPage = Math.max(1, Math.ceil(walk.totalItems / pageSize));
  const target = Math.min(page, lastPage);
  const after = target > 1 ? walk.cursors[(target - 1) * pageSize - 1] : undefined;

  return { after, page: target };
}

export function numberedPaginationInfo(
  totalItems: number,
  page: number,
  limit = DEFAULT_PAGE_SIZE,
): NumberedPaginationInfo {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const current = Math.min(Math.max(1, page), totalPages);

  return {
    page: current,
    totalPages,
    from: totalItems === 0 ? 0 : (current - 1) * limit + 1,
    to: Math.min(current * limit, totalItems),
    totalItems,
    pageParamName: PAGE_PARAM,
  };
}
