'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { z } from 'zod';

import { type CartDrawerData } from '@/vibes/soul/primitives/cart-drawer/store';
import { Link } from '~/components/link';
import { addToOrCreateCart } from '~/lib/cart';
import { getCartDrawerSummary } from '~/lib/cart/drawer-summary';

// `option` carries a swatch chosen on the card as "optionId:valueId".
const schema = z.object({
  id: z.string(),
  option: z
    .string()
    .regex(/^\d+:\d+$/)
    .optional(),
});

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
  // The cart after the add, for the "added to cart" drawer (falls back to the toast when null).
  cartDrawer?: CartDrawerData | null;
}

/**
 * Direct add-to-cart for product cards (the icon-only CTA on no-option products). Reuses the same
 * addToOrCreateCart flow as the compare/PDP add-to-cart. Products with required options never use
 * this — their card CTA links to the PDP instead.
 */
export const productCardAddToCartAction = async (
  _prevState: State,
  payload: FormData,
): Promise<State> => {
  const t = await getTranslations('Compare');
  const submission = parseWithZod(payload, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  try {
    const [optionEntityId, optionValueEntityId] = submission.value.option
      ? submission.value.option.split(':').map(Number)
      : [];
    const selectedOptions =
      optionEntityId != null && optionValueEntityId != null
        ? { multipleChoices: [{ optionEntityId, optionValueEntityId }] }
        : undefined;

    await addToOrCreateCart({
      lineItems: [{ productEntityId: Number(submission.value.id), quantity: 1, selectedOptions }],
    });

    return {
      lastResult: submission.reply(),
      cartDrawer: await getCartDrawerSummary(Number(submission.value.id)).catch(() => null),
      successMessage: t.rich('successMessage', {
        cartItems: 1,
        cartLink: (chunks) => (
          <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
            {chunks}
          </Link>
        ),
      }),
    };
  } catch {
    return { lastResult: submission.reply({ formErrors: [t('unknownError')] }) };
  }
};
