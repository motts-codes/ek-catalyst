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
//
// Reserved keys, written last and therefore authoritative: name, form, form_label, source,
// page_url, date, timestamp and the tracking keys. Do not name a form field after one of them
// (the booking form's appointment date is `appointmentDate` for this reason).
export type OptionLabels = Record<string, Record<string, string>>;

// The visitor-facing label for a stored option value ("lt5" → "Under $5,000"); arrays map each item.
export function labelled(key: string, value: unknown, labels: OptionLabels): unknown {
  const map = labels[key];

  if (!map) return value;

  const one = (v: unknown): unknown => (typeof v === 'string' && map[v]) || v;

  return Array.isArray(value) ? value.map(one) : one(value);
}

export function buildLeadPayload(
  form: string,
  values: Record<string, unknown>,
  tracking: Tracking,
  now: Date = new Date(),
  labels: OptionLabels = {},
): Record<string, string> {
  // Human-readable answers for the CRM and the sheet; the raw values still drive crmFields().
  const fields = Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, asText(labelled(key, value, labels))] as const)
      .filter(([, text]) => text !== ''),
  );

  return {
    ...fields,
    ...crmFields(values),
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

// ---- CRM-ready values -------------------------------------------------------------------------
// monday.com Status columns only accept their existing labels, so the payload also carries the
// form's answers translated into the exact labels on the WF28 Online Nurturing Funnel board
// (read from the board on 8 Nov 2026). Pabbly maps these keys straight across, no lookups.

/** Website showroom value → monday "Store" label (note the board's own spelling of Bristol). */
export const MONDAY_STORE_LABELS: Record<string, string> = {
  brookfield: 'CT - BROOKFIELD',
  'new-london': 'CT - NEW LONDON',
  newington: 'CT - NEWINGTON',
  orange: 'CT - ORANGE',
  stamford: 'CT - STAMFORD',
  bristol: 'CT-BRISTOL',
};

/** Meeting format → monday "Kitchen Design options" label. */
export const MONDAY_DESIGN_OPTIONS: Record<string, string> = {
  showroom: 'In-Store',
  video: 'Virtual',
};

/** Meeting format → wording in the board's free-text "Preference" column. */
export const PREFERENCE_LABELS: Record<string, string> = {
  showroom: 'Showroom Consult',
  video: 'Virtual Consult',
};

// monday "State" label from a US ZIP prefix: CT is 06; MA 010–027; NY 100–149; NJ 070–089.
export function stateFromZip(zip: unknown): string {
  const digits = asText(zip).replace(/\D/g, '');

  if (digits.length < 5) {
    return '';
  }

  const p3 = Number(digits.slice(0, 3));

  if (digits.startsWith('06')) {
    return 'CT';
  }

  if ((p3 >= 10 && p3 <= 27) || (p3 >= 100 && p3 <= 149) || (p3 >= 70 && p3 <= 89)) {
    return 'MA / NY / NJ';
  }

  return '';
}

export function crmFields(values: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const showroom = asText(values.showroom);
  const format = asText(values.format);

  if (showroom && MONDAY_STORE_LABELS[showroom]) {
    out.store = MONDAY_STORE_LABELS[showroom];
  }

  if (format && MONDAY_DESIGN_OPTIONS[format]) {
    out.design_option = MONDAY_DESIGN_OPTIONS[format];
    out.preference = PREFERENCE_LABELS[format] ?? format;
  }

  if ('smsConsent' in values) {
    out.sms_opt_in =
      values.smsConsent === true || asText(values.smsConsent) === 'true' ? 'IN' : 'OUT';
  }

  const state = stateFromZip(values.zip);

  if (state) {
    out.state = state;
  }

  return out;
}
