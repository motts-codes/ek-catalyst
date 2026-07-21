import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';

export const ProductCardFragment = graphql(
  `
    fragment ProductCardFragment on Product {
      entityId
      name
      defaultImage {
        altText
        url: urlTemplate(lossy: true)
      }
      path
      brand {
        name
        path
      }
      # Marketing-flag custom fields (__is_bestseller / __is_trending / __is_new) drive the card
      # badges. first: 50 (API max) so they aren't dropped on products with many custom fields.
      customFields(first: 50) {
        edges {
          node {
            name
            value
          }
        }
      }
      inventory {
        hasVariantInventory
        isInStock
        aggregated {
          availableForBackorder
          unlimitedBackorder
          availableOnHand
        }
      }
      reviewSummary {
        numberOfReviews
        averageRating
      }
      variants(first: 1) {
        edges {
          node {
            entityId
            sku
            inventory {
              byLocation {
                edges {
                  node {
                    locationEntityId
                    backorderMessage
                  }
                }
              }
            }
          }
        }
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);
