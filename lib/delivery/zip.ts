import { cookies } from 'next/headers';

import { DeliveryZip, parseDeliveryZip } from './zip-shared';

export type { DeliveryZip } from './zip-shared';
export { formatDeliveryZip, isDeliveryZip, parseDeliveryZip } from './zip-shared';

// The visitor's delivery ZIP: shown in the utility bar ("Deliver to 06010"), pre-fills the showroom
// search, and is the only thing the cart needs for a shipping estimate (EK ships within the US).
// Stored as "zip|town|state" so the header and the cart can show "Bristol, CT 06010" without a
// lookup. Only the ZIP is ever stored, never a coordinate.
export const DELIVERY_ZIP_COOKIE = 'ek_zip';

const MAX_AGE = 60 * 60 * 24 * 365; // a year

export async function getDeliveryZip(): Promise<DeliveryZip | null> {
  const store = await cookies();

  return parseDeliveryZip(store.get(DELIVERY_ZIP_COOKIE)?.value);
}

// Persist the delivery ZIP (one-year cookie). Call from a server action / route handler.
export async function setDeliveryZip({ zip, town, state }: DeliveryZip): Promise<void> {
  const store = await cookies();

  store.set(DELIVERY_ZIP_COOKIE, [zip, town ?? '', state ?? ''].join('|'), {
    maxAge: MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
}

export async function clearDeliveryZip(): Promise<void> {
  const store = await cookies();

  store.delete(DELIVERY_ZIP_COOKIE);
}
