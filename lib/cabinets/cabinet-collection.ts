import { cache } from 'react';

import { CabinetCollectionHeaderData } from '@/vibes/soul/sections/cabinet-collection-header';
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
      }
    }
  }
`);

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

/** Build the collection-header data for a cabinet collection category + program (Assembled / RTA). */
export const getCabinetCollectionHeader = cache(
  async (
    categoryId: number,
    program: CabinetProgram,
  ): Promise<CabinetCollectionHeaderData | null> => {
    const { data } = await client.fetch({
      document: CabinetCollectionQuery,
      variables: { entityId: categoryId },
      fetchOptions: { next: { revalidate } },
    });

    const cat = data.site.category;

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

    return {
      name: cat.name,
      description: cat.description ? stripHtml(cat.description) : undefined,
      line: merch?.line,
      doorStyle: merch?.door_style,
      defaultFinish: merch?.default_finish,
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

// Category description comes back as HTML; the header renders plain text.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
