import { cache } from 'react';

import { CabinetLine } from '@/vibes/soul/sections/cabinet-lines';
import { CabinetFaqData } from '@/vibes/soul/sections/cabinet-faq';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

// The "Cabinets" category (parent). When the category page resolves this id, it renders the
// cabinet-lines view (a card per child line/finish) instead of the normal product grid.
export const CABINETS_CATEGORY_ID = 863;

export type CabinetProgram = 'assembled' | 'rta';

/** Last non-empty path segment as a slug: "/cabinets/avon/" -> "avon" (trailing-slash safe). */
export function slugFromPath(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? '';
}

export interface CabinetCollectionRef {
  entityId: number;
  name: string;
  slug: string;
  path: string;
  image?: { src: string; alt: string };
}

/** All cabinet collections (children of Cabinets) as light refs — for slug resolution + listings. */
export const getCabinetCollectionRefs = cache(async (): Promise<CabinetCollectionRef[]> => {
  const { data } = await client.fetch({
    document: CabinetLinesQuery,
    variables: { rootEntityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });

  const root = data.site.categoryTree.find((c) => c.entityId === CABINETS_CATEGORY_ID);

  return (root?.children ?? []).map((c) => ({
    entityId: c.entityId,
    name: c.name,
    slug: slugFromPath(c.path),
    path: c.path,
    image: c.image ? { src: c.image.url, alt: c.image.altText } : undefined,
  }));
});

/** Resolve a collection slug (e.g. "avon") to its category ref, or null when unknown. */
export async function resolveCabinetCollectionBySlug(
  slug: string,
): Promise<CabinetCollectionRef | null> {
  const refs = await getCabinetCollectionRefs();

  return refs.find((r) => r.slug === slug.toLowerCase()) ?? null;
}

// One query: the Cabinets subtree (child ids/names/paths/images) + each child's metafields. The
// storefront Category type has no `children`, so children come from categoryTree; metafields are
// read per-child via `category(entityId:)`.
const CabinetLinesQuery = graphql(`
  query CabinetLinesQuery($rootEntityId: Int!) {
    site {
      categoryTree(rootEntityId: $rootEntityId) {
        entityId
        name
        children {
          entityId
          name
          path
          image {
            url: url(width: 600)
            altText
          }
        }
      }
    }
  }
`);

// Metafields are stringified JSON; keyed per namespace. Fetched per child.
const CabinetLineMetafieldsQuery = graphql(`
  query CabinetLineMetafieldsQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        pricing: metafields(namespace: "pricing_10x10") {
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

/**
 * Fetch the cabinet lines (child categories of Cabinets) with the pricing/delivery/sample data for
 * the given program (Assembled or RTA), shaped for the CabinetLines section.
 */
export const getCabinetLines = cache(
  async (program: CabinetProgram): Promise<CabinetLine[]> => {
    const { data } = await client.fetch({
      document: CabinetLinesQuery,
      variables: { rootEntityId: CABINETS_CATEGORY_ID },
      fetchOptions: { next: { revalidate } },
    });

    const root = data.site.categoryTree.find((c) => c.entityId === CABINETS_CATEGORY_ID);
    const children = root?.children ?? [];

    const lines = await Promise.all(
      children.map(async (child): Promise<CabinetLine> => {
        const { data: mf } = await client.fetch({
          document: CabinetLineMetafieldsQuery,
          variables: { entityId: child.entityId },
          fetchOptions: { next: { revalidate } },
        });

        const cat = mf.site.category;

        // pricing_10x10.pricing = { rta: {...}, assembled: {...} }
        const pricingRaw = cat?.pricing.edges?.find((e) => e.node.key === 'pricing')?.node.value;
        const pricing = parseJson<Record<string, ProgramPricing>>(pricingRaw)?.[program];

        // fulfillment.delivery = { rta: "2 Weeks", assembled: "3 Weeks" }
        const deliveryRaw = cat?.fulfillment.edges?.find((e) => e.node.key === 'delivery')?.node
          .value;
        const delivery = parseJson<Record<string, string>>(deliveryRaw)?.[program];

        // Carry the program in the URL so the collection detail page scopes its grid + header to
        // the same program (Assembled / RTA) the visitor came from.
        const href = `${child.path}?program=${program}`;

        // sample.order_sample = { product_id, price } — for now the card links to the category page
        // (add-to-cart of a specific sample product is a later step).
        return {
          entityId: child.entityId,
          name: child.name,
          href,
          image: child.image ? { src: child.image.url, alt: child.image.altText } : undefined,
          price: pricing?.price,
          strikePrice: pricing?.strike_price,
          emiText: pricing?.emi_text,
          deliveryTime: delivery,
          orderSampleHref: href,
        };
      }),
    );

    return lines;
  },
);

// Program-wide FAQ shown on the /cabinets/* listing listing pages (one FAQ per program, not per
// collection). Stored on the Cabinets parent (863) as faq.by_program = { assembled, rta } — the
// same shape the per-collection editor uses, but authored on the parent category.
const CabinetProgramFaqQuery = graphql(`
  query CabinetProgramFaqQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        faq: metafields(namespace: "faq") {
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

interface FaqSide {
  headline?: string;
  items?: Array<{ q?: string; a?: string }>;
}

/** The program-wide FAQ (Assembled or RTA) for the cabinet shop pages, or null when none authored. */
export const getCabinetProgramFaq = cache(
  async (program: CabinetProgram): Promise<CabinetFaqData | null> => {
    const { data } = await client.fetch({
      document: CabinetProgramFaqQuery,
      variables: { entityId: CABINETS_CATEGORY_ID },
      fetchOptions: { next: { revalidate } },
    });

    const raw = data.site.category?.faq.edges?.find((e) => e.node.key === 'by_program')?.node.value;
    const side = parseJson<Partial<Record<CabinetProgram, FaqSide>>>(raw)?.[program];

    if (!side) return null;

    const items = (side.items ?? [])
      .map((it) => ({ q: (it.q ?? '').trim(), a: (it.a ?? '').trim() }))
      .filter((it) => it.q !== '' || it.a !== '');

    if (items.length === 0) return null;

    return { headline: side.headline?.trim() || 'Frequently Asked Questions', items };
  },
);
