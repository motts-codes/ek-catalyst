'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { FragmentOf } from 'gql.tada';
import { getTranslations } from 'next-intl/server';

import { CartLineItem } from '@/vibes/soul/sections/cart';
import { cartLineItemActionFormDataSchema } from '@/vibes/soul/sections/cart/schema';

import { DigitalItemFragment, PhysicalItemFragment } from '../page-data';

import { parseSelectedOptions } from './parse-selected-options';
import { removeItem } from './remove-item';
import { updateQuantity } from './update-quantity';

type LineItem = {
  selectedOptions:
    | FragmentOf<typeof PhysicalItemFragment>['selectedOptions']
    | FragmentOf<typeof DigitalItemFragment>['selectedOptions'];
  productEntityId: number;
  variantEntityId: number | null;
} & CartLineItem;

export const updateLineItem = async (
  prevState: Awaited<{
    lineItems: LineItem[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}> => {
  const t = await getTranslations('Cart.Errors');

  const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  const cartLineItem = prevState.lineItems.find((item) => item.id === submission.value.id);

  if (!cartLineItem) {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
    };
  }

  switch (submission.value.intent) {
    case 'increment': {
      const parsedSelectedOptions = parseSelectedOptions(cartLineItem.selectedOptions);

      try {
        await updateQuantity({
          lineItemEntityId: cartLineItem.id,
          productEntityId: cartLineItem.productEntityId,
          variantEntityId: cartLineItem.variantEntityId,
          selectedOptions: parsedSelectedOptions,
          quantity: cartLineItem.quantity + 1,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity + 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'decrement': {
      const parsedSelectedOptions = parseSelectedOptions(cartLineItem.selectedOptions);

      try {
        await updateQuantity({
          lineItemEntityId: cartLineItem.id,
          productEntityId: cartLineItem.productEntityId,
          variantEntityId: cartLineItem.variantEntityId,
          selectedOptions: parsedSelectedOptions,
          quantity: cartLineItem.quantity - 1,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity - 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete': {
      try {
        await removeItem({ lineItemEntityId: submission.value.id });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (error instanceof BigCommerceGQLError) {
          return {
            ...prevState,
            lastResult: submission.reply({
              formErrors: error.errors.map(({ message }) => message),
            }),
          };
        }

        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const deletedItem = submission.value;

      return {
        lineItems: prevState.lineItems.filter((item) => item.id !== deletedItem.id),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
