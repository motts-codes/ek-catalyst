import 'server-only';

import { geocodeZip } from '~/lib/pages/showroom-distance';

import { DeliveryZip } from './zip';

// A ZIP to its town and state, server-side, through the same Mapbox geocoder the showroom search
// uses. BigCommerce's shipping zones are usually drawn by state, so the estimate is better with it;
// if the lookup fails for any reason (no token, Mapbox down, a token locked to the site's URL) the
// ZIP alone still goes through. Never throws.
export async function resolveZip(zip: string): Promise<DeliveryZip> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) return { zip };

  try {
    const origin = await Promise.race([
      geocodeZip(zip, token),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 3000);
      }),
    ]);

    return { zip, town: origin?.town, state: origin?.state };
  } catch {
    return { zip };
  }
}
