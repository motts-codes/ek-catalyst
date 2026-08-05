import { createHmac, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';

// Shared-password gate for the /cabinet-admin panel. One password (CABINET_ADMIN_PASSWORD, env),
// server-side only. On success we set a cookie whose value is an HMAC of a constant, signed with
// AUTH_SECRET — so the cookie can't be forged without the secret, and the password itself is never
// stored in the cookie. This is a lightweight gate for a single-client pilot tool, not a full user
// system.
const COOKIE_NAME = 'ek_cabinet_admin';
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12h
const SESSION_PAYLOAD = 'cabinet-admin-v1';

function sign(payload: string): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) throw new Error('AUTH_SECRET is not set');

  return createHmac('sha256', secret).update(payload).digest('hex');
}

const validSessionToken = () => sign(SESSION_PAYLOAD);

/** Constant-time compare that tolerates length mismatches without throwing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);

  if (ab.length !== bb.length) return false;

  return timingSafeEqual(ab, bb);
}

/** Check the submitted password against CABINET_ADMIN_PASSWORD (constant-time). */
export function passwordMatches(submitted: string): boolean {
  const expected = process.env.CABINET_ADMIN_PASSWORD;

  if (!expected) return false;

  return safeEqual(submitted, expected);
}

/** Set the admin session cookie after a successful login. */
export async function setAdminSession(): Promise<void> {
  const store = await cookies();

  store.set(COOKIE_NAME, validSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/cabinet-admin',
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Clear the admin session (logout). */
export async function clearAdminSession(): Promise<void> {
  const store = await cookies();

  store.delete(COOKIE_NAME);
}

/** True when the current request has a valid admin session cookie. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) return false;

  return safeEqual(token, validSessionToken());
}
