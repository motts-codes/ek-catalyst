import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { Product } from '@/vibes/soul/primitives/product-card';
import { ExistingResultType } from '~/client/util';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { WishlistItemProductFragment } from '~/components/wishlist/fragment';

import { pricesTransformer, TaxDisplay } from './prices-transformer';

const getInventoryMessage = (
  product: ResultOf<typeof ProductCardFragment>,
  outOfStockMessage?: string,
  showBackorderMessage?: boolean,
) => {
  if (!product.inventory.isInStock) {
    return outOfStockMessage;
  }

  if (!showBackorderMessage || product.inventory.hasVariantInventory) {
    return undefined;
  }

  const { availableForBackorder, unlimitedBackorder, availableOnHand } =
    product.inventory.aggregated ?? {};

  if (availableOnHand) {
    return undefined;
  }

  const hasBackorderAvailablity = !!availableForBackorder || unlimitedBackorder;

  if (!hasBackorderAvailablity) {
    return undefined;
  }

  const baseVariant = removeEdgesAndNodes(product.variants).at(0);

  if (!baseVariant?.inventory?.byLocation) {
    return undefined;
  }

  const inventoryByLocation = removeEdgesAndNodes(baseVariant.inventory.byLocation).at(0);

  return inventoryByLocation?.backorderMessage ?? undefined;
};

// Marketing pills shown on the card, driven by the __is_* custom fields (value "yes"). Order:
// New, Bestseller, Trending. Colors reuse the PDP pill CSS variables so cards match the PDP.
const getCardBadges = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): Array<{ label: string; color: string }> => {
  if (!('customFields' in product)) {
    return [];
  }

  const fields = removeEdgesAndNodes(product.customFields);
  const isYes = (name: string) =>
    fields.find((f) => f.name === name)?.value?.trim().toLowerCase() === 'yes';

  return [
    isYes('__is_new') && { label: 'New', color: 'var(--pill-new-background)' },
    isYes('__is_bestseller') && { label: 'Bestseller', color: 'var(--pill-bestseller-background)' },
    isYes('__is_trending') && { label: 'Trending', color: 'var(--pill-trending-background)' },
  ].filter((b): b is { label: string; color: string } => Boolean(b));
};

export const singleProductCardTransformer = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
  format: ExistingResultType<typeof getFormatter>,
  outOfStockMessage?: string,
  showBackorderMessage?: boolean,
  taxDisplay?: TaxDisplay | null,
): Product => {
  return {
    id: product.entityId.toString(),
    title: product.name,
    href: product.path,
    image: product.defaultImage
      ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
      : undefined,
    price: pricesTransformer(product, format, taxDisplay),
    subtitle: product.brand?.name ?? undefined,
    badges: getCardBadges(product),
    requiresOptions:
      'productOptions' in product
        ? removeEdgesAndNodes(product.productOptions).some((o) => o.isRequired)
        : undefined,
    rating: product.reviewSummary.averageRating,
    numberOfReviews: product.reviewSummary.numberOfReviews,
    inventoryMessage:
      'variants' in product
        ? getInventoryMessage(product, outOfStockMessage, showBackorderMessage)
        : undefined,
  };
};

export const productCardTransformer = (
  products: Array<ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>>,
  format: ExistingResultType<typeof getFormatter>,
  outOfStockMessage?: string,
  showBackorderMessage?: boolean,
  taxDisplay?: TaxDisplay | null,
): Product[] => {
  return products.map((product) =>
    singleProductCardTransformer(
      product,
      format,
      outOfStockMessage,
      showBackorderMessage,
      taxDisplay,
    ),
  );
};
