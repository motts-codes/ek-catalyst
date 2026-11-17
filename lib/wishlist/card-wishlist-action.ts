'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import {
  CreateWishlistMutation,
  DeleteWishlistItemsMutation,
} from '~/app/[locale]/(default)/account/wishlists/_actions/mutation';
import { getSessionCustomerAccessToken } from '~/auth';
import { buildConfig } from '~/build-config/reader';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { redirect } from '~/i18n/routing';
import { serverToast } from '~/lib/server-toast';

// The product-card heart. One click saves the product to the customer's first wish list (created
// on the first save) or removes it again; guests are sent to sign in and come back to the same
// listing. No variant is recorded: the card has no chosen options.
const AddCardWishlistItemMutation = graphql(`
  mutation AddCardWishlistItemMutation($wishlistId: Int!, $productId: Int!) {
    wishlist {
      addWishlistItems(input: { entityId: $wishlistId, items: [{ productEntityId: $productId }] }) {
        result {
          entityId
        }
      }
    }
  }
`);

const schema = z.object({
  productId: z.coerce.number().int().positive(),
  intent: z.enum(['add', 'remove']),
  wishlistId: z.coerce.number().int().nonnegative(),
  itemId: z.coerce.number().int().positive().optional(),
  redirectTo: z.string(),
});

function loginHref(redirectTo: string) {
  const url = new URL(redirectTo, buildConfig.get('urls').vanityUrl);
  const params = new URLSearchParams({ redirectTo: url.pathname + url.search });

  return `/login?${params.toString()}`;
}

export async function cardWishlistAction(formData: FormData): Promise<void> {
  const locale = await getLocale();
  const t = await getTranslations('Wishlist');
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    await serverToast.error(t('Errors.unexpected'));

    return;
  }

  const { productId, intent, wishlistId, itemId, redirectTo } = parsed.data;
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    redirect({ href: loginHref(redirectTo), locale });

    return;
  }

  const fetchOptions = { cache: 'no-store' } as const;

  try {
    if (intent === 'remove') {
      if (itemId == null) throw new Error('itemId is required to remove a wish list item');

      await client.fetch({
        document: DeleteWishlistItemsMutation,
        variables: { wishlistId, itemIds: [itemId] },
        customerAccessToken,
        fetchOptions,
      });
      await serverToast.success(t('Button.removeSuccessMessage'));
    } else if (wishlistId === 0) {
      await client.fetch({
        document: CreateWishlistMutation,
        variables: {
          input: {
            name: t('Button.defaultWishlistName'),
            isPublic: false,
            items: [{ productEntityId: productId }],
          },
        },
        customerAccessToken,
        fetchOptions,
      });
      await serverToast.success(t('Button.addSuccessMessage'));
    } else {
      await client.fetch({
        document: AddCardWishlistItemMutation,
        variables: { wishlistId, productId },
        customerAccessToken,
        fetchOptions,
      });
      await serverToast.success(t('Button.addSuccessMessage'));
    }

    revalidateTag(TAGS.customer, { expire: 0 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError && error.message.includes('Please sign in')) {
      redirect({ href: loginHref(redirectTo), locale });

      return;
    }

    await serverToast.error(t('Errors.unexpected'));
  }
}
