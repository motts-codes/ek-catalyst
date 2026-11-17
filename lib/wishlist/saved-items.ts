import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { type CardSavedItems, type CardWishlistState } from '@/vibes/soul/primitives/product-card';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

// One request per listing page for a signed-in customer: every saved product across their wish
// lists, so each card's heart knows whether to show filled. Guests get null (no hearts filled; a
// click sends them to sign in).
const CardSavedItemsQuery = graphql(`
  query CardSavedItemsQuery {
    customer {
      wishlists(first: 50) {
        edges {
          node {
            entityId
            items(first: 50) {
              edges {
                node {
                  entityId
                  productEntityId
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getSavedItems = cache(
  async (customerAccessToken?: string): Promise<CardSavedItems | null> => {
    if (!customerAccessToken) return null;

    const { data } = await client.fetch({
      document: CardSavedItemsQuery,
      customerAccessToken,
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    });

    const wishlists = data.customer ? removeEdgesAndNodes(data.customer.wishlists) : [];
    const items: Record<string, CardWishlistState> = {};

    wishlists.forEach((wishlist) => {
      removeEdgesAndNodes(wishlist.items).forEach((item) => {
        items[String(item.productEntityId)] ??= {
          wishlistId: wishlist.entityId,
          itemId: item.entityId,
        };
      });
    });

    return { defaultWishlistId: wishlists[0]?.entityId ?? 0, items };
  },
);
