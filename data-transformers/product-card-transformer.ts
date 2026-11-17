// Builds the ProductCard `Product` (presentation shape) from a BigCommerce product. Used by the
// faceted grids (category/brand/search), the PDP related carousel, wishlist, etc. Derives the
// marketing badges (from __is_* custom fields) and `requiresOptions` (drives the card CTA) — both
// require the fragment to fetch customFields + productOptions. See docs/PRODUCT-CARD.md.
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { type Price } from '@/vibes/soul/primitives/price-label';
import {
  type CardVariants,
  Product,
  type RequiredOption,
} from '@/vibes/soul/primitives/product-card';
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
// Sale percentage from the __sale custom field. Returns a positive number, or undefined when the
// field is absent / empty / non-positive (so the card shows nothing).
const getSalePercent = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): number | undefined => {
  if (!('customFields' in product)) {
    return undefined;
  }

  const raw = removeEdgesAndNodes(product.customFields)
    .find((f) => f.name === '__sale')
    ?.value.replace('%', '')
    .trim();

  if (raw == null || raw === '') {
    return undefined;
  }

  const pct = Number(raw);

  return Number.isFinite(pct) && pct > 0 ? pct : undefined;
};

const getCardBadges = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): Array<{ label: string; color: string; textColor?: string }> => {
  if (!('customFields' in product)) {
    return [];
  }

  const fields = removeEdgesAndNodes(product.customFields);
  const isYes = (name: string) =>
    fields
      .find((f) => f.name === name)
      ?.value.trim()
      .toLowerCase() === 'yes';
  // A product is "on sale" when __sale holds a positive percentage.
  const onSale = getSalePercent(product) != null;

  return [
    // Sale first (most prominent) — solid red pill with white text, unlike the pastel badges.
    onSale && {
      label: 'Sale',
      color: 'var(--pill-sale-background)',
      textColor: 'var(--pill-sale-text)',
    },
    isYes('__is_new') && { label: 'New', color: 'var(--pill-new-background)' },
    isYes('__is_bestseller') && { label: 'Bestseller', color: 'var(--pill-bestseller-background)' },
    isYes('__is_trending') && { label: 'Trending', color: 'var(--pill-trending-background)' },
  ].filter((b): b is { label: string; color: string; textColor?: string } => Boolean(b));
};

// The photo shown while the card is hovered: the first gallery image that is not the default one.
const getHoverImage = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): { src: string; alt: string } | undefined => {
  if (!('images' in product)) {
    return undefined;
  }

  const defaultUrl = product.defaultImage?.url;
  const next = removeEdgesAndNodes(product.images).find(
    (image) => !image.isDefault && image.url !== defaultUrl,
  );

  return next ? { src: next.url, alt: next.altText || product.name } : undefined;
};

// Delivery/pickup message from the __delivery custom field (e.g. "Same Day Pickup", "2 Day pickup").
// Shown on the card after the price. Absent -> nothing shown.
const getDeliveryMessage = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): string | undefined => {
  if (!('customFields' in product)) {
    return undefined;
  }

  const value = removeEdgesAndNodes(product.customFields)
    .find((f) => f.name === '__delivery')
    ?.value.trim();

  return value !== undefined && value !== '' ? value : undefined;
};

// A trimmed custom-field value, or undefined when absent/empty.
const getCustomFieldValue = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
  name: string,
): string | undefined => {
  if (!('customFields' in product)) {
    return undefined;
  }

  const value = removeEdgesAndNodes(product.customFields)
    .find((f) => f.name === name)
    ?.value.trim();

  return value !== undefined && value !== '' ? value : undefined;
};

const plural = (noun: string, count: number): string => {
  if (count === 1) return noun;

  return noun.endsWith('f') ? `${noun.slice(0, -1)}ves` : `${noun}s`;
};

// The cabinets' door_shelf_drawer custom field ("2 Door |1 Shelf | 1 Drawer") as a tidy line:
// "2 doors · 1 shelf · 1 drawer". Zero counts are left out; absent → nothing shown.
const getSpecLine = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): string | undefined => {
  const raw = getCustomFieldValue(product, 'door_shelf_drawer');

  if (!raw) return undefined;

  const parts = raw
    .split('|')
    .map((part) => /^\s*(\d+)\s*([A-Za-z]+)/.exec(part))
    .filter((m): m is RegExpExecArray => m != null)
    .map((m) => ({ count: Number(m[1]), noun: (m[2] ?? '').toLowerCase() }))
    .filter(({ count }) => count > 0)
    .map(({ count, noun }) => `${count} ${plural(noun, count)}`);

  return parts.length > 0 ? parts.join(' · ') : undefined;
};

