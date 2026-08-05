import { readCabinetAttributes } from './attributes-shape';
import { CABINETS_PARENT_CATEGORY_ID } from './collection-shape-const';
import { listCabinetCollections, listMetafields, type Metafield, upsertMetafield } from './metafields-api';

export { CABINETS_PARENT_CATEGORY_ID };

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

export interface AssemblyVideo {
  name: string;
  url: string;
}

// A collection's selections from the attribute master-lists (see attributes-shape.ts). Options are
// referenced by stable id; dangling ids (option deleted from the master list) are ignored on read.
export interface CollectionSpec {
  productLineId: string;
  constructionId: string;
  colorIds: string[];
  defaultColorId: string;
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
  // spec.info = { product_line_id, construction_id, color_ids[], default_color_id } — references into
  // the attribute master-lists on 863. Product Line replaces the old free-text merch.line;
  // Construction replaces merch.door_style; the default color supersedes merch.default_finish.
  spec: CollectionSpec;
  // assembly.videos = [{ name, url }] — per-collection assembly instruction videos (YouTube links).
  assembly: { videos: AssemblyVideo[] };
  // content.* — HTML rich text authored by staff (rendered directly; same trust boundary as the
  // native BC category description). Overview REPLACES the native category-description render for
  // cabinets. Disclaimer is small print at the bottom. Specifications is its own section.
  content: { overview: string; disclaimer: string; specifications: string };
  // media.images = [url×5] — collection gallery; images[0] is the main image.
  images: string[];
}

const IMAGE_SLOTS = 5;

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
    spec: { productLineId: '', constructionId: '', colorIds: [], defaultColorId: '' },
    assembly: { videos: [] },
    content: { overview: '', disclaimer: '', specifications: '' },
    images: Array.from({ length: IMAGE_SLOTS }, () => ''),
  };
}

// Raw metafield string (not JSON-parsed) — for HTML rich-text fields stored verbatim.
function findRaw(mfs: Metafield[], namespace: string, key: string): string {
  return mfs.find((m) => m.namespace === namespace && m.key === key)?.value ?? '';
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
  const spec = findValue(mfs, 'spec', 'info') as
    | {
        product_line_id?: string;
        construction_id?: string;
        color_ids?: string[];
        default_color_id?: string;
      }
    | undefined;
  const assembly = findValue(mfs, 'assembly', 'videos') as AssemblyVideo[] | undefined;
  const imagesRaw = findValue(mfs, 'media', 'images') as string[] | undefined;
  const images = Array.from({ length: IMAGE_SLOTS }, (_, i) =>
    Array.isArray(imagesRaw) && typeof imagesRaw[i] === 'string' ? imagesRaw[i] : '',
  );

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
    spec: {
      productLineId: spec?.product_line_id ?? '',
      constructionId: spec?.construction_id ?? '',
      colorIds: Array.isArray(spec?.color_ids) ? spec.color_ids : [],
      defaultColorId: spec?.default_color_id ?? '',
    },
    assembly: {
      videos: Array.isArray(assembly)
        ? assembly.map((v) => ({ name: v.name ?? '', url: v.url ?? '' }))
        : [],
    },
    content: {
      overview: findRaw(mfs, 'content', 'overview'),
      disclaimer: findRaw(mfs, 'content', 'disclaimer'),
      specifications: findRaw(mfs, 'content', 'specifications'),
    },
    images,
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

  // Attribute selections (references into the 863 master-lists). Drop a default color that isn't in
  // the selected set so the two stay consistent.
  const colorIds = data.spec.colorIds.filter(Boolean);
  const defaultColorId = colorIds.includes(data.spec.defaultColorId)
    ? data.spec.defaultColorId
    : (colorIds[0] ?? '');

  await upsertMetafield(
    'categories',
    categoryId,
    'spec',
    'info',
    JSON.stringify({
      product_line_id: data.spec.productLineId,
      construction_id: data.spec.constructionId,
      color_ids: colorIds,
      default_color_id: defaultColorId,
    }),
  );

  // Assembly videos — drop rows with no name AND no url.
  await upsertMetafield(
    'categories',
    categoryId,
    'assembly',
    'videos',
    JSON.stringify(
      data.assembly.videos.filter((v) => v.name.trim() !== '' || v.url.trim() !== ''),
    ),
  );

  // Rich-text content — stored as raw HTML strings (rendered verbatim on the storefront).
  await upsertMetafield('categories', categoryId, 'content', 'overview', data.content.overview);
  await upsertMetafield(
    'categories',
    categoryId,
    'content',
    'disclaimer',
    data.content.disclaimer,
  );
  await upsertMetafield(
    'categories',
    categoryId,
    'content',
    'specifications',
    data.content.specifications,
  );

  // Gallery images — fixed 5 slots (images[0] = main); trailing blanks preserved so slot order is
  // stable, but a fully-empty gallery stores [].
  const trimmedImages = data.images.slice(0, IMAGE_SLOTS).map((u) => u.trim());
  await upsertMetafield(
    'categories',
    categoryId,
    'media',
    'images',
    JSON.stringify(trimmedImages.some((u) => u !== '') ? trimmedImages : []),
  );
}

