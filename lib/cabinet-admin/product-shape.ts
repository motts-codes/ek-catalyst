import 'server-only';

import { listMetafields, type Metafield, upsertMetafield } from './metafields-api';

// Per-product editor data for the admin Products tab. VIEW-ONLY: basic fields (name/SKU/visibility),
// category relationships, and the program-sibling link (managed in BC admin). EDITABLE: the three
// PDP content metafields the client authors.
//
// Content metafields (must match exactly what the PDP reads — see the PDP page-data query):
//   features.grid        = { headline, description, features: [{ image, title, text }] }
//   faq.list             = { headline, image?, items: [{ q, a }] }   <-- note: image is preserved
//   product_info.features = { headline, items: [{ name, value }] }
//
// Writes use READ-MODIFY-WRITE: the stored JSON is spread and only editor-managed keys overwritten,
// so unmodeled keys (e.g. faq.list.image) survive a save instead of being dropped.

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.CATALYST_ACCESS_TOKEN;
const BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;

function headers() {
  if (!TOKEN) throw new Error('CATALYST_ACCESS_TOKEN is not set');

  return { 'X-Auth-Token': TOKEN, Accept: 'application/json' };
}

// ── shapes ─────────────────────────────────────────────────────────────────────────────────────
export interface FeatureCell {
  image: string;
  title: string;
  text: string;
}
export interface FaqItem {
  q: string;
  a: string;
}
export interface InfoItem {
  name: string;
  value: string;
}

export interface ProductContent {
  features: { headline: string; description: string; cells: FeatureCell[] };
  faq: { headline: string; items: FaqItem[] };
  info: { headline: string; items: InfoItem[] };
}

export interface ProductView {
  id: number;
  name: string;
  sku: string;
  isVisible: boolean;
  categoryIds: number[];
  categoryNames: string[];
  // Program sibling (RTA <-> Assembled twin), if set.
  sibling: { productId: number; name: string } | null;
}

export interface ProductEditorData {
  view: ProductView;
  content: ProductContent;
}

export function emptyProductContent(): ProductContent {
  return {
    features: { headline: '', description: '', cells: [] },
    faq: { headline: '', items: [] },
    info: { headline: '', items: [] },
  };
}

// ── read ─────────────────────────────────────────────────────────────────────────────────────
function parse(mfs: Metafield[], namespace: string, key: string): Record<string, unknown> {
  const raw = mfs.find((m) => m.namespace === namespace && m.key === key)?.value;

  if (raw == null || raw === '') return {};

  try {
    const v: unknown = JSON.parse(raw);

    return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

async function bcGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), cache: 'no-store' });

  if (!res.ok) throw new Error(`BC ${path} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);

  return (await res.json()) as unknown;
}

/** Load one product's editor data (view fields + editable content). Null if the product is gone. */
export async function readProduct(productId: number): Promise<ProductEditorData | null> {
  const productResp = (await bcGet(
    `/catalog/products/${productId}?include_fields=name,sku,is_visible,categories`,
  )) as { data?: { name?: string; sku?: string; is_visible?: boolean; categories?: number[] } };

  const p = productResp.data;

  if (!p) return null;

  const mfs = await listMetafields('products', productId);

  // Category names (best-effort; a missing name just shows the id).
  const categoryIds = Array.isArray(p.categories) ? p.categories : [];
  const categoryNames = await categoryNamesFor(categoryIds);

  // Program sibling link (merch.program_sibling = { product_id, name }).
  const sib = parse(mfs, 'merch', 'program_sibling');
  const sibId = typeof sib.product_id === 'number' ? sib.product_id : Number(sib.product_id);
  const sibling =
    sibId && !Number.isNaN(sibId) ? { productId: sibId, name: str(sib.name) } : null;

  // Editable content.
  const features = parse(mfs, 'features', 'grid');
  const faq = parse(mfs, 'faq', 'list');
  const info = parse(mfs, 'product_info', 'features');

  return {
    view: {
      id: productId,
      name: p.name ?? '',
      sku: p.sku ?? '',
      isVisible: p.is_visible ?? true,
      categoryIds,
      categoryNames,
      sibling,
    },
    content: {
      features: {
        headline: str(features.headline),
        description: str(features.description),
        cells: arr(features.features).map((c) => {
          const cell = c as Record<string, unknown>;

          return { image: str(cell.image), title: str(cell.title), text: str(cell.text) };
        }),
      },
      faq: {
        headline: str(faq.headline),
        items: arr(faq.items).map((it) => {
          const item = it as Record<string, unknown>;

          return { q: str(item.q), a: str(item.a) };
        }),
      },
      info: {
        headline: str(info.headline),
        items: arr(info.items).map((it) => {
          const item = it as Record<string, unknown>;

          return { name: str(item.name), value: str(item.value) };
        }),
      },
    },
  };
}

// Small category-tree cache for id -> name resolution.
async function categoryNamesFor(ids: number[]): Promise<string[]> {
  if (ids.length === 0) return [];

  const tree = (await bcGet('/catalog/trees/categories?limit=250')) as {
    data?: Array<{ category_id: number; name: string }>;
  };
  const byId = new Map((tree.data ?? []).map((c) => [c.category_id, c.name]));

  return ids.map((id) => byId.get(id) ?? `#${id}`);
}

// ── write (content only; read-modify-write to preserve unmodeled keys) ───────────────────────────
export async function writeProductContent(
  productId: number,
  content: ProductContent,
): Promise<void> {
  const mfs = await listMetafields('products', productId);

  // features.grid — preserve any extra keys; drop empty cells.
  const featuresPrev = parse(mfs, 'features', 'grid');
  const cells = content.features.cells.filter(
    (c) => c.image.trim() || c.title.trim() || c.text.trim(),
  );
  await upsertMetafield(
    'products',
    productId,
    'features',
    'grid',
    JSON.stringify({
      ...featuresPrev,
      headline: content.features.headline,
      description: content.features.description,
      features: cells,
    }),
  );

  // faq.list — CRITICAL: spread previous so faq.list.image (unmodeled) is preserved.
  const faqPrev = parse(mfs, 'faq', 'list');
  const faqItems = content.faq.items.filter((it) => it.q.trim() || it.a.trim());
  await upsertMetafield(
    'products',
    productId,
    'faq',
    'list',
    JSON.stringify({ ...faqPrev, headline: content.faq.headline, items: faqItems }),
  );

  // product_info.features — preserve extra keys; drop empty rows.
  const infoPrev = parse(mfs, 'product_info', 'features');
  const infoItems = content.info.items.filter((it) => it.name.trim() || it.value.trim());
  await upsertMetafield(
    'products',
    productId,
    'product_info',
    'features',
    JSON.stringify({ ...infoPrev, headline: content.info.headline, items: infoItems }),
  );
}
