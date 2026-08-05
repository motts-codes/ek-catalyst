import { listCabinetCollections, listMetafields, type Metafield, upsertMetafield } from './metafields-api';

// Structured shape of a cabinet collection's editable metafields. The panel edits these fields; the
// helpers below convert to/from the stored JSON-string metafields (namespace.key = value).

export interface ProgramPricing {
  price: string;
  strike_price: string;
  emi_text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CollectionMetafields {
  // pricing_10x10.pricing = { rta, assembled }
  pricing: { rta: ProgramPricing; assembled: ProgramPricing };
  // merch.info
  merch: { line: string; door_style: string; default_finish: string };
  // fulfillment.delivery = { rta, assembled }
  delivery: { rta: string; assembled: string };
  // assets.spec_sheets = { rta, assembled }
  specSheets: { rta: string; assembled: string };
  // sample.order_sample
  sample: { product_id: string; price: string };
  // faq.by_program = { assembled: {headline, items[]}, rta: {headline, items[]} } — collection FAQ
  // split by program (RTA and Assembled have different questions).
  faq: {
    assembled: { headline: string; items: FaqItem[] };
    rta: { headline: string; items: FaqItem[] };
  };
}

const emptyPricing = (): ProgramPricing => ({ price: '', strike_price: '', emi_text: '' });

const DEFAULT_FAQ_HEADLINE = 'Frequently Asked Questions';

export function emptyCollectionMetafields(): CollectionMetafields {
  return {
    pricing: { rta: emptyPricing(), assembled: emptyPricing() },
    merch: { line: '', door_style: '', default_finish: '' },
    delivery: { rta: '', assembled: '' },
    specSheets: { rta: '', assembled: '' },
    sample: { product_id: '', price: '' },
    faq: {
      assembled: { headline: DEFAULT_FAQ_HEADLINE, items: [] },
      rta: { headline: DEFAULT_FAQ_HEADLINE, items: [] },
    },
  };
}

function findValue(mfs: Metafield[], namespace: string, key: string): unknown {
  const raw = mfs.find((m) => m.namespace === namespace && m.key === key)?.value;

  if (raw == null || raw === '') return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Read a collection's metafields into the structured shape (missing values -> empty strings). */
export async function readCollectionMetafields(categoryId: number): Promise<CollectionMetafields> {
  const mfs = await listMetafields('categories', categoryId);
  const base = emptyCollectionMetafields();

  const pricing = findValue(mfs, 'pricing_10x10', 'pricing') as
    | Partial<CollectionMetafields['pricing']>
    | undefined;
  const merch = findValue(mfs, 'merch', 'info') as
    | Partial<CollectionMetafields['merch']>
    | undefined;
  const delivery = findValue(mfs, 'fulfillment', 'delivery') as
    | Partial<CollectionMetafields['delivery']>
    | undefined;
  const specSheets = findValue(mfs, 'assets', 'spec_sheets') as
    | Partial<CollectionMetafields['specSheets']>
    | undefined;
  const sample = findValue(mfs, 'sample', 'order_sample') as
    | { product_id?: number | string; price?: string }
    | undefined;
  const faq = findValue(mfs, 'faq', 'by_program') as
    | Partial<CollectionMetafields['faq']>
    | undefined;

  const normalizeFaqSide = (
    side: { headline?: string; items?: FaqItem[] } | undefined,
    fallback: { headline: string; items: FaqItem[] },
  ) => ({
    headline: side?.headline ?? fallback.headline,
    items: Array.isArray(side?.items) ? side.items : fallback.items,
  });

  return {
    pricing: {
      rta: { ...base.pricing.rta, ...pricing?.rta },
      assembled: { ...base.pricing.assembled, ...pricing?.assembled },
    },
    merch: { ...base.merch, ...merch },
    delivery: { ...base.delivery, ...delivery },
    specSheets: { ...base.specSheets, ...specSheets },
    sample: {
      product_id: sample?.product_id != null ? String(sample.product_id) : '',
      price: sample?.price ?? '',
    },
    faq: {
      assembled: normalizeFaqSide(faq?.assembled, base.faq.assembled),
      rta: normalizeFaqSide(faq?.rta, base.faq.rta),
    },
  };
}

/** Write the structured shape back to the collection's metafields (only writes the 5 namespaces). */
export async function writeCollectionMetafields(
  categoryId: number,
  data: CollectionMetafields,
): Promise<void> {
  await upsertMetafield(
    'categories',
    categoryId,
    'pricing_10x10',
    'pricing',
    JSON.stringify({ rta: data.pricing.rta, assembled: data.pricing.assembled }),
  );
  await upsertMetafield('categories', categoryId, 'merch', 'info', JSON.stringify(data.merch));
  await upsertMetafield(
    'categories',
    categoryId,
    'fulfillment',
    'delivery',
    JSON.stringify(data.delivery),
  );
  await upsertMetafield(
    'categories',
    categoryId,
    'assets',
    'spec_sheets',
    JSON.stringify(data.specSheets),
  );
  await upsertMetafield(
    'categories',
    categoryId,
    'sample',
    'order_sample',
    // Keep product_id numeric in the stored JSON when possible (matches the seed shape).
    JSON.stringify({
      product_id: /^\d+$/.test(data.sample.product_id)
        ? Number(data.sample.product_id)
        : data.sample.product_id,
      price: data.sample.price,
    }),
  );
  // Collection FAQ, split by program. Drop empty Q&A rows on save so the stored list is clean.
  const cleanSide = (side: { headline: string; items: FaqItem[] }) => ({
    headline: side.headline,
    items: side.items.filter((it) => it.q.trim() !== '' || it.a.trim() !== ''),
  });

  await upsertMetafield(
    'categories',
    categoryId,
    'faq',
    'by_program',
    JSON.stringify({
      assembled: cleanSide(data.faq.assembled),
      rta: cleanSide(data.faq.rta),
    }),
  );
}

// A summary row per collection for the admin Collections table.
export interface CollectionRow {
  id: number;
  name: string;
  line: string;
  doorStyle: string;
  defaultFinish: string;
}

export async function listCollectionRows(): Promise<CollectionRow[]> {
  const collections = await listCabinetCollections();

  return Promise.all(
    collections.map(async (c) => {
      const mf = await readCollectionMetafields(c.id);

      return {
        id: c.id,
        name: c.name,
        line: mf.merch.line,
        doorStyle: mf.merch.door_style,
        defaultFinish: mf.merch.default_finish,
      };
    }),
  );
}
