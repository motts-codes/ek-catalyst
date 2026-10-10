'use server';

import { revalidatePath } from 'next/cache';

import { setAudienceMode } from './audience-mode';
import { AudienceMode } from './menu-config';

/**
 * Toggle the audience mode: persist the cookie and revalidate so the header (and page) re-render
 * server-side in the new mode.
 *
 * Navigation is decided client-side (the toggle knows the current path): selecting Pro from the
 * home page routes to /pro, selecting Homeowner from /pro routes back to home, and anywhere else
 * just reloads in place. This action only owns the cookie + revalidation.
 */
export async function switchAudienceMode(mode: AudienceMode): Promise<void> {
  await setAudienceMode(mode);
  revalidatePath('/', 'layout');
}
