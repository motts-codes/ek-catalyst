'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from '~/i18n/routing';
import { applyDeliveryZipToCart } from '~/lib/delivery/delivery-zip-action';
import { DeliveryZip } from '~/lib/delivery/zip-shared';

// Rendered by the cart page when a delivery ZIP is remembered but the cart has no shipping estimate
// yet: quotes it once, then refreshes so the summary shows the options. Renders nothing.
export function ShippingAutoEstimate({ value }: { value: DeliveryZip }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;

    ran.current = true;

    void applyDeliveryZipToCart(value).then((ok) => {
      if (ok) router.refresh();
    });
  }, [router, value]);

  return null;
}
