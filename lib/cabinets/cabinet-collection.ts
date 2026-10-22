import { cache } from 'react';

import { CabinetAssemblyVideo } from '@/vibes/soul/sections/cabinet-assembly';
import { CabinetCollectionHeaderData } from '@/vibes/soul/sections/cabinet-collection-header';
import { CabinetFaqData } from '@/vibes/soul/sections/cabinet-faq';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getAudienceMode } from '~/lib/navigation/audience-mode';

import { type CabinetProgram, CABINETS_CATEGORY_ID } from './cabinet-lines-data';

// Child categories of Cabinets are the cabinet collections (Avon, Dover, …). Only these get the
// collection header. Fetched once (small), cached per request.
const getCabinetCollectionIds = cache(async (): Promise<Set<number>> => {
  const { data } = await client.fetch({
    document: graphql(`
      query CabinetCollectionIdsQuery($rootEntityId: Int!) {
        site {
          categoryTree(rootEntityId: $rootEntityId) {
            entityId
            children {
              entityId
            }
          }
        }
      }
    `),
    variables: { rootEntityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });

  const root = data.site.categoryTree.find((c) => c.entityId === CABINETS_CATEGORY_ID);

  return new Set((root?.children ?? []).map((c) => c.entityId));
});

/** True when this category is a cabinet collection (a child of Cabinets) that should show the header. */
export async function isCabinetCollection(categoryId: number): Promise<boolean> {
  return (await getCabinetCollectionIds()).has(categoryId);
}

/**
 * Whether a product belongs to the given program's listing. The RTA/Assembled split lives in the
 * product NAME (e.g. "Avon Assembled …" / "Avon RTA …"); products with neither in the name are
 * accessories (moldings, panels, fillers, samples) shown under BOTH programs. Non-collection items
 * (e.g. mis-categorized closet products without the collection prefix) are excluded by requiring the
 * name to start with the collection name.
 */
export function productMatchesProgram(
  productName: string,
  program: CabinetProgram,
  collectionName: string,
): boolean {
  if (!productName.toLowerCase().startsWith(`${collectionName.toLowerCase()} `)) {
    return false;
  }

  const hasRta = / RTA /i.test(productName);
  const hasAssembled = / Assembled /i.test(productName);

  // Accessory (neither program named) -> show under both programs.
  if (!hasRta && !hasAssembled) {
    return true;
  }

  return program === 'rta' ? hasRta : hasAssembled;
}

/** Parse the ?program= search param, defaulting to Assembled. Used for the header/pricing, which
 *  always needs a concrete program to show. */
export function parseCabinetProgram(value: string | string[] | undefined): CabinetProgram {
  const v = Array.isArray(value) ? value[0] : value;

  return v === 'rta' ? 'rta' : 'assembled';
}

/** The EXPLICITLY-selected program, or null when ?program= is absent/invalid. Used for the grid
 *  filter: no param -> null -> show ALL products (both programs). */
export function selectedCabinetProgram(
  value: string | string[] | undefined,
): CabinetProgram | null {
  const v = Array.isArray(value) ? value[0] : value;

  if (v === 'rta') return 'rta';
  if (v === 'assembled') return 'assembled';

  return null;
}

// The BigCommerce product custom field + faceted-search filter that carries the program (must match
// the "Program" custom field set on products — see docs/CABINET-FACETS.md). The faceted search reads
// URL params prefixed `attr_`, so ?program=assembled is injected as attr_Program=Assembled. Until the
// facet is configured in BC (custom field on products + Faceted Search filter enabled), this filter
// simply matches nothing extra — the grid is unaffected. Once configured, it filters server-side
// (correctly paginated).
export const CABINET_PROGRAM_ATTRIBUTE = 'Program';

/** The custom-field value for a program, e.g. 'assembled' -> 'Assembled'. */
export function cabinetProgramAttributeValue(program: CabinetProgram): string {
  return program === 'rta' ? 'RTA' : 'Assembled';
}

/**
 * Build the faceted-search URL param that filters the grid to a program, e.g.
 * { attr_Program: ['Assembled'] }. Spread into the searchParams passed to fetchFacetedSearch.
 */
export function cabinetProgramSearchParam(program: CabinetProgram): Record<string, string[]> {
  return { [`attr_${CABINET_PROGRAM_ATTRIBUTE}`]: [cabinetProgramAttributeValue(program)] };
}

const CabinetCollectionQuery = graphql(`
  query CabinetCollectionQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        name
        description
        pricing: metafields(namespace: "pricing_10x10") {
          edges {
            node {
              key
              value
            }
          }
        }
        merch: metafields(namespace: "merch") {
          edges {
            node {
              key
              value
            }
          }
        }
        fulfillment: metafields(namespace: "fulfillment") {
          edges {
            node {
              key
              value
            }
          }
        }
        assets: metafields(namespace: "assets") {
          edges {
            node {
              key
              value
            }
          }
        }
        sample: metafields(namespace: "sample") {
          edges {
            node {
              key
              value
            }
          }
        }
        faq: metafields(namespace: "faq") {
          edges {
            node {
              key
              value
            }
          }
        }
        spec: metafields(namespace: "spec") {
          edges {
            node {
              key
              value
            }
          }
        }
        assembly: metafields(namespace: "assembly") {
          edges {
            node {
              key
              value
            }
          }
        }
        content: metafields(namespace: "content") {
          edges {
            node {
              key
              value
            }
          }
        }
        finishes: metafields(namespace: "finishes") {
          edges {
            node {
              key
              value
            }
          }
        }
        media: metafields(namespace: "media") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  }
`);

// Attribute master-lists live on the Cabinets parent (863) under namespace "attributes". Fetched
// once per request and joined against each collection's spec selections.
const CabinetAttributesQuery = graphql(`
  query CabinetAttributesQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        attributes: metafields(namespace: "attributes") {
          edges {
            node {
              key
              value
            }
          }
        }
        offers: metafields(namespace: "offers") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  }
`);

// offers.list on the Cabinets parent — see lib/cabinet-admin/offers-shape.ts for the shape.
interface OfferRow {
  text?: string;
  highlight?: string;
  url?: string;
  scope?: 'all' | 'line' | 'collection';
  lineId?: string;
  collectionId?: string;
  program?: 'both' | 'assembled' | 'rta';
  active?: boolean;
  startsOn?: string;
  endsOn?: string;
}

export interface CabinetOfferLine {
  text: string;
  highlight?: string;
  /** Link to the full offer / terms. */
  href?: string;
}

const getCabinetOffersRegistry = cache(async (): Promise<OfferRow[]> => {
  const { data } = await client.fetch({
    document: CabinetAttributesQuery,
    variables: { entityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });
  const raw = data.site.category?.offers.edges?.find((e) => e.node.key === 'list')?.node.value;
  const rows = parseJson<OfferRow[]>(raw);

  return Array.isArray(rows) ? rows : [];
});

/** The offers that apply to a collection in a program: all-cabinet offers, then its product
 *  line's, then its own — active ones within their dates, in registry order. */
export const getCabinetOffers = cache(
  async (categoryId: number, program: CabinetProgram | undefined): Promise<CabinetOfferLine[]> => {
    if (program == null) return [];

    const [rows, cat] = await Promise.all([
      getCabinetOffersRegistry(),
      fetchCabinetCollection(categoryId),
    ]);
    const lineId = parseJson<{ product_line_id?: string }>(
      cat?.spec.edges?.find((e) => e.node.key === 'info')?.node.value,
    )?.product_line_id;
    const today = new Date().toISOString().slice(0, 10);
    const live = rows.filter(
      (o) =>
        o.active !== false &&
        typeof o.text === 'string' &&
        o.text.trim() !== '' &&
        (!o.startsOn || o.startsOn <= today) &&
        (!o.endsOn || o.endsOn >= today),
    );
    const applies = (o: OfferRow) => {
      if (o.scope === 'line') return o.lineId != null && o.lineId !== '' && o.lineId === lineId;
      if (o.scope === 'collection')
        return (
          o.collectionId === String(categoryId) &&
          (o.program == null || o.program === 'both' || o.program === program)
        );

      return true;
    };
    const RANK = { all: 0, line: 1, collection: 2 } as const;
    const rank = (o: OfferRow) => RANK[o.scope ?? 'all'];

    return live
      .filter(applies)
      .sort((a, b) => rank(a) - rank(b))
      .map((o) => ({
        text: o.text ?? '',
        highlight: o.highlight || undefined,
        href: o.url || undefined,
      }));
  },
);

interface AttrOption {
  id: string;
  name: string;
}

interface ColorOption {
  id: string;
  name: string;
  hex?: string;
  image?: string;
}

interface CabinetAttributeLists {
  productLines: AttrOption[];
  constructions: AttrOption[];
  colors: ColorOption[];
}

const getCabinetAttributes = cache(async (): Promise<CabinetAttributeLists> => {
  const { data } = await client.fetch({
    document: CabinetAttributesQuery,
    variables: { entityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });

  const attrs = data.site.category?.attributes.edges ?? [];
  const val = (key: string) => attrs.find((e) => e.node.key === key)?.node.value;

  return {
    productLines: parseJson<AttrOption[]>(val('product_lines')) ?? [],
    constructions: parseJson<AttrOption[]>(val('constructions')) ?? [],
    colors: parseJson<ColorOption[]>(val('colors')) ?? [],
  };
});

function parseJson<T>(value: string | undefined): T | undefined {
  if (value == null || value === '') return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

interface ProgramPricing {
  price?: string;
  strike_price?: string;
  emi_text?: string;
}

interface MerchInfo {
  line?: string;
  door_style?: string;
  default_finish?: string;
}

// finishes.by_finish = { "<finish name>": { assembled?: ProgramPricing, rta?: ProgramPricing, images?: [] } }
// Multi-finish collections (Prism) price and photograph each finish; keyed by the finish name as it
// appears in the Cabinets colour master list.
type ByFinish = Record<
  string,
  { assembled?: ProgramPricing; rta?: ProgramPricing; images?: string[] }
>;

/** URL slug for a finish name: "French Vanilla" -> "french-vanilla". */
export function cabinetFinishSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Resolve a ?finish= slug to the finish name among this collection's colours, or null. */
export const resolveCabinetFinish = cache(
  async (categoryId: number, slug: string | null): Promise<string | null> => {
    if (!slug) return null;

    const cat = await fetchCabinetCollection(categoryId);

    if (!cat) return null;

    const spec = parseJson<{ color_ids?: string[] }>(
      cat.spec.edges?.find((e) => e.node.key === 'info')?.node.value,
    );
    const attributes = await getCabinetAttributes();
    const names = (spec?.color_ids ?? [])
      .map((id) => attributes.colors.find((c) => c.id === id)?.name)
      .filter((n): n is string => n != null);

    return names.find((n) => cabinetFinishSlug(n) === slug) ?? null;
  },
);

export const CABINET_FINISH_ATTRIBUTE_PARAM = 'attr_Finish';

export interface CabinetFinishContext {
  /** The selected finish name, or null. */
  name: string | null;
  /** The faceted-search param narrowing the grid to that finish ({} when none). */
  filter: Record<string, string[]>;
}

/** ?finish=<slug> for a collection page: the finish name and the grid filter for it. */
export async function cabinetFinishContext(
  isCollection: boolean,
  categoryId: number,
  raw: string | string[] | undefined,
): Promise<CabinetFinishContext> {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const slug = isCollection && first ? first : null;
  const name = await resolveCabinetFinish(categoryId, slug);

  return { name, filter: name ? { [CABINET_FINISH_ATTRIBUTE_PARAM]: [name] } : {} };
}

interface SampleInfo {
  product_id?: number;
  price?: string;
  /** "Order sample" link (a path on this store, or a full URL) — from the collection metafield. */
  url?: string;
}

// faq.by_program = { assembled: {headline, items[]}, rta: {headline, items[]} } — written by the
// admin panel (lib/cabinet-admin/collection-shape.ts) and by the program-wide FAQ editor.
interface FaqSide {
  headline?: string;
  items?: Array<{ q?: string; a?: string }>;
}

type FaqByProgram = Partial<Record<CabinetProgram, FaqSide>>;

/**
 * Pull one program's FAQ out of a `faq.by_program` metafield value. Returns null when there's no
 * usable FAQ (missing side, or no non-empty rows) so the section renders nothing.
 */
function pickFaqForProgram(
  faqValue: string | undefined,
  program: CabinetProgram,
): CabinetFaqData | null {
  const side = parseJson<FaqByProgram>(faqValue)?.[program];

  if (!side) return null;

  const items = (side.items ?? [])
    .map((it) => ({ q: (it.q ?? '').trim(), a: (it.a ?? '').trim() }))
    .filter((it) => it.q !== '' || it.a !== '');

  if (items.length === 0) return null;

  return { headline: side.headline?.trim() || 'Frequently Asked Questions', items };
}

// One network round-trip per collection, deduped per request; both the header and the FAQ read from it.
const fetchCabinetCollection = cache(async (categoryId: number) => {
  const { data } = await client.fetch({
    document: CabinetCollectionQuery,
    variables: { entityId: categoryId },
    fetchOptions: { next: { revalidate } },
  });

  return data.site.category;
});

/** The per-collection FAQ for a program (Avon's Assembled FAQ, etc.), or null when none is authored. */
export const getCabinetCollectionFaq = cache(
  async (categoryId: number, program: CabinetProgram): Promise<CabinetFaqData | null> => {
    const cat = await fetchCabinetCollection(categoryId);

    if (!cat) return null;

    return pickFaqForProgram(
      cat.faq.edges?.find((e) => e.node.key === 'by_program')?.node.value,
      program,
    );
  },
);

export interface CabinetCollectionPrograms {
  rta: boolean;
  assembled: boolean;
}

// Which programs this collection is sold in: a program counts when it has a 10×10 price (the same
// rule the listings use to hide a collection from a program). Prism and Euro Value lines are
// Assembled only; Rochelle and Brunswick too.
export const getCabinetCollectionPrograms = cache(
  async (categoryId: number): Promise<CabinetCollectionPrograms> => {
    const cat = await fetchCabinetCollection(categoryId);
    const pricing = cat
      ? parseJson<Record<string, ProgramPricing>>(
          cat.pricing.edges?.find((e) => e.node.key === 'pricing')?.node.value,
        )
      : null;
    const priced = (program: CabinetProgram) => {
      const price = pricing?.[program]?.price;

      return price != null && price !== '';
    };

    return { rta: priced('rta'), assembled: priced('assembled') };
  },
);

export interface CabinetProgramContext {
  /** The program the page shows (header, pricing, FAQ): the requested one when the collection
   *  sells it, else the one it does sell. Undefined for a non-collection category. */
  program: CabinetProgram | undefined;
  /** The explicit ?program= selection for the grid filter (resolved the same way), or null. */
  selected: CabinetProgram | null;
  /** Whether a "Switch to <other program>" link makes sense. */
  switchable: boolean;
}

// Resolve ?program= for a collection page. A request for RTA on an Assembled-only collection
// (Prism, Euro Value…) shows Assembled instead of an empty header, and offers no switch.
export async function cabinetProgramContext(
  isCollection: boolean,
  categoryId: number,
  programParam: string | string[] | undefined,
): Promise<CabinetProgramContext> {
  if (!isCollection) return { program: undefined, selected: null, switchable: false };

  const programs = await getCabinetCollectionPrograms(categoryId);
  const requested = parseCabinetProgram(programParam);
  const other: CabinetProgram = requested === 'rta' ? 'assembled' : 'rta';
  const program = programs[requested] || !programs[other] ? requested : other;
  const explicit = selectedCabinetProgram(programParam);

  return {
    program,
    selected: explicit == null ? null : program,
    switchable: programs[program === 'rta' ? 'assembled' : 'rta'],
  };
}

/** Build the collection-header data for a cabinet collection category + program (Assembled / RTA). */
export const getCabinetCollectionHeader = cache(
  async (
    categoryId: number,
    program: CabinetProgram,
    /** The selected finish NAME (see resolveCabinetFinish); its own price/photos win when present. */
    finish: string | null = null,
  ): Promise<CabinetCollectionHeaderData | null> => {
    const cat = await fetchCabinetCollection(categoryId);

    if (!cat) return null;

    const byFinish =
      parseJson<ByFinish>(
        cat.finishes.edges?.find((e) => e.node.key === 'by_finish')?.node.value,
      ) ?? {};
    const finishEntry = finish ? byFinish[finish] : undefined;
    const finishPricing = finishEntry?.[program];
    const pricing =
      finishPricing?.price != null && finishPricing.price !== ''
        ? finishPricing
        : parseJson<Record<string, ProgramPricing>>(
            cat.pricing.edges?.find((e) => e.node.key === 'pricing')?.node.value,
          )?.[program];
    const merch = parseJson<MerchInfo>(
      cat.merch.edges?.find((e) => e.node.key === 'info')?.node.value,
    );
    const delivery = parseJson<Record<string, string>>(
      cat.fulfillment.edges?.find((e) => e.node.key === 'delivery')?.node.value,
    )?.[program];
    const specSheets = parseJson<Record<string, string>>(
      cat.assets.edges?.find((e) => e.node.key === 'spec_sheets')?.node.value,
    );
    const sample = parseJson<SampleInfo>(
      cat.sample.edges?.find((e) => e.node.key === 'order_sample')?.node.value,
    );

    // Attribute selections: resolve ids against the 863 master-lists. Dangling ids (option deleted)
    // are dropped silently.
    const spec = parseJson<{
      product_line_id?: string;
      construction_id?: string;
      color_ids?: string[];
      default_color_id?: string;
    }>(cat.spec.edges?.find((e) => e.node.key === 'info')?.node.value);
    const attributes = await getCabinetAttributes();

    // The collection's door-sample photo (media.images[0]) stands in as a swatch for a finish with
    // no hex/swatch in the master list and no photo of its own (single-finish collections).
    const doorPhoto = (
      parseJson<string[]>(cat.media.edges?.find((e) => e.node.key === 'images')?.node.value) ?? []
    ).find((u): u is string => typeof u === 'string' && u !== '');
    const productLine = attributes.productLines.find((o) => o.id === spec?.product_line_id)?.name;
    const construction = attributes.constructions.find((o) => o.id === spec?.construction_id)?.name;
    const colorIds = spec?.color_ids ?? [];
    const colors = colorIds
      .map((id) => attributes.colors.find((c) => c.id === id))
      .filter((c): c is ColorOption => c != null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: cabinetFinishSlug(c.name),
        hex: c.hex,
        image: c.image,
        swatch: c.image,
        // A finish's own door photo can stand in for a missing master-list swatch; the collection's
        // door sample only when it has a single finish (otherwise every chip would show one colour).
        photo: byFinish[c.name]?.images?.[0] || (colorIds.length === 1 ? doorPhoto : undefined),
      }));

    // Overview (staff-authored HTML metafield) replaces the native BC category description for
    // cabinet collections. Gallery images come from media.images (order: [door-sample, …, kitchen]).
    const overview = cat.content.edges?.find((e) => e.node.key === 'overview')?.node.value ?? '';
    const rawImages = (
      parseJson<string[]>(cat.media.edges?.find((e) => e.node.key === 'images')?.node.value) ?? []
    ).filter((u): u is string => typeof u === 'string' && u !== '');

    // Audience-aware lead image (Gallery shows images[0] as the main): homeowners lead with the
    // kitchen (last image) moved to the front; contractors keep the door sample (first) as-is.
    const audience = await getAudienceMode();
    const kitchen = rawImages.at(-1);
    const finishImages = (finishEntry?.images ?? []).filter((u) => u !== '');
    const homeownerOrder =
      audience === 'homeowner' && rawImages.length > 1 && kitchen
        ? [kitchen, ...rawImages.slice(0, -1)]
        : rawImages;
    // A chosen finish leads with its own door photos, then the rest of the gallery.
    const images =
      finishImages.length > 0
        ? [...finishImages, ...rawImages.filter((u) => !finishImages.includes(u))]
        : homeownerOrder;

    // Door-sample photos (the gallery's first image by convention, plus every finish's photos) are
    // tight crops of a door: the gallery shows them contained with padding rather than filling
    // the frame, which kitchen photos do.
    const doorImages = [
      ...(rawImages[0] != null ? [rawImages[0]] : []),
      ...Object.values(byFinish).flatMap((entry) => entry.images ?? []),
    ].filter((u) => u !== '');

    return {
      name: cat.name,
      overview: overview !== '' ? overview : undefined,
      images: images.length > 0 ? images : undefined,
      doorImages,
      line: merch?.line,
      doorStyle: merch?.door_style,
      defaultFinish: merch?.default_finish,
      productLine,
      construction,
      colors,
      selectedFinish: finish ?? undefined,
      price: pricing?.price,
      strikePrice: pricing?.strike_price,
      emiText: pricing?.emi_text,
      deliveryTime: delivery,
      specSheetUrl: specSheets?.[program],
      // The "Order sample" link stored on the collection (sample.order_sample.url). No link → no CTA.
      orderSampleHref: sample?.url || undefined,
      orderSamplePrice: sample?.price,
    };
  },
);

export interface CabinetCollectionContent {
  specifications: string;
  disclaimer: string;
}

/**
 * Specifications (PER-PROGRAM) + disclaimer HTML for a collection. Specifications come from
 * content.spec_by_program[program], falling back to the legacy single content.specifications.
 */
export const getCabinetCollectionContent = cache(
  async (categoryId: number, program: CabinetProgram): Promise<CabinetCollectionContent> => {
    const cat = await fetchCabinetCollection(categoryId);

    const val = (key: string) =>
      cat?.content.edges?.find((e) => e.node.key === key)?.node.value ?? '';

    const specByProgram = parseJson<{ rta?: string; assembled?: string }>(val('spec_by_program'));
    const specifications = specByProgram?.[program] ?? val('specifications');

    return { specifications, disclaimer: val('disclaimer') };
  },
);

/**
 * Assembly-instruction videos for a collection + PROGRAM (name + YouTube url, id parsed). Reads
 * assembly.by_program[program], falling back to the legacy flat assembly.videos.
 */
export const getCabinetAssemblyVideos = cache(
  async (categoryId: number, program: CabinetProgram): Promise<CabinetAssemblyVideo[]> => {
    const cat = await fetchCabinetCollection(categoryId);

    if (!cat) return [];

    const value = cat.assembly.edges?.find((e) => e.node.key === 'by_program')?.node.value;
    const byProgram = parseJson<{ rta?: unknown; assembled?: unknown }>(value);
    const raw = Array.isArray(byProgram?.[program])
      ? (byProgram[program] as Array<{ name?: string; url?: string }>)
      : // Legacy fallback: flat assembly.videos list (treated as the program's list).
        parseJson<Array<{ name?: string; url?: string }>>(
          cat.assembly.edges?.find((e) => e.node.key === 'videos')?.node.value,
        );

    if (!Array.isArray(raw)) return [];

    return raw
      .map((v) => ({ name: (v.name ?? '').trim(), url: (v.url ?? '').trim() }))
      .filter((v) => v.name !== '' || v.url !== '')
      .map((v) => ({ ...v, youtubeId: parseYouTubeId(v.url) }));
  },
);

// Pull the 11-char video id out of the common YouTube URL forms (watch?v=, youtu.be/, /embed/,
// /shorts/). Returns null for anything unrecognized so the section links out instead of embedding.
function parseYouTubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
  ];

  for (const re of patterns) {
    const m = url.match(re);

    if (m?.[1]) return m[1];
  }

  return null;
}
