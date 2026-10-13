import { getFormatter } from 'next-intl/server';

import {
  type CartDrawerData,
  type CartDrawerItem,
} from '@/vibes/soul/primitives/cart-drawer/store';
import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { getCartId } from '.';

// After an add-to-cart: the cart as the drawer shows it. Null when there's no cart to read (the
// caller then falls back to the plain toast).
export async function getCartDrawerSummary(addedProductId: number): Promise<CartDrawerData | null> {
  const cartId = await getCartId();

  if (!cartId) return null;

  const currencyCode = await getPreferredCurrencyCode();
  const data = await getCart({ cartId, currencyCode });
  const cart = data.site.cart;

  if (!cart) return null;

  const format = await getFormatter();
  const money = (value: number, currency: string) =>
    format.number(value, { style: 'currency', currency });

  const lines = cart.lineItems.physicalItems.filter((item) => !item.parentEntityId);

  const toItem = (item: (typeof lines)[number]): CartDrawerItem => ({
    id: item.entityId,
    name: item.name,
    brand: item.brand ?? undefined,
    href: item.url,
    image: item.image ? { src: item.image.url, alt: item.name } : undefined,
    options: item.selectedOptions.flatMap((option) => {
      if ('value' in option) return [`${option.name}: ${option.value}`];
      if ('text' in option) return [`${option.name}: ${option.text}`];
      if ('number' in option) return [`${option.name}: ${option.number}`];

      return [];
    }),
    quantity: item.quantity,
    price: money(item.salePrice.value, item.salePrice.currencyCode),
  });

  // The line just added: the last line for that product (BC merges same-option adds into one line).
  const addedLine =
    [...lines].reverse().find((item) => item.productEntityId === addedProductId) ?? lines[0];

  if (!addedLine) return null;

  const subtotal = data.site.checkout?.subtotal;

  return {
    added: toItem(addedLine),
    items: lines.map(toItem),
    totalQuantity: cart.lineItems.totalQuantity,
    subtotal: subtotal ? money(subtotal.value, subtotal.currencyCode) : '',
  };
}
