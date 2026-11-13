import 'server-only';

import { DeliveryZip } from '~/lib/delivery/zip-shared';

import { getCart } from '../page-data';

import {
  addCheckoutShippingConsignments,
  updateCheckoutShippingConsignment,
} from './add-shipping-info';

// Put a ZIP on the cart's shipping consignment so BigCommerce quotes the shipping options. EK ships
// within the US only, so the country is fixed; the town and state ride along when known. Returns
// the available options, or null when there's no cart or BigCommerce gave none back. Throws on an
// API error, for the caller to turn into a message.
export async function estimateShippingByZip(
  cartId: string,
  { zip, town, state }: DeliveryZip,
): Promise<Array<{ entityId: string; description: string; cost: { value: number } }> | null> {
  const cart = await getCart({ cartId });
  const checkout = cart.site.checkout;

  if (!checkout?.entityId || !cart.site.cart) return null;

  const lineItems = [
    ...cart.site.cart.lineItems.physicalItems,
    ...cart.site.cart.lineItems.digitalItems,
  ].map((item) => ({ lineItemEntityId: item.entityId, quantity: item.quantity }));

  if (lineItems.length === 0) return null;

  const consignment =
    checkout.shippingConsignments?.find((c) => c.selectedShippingOption) ??
    checkout.shippingConsignments?.[0];

  const address = { countryCode: 'US', postalCode: zip, city: town, stateOrProvince: state };

  const result = consignment?.entityId
    ? await updateCheckoutShippingConsignment({
        checkoutEntityId: checkout.entityId,
        address,
        lineItems,
        shippingId: consignment.entityId,
      })
    : await addCheckoutShippingConsignments({
        checkoutEntityId: checkout.entityId,
        address,
        lineItems,
      });

  return result?.shippingConsignments?.[0]?.availableShippingOptions ?? null;
}
