import { type Field } from './schema';

const CHOICE_TYPES = new Set<Field['type']>([
  'select',
  'radio-group',
  'button-radio-group',
  'card-radio-group',
  'picture-radio-group',
  'swatch-radio-group',
  'checkbox-group',
  'date',
]);

const IMPERATIVE = /^(pick|choose|select|tell us|enter|describe|upload)\b/i;

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

// The "you left this empty" message for a field, worded from its label so it names the field and
// still reads as a sentence: "Please answer: Which showroom?", "Please pick a date",
// "Please choose siding type", "Scope is required", "Please fill in: Which items you want to
// return, and why". A bare "<Label> is required" is kept for short plain labels only.
export function requiredMessageFor(field: Pick<Field, 'type' | 'label' | 'name'>): string {
  const label = (field.label ?? field.name).trim();

  if (label.endsWith('?')) return `Please answer: ${label}`;
  if (IMPERATIVE.test(label)) return `Please ${lowerFirst(label)}`;
  if (field.type === 'checkbox') return `Please tick: ${label}`;
  if (CHOICE_TYPES.has(field.type)) return `Please choose ${lowerFirst(label)}`;

  // "Project: scope" -> "Scope is required"
  const afterColon = label.includes(':') ? label.slice(label.indexOf(':') + 1).trim() : label;
  const short = afterColon.charAt(0).toUpperCase() + afterColon.slice(1);

  if (short.length > 32 || short.includes(',')) return `Please fill in: ${short}`;

  return `${short} is required`;
}
