import { cache } from 'react';

import { CabinetAssemblyVideo } from '@/vibes/soul/sections/cabinet-assembly';
import { CabinetCollectionHeaderData } from '@/vibes/soul/sections/cabinet-collection-header';
import { CabinetFaqData } from '@/vibes/soul/sections/cabinet-faq';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { CABINETS_CATEGORY_ID, type CabinetProgram } from './cabinet-lines-data';

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

/** Parse the ?program= search param, defaulting to Assembled. */
export function parseCabinetProgram(value: string | string[] | undefined): CabinetProgram {
  const v = Array.isArray(value) ? value[0] : value;

  return v === 'rta' ? 'rta' : 'assembled';
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
      }
    }
  }
`);

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
interface SampleInfo {
  product_id?: number;
  price?: string;
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

/** Build the collection-header data for a cabinet collection category + program (Assembled / RTA). */
export const getCabinetCollectionHeader = cache(
  async (
    categoryId: number,
    program: CabinetProgram,
  ): Promise<CabinetCollectionHeaderData | null> => {
    const cat = await fetchCabinetCollection(categoryId);

    if (!cat) return null;

    const pricing = parseJson<Record<string, ProgramPricing>>(
      cat.pricing.edges?.find((e) => e.node.key === 'pricing')?.node.value,
    )?.[program];
    const merch = parseJson<MerchInfo>(cat.merch.edges?.find((e) => e.node.key === 'info')?.node.value);
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

    const productLine = attributes.productLines.find((o) => o.id === spec?.product_line_id)?.name;
    const construction = attributes.constructions.find((o) => o.id === spec?.construction_id)?.name;
    const colors = (spec?.color_ids ?? [])
      .map((id) => attributes.colors.find((c) => c.id === id))
      .filter((c): c is ColorOption => c != null)
      .map((c) => ({ id: c.id, name: c.name, hex: c.hex, image: c.image }));

    return {
      name: cat.name,
      description: cat.description ? stripHtml(cat.description) : undefined,
      line: merch?.line,
      doorStyle: merch?.door_style,
      defaultFinish: merch?.default_finish,
      productLine,
      construction,
      colors,
      price: pricing?.price,
      strikePrice: pricing?.strike_price,
      emiText: pricing?.emi_text,
      deliveryTime: delivery,
      specSheetUrl: specSheets?.[program],
      // Add-to-cart of the specific sample product is a later step (sample.product_id is a live-store
      // id in the seeded data); for now no sample CTA when we can't resolve it. Omit href to hide it.
      orderSampleHref: undefined,
      orderSamplePrice: sample?.price,
    };
  },
);

/** Assembly-instruction videos for a collection (name + YouTube url), with the video id parsed. */
export const getCabinetAssemblyVideos = cache(
  async (categoryId: number): Promise<CabinetAssemblyVideo[]> => {
    const cat = await fetchCabinetCollection(categoryId);

    if (!cat) return [];

    const raw = parseJson<Array<{ name?: string; url?: string }>>(
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

// Category description comes back as HTML; the header renders plain text.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
