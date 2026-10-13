'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';

import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { type CartDrawerItem, closeCartDrawer, useCartDrawer } from './store';

export { openCartDrawer, closeCartDrawer, useCartDrawer } from './store';
export type { CartDrawerData, CartDrawerItem } from './store';

interface Props {
  cartHref?: string;
  checkoutHref?: string;
}

// The "added to cart" drawer: slides in from the right after any add-to-cart. Shows the item just
// added, the rest of the cart, the subtotal, and Checkout / View cart. Closes on X, overlay, Esc
// or "Continue shopping". Mounted once in the app providers; opened via openCartDrawer().
export function CartDrawer({ cartHref = '/cart', checkoutHref = '/checkout' }: Props) {
  const data = useCartDrawer();
  const others = data?.items.filter((item) => item.id !== data.added.id) ?? [];

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (!open) closeCartDrawer();
      }}
      open={data != null}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[26rem] max-w-full flex-col bg-white shadow-2xl duration-300 @container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        >
          <div className="flex items-center justify-between gap-3 border-b border-contrast-100 px-6 py-5">
            <Dialog.Title className="flex items-center gap-2 font-heading text-lg font-bold">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#16A34A] text-white">
                <Check aria-hidden size={14} strokeWidth={3} />
              </span>
              Added to your cart
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="-mr-2 flex size-9 items-center justify-center rounded-full text-contrast-500 transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                type="button"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          {data != null && (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <ItemRow highlight item={data.added} />
                {others.length > 0 && (
                  <>
                    <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-contrast-500">
                      Also in your cart
                    </p>
                    <ul className="divide-y divide-contrast-100">
                      {others.map((item) => (
                        <li className="py-3" key={item.id}>
                          <ItemRow compact item={item} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="border-t border-contrast-100 px-6 py-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-sm text-contrast-500">
                    Subtotal · {data.totalQuantity} {data.totalQuantity === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-heading text-lg font-bold">{data.subtotal}</span>
                </div>
                <div className="grid gap-2">
                  {/* /checkout is a route handler that redirects to the hosted checkout, so it's a
                      full navigation rather than a client-side one. */}
                  <Button
                    className="w-full"
                    onClick={() => window.location.assign(checkoutHref)}
                    size="medium"
                    type="button"
                  >
                    Checkout
                  </Button>
                  <ButtonLink
                    className="w-full !border-foreground !bg-white !text-foreground after:!bg-foreground hover:!text-white"
                    href={cartHref}
                    onClick={closeCartDrawer}
                    size="medium"
                    variant="tertiary"
                  >
                    View cart
                  </ButtonLink>
                </div>
                <Dialog.Close asChild>
                  <button
                    className="mt-3 w-full text-center text-sm text-contrast-500 underline-offset-4 hover:text-foreground hover:underline"
                    type="button"
                  >
                    Continue shopping
                  </button>
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ItemRow({
  item,
  highlight = false,
  compact = false,
}: {
  item: CartDrawerItem;
  highlight?: boolean;
  compact?: boolean;
}) {
  const name = item.href ? (
    <Link
      className="hover:text-[var(--button-primary-background,#d90716)]"
      href={item.href}
      onClick={closeCartDrawer}
    >
      {item.name}
    </Link>
  ) : (
    item.name
  );

  return (
    <div className="flex gap-4">
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border border-contrast-100 bg-white ${compact ? 'size-14' : 'size-20'}`}
      >
        {item.image != null && (
          <Image
            alt={item.image.alt}
            className="object-contain p-1"
            fill
            sizes="80px"
            src={item.image.src}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {Boolean(item.brand) && !compact && (
          <p className="text-xs text-contrast-500">{item.brand}</p>
        )}
        <p className={`line-clamp-2 font-semibold ${compact ? 'text-sm' : 'text-base'}`}>{name}</p>
        {item.options.length > 0 && !compact && (
          <p className="mt-0.5 text-xs text-contrast-500">{item.options.join(' · ')}</p>
        )}
        <p className={`mt-1 text-contrast-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          Qty {item.quantity} · <span className="font-semibold text-foreground">{item.price}</span>
          {highlight && item.quantity > 1 && ' each'}
        </p>
      </div>
    </div>
  );
}
