import 'server-only';

import { z } from 'zod';

// Does an email already have a customer account? Read-only lookup through the Management API,
// with the "customer read only" store API account (Customers: read-only, nothing else). The
// token never reaches the browser.
//
// Returns null when the lookup could not run (no token, API error, timeout) so callers fail open:
// registration then falls through to BigCommerce's own EmailAlreadyInUseError.

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const TOKEN = process.env.BIGCOMMERCE_CUSTOMERS_READ_TOKEN;

const CustomersResponse = z.object({ data: z.array(z.unknown()) });

export async function emailHasAccount(email: string): Promise<boolean | null> {
  if (!STORE_HASH || !TOKEN) return null;

  const trimmed = email.trim();
  // Stored emails keep the case they were typed in; match either spelling.
  const candidates = [...new Set([trimmed, trimmed.toLowerCase()])];
  const url = new URL(`https://api.bigcommerce.com/stores/${STORE_HASH}/v3/customers`);

  url.searchParams.set('email:in', candidates.join(','));
  url.searchParams.set('limit', '1');

  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': TOKEN, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;

    const parsed = CustomersResponse.safeParse(await res.json());

    return parsed.success ? parsed.data.data.length > 0 : null;
  } catch {
    return null;
  }
}
