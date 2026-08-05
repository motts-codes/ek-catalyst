import 'server-only';

// Server-side product list for the admin Products tab. Search + pagination happen on the
// BigCommerce Management API so this scales to thousands of products (never load them all client-side).

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_ACCESS_TOKEN;
const BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;

function headers() {
  if (!TOKEN) throw new Error('CATALYST_ACCESS_TOKEN is not set');

  return { 'X-Auth-Token': TOKEN, Accept: 'application/json' };
}

export interface AdminProductRow {
  id: number;
  name: string;
  sku: string;
  type: string; // derived (cabinet program / accessory / other)
  isVisible: boolean;
}

export interface ProductsPage {
  rows: AdminProductRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Rough "type" label from the product name (until a real Program/Type facet exists).
function deriveType(name: string): string {
  if (/ Assembled /i.test(name)) return 'Assembled Cabinet';
  if (/ RTA /i.test(name)) return 'RTA Cabinet';
  if (/molding|panel|filler|valance|toe kick|scribe|batten|light rail/i.test(name)) return 'Accessory';
  if (/sample/i.test(name)) return 'Sample';

  return 'Product';
}

/** One page of products, optionally filtered by a keyword search. */
export async function getAdminProducts({
  page = 1,
  perPage = 25,
  search = '',
}: {
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<ProductsPage> {
  const params = new URLSearchParams({
    limit: String(perPage),
    page: String(page),
    include_fields: 'name,sku,is_visible',
    sort: 'name',
  });

  if (search.trim()) {
    params.set('keyword', search.trim());
  }

  const res = await fetch(`${BASE}/catalog/products?${params.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`BC products list -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = await res.json();
  const pagination = data.meta?.pagination ?? {};

  const rows: AdminProductRow[] = (data.data ?? []).map(
    (p: { id: number; name: string; sku?: string; is_visible?: boolean }) => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? '',
      type: deriveType(p.name),
      isVisible: p.is_visible ?? true,
    }),
  );

  return {
    rows,
    total: pagination.total ?? rows.length,
    page: pagination.current_page ?? page,
    perPage,
    totalPages: pagination.total_pages ?? 1,
  };
}
