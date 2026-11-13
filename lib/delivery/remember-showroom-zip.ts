'use server';

import { SearchOrigin } from '~/lib/pages/showroom-distance';

import { saveDeliveryZip } from './delivery-zip-action';

// A ZIP searched on the showrooms page becomes the visitor's delivery ZIP (one ZIP everywhere).
// Server action so the page can hand it to the client locator as a prop.
export async function rememberShowroomZip(origin: SearchOrigin): Promise<void> {
  if (!/^\d{5}$/.test(origin.label)) return;

  await saveDeliveryZip({ zip: origin.label, town: origin.town, state: origin.state });
}
