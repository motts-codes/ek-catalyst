// The delivery ZIP's shape and formatting, safe to import from client components. The cookie
// read/write lives in ./zip (server only).
export interface DeliveryZip {
  zip: string;
  town?: string;
  state?: string;
}

const US_ZIP = /^\d{5}$/;

export const isDeliveryZip = (value: string): boolean => US_ZIP.test(value.trim());

// "Bristol, CT 06010", or just the ZIP when the town isn't known.
export function formatDeliveryZip({ zip, town, state }: DeliveryZip): string {
  const place = [town, state].filter(Boolean).join(', ');

  return place ? `${place} ${zip}` : zip;
}

export function parseDeliveryZip(raw: string | undefined): DeliveryZip | null {
  if (!raw) return null;

  const [zip = '', town = '', state = ''] = raw.split('|');

  if (!US_ZIP.test(zip)) return null;

  return { zip, town: town || undefined, state: state || undefined };
}
