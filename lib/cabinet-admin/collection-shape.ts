import { readCabinetAttributes } from './attributes-shape';
import { CABINETS_PARENT_CATEGORY_ID } from './collection-shape-const';
import {
  listCabinetCollections,
  listMetafields,
  type Metafield,
  upsertMetafield,
} from './metafields-api';

export { CABINETS_PARENT_CATEGORY_ID };

// Structured shape of a cabinet collection's editable metafields. The panel edits these fields; the
// helpers below convert to/from the stored JSON-string metafields (namespace.key = value).

export interface ProgramPricing {
  price: string;
  strike_price: string;
  emi_text: string;
}

export interface FinishEntry {
  assembled: ProgramPricing;
  rta: ProgramPricing;
  images: string[];
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
  sample: { product_id: string; price: string; url: string };
  // finishes.by_finish = { "<finish name>": { assembled, rta, images } } — multi-finish collections
  // (Prism) price and photograph each finish; empty for single-finish collections.
  finishes: Record<string, FinishEntry>;
  // faq.by_program = { assembled: {headline, items[]}, rta: {headline, items[]} } — collection FAQ
  // split by program (RTA and Assembled have different questions).
  faq: {
    assembled: { headline: string; items: FaqItem[] };
    rta: { headline: string; items: FaqItem[] };
  };
  // spec.info = { product_line_id, construction_id, color_ids[], default_color_id } — references into
  // the attribute master-lists on 863. Product Line replaces the old free-text merch.line and the
  // default color supersedes merch.default_finish. merch.door_style stays in use: it's a separate
  // dimension from Construction (e.g. "Shaker Full Overlay" vs "Framed") and shows as its own chip.
  spec: CollectionSpec;
  // assembly.videos = { rta: [{name,url}], assembled: [...] } — PER-PROGRAM assembly videos. RTA
  // ships flat (has videos); Assembled ships built (usually none). Matches the Laravel source.
  assembly: { rta: AssemblyVideo[]; assembled: AssemblyVideo[] };
  // content.* — HTML rich text. overview REPLACES the native category description; disclaimer is
  // small print; short_description is a brief blurb; specifications is PER-PROGRAM (RTA/Assembled
  // spec lists differ). All staff-authored HTML rendered directly.
  content: {
    overview: string;
    disclaimer: string;
    short_description: string;
    specifications: { rta: string; assembled: string };
  };
  // assets.shop_now_url = { rta, assembled } — the original expresskitchens.com URL per program
  // (from Laravel; useful for reference/redirects).
  shopNowUrl: { rta: string; assembled: string };
  // media.images = [url×5] — collection gallery; images[0] is the main image.
  images: string[];
  // media.door_image / media.kitchen_image — the two named photos the storefront keys on (door
  // sample: shown contained, listing hover/contractor cover, swatch fallback; kitchen: the
  // homeowner lead). Empty → the gallery's first / last image by convention.
  doorImage: string;
  kitchenImage: string;
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
    sample: { product_id: '', price: '', url: '' },
    finishes: {},
    faq: {
      assembled: { headline: DEFAULT_FAQ_HEADLINE, items: [] },
      rta: { headline: DEFAULT_FAQ_HEADLINE, items: [] },
    },
    spec: { productLineId: '', constructionId: '', colorIds: [], defaultColorId: '' },
    assembly: { rta: [], assembled: [] },
    content: {
      overview: '',
      disclaimer: '',
      short_description: '',
      specifications: { rta: '', assembled: '' },
    },
    shopNowUrl: { rta: '', assembled: '' },
    images: Array.from({ length: IMAGE_SLOTS }, () => ''),
    doorImage: '',
    kitchenImage: '',
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
    Partial<CollectionMetafields['pricing']> | undefined;
  const merch = findValue(mfs, 'merch', 'info') as
    Partial<CollectionMetafields['merch']> | undefined;
  const delivery = findValue(mfs, 'fulfillment', 'delivery') as
    Partial<CollectionMetafields['delivery']> | undefined;
  const specSheets = findValue(mfs, 'assets', 'spec_sheets') as
    Partial<CollectionMetafields['specSheets']> | undefined;
  const sample = findValue(mfs, 'sample', 'order_sample') as
    { product_id?: number | string; price?: string; url?: string } | undefined;
  const byFinish = findValue(mfs, 'finishes', 'by_finish') as
    | Record<
        string,
        Partial<{
          assembled: Partial<ProgramPricing>;
          rta: Partial<ProgramPricing>;
          images: unknown;
        }>
      >
    | undefined;
  const finishes: Record<string, FinishEntry> = {};

