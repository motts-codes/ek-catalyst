// The Products tab's visibility filter. Plain types and parsing only (no server-only import), so
// the client-side table and the server loader can both use it.

/** Which products the list shows; the default hides products that are not visible on the storefront. */
export type ProductStatusFilter = 'active' | 'hidden' | 'all';

export const DEFAULT_PRODUCT_STATUS: ProductStatusFilter = 'active';

export function parseProductStatus(value: string | undefined): ProductStatusFilter {
  return value === 'hidden' || value === 'all' ? value : DEFAULT_PRODUCT_STATUS;
}
