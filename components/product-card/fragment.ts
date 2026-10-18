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
      # Required options drive the card CTA: none -> one-click add-to-cart; one swatch option
      # with a few values -> swatches on the card; otherwise a "Choose size/finish/options" link.
      productOptions(first: 5) {
        edges {
          node {
            entityId
            displayName
            isRequired
            ... on MultipleChoiceOption {
              displayStyle
              values(first: 8) {
                edges {
                  node {
                    __typename
                    entityId
                    label
                    isDefault
                    ... on SwatchOptionValue {
                      hexColors
                      imageUrl(width: 48)
                    }
                  }
                }
              }
            }
          }
        }
      }
      # A few variants, with their own photo and price, so a swatch chosen on the card can swap
      # them in and the add goes through only once the chosen variant is on screen.
      variants(first: 8) {
        edges {
          node {
            entityId
            sku
            isPurchasable
            defaultImage {
              altText
              url: urlTemplate(lossy: true)
            }
            variantPricesIncludingTax: prices(currencyCode: $currencyCode, includeTax: true) {
              price {
                value
                currencyCode
              }
              basePrice {
                value
                currencyCode
              }
              salePrice {
                value
                currencyCode
              }
            }
            variantPricesExcludingTax: prices(currencyCode: $currencyCode, includeTax: false) {
              price {
                value
                currencyCode
              }
              basePrice {
                value
                currencyCode
              }
              salePrice {
                value
                currencyCode
              }
            }
            options {
              edges {
                node {
                  entityId
                  values {
                    edges {
                      node {
                        entityId
                      }
                    }
                  }
                }
              }
            }
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
