import { z } from 'zod';

interface FormField {
  name: string;
  label: string;
  errors?: string[];
  required?: boolean;
  persist?: boolean;
}

type RadioField = {
  type: 'radio-group';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
} & FormField;

type SelectField = {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
} & FormField;

type CheckboxField = {
  type: 'checkbox';
  defaultValue?: string;
  checkedValue: string;
  uncheckedValue: string;
} & FormField;

type NumberInputField = {
  type: 'number';
  defaultValue?: string;
  min?: number;
  max?: number;
  incrementLabel?: string;
  decrementLabel?: string;
} & FormField;

type TextInputField = {
  type: 'text';
  defaultValue?: string;
  pattern?: string;
} & FormField;

type TextAreaField = {
  type: 'textarea';
  defaultValue?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
} & FormField;

type DateField = {
  type: 'date';
  defaultValue?: string;
  pattern?: string;
} & FormField;

type SwatchRadioFieldOption =
  | {
      type: 'color';
      value: string;
      label: string;
      color: string;
      disabled?: boolean;
    }
  | {
      type: 'image';
      value: string;
      label: string;
      image: { src: string; alt: string };
      disabled?: boolean;
    };

type SwatchRadioField = {
  type: 'swatch-radio-group';
  defaultValue?: string;
  options: SwatchRadioFieldOption[];
} & FormField;

type CardRadioField = {
  type: 'card-radio-group';
  defaultValue?: string;
  options: Array<{
    value: string;
    label: string;
    image?: { src: string; alt: string };
    disabled?: boolean;
  }>;
} & FormField;

type ButtonRadioField = {
  type: 'button-radio-group';
  defaultValue?: string;
  pattern?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
} & FormField;

export type Field =
  | RadioField
  | CheckboxField
  | NumberInputField
  | TextInputField
  | TextAreaField
  | DateField
  | SwatchRadioField
  | CardRadioField
  | ButtonRadioField
  | SelectField;

export interface SchemaRawShape {
  [key: string]:
    z.ZodString | z.ZodOptional<z.ZodString> | z.ZodNumber | z.ZodOptional<z.ZodNumber>;
  id: z.ZodString;
  quantity: z.ZodNumber;
}

// Most of one product a single order may hold; the same ceiling as the cart's quantity box.
export const MAX_PER_ORDER = 999;

// The quantity cap the form enforces: the stock / purchase-limit cap when BigCommerce gives one,
// never more than MAX_PER_ORDER (most live products carry no tracked stock, and without a
// ceiling a typed 99999 went straight into the cart).
export function quantityCap(maxQuantity?: number): number {
  return Math.min(maxQuantity ?? MAX_PER_ORDER, MAX_PER_ORDER);
}

// The note shown when a typed quantity is pulled down to the cap. Names its field (site rule).
export function quantityCapMessage(cap: number, maxQuantity?: number): string {
  return maxQuantity != null && maxQuantity <= MAX_PER_ORDER
    ? `Quantity: only ${cap} available`
    : `Quantity: up to ${MAX_PER_ORDER} per order`;
}

export function schema(
  fields: Field[],
  minQuantity?: number,
  maxQuantity?: number,
): z.ZodObject<SchemaRawShape> {
  const min = minQuantity ?? 1;
  const cap = quantityCap(maxQuantity);
  const quantitySchema = z
    .number({ invalid_type_error: 'Quantity is required' })
    .min(min, { message: `Quantity must be at least ${min}` })
    .max(cap, { message: quantityCapMessage(cap, maxQuantity) });

  const shape: SchemaRawShape = {
    id: z.string(),
    quantity: quantitySchema,
  };

  fields.forEach((field) => {
    let fieldSchema: z.ZodString | z.ZodNumber;

    switch (field.type) {
      case 'number':
        fieldSchema = z.number();

        if (field.min != null) fieldSchema = fieldSchema.min(field.min);
        if (field.max != null) fieldSchema = fieldSchema.max(field.max);

        shape[field.name] = fieldSchema;
        break;

      case 'textarea':
        fieldSchema = z.string();
        if (field.minLength != null) fieldSchema = fieldSchema.min(field.minLength);
        if (field.maxLength != null) fieldSchema = fieldSchema.max(field.maxLength);

        shape[field.name] = fieldSchema;
        break;

      default:
        fieldSchema = z.string();

        shape[field.name] = fieldSchema;
        break;
    }

    if (field.required !== true) shape[field.name] = fieldSchema.optional();
  });

  return z.object(shape);
}
