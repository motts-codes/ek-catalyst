'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { TAGS } from '~/client/tags';
import { addToOrCreateCart } from '~/lib/cart';

import { parseSelectedOptions } from './parse-selected-options';

// "Undo" after a remove: the client hands back the cart line it was given (product, variant,
// quantity and the selected options as BigCommerce returned them). Server actions are public
// endpoints, so the shape is validated rather than trusted.
const base = { entityId: z.number().int(), name: z.string() };
const selectedOption = z.discriminatedUnion('__typename', [
  z.object({
    ...base,
    __typename: z.literal('CartSelectedMultipleChoiceOption'),
    value: z.string(),
    valueEntityId: z.number().int(),
  }),
  z.object({
    ...base,
    __typename: z.literal('CartSelectedCheckboxOption'),
    value: z.string(),
    valueEntityId: z.number().int(),
  }),
  z.object({ ...base, __typename: z.literal('CartSelectedNumberFieldOption'), number: z.number() }),
  z.object({ ...base, __typename: z.literal('CartSelectedTextFieldOption'), text: z.string() }),
  z.object({
    ...base,
    __typename: z.literal('CartSelectedMultiLineTextFieldOption'),
    text: z.string(),
  }),
  z.object({
    ...base,
    __typename: z.literal('CartSelectedDateFieldOption'),
    date: z.object({ utc: z.string() }),
  }),
]);

const lineSchema = z.object({
  productEntityId: z.number().int().positive(),
  variantEntityId: z.number().int().nullable(),
  quantity: z.number().int().positive(),
  selectedOptions: z.array(selectedOption),
});

export async function restoreLineItem(line: unknown): Promise<{ error?: string }> {
  const parsed = lineSchema.safeParse(line);

  if (!parsed.success) return { error: 'Could not restore the item.' };

  const { productEntityId, variantEntityId, quantity, selectedOptions } = parsed.data;

  try {
    await addToOrCreateCart({
      lineItems: [
        {
          productEntityId,
          variantEntityId: variantEntityId ?? undefined,
          selectedOptions: parseSelectedOptions(selectedOptions),
          quantity,
        },
      ],
    });

    revalidateTag(TAGS.cart, { expire: 0 });

    return {};
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      return { error: error.errors.map(({ message }) => message).join(' ') };
    }

    return { error: error instanceof Error ? error.message : 'Could not restore the item.' };
  }
}
