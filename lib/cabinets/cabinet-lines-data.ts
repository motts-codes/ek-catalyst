import { cache } from 'react';

import { CabinetLine } from '@/vibes/soul/sections/cabinet-lines';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

// The "Cabinets" category (parent). When the category page resolves this id, it renders the
// cabinet-lines view (a card per child line/finish) instead of the normal product grid.
export const CABINETS_CATEGORY_ID = 863;

export type CabinetProgram = 'assembled' | 'rta';

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

        // sample.order_sample = { product_id, price } — for now the card links to the category page
        // (add-to-cart of a specific sample product is a later step).
        return {
          entityId: child.entityId,
          name: child.name,
          href: child.path,
          image: child.image ? { src: child.image.url, alt: child.image.altText } : undefined,
          price: pricing?.price,
          strikePrice: pricing?.strike_price,
          emiText: pricing?.emi_text,
          deliveryTime: delivery,
          orderSampleHref: child.path,
        };
      }),
    );

    return lines;
  },
);