// ── Program-wide FAQ ────────────────────────────────────────────────────────────────────────────
// The Cabinets parent category (863) stores a faq.by_program metafield shown on the /cabinets/* listing
// listing pages — one FAQ per program, distinct from the per-collection FAQ above (same JSON shape,
// different category). Edited on the "Program FAQ" admin tab.

export interface ProgramFaq {
  assembled: { headline: string; items: FaqItem[] };
  rta: { headline: string; items: FaqItem[] };
}

export function emptyProgramFaq(): ProgramFaq {
  return {
    assembled: { headline: DEFAULT_FAQ_HEADLINE, items: [] },
    rta: { headline: DEFAULT_FAQ_HEADLINE, items: [] },
  };
}

/** Read the program-wide FAQ (category 863) into the structured shape. */
export async function readProgramFaq(): Promise<ProgramFaq> {
  const mfs = await listMetafields('categories', CABINETS_PARENT_CATEGORY_ID);
  const base = emptyProgramFaq();
  const faq = findValue(mfs, 'faq', 'by_program') as Partial<ProgramFaq> | undefined;

  const side = (
    s: { headline?: string; items?: FaqItem[] } | undefined,
    fallback: { headline: string; items: FaqItem[] },
  ) => ({
    headline: s?.headline ?? fallback.headline,
    items: Array.isArray(s?.items) ? s.items : fallback.items,
  });

  return {
    assembled: side(faq?.assembled, base.assembled),
    rta: side(faq?.rta, base.rta),
  };
}

/** Write the program-wide FAQ back to category 863 (drops empty Q&A rows). */
export async function writeProgramFaq(data: ProgramFaq): Promise<void> {
  const cleanSide = (s: { headline: string; items: FaqItem[] }) => ({
    headline: s.headline,
    items: s.items.filter((it) => it.q.trim() !== '' || it.a.trim() !== ''),
  });

  await upsertMetafield(
    'categories',
    CABINETS_PARENT_CATEGORY_ID,
    'faq',
    'by_program',
    JSON.stringify({ assembled: cleanSide(data.assembled), rta: cleanSide(data.rta) }),
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
  const [collections, attributes] = await Promise.all([
    listCabinetCollections(),
    readCabinetAttributes(),
  ]);

  const lineName = (id: string) => attributes.productLines.find((o) => o.id === id)?.name ?? '';
  const constructionName = (id: string) =>
    attributes.constructions.find((o) => o.id === id)?.name ?? '';
  const colorName = (id: string) => attributes.colors.find((o) => o.id === id)?.name ?? '';

  return Promise.all(
    collections.map(async (c) => {
      const mf = await readCollectionMetafields(c.id);

      // Prefer the attribute selection; fall back to the legacy free-text merch fields.
      return {
        id: c.id,
        name: c.name,
        line: lineName(mf.spec.productLineId) || mf.merch.line,
        doorStyle: constructionName(mf.spec.constructionId) || mf.merch.door_style,
        defaultFinish: colorName(mf.spec.defaultColorId) || mf.merch.default_finish,
      };
    }),
  );
}
