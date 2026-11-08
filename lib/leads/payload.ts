// Pure helpers shared by every lead channel (webhook, monday.com). No imports from Next so they
// can be unit-tested with plain Node.

import {
  PAGE_URL_FIELD,
  TRACKING_KEYS,
  type TrackingKey,
} from '@/vibes/soul/form/tracking-fields/constants';

export const FORM_LABELS: Record<string, string> = {
  contact: 'Contact',
  'free-design': 'Free design consult',
  booking: 'Book',
  quote: 'Quote request',
  industry: 'Commercial / multifamily',
  'pro-program': 'Pro Program',
  'refer-a-friend': 'Referral',
  support: 'Support',
  'return-authorization': 'Return',
  'price-match': 'Price match',
  estimate: 'Kitchen estimate',
};

export type Tracking = Partial<Record<TrackingKey | typeof PAGE_URL_FIELD, string>>;

export function formLabel(form: string): string {
  return FORM_LABELS[form] ?? form;
}

export function asText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(asText).join(', ');
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return value == null ? '' : JSON.stringify(value);
}

// Reads the hidden attribution inputs (utm_*, gclid, fbclid, page_url) off the raw form data.
export function extractTracking(formData: FormData): Tracking {
  const out: Tracking = {};
  const keys: Array<TrackingKey | typeof PAGE_URL_FIELD> = [...TRACKING_KEYS, PAGE_URL_FIELD];

  keys.forEach((key) => {
    const value = formData.get(key);

    if (typeof value === 'string' && value.trim() !== '') {
      out[key] = value.trim().slice(0, 500);
    }
  });

  return out;
}

export function fullName(values: Record<string, unknown>): string {
  const single = asText(values.name).trim();

  if (single) {
    return single;
  }

  return [values.firstName, values.lastName]
    .map(asText)
    .map((v) => v.trim())
    .filter(Boolean)
    .join(' ');
}

// The flat JSON a webhook receives. Shape follows the old landing page's payload (name, email,
// phone, preference-style fields, source, page_url, date, timestamp, utm_*) so an existing
// Pabbly → monday.com workflow keeps working, with every other field of the form added as-is.
export function buildLeadPayload(
  form: string,
  values: Record<string, unknown>,
  tracking: Tracking,
  now: Date = new Date(),
): Record<string, string> {
  const fields = Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, asText(value)] as const)
      .filter(([, text]) => text !== ''),
  );

  return {
    ...fields,
    name: fullName(values),
    form,
    form_label: formLabel(form),
    source: `EK Website – ${formLabel(form)}`,
    page_url: tracking.page_url ?? '',
    date: now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    timestamp: now.toISOString(),
    ...Object.fromEntries(
      TRACKING_KEYS.filter((key) => tracking[key]).map((key) => [key, tracking[key] ?? '']),
    ),
  };
}
