import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { Money, Price } from '@/vibes/soul/primitives/price-label';
import { PricingFragment } from '~/client/fragments/pricing';
import { ExistingResultType } from '~/client/util';

type Pricing = ResultOf<typeof PricingFragment>;
type Format = ExistingResultType<typeof getFormatter>;

export type TaxDisplay = 'INC' | 'EX' | 'BOTH';

const toMoney = (
  inc: { value: number; currencyCode: string },
  ex: { value: number; currencyCode: string },
  format: Format,
): Money => ({
  inc: format.number(inc.value, { style: 'currency', currency: inc.currencyCode }),
  ex: format.number(ex.value, { style: 'currency', currency: ex.currencyCode }),
});

// A sale is either an explicit sale price, or a selling price below the base price: customer
// group discounts (e.g. the 14.35% Closets rule) lower `price` but leave `salePrice` alone.
const isDiscounted = (prices: NonNullable<Pricing['pricesIncludingTax']>): boolean =>
  prices.salePrice?.value !== prices.basePrice?.value ||
  (prices.basePrice != null && prices.price.value < prices.basePrice.value);

export const pricesTransformer = (
  pricing: Pricing,
  format: Format,
  taxDisplay: TaxDisplay | null | undefined = 'EX',
): Price | undefined => {
  const inc = pricing.pricesIncludingTax;
  const ex = pricing.pricesExcludingTax;

  if (!inc || !ex) {
    return undefined;
  }

  let mode: TaxDisplay = taxDisplay ?? 'EX';

  // Tax-disabled stores, tax-exempt customer groups, and some B2B contexts return identical
  // values for inc and ex. Degrade BOTH to a single-price render so we don't duplicate the
  // same number on two lines.
  if (mode === 'BOTH') {
    const hasTaxDifference =
      inc.price.value !== ex.price.value ||
      inc.basePrice?.value !== ex.basePrice?.value ||
      inc.salePrice?.value !== ex.salePrice?.value ||
      inc.priceRange.min.value !== ex.priceRange.min.value ||
      inc.priceRange.max.value !== ex.priceRange.max.value;

    if (!hasTaxDifference) {
      mode = 'EX';
    }
  }

  const isPriceRange = inc.priceRange.min.value !== inc.priceRange.max.value;
  const isSalePrice = isDiscounted(inc);

  if (isPriceRange) {
    return {
      type: 'range',
      min: toMoney(inc.priceRange.min, ex.priceRange.min, format),
      max: toMoney(inc.priceRange.max, ex.priceRange.max, format),
      mode,
    };
  }

  if (isSalePrice && inc.salePrice && inc.basePrice && ex.salePrice && ex.basePrice) {
    return {
      type: 'sale',
      previous: toMoney(inc.basePrice, ex.basePrice, format),
      current: toMoney(inc.price, ex.price, format),
      mode,
    };
  }

  // No sale, but a retail (MRP) price above the selling price: show it struck through.
  if (inc.retailPrice && ex.retailPrice && inc.retailPrice.value > inc.price.value) {
    return {
      type: 'sale',
      previous: toMoney(inc.retailPrice, ex.retailPrice, format),
      current: toMoney(inc.price, ex.price, format),
      mode,
    };
  }

  return {
    type: 'plain',
    money: toMoney(inc.price, ex.price, format),
    mode,
  };
};
