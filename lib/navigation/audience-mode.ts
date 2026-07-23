import { cookies } from 'next/headers';

import { AudienceMode } from './menu-config';

// Audience-mode cookie. Homeowner is the default; Pro persists for repeat (contractor) visitors.
export const AUDIENCE_COOKIE = 'ek_audience';
const AUDIENCE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

/** Read the current audience mode from the cookie (server-side). Defaults to homeowner. */
export async function getAudienceMode(): Promise<AudienceMode> {
  const store = await cookies();

  return store.get(AUDIENCE_COOKIE)?.value === 'pro' ? 'pro' : 'homeowner';
}

/** Persist the audience mode (90-day cookie). Call from a server action / route handler. */
export async function setAudienceMode(mode: AudienceMode): Promise<void> {
  const store = await cookies();

  store.set(AUDIENCE_COOKIE, mode, {
    maxAge: AUDIENCE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
}
