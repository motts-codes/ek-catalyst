import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { type AudienceMode } from '~/lib/navigation/menu-config';

// Trade-only fields on the customer and address forms. A homeowner has no company name or
// property / unit to give, so those two optional fields appear only in the header's Pro mode
// (the `ek_audience` cookie). The header toggle reloads the page, so flipping it on a form shows
// or hides them at once. Nothing new is sent to BigCommerce.
const TRADE_ONLY_LABELS = ['Company Name', 'Property Name and Unit #'];

export function isTradeOnly(field: Field): boolean {
  return (
    field.name === 'company' ||
    TRADE_ONLY_LABELS.some((label) => field.name.endsWith(label) || field.label === label)
  );
}

export function forAudience(
  fields: Array<Field | Field[]>,
  audience: AudienceMode,
): Array<Field | Field[]> {
  if (audience === 'pro') return fields;

  return fields
    .map((field) => (Array.isArray(field) ? field.filter((f) => !isTradeOnly(f)) : field))
    .filter((field) => (Array.isArray(field) ? field.length > 0 : !isTradeOnly(field)));
}
