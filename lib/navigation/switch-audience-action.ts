'use server';

import { revalidatePath } from 'next/cache';

import { AudienceMode } from './menu-config';
import { setAudienceMode } from './audience-mode';

/**
 * Toggle the audience mode: persist the cookie and revalidate so the header (and page) re-render
 * server-side in the new mode. (Cookie + reload approach — the eventual /pro routing layers on top.)
 */
export async function switchAudienceMode(mode: AudienceMode): Promise<void> {
  await setAudienceMode(mode);
  revalidatePath('/', 'layout');
}