  Object.entries(byFinish ?? {}).forEach(([name, entry]) => {
    finishes[name] = {
      assembled: { ...emptyPricing(), ...entry.assembled },
      rta: { ...emptyPricing(), ...entry.rta },
      images: Array.isArray(entry.images)
        ? entry.images.filter((u): u is string => typeof u === 'string')
        : [],
    };
  });
  const faq = findValue(mfs, 'faq', 'by_program') as
    Partial<CollectionMetafields['faq']> | undefined;
  const spec = findValue(mfs, 'spec', 'info') as
    | {
        product_line_id?: string;
        construction_id?: string;
        color_ids?: string[];
        default_color_id?: string;
      }
    | undefined;
  // Assembly is now per-program (assembly.by_program). Fall back to the legacy flat assembly.videos
  // (put under RTA) so pre-migration collections still read.
  const assemblyByProgram = findValue(mfs, 'assembly', 'by_program') as
    { rta?: AssemblyVideo[]; assembled?: AssemblyVideo[] } | undefined;
  const legacyAssembly = findValue(mfs, 'assembly', 'videos') as AssemblyVideo[] | undefined;
  const specByProgram = findValue(mfs, 'content', 'spec_by_program') as
    { rta?: string; assembled?: string } | undefined;
  const shopNow = findValue(mfs, 'assets', 'shop_now_url') as
    { rta?: string; assembled?: string } | undefined;
  const imagesRaw = findValue(mfs, 'media', 'images') as string[] | undefined;
  const images = Array.from({ length: IMAGE_SLOTS }, (_, i) =>
    Array.isArray(imagesRaw) && typeof imagesRaw[i] === 'string' ? imagesRaw[i] : '',
  );
  const doorImage = mfs.find((m) => m.namespace === 'media' && m.key === 'door_image')?.value ?? '';
  const kitchenImage =
    mfs.find((m) => m.namespace === 'media' && m.key === 'kitchen_image')?.value ?? '';

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
      url: sample?.url ?? '',
    },
    finishes,
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
      rta: normalizeVideos(assemblyByProgram?.rta ?? legacyAssembly),
      assembled: normalizeVideos(assemblyByProgram?.assembled),
    },
    content: {
      overview: findRaw(mfs, 'content', 'overview'),
      disclaimer: findRaw(mfs, 'content', 'disclaimer'),
      short_description: findRaw(mfs, 'content', 'short_description'),
      specifications: {
        // Prefer per-program; fall back to the legacy single content.specifications for both.
        rta: specByProgram?.rta ?? findRaw(mfs, 'content', 'specifications'),
        assembled: specByProgram?.assembled ?? findRaw(mfs, 'content', 'specifications'),
      },
    },
    shopNowUrl: { rta: shopNow?.rta ?? '', assembled: shopNow?.assembled ?? '' },
    images,
    doorImage,
    kitchenImage,
  };
}

function normalizeVideos(v: AssemblyVideo[] | undefined): AssemblyVideo[] {
  return Array.isArray(v) ? v.map((x) => ({ name: x.name ?? '', url: x.url ?? '' })) : [];
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
      url: data.sample.url.trim(),
    }),
  );
  // Per-finish pricing/photos (Prism). Written only when the collection has any, so single-finish
  // collections don't grow an empty metafield on every save.
  if (Object.keys(data.finishes).length > 0) {
    await upsertMetafield(
      'categories',
      categoryId,
      'finishes',
      'by_finish',
      JSON.stringify(data.finishes),
    );
  }
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

  // Assembly videos — PER-PROGRAM (assembly.by_program). Drop rows with no name AND no url.
  const cleanVideos = (vs: AssemblyVideo[]) =>
    vs.filter((v) => v.name.trim() !== '' || v.url.trim() !== '');
  await upsertMetafield(
    'categories',
    categoryId,
    'assembly',
    'by_program',
    JSON.stringify({
      rta: cleanVideos(data.assembly.rta),
      assembled: cleanVideos(data.assembly.assembled),
    }),
  );

  // Rich-text content — raw HTML strings rendered verbatim. specifications is PER-PROGRAM (JSON under
  // content.spec_by_program); overview / disclaimer / short_description are single raw strings.
  await upsertMetafield('categories', categoryId, 'content', 'overview', data.content.overview);
  await upsertMetafield('categories', categoryId, 'content', 'disclaimer', data.content.disclaimer);
  await upsertMetafield(
    'categories',
    categoryId,
    'content',
    'short_description',
    data.content.short_description,
  );
  await upsertMetafield(
    'categories',
    categoryId,
    'content',
    'spec_by_program',
    JSON.stringify({
      rta: data.content.specifications.rta,
      assembled: data.content.specifications.assembled,
    }),
  );

  // Shop-now URL per program (assets.shop_now_url) — reference URLs from the old site.
  await upsertMetafield(
    'categories',
    categoryId,
    'assets',
    'shop_now_url',
    JSON.stringify({ rta: data.shopNowUrl.rta, assembled: data.shopNowUrl.assembled }),
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
  await upsertMetafield('categories', categoryId, 'media', 'door_image', data.doorImage.trim());
  await upsertMetafield(
    'categories',
    categoryId,
    'media',
    'kitchen_image',
    data.kitchenImage.trim(),
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
