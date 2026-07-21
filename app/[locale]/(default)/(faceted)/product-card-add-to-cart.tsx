'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { z } from 'zod';

import { Link } from '~/components/link';
import { addToOrCreateCart } from '~/lib/cart';

const schema = z.object({ id: z.string() });

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
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
    await addToOrCreateCart({
      lineItems: [{ productEntityId: Number(submission.value.id), quantity: 1 }],
    });

    return {
      lastResult: submission.reply(),
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
