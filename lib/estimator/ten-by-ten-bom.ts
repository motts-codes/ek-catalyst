import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { TEN_BY_TEN_CABINETS, type TenByTenCabinet } from './ten-by-ten';

const BomProductQuery = graphql(`
  query TenByTenBomProduct($term: String!) {
    site {
      search {
        searchProducts(filters: { searchTerm: $term }) {
          products(first: 50) {
            edges {
              node {
                name
                sku
                defaultImage {
                  url: urlTemplate(lossy: true)
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`);

export interface TenByTenCabinetPhoto extends TenByTenCabinet {
  image?: { src: string; alt: string };
}

// The seven "What's in our 10×10" lines with a product photo each: the first assembled hit for
// the line's search term (an Avon cabinet, the one collection every size is seeded in). A line
// with no hit simply has no photo.
export const getTenByTenCabinetPhotos = cache(async (): Promise<TenByTenCabinetPhoto[]> =>
  Promise.all(
    TEN_BY_TEN_CABINETS.map(async (cabinet) => {
      const { data } = await client.fetch({
        document: BomProductQuery,
        variables: { term: cabinet.search },
        fetchOptions: { next: { revalidate } },
      });
      const hits = data.site.search.searchProducts.products.edges?.map((e) => e.node) ?? [];
      const wanted = cabinet.match ? new RegExp(cabinet.match, 'i') : /./;
      const assembled = (name: string) =>
        /assembled/i.test(name) && !/ready to assemble/i.test(name);
      const hit =
        hits.find((h) => wanted.test(h.name) && assembled(h.name)) ??
        hits.find((h) => wanted.test(h.name)) ??
        hits[0];
      const image = hit?.defaultImage
        ? { src: hit.defaultImage.url, alt: hit.defaultImage.altText || hit.name }
        : undefined;

      return { ...cabinet, image };
    }),
  ),
);
