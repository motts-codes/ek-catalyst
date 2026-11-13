'use server';

import { revalidatePath } from 'next/cache';

import { estimateShippingByZip } from '~/app/[locale]/(default)/cart/_actions/estimate-shipping-by-zip';
import { getCartId } from '~/lib/cart';

import { resolveZip } from './resolve-zip';
import { DeliveryZip, formatDeliveryZip, isDeliveryZip, setDeliveryZip } from './zip';

export type SaveDeliveryZipResult =
  { ok: true; value: DeliveryZip; label: string } | { ok: false; error: string };

interface Input {
  zip: string;
  /** Town and state, when the browser already geocoded the ZIP (saves a server lookup). */
  town?: string;
  state?: string;
}

// Remember the visitor's delivery ZIP (utility bar, showroom search, cart) and, when there's a
// cart, re-quote its shipping for the new ZIP so the cart page is right the next time it renders.
// A failed cart re-quote doesn't fail the save: the cart page retries on load.
export async function saveDeliveryZip({ zip, town, state }: Input): Promise<SaveDeliveryZipResult> {
  const trimmed = zip.trim();

  if (!isDeliveryZip(trimmed)) {
    return { ok: false, error: 'Enter a 5-digit ZIP code.' };
  }

  const value: DeliveryZip = town ? { zip: trimmed, town, state } : await resolveZip(trimmed);

  await setDeliveryZip(value);

  const cartId = await getCartId();

  if (cartId) {
    try {
      await estimateShippingByZip(cartId, value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[delivery-zip] cart re-quote failed', error);
    }
  }

  revalidatePath('/', 'layout');

  return { ok: true, value, label: formatDeliveryZip(value) };
}

// The cart page calls this on load when a ZIP is known but the cart has no estimate yet.
export async function applyDeliveryZipToCart(value: DeliveryZip): Promise<boolean> {
  const cartId = await getCartId();

  if (!cartId) return false;

  try {
    const options = await estimateShippingByZip(cartId, value);

    return options !== null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[delivery-zip] cart estimate failed', error);

    return false;
  }
}
