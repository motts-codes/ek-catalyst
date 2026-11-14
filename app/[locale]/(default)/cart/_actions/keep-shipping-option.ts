import 'server-only';

import { getCart } from '../page-data';

import { addShippingCost } from './add-shipping-cost';

// BigCommerce clears the chosen shipping option whenever the cart changes (a quantity edit, an
// item removed), which pops the options list open again. These two calls bracket such a change:
// note the option before, and re-select the same one afterwards when it's still offered. The
// visitor only sees the price update. Nothing is forced: if the option is gone, the list opens as
// before.

export async function rememberShippingOption(cartId: string): Promise<string | null> {
  try {
    const { site } = await getCart({ cartId });
    const consignment = site.checkout?.shippingConsignments?.[0];

    return consignment?.selectedShippingOption?.description ?? null;
  } catch {
    return null;
  }
}

export async function restoreShippingOption(
  cartId: string,
  description: string | null,
): Promise<void> {
  if (!description) return;

  try {
    const { site } = await getCart({ cartId });
    const checkout = site.checkout;
    const consignment = checkout?.shippingConsignments?.[0];

    if (!checkout?.entityId || !consignment?.entityId || consignment.selectedShippingOption) return;

    const match = consignment.availableShippingOptions?.find(
      (option) => option.description === description,
    );

    if (!match) return;

    await addShippingCost({
      checkoutEntityId: checkout.entityId,
      consignmentEntityId: consignment.entityId,
      shippingOptionEntityId: match.entityId,
    });
  } catch (error) {
    // Best effort: the visitor can pick again from the list.
    // eslint-disable-next-line no-console
    console.error('[cart] could not restore the shipping option', error);
  }
}