// The product's required options, with swatch colours where BigCommerce has them. The card
// shows swatches for a single small swatch option and names the choice in the CTA otherwise.
const getRequiredOptions = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
): RequiredOption[] | undefined => {
  if (!('productOptions' in product)) {
    return undefined;
  }

  return removeEdgesAndNodes(product.productOptions)
    .filter((option) => option.isRequired)
    .map((option) => {
      const values =
        'values' in option && option.displayStyle === 'Swatch'
          ? removeEdgesAndNodes(option.values)
          : [];
      const swatches = values.flatMap((value) =>
        '__typename' in value && value.__typename === 'SwatchOptionValue'
          ? [
              {
                id: value.entityId,
                label: value.label,
                color: value.hexColors[0] ?? undefined,
                image: value.imageUrl ?? undefined,
                isDefault: value.isDefault,
              },
            ]
          : [],
      );

      return {
        id: option.entityId,
        name: option.displayName,
        swatches: swatches.length > 0 ? swatches : undefined,
      };
    });
};

// Money for a variant's price block, formatted like the product's.
const variantMoney = (
  inc: { value: number; currencyCode: string },
  ex: { value: number; currencyCode: string },
  format: ExistingResultType<typeof getFormatter>,
) => ({
  inc: format.number(inc.value, { style: 'currency', currency: inc.currencyCode }),
  ex: format.number(ex.value, { style: 'currency', currency: ex.currencyCode }),
});

// For the card's swatch option: each option value -> its variant's photo, price and
// purchasability, so choosing a swatch swaps the card to that variant.
const getCardVariants = (
  product: ResultOf<typeof ProductCardFragment | typeof WishlistItemProductFragment>,
  optionId: number | undefined,
  format: ExistingResultType<typeof getFormatter>,
): CardVariants | undefined => {
  if (optionId == null || !('variants' in product)) {
    return undefined;
  }

  const entries = removeEdgesAndNodes(product.variants).flatMap((variant) => {
    if (!('options' in variant)) return [];

    const option = removeEdgesAndNodes(variant.options).find((o) => o.entityId === optionId);
    const valueId = option ? removeEdgesAndNodes(option.values)[0]?.entityId : undefined;

    if (valueId == null) return [];

    const inc = variant.variantPricesIncludingTax;
    const ex = variant.variantPricesExcludingTax;
    let price: Price | undefined;

    if (inc?.price && ex?.price) {
      const current = variantMoney(inc.price, ex.price, format);
      const onSale =
        inc.basePrice && ex.basePrice && inc.salePrice && inc.price.value < inc.basePrice.value;

      price =
        onSale && inc.basePrice && ex.basePrice
          ? { type: 'sale', previous: variantMoney(inc.basePrice, ex.basePrice, format), current }
          : { type: 'plain', money: current };
    }

    return [
      [
        String(valueId),
        {
          image: variant.defaultImage
            ? { src: variant.defaultImage.url, alt: variant.defaultImage.altText || product.name }
            : undefined,
          price,
          purchasable: variant.isPurchasable,
        },
      ] as const,
    ];
  });

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
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
    hoverImage: getHoverImage(product),
    price: pricesTransformer(product, format, taxDisplay),
    subtitle: product.brand?.name ?? undefined,
    badges: getCardBadges(product),
    salePercent: getSalePercent(product),
    deliveryMessage: getDeliveryMessage(product),
    specLine: getSpecLine(product),
    // Quote-only products (countertops): __quote_only = yes swaps the cart CTA for "Request a
    // quote" and hides the delivery line; __price_unit (e.g. "sq. ft.") is shown after the price.
    quoteOnly: getCustomFieldValue(product, '__quote_only')?.toLowerCase() === 'yes',
    priceUnit: getCustomFieldValue(product, '__price_unit'),
    requiresOptions:
      'productOptions' in product
        ? removeEdgesAndNodes(product.productOptions).some((o) => o.isRequired)
        : undefined,
    requiredOptions: getRequiredOptions(product),
    cardVariants: getCardVariants(
      product,
      getRequiredOptions(product)?.find((option) => option.swatches != null)?.id,
      format,
    ),
    rating: product.reviewSummary.averageRating,
    numberOfReviews: product.reviewSummary.numberOfReviews,
    // BigCommerce's verdict (tracked stock at zero, or unavailable): the card then offers a call
    // instead of an add that the API would refuse.
    outOfStock: 'inventory' in product ? !product.inventory.isInStock : undefined,
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
