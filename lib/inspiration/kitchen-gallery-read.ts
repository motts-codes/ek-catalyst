import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { CABINETS_CATEGORY_ID } from '~/lib/cabinets/cabinet-lines-data';

import { GALLERY_KEY, type GalleryConfig, normalizeGalleryConfig } from './kitchen-gallery-config';

const BestSellersGalleryQuery = graphql(`
  query BestSellersGalleryQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        gallery: metafields(namespace: "gallery") {
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

// The hand-picked gallery layout from /cabinet-admin, or null when none has been saved (the
// page then builds its own mix).
export const getBestSellersGallery = cache(async (): Promise<GalleryConfig | null> => {
  const { data } = await client.fetch({
    document: BestSellersGalleryQuery,
    variables: { entityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });
  const raw = data.site.category?.gallery.edges?.find((e) => e.node.key === GALLERY_KEY)?.node
    .value;

  return normalizeGalleryConfig(raw);
});
