'use client';

import { clsx } from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useOptimistic } from 'react';

import { Heart } from '@/vibes/soul/primitives/favorite/heart';
import { usePathname } from '~/i18n/routing';

/** Where a product sits for this customer: `itemId` present means it is saved already. */
export interface CardWishlistState {
  wishlistId: number;
  itemId?: number;
}

/** Everything the customer has saved, keyed by product id, plus the list a new save goes to. */
export interface CardSavedItems {
  defaultWishlistId: number;
  items: Record<string, CardWishlistState>;
}

export type ProductCardWishlistAction = (formData: FormData) => Promise<void>;

interface Props {
  productId: number;
  action: ProductCardWishlistAction;
  /** Undefined for guests (the action then sends them to sign in) or when nothing is saved yet. */
  wishlist?: CardWishlistState;
  className?: string;
  saveLabel?: string;
  savedLabel?: string;
}

// The heart on the card image. Hidden until the card is hovered on a mouse device, always shown
// on touch screens (no hover there) and whenever the product is saved. Posts a plain form to the
// wishlist action so it works before hydration; the heart fills at once and settles when the
// server answers.
export function WishlistHeart({
  productId,
  action,
  wishlist,
  className,
  saveLabel = 'Save to wish list',
  savedLabel = 'Saved to wish list',
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saved = wishlist?.itemId != null;
  const [shown, setShown] = useOptimistic(saved);
  const redirectTo = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname;
  const label = shown ? savedLabel : saveLabel;

  return (
    <form
      action={async (formData) => {
        setShown(!saved);
        await action(formData);
      }}
      className={clsx(
        'absolute z-10 transition-opacity duration-300',
        shown
          ? 'opacity-100'
          : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100',
        className,
      )}
    >
      <input name="productId" type="hidden" value={productId} />
      <input name="intent" type="hidden" value={saved ? 'remove' : 'add'} />
      <input name="wishlistId" type="hidden" value={wishlist?.wishlistId ?? 0} />
      {wishlist?.itemId != null && <input name="itemId" type="hidden" value={wishlist.itemId} />}
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <button
        aria-label={label}
        aria-pressed={shown}
        className={clsx(
          'flex size-[26px] items-center justify-center rounded-full border bg-white shadow-[0_2px_8px_rgb(0_0_0/0.12)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--favorite-focus,hsl(var(--primary)))]',
          // Saved: pale red ring, red heart. Not saved: grey ring, black heart, both turning red
          // on hover so the button answers before the click.
          shown
            ? 'border-[var(--favorite-on-border,#fcb6bb)] text-[var(--favorite-on-icon,var(--button-primary-background,#d90716))]'
            : 'border-contrast-100 text-foreground hover:border-[var(--favorite-on-border,#fcb6bb)] hover:text-[var(--favorite-on-icon,var(--button-primary-background,#d90716))]',
        )}
        type="submit"
      >
        {/* The shared heart is drawn at 20px; 0.7 brings it down with the smaller button. */}
        <span className="flex origin-center scale-[0.7]">
          <Heart filled={shown} title={label} />
        </span>
      </button>
    </form>
  );
}
