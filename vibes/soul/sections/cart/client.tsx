'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight, GiftIcon, Minus, Plus, Trash2 } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { toast } from '@/vibes/soul/primitives/toaster';
import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import {
  GiftCertificateCodeForm,
  GiftCertificateCodeFormState,
} from '@/vibes/soul/sections/cart/gift-certificate-code-form';
import { StickySidebarLayout } from '@/vibes/soul/sections/sticky-sidebar-layout';
import { useEvents } from '~/components/analytics/events';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { useRouter } from '~/i18n/routing';

import { CouponCodeForm, CouponCodeFormState } from './coupon-code-form';
import { cartLineItemActionFormDataSchema } from './schema';
import { ShippingForm, ShippingFormState } from './shipping-form';

import { CartEmptyState } from '.';

// Desktop columns: image, details, price, quantity (with remove), line total.
const GRID_ROW = '@xl:grid @xl:grid-cols-[4rem_minmax(0,1fr)_5.5rem_9rem_6rem] @xl:gap-x-4';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface CartLineIteminventoryMessages {
  outOfStockMessage?: string;
  quantityReadyToShipMessage?: string;
  quantityBackorderedMessage?: string;
  quantityOutOfStockMessage?: string;
  backorderMessage?: string;
}

export interface CartLineItem {
  typename: string;
  id: string;
  title: string;
  image?: { alt: string; src: string };
  subtitle: string;
  /** Shown as a small "SKU …" line under the options, when the product has one. */
  sku?: string;
  /** quantity × price, shown on desktop next to the counter. */
  lineTotal?: string;
  /** Product page link with the current options pre-selected, to change size/colour in place. */
  changeHref?: string;
  quantity: number;
  price: Price;
  href?: string;
  inventoryMessages?: CartLineIteminventoryMessages;
}

export interface CartGiftCertificateLineItem extends CartLineItem {
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  message?: string;
}

export interface CartSummaryItem {
  label: string;
  value: string;
}

export interface CartState<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}

export interface Cart<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  summaryItems: CartSummaryItem[];
  /** Shown under the shipping block rather than among summaryItems. */
  tax?: CartSummaryItem;
  total: string;
  totalLabel?: string;
  totalSubtitle?: string;
}

interface CouponCode {
  action: Action<CouponCodeFormState, FormData>;
  couponCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

interface GiftCertificate {
  action: Action<GiftCertificateCodeFormState, FormData>;
  giftCertificateCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

interface ShippingOption {
  label: string;
  value: string;
  price: string;
}

interface Address {
  country: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface Shipping {
  action: Action<ShippingFormState, FormData>;
  address?: Address;
  shippingOptions?: ShippingOption[];
  shippingOption?: ShippingOption;
  shippingLabel?: string;
  addLabel?: string;
  changeLabel?: string;
  postalCodeLabel?: string;
  postalCodeHint?: string;
  estimateNote?: string;
  /** The visitor's remembered ZIP, to pre-fill the field. */
  defaultPostalCode?: string;
  updateShippingOptionsLabel?: string;
  viewShippingOptionsLabel?: string;
  cancelLabel?: string;
  editAddressLabel?: string;
  shippingOptionsLabel?: string;
  updateShippingLabel?: string;
  addShippingLabel?: string;
  showShippingForm?: boolean;
  noShippingOptionsLabel?: string;
}

export interface CartProps<LineItem extends CartLineItem> {
  title?: string;
  summaryTitle?: string;
  emptyState?: CartEmptyState;
  lineItemAction: Action<CartState<LineItem>, FormData>;
  checkoutAction: Action<SubmissionResult | null, FormData> | string;
  checkoutLabel?: string;
  deleteLineItemLabel?: string;
  decrementLineItemLabel?: string;
  incrementLineItemLabel?: string;
  /** Accessible name of the typed quantity box ("Quantity"). */
  quantityLabel?: string;
  cart: Cart<LineItem>;
  couponCode?: CouponCode;
  giftCertificate?: GiftCertificate;
  /** Heading over the coupon / gift certificate card. */
  offersLabel?: string;
  changeOptionsLabel?: string;
  /** Home › Cart trail above the page. */
  breadcrumbs?: Breadcrumb[];
  /** "item" / "items" for the heading count. */
  itemLabels?: { one: string; other: string };
  /** Desktop column headings over the line items. */
  columnLabels?: { details: string; price: string; quantity: string; total: string };
  shipping?: Shipping;
  lineItemActionPendingLabel?: string;
  // Puts a removed line back (the "Undo" in the removal toast): receives the line item object as
  // given in `cart.lineItems`. Without it, no undo is offered.
  restoreLineItemAction?: (lineItem: unknown) => Promise<{ error?: string }>;
  removedLabel?: string;
  undoLabel?: string;
}

const defaultEmptyState = {
  title: 'Your cart is empty',
  subtitle: 'Add some products to get started.',
  cta: { label: 'Continue shopping', href: '#' },
};

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --cart-focus: hsl(var(--primary));
 *   --cart-font-family: var(--font-family-body);
 *   --cart-title-font-family: var(--font-family-heading);
 *   --cart-text: hsl(var(--foreground));
 *   --cart-subtitle-text: hsl(var(--contrast-500));
 *   --cart-subtext-text: hsl(var(--contrast-300));
 *   --cart-icon: hsl(var(--contrast-300));
 *   --cart-icon-hover: hsl(var(--foreground));
 *   --cart-border: hsl(var(--contrast-100));
 *   --cart-summary-background: #fbf5ea;
 *   --cart-image-background: hsl(var(--contrast-100));
 *   --cart-button-background: hsl(var(--contrast-100));
 *   --cart-counter-icon: hsl(var(--contrast-300));
 *   --cart-counter-icon-hover: hsl(var(--foreground));
 *   --cart-counter-background: hsl(var(--background));
 *   --cart-counter-background-hover: hsl(var(--contast-100) / 50%);
 * }
 * ```
 */
export function CartClient<LineItem extends CartLineItem>({
  title,
  cart,
  couponCode,
  giftCertificate,
  offersLabel = 'Offers & rewards',
  changeOptionsLabel = 'Change options',
  breadcrumbs,
  itemLabels = { one: 'item', other: 'items' },
  columnLabels = { details: 'Product details', price: 'Price', quantity: 'Qty', total: 'Total' },
  decrementLineItemLabel,
  incrementLineItemLabel,
  quantityLabel,
  deleteLineItemLabel,
  lineItemAction,
  lineItemActionPendingLabel = 'You have a cart update in progress. Are you sure you want to leave this page? Your changes may be lost.',
  checkoutAction,
  checkoutLabel = 'Checkout',
  emptyState = defaultEmptyState,
  summaryTitle,
  shipping,
  restoreLineItemAction,
  removedLabel = 'removed from your cart.',
  undoLabel = 'Undo',
}: CartProps<LineItem>) {
  const events = useEvents();
  const router = useRouter();

  // No "are you sure?" on remove: the line goes straight away and a toast offers Undo for a few
  // seconds. Raised at the click (the cart remounts under a new version once the action lands,
  // so an effect would never see it). Undo re-adds the line and refreshes the page.
  const toastRemoved = (lineItem: CartLineItem) => {
    toast.success(`${lineItem.title} ${removedLabel}`, {
      duration: 8000,
      action:
        restoreLineItemAction == null
          ? undefined
          : {
              label: undoLabel,
              onClick: () => {
                startTransition(async () => {
                  const result = await restoreLineItemAction(lineItem);

                  if (result.error) toast.error(result.error);
                  else router.refresh();
                });
              },
            },
    });
  };
  const [state, formAction, isLineItemActionPending] = useActionState(lineItemAction, {
    lineItems: cart.lineItems,
    lastResult: null,
  });

  const [form] = useForm({ lastResult: state.lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  // Prevent page unload when line item action is pending
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLineItemActionPending) {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        event.returnValue = ''; // Chrome requires returnValue to be set

        return ''; // For older browsers
      }
    };

    if (isLineItemActionPending) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLineItemActionPending]);

  // Prevent client-side navigation when line item action is pending
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isLineItemActionPending && event.target instanceof HTMLElement) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (!shouldNavigate) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isLineItemActionPending &&
        (event.key === 'Enter' || event.key === ' ') &&
        event.target instanceof HTMLElement
      ) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (!shouldNavigate) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    if (isLineItemActionPending) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isLineItemActionPending, lineItemActionPendingLabel]);

  const [optimisticLineItems, setOptimisticLineItems] = useOptimistic<CartLineItem[], FormData>(
    state.lineItems,
    (prevState, formData) => {
      const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'increment': {
          const { id } = submission.value;

          return prevState.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }

        case 'decrement': {
          const { id } = submission.value;

          return prevState.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
          );
        }

        case 'set': {
          const { id, quantity } = submission.value;

          return prevState.map((item) => (item.id === id ? { ...item, quantity } : item));
        }

        case 'delete': {
          const { id } = submission.value;

          return prevState.filter((item) => item.id !== id);
        }

        default:
          return prevState;
      }
    },
  );

  const optimisticQuantity = useMemo(
    () => optimisticLineItems.reduce((total, item) => total + item.quantity, 0),
    [optimisticLineItems],
  );

  if (optimisticQuantity === 0) {
    return <CartEmptyState {...emptyState} />;
  }

  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <div className="@container">
          <div className="mx-auto max-w-[var(--section-max-width-2xl,1536px)] px-4 pt-6 @xl:px-6 @xl:pt-8 @4xl:px-8">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>
      ) : null}
      <StickySidebarLayout
        // Extra room under the cart so it doesn't run straight into the newsletter band; light top
        // padding because the breadcrumbs sit just above.
        className="pb-16 font-[family-name:var(--cart-font-family,var(--font-family-body))] text-[var(--cart-text,hsl(var(--foreground)))] @xl:pb-40 @4xl:pb-[250px] [&>div]:pt-4 [&>div]:@xl:pt-5"
        compact
        sidebar={
          // Cream card so the summary reads as its own panel; the rules inside pick up a warmer
          // tint through --cart-border so they still show on cream. Side by side, the card is
          // pulled up by its own padding so its title shares a baseline with the cart title.
          <div className="rounded-xl bg-[var(--cart-summary-background,#fbf5ea)] p-5 [--cart-border:#eadcc0] @xl:p-6 @4xl:-mt-6">
            <h2 className="mb-4 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-2xl font-semibold leading-none @xl:text-3xl">
              {summaryTitle}
            </h2>
            <dl aria-label="Receipt Summary" className="w-full">
              <div className="divide-y divide-[var(--cart-border,hsl(var(--contrast-100)))]">
                {cart.summaryItems.map((summaryItem, index) => (
                  // The first row (Subtotal) is the same height as the column-heading row on the
                  // left, so the rule under it continues the rule under the headings.
                  <div
                    className="flex justify-between py-2.5 text-sm first:pb-1.5 first:pt-0"
                    key={index}
                  >
                    <dt>{summaryItem.label}</dt>
                    {isLineItemActionPending ? (
                      <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
                    ) : (
                      <dd>{summaryItem.value}</dd>
                    )}
                  </div>
                ))}

                {shipping && (
                  <ShippingForm
                    {...shipping}
                    key={`${shipping.address?.postalCode ?? ''}-${shipping.shippingOption?.value ?? ''}`}
                  />
                )}

                {cart.tax && (
                  <div className="flex justify-between py-2.5 text-sm">
                    <dt>{cart.tax.label}</dt>
                    {isLineItemActionPending ? (
                      <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
                    ) : (
                      <dd>{cart.tax.value}</dd>
                    )}
                  </div>
                )}
              </div>
              {(couponCode ?? giftCertificate) && (
                <section
                  aria-label={offersLabel}
                  className="border-t border-[var(--cart-border,hsl(var(--contrast-100)))] py-3"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-contrast-500">
                    {offersLabel}
                  </h3>
                  <div className="mt-1 divide-y divide-[var(--cart-border,hsl(var(--contrast-100)))]">
                    {couponCode && (
                      <CouponCodeForm
                        action={couponCode.action}
                        couponCodes={couponCode.couponCodes}
                        ctaLabel={couponCode.ctaLabel}
                        disabled={couponCode.disabled}
                        label={couponCode.label}
                        placeholder={couponCode.placeholder}
                        removeLabel={couponCode.removeLabel}
                      />
                    )}
                    {giftCertificate && (
                      <GiftCertificateCodeForm
                        action={giftCertificate.action}
                        ctaLabel={giftCertificate.ctaLabel}
                        disabled={giftCertificate.disabled}
                        giftCertificateCodes={giftCertificate.giftCertificateCodes}
                        label={giftCertificate.label}
                        placeholder={giftCertificate.placeholder}
                        removeLabel={giftCertificate.removeLabel}
                      />
                    )}
                  </div>
                </section>
              )}
              <div className="border-t border-[var(--cart-border,hsl(var(--contrast-100)))] py-4">
                <div className="flex justify-between text-base font-bold">
                  <dt>{cart.totalLabel ?? 'Total'}</dt>
                  {isLineItemActionPending ? (
                    <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
                  ) : (
                    <dd>{cart.total}</dd>
                  )}
                </div>
                {cart.totalSubtitle != null && (
                  <div className="mt-1 flex justify-end text-sm font-normal opacity-70">
                    {cart.totalSubtitle}
                  </div>
                )}
              </div>
            </dl>
            <CheckoutButton
              action={checkoutAction}
              className="mt-3 w-full"
              isCartUpdatePending={isLineItemActionPending}
            >
              {checkoutLabel}
              <ArrowRight size={20} strokeWidth={1} />
            </CheckoutButton>
          </div>
        }
        sidebarPosition="after"
        sidebarSize="1/3"
      >
        <div className="w-full">
          <h1 className="mb-4 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-2xl font-semibold leading-none @xl:text-3xl">
            {title}:{' '}
            <span className="ml-2 font-normal text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
              {optimisticQuantity} {optimisticQuantity === 1 ? itemLabels.one : itemLabels.other}
            </span>
          </h1>
          {/* Cart Items. On desktop each row is a grid so the column headings line up. */}
          <div>
            <div
              aria-hidden
              className={clsx(
                'hidden border-b border-[var(--cart-border,hsl(var(--contrast-100)))] pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-contrast-500',
                GRID_ROW,
              )}
            >
              <span className="col-span-2">{columnLabels.details}</span>
              <span className="text-right">{columnLabels.price}</span>
              <span className="text-center">{columnLabels.quantity}</span>
              <span className="text-right">{columnLabels.total}</span>
            </div>
            <ul className="divide-y divide-[var(--cart-border,hsl(var(--contrast-100)))]">
              {optimisticLineItems.map((lineItem) => (
                <li
                  className={clsx(
                    'flex flex-col items-start gap-x-4 gap-y-3 py-4 @sm:flex-row @xl:items-center',
                    GRID_ROW,
                  )}
                  key={lineItem.id}
                >
                  <div className="relative aspect-square w-full max-w-16 overflow-hidden rounded-lg bg-[var(--cart-image-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4">
                    {lineItem.typename === 'CartGiftCertificate' ? (
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                        <GiftIcon className="h-full w-full text-[var(--cart-icon,hsl(var(--contrast-300)))]" />
                      </div>
                    ) : (
                      lineItem.image != null && (
                        <Image
                          alt={lineItem.image.alt}
                          className="object-cover"
                          fill
                          sizes="4rem"
                          src={lineItem.image.src}
                        />
                      )
                    )}
                  </div>
                  <div className="flex grow flex-col flex-wrap justify-between gap-y-1 @xl:contents">
                    <div className="flex w-full flex-1 flex-col @xl:min-w-0">
                      {lineItem.href ? (
                        <Link
                          className="self-start text-sm font-medium leading-snug underline-offset-2 transition-colors hover:text-[var(--button-primary-background,#d90716)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                          href={lineItem.href}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {lineItem.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium leading-snug">{lineItem.title}</span>
                      )}
                      <span className="text-sm text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                        {lineItem.subtitle}
                      </span>
                      {lineItem.sku ? (
                        <span className="mt-0.5 text-xs text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                          SKU {lineItem.sku}
                        </span>
                      ) : null}
                      {lineItem.changeHref ? (
                        <Link
                          className="mt-1 self-start text-xs font-semibold text-[var(--button-primary-background,#d90716)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                          href={lineItem.changeHref}
                        >
                          {changeOptionsLabel}
                        </Link>
                      ) : null}
                    </div>
                    <CounterForm
                      action={formAction}
                      decrementLabel={decrementLineItemLabel}
                      deleteLabel={deleteLineItemLabel}
                      incrementLabel={incrementLineItemLabel}
                      lineItem={lineItem}
                      onSubmit={(formData) => {
                        startTransition(() => {
                          formAction(formData);
                          setOptimisticLineItems(formData);

                          const intent = formData.get('intent');

                          if (intent === 'set') {
                            const next = Number(formData.get('quantity'));
                            const delta = next - lineItem.quantity;

                            formData.set('quantity', Math.abs(delta).toString());

                            if (delta > 0) events.onAddToCart?.(formData);
                            if (delta < 0) events.onRemoveFromCart?.(formData);
                          }

                          if (intent === 'increment') {
                            formData.set('quantity', '1');

                            events.onAddToCart?.(formData);
                          }

                          if (intent === 'decrement') {
                            formData.set('quantity', '1');

                            events.onRemoveFromCart?.(formData);
                          }

                          if (intent === 'delete') {
                            toastRemoved(lineItem);
                            formData.set('quantity', lineItem.quantity.toString());

                            events.onRemoveFromCart?.(formData);
                          }
                        });
                      }}
                      pending={isLineItemActionPending}
                      quantityLabel={quantityLabel}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </StickySidebarLayout>
    </>
  );
}

// How long the counter waits after the last click or keystroke before it sends the new quantity.
const QUANTITY_SETTLE_MS = 500;

function CounterForm({
  lineItem,
  action,
  onSubmit,
  pending,
  incrementLabel = 'Increase count',
  decrementLabel = 'Decrease count',
  deleteLabel = 'Remove item',
  quantityLabel = 'Quantity',
}: {
  lineItem: CartLineItem;
  incrementLabel?: string;
  decrementLabel?: string;
  deleteLabel?: string;
  quantityLabel?: string;
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
  /** A cart update is in flight (the draft is not re-synced from the line until it lands). */
  pending: boolean;
}) {
  // The quantity shown in the box. +/- and typing change it at once; the cart is updated once
  // the visitor pauses (one request for a burst of clicks), or when the box loses focus / Enter
  // is pressed. `dirty` marks a draft the cart has not been told about yet.
  const [draft, setDraftState] = useState(String(lineItem.quantity));
  // The draft as of the last change, for clicks that land before React re-renders (a quick
  // triple-click must count three, not one).
  const draftRef = useRef(draft);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setDraft = (value: string) => {
    draftRef.current = value;
    setDraftState(value);
  };

  useEffect(() => {
    if (!dirty.current && !pending) {
      draftRef.current = String(lineItem.quantity);
      setDraftState(draftRef.current);
    }
  }, [lineItem.quantity, pending]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = () => {
    clearTimeout(timer.current);
    dirty.current = false;

    const next = Number.parseInt(draftRef.current, 10);

    // Blank or nonsense: back to what the cart has.
    if (!Number.isInteger(next) || next < 1) {
      setDraft(String(lineItem.quantity));

      return;
    }

    if (next === lineItem.quantity) return;

    const formData = new FormData();

    formData.set('id', lineItem.id);
    formData.set('intent', 'set');
    formData.set('quantity', String(next));
    onSubmit(formData);
  };

  // Latest draft for the settle timer (the closure above reads `draft` from its own render).
  const commitRef = useRef(commit);

  commitRef.current = commit;

  const change = (value: string, settleMs = QUANTITY_SETTLE_MS) => {
    dirty.current = true;
    setDraft(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commitRef.current(), settleMs);
  };

  // The quantity the +/- buttons step from: the draft when it is a number, else the line's.
  const currentOf = () => {
    const shown = Number.parseInt(draftRef.current, 10);

    return Number.isInteger(shown) && shown >= 1 ? shown : lineItem.quantity;
  };
  const current = currentOf();

  const [form, fields] = useForm({
    defaultValue: { id: lineItem.id },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      onSubmit(formData);
    },
  });

  if (lineItem.typename === 'CartGiftCertificate') {
    return (
      <form {...getFormProps(form)} action={action} className="@xl:contents">
        <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
        <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 @xl:contents">
          {typeof lineItem.price === 'string' && (
            <span className="font-medium @xl:ml-auto">{lineItem.price}</span>
          )}

          <span className="flex flex-1 select-none justify-center px-14 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]">
            {lineItem.quantity}
          </span>

          <button
            aria-label={deleteLabel}
            className="group -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
            name="intent"
            type="submit"
            value="delete"
          >
            <Trash2
              className="text-[var(--cart-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
              size={20}
              strokeWidth={1}
            />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form {...getFormProps(form)} action={action} className="@xl:contents">
      <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 @xl:contents">
        <PriceLabel
          className="mt-1.5 self-start text-sm @xl:mt-0 @xl:self-center @xl:text-right"
          price={lineItem.price}
        />
        <div className="flex size-min flex-col gap-y-0 @xl:mx-auto">
          <div className="flex items-center gap-x-3">
            {/* Counter */}
            <div
              className={clsx(
                'flex items-center rounded-lg border border-[var(--cart-counter-border,hsl(var(--contrast-100)))]',
                (lineItem.inventoryMessages?.outOfStockMessage != null ||
                  lineItem.inventoryMessages?.quantityOutOfStockMessage != null) &&
                  'border-red-500',
              )}
            >
              <button
                aria-label={decrementLabel}
                className={clsx(
                  'group rounded-l-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
                  current === 1
                    ? 'opacity-50'
                    : 'hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))]',
                )}
                disabled={current === 1}
                onClick={() => change(String(Math.max(1, currentOf() - 1)))}
                type="button"
              >
                <Minus
                  className={clsx(
                    'text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300',
                    current !== 1 &&
                      'group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]',
                  )}
                  size={16}
                  strokeWidth={1.5}
                />
              </button>
              <input
                aria-label={quantityLabel}
                className="w-10 border-0 bg-transparent p-0 text-center text-sm tabular-nums [appearance:textfield] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                inputMode="numeric"
                max={999}
                min={1}
                onBlur={commit}
                onChange={(event) => change(event.target.value, 900)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commit();
                  }
                }}
                type="number"
                value={draft}
              />
              <button
                aria-label={incrementLabel}
                className={clsx(
                  'group rounded-r-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-2 transition-colors duration-300 hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
                )}
                onClick={() => change(String(Math.min(999, currentOf() + 1)))}
                type="button"
              >
                <Plus
                  className="text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300 group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]"
                  size={16}
                  strokeWidth={1.5}
                />
              </button>
            </div>
            <button
              aria-label={deleteLabel}
              className="group -ml-1 flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
              name="intent"
              type="submit"
              value="delete"
            >
              <Trash2
                className="text-[var(--cart-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
                size={18}
                strokeWidth={1}
              />
            </button>
          </div>
          {lineItem.inventoryMessages?.outOfStockMessage != null && (
            <span className="text-xs/5 font-light text-red-500">
              {lineItem.inventoryMessages.outOfStockMessage}
            </span>
          )}
          {lineItem.inventoryMessages?.quantityOutOfStockMessage != null && (
            <span className="mb-3 text-xs/5 font-light text-red-500">
              {lineItem.inventoryMessages.quantityOutOfStockMessage}
            </span>
          )}
          {lineItem.inventoryMessages?.quantityReadyToShipMessage != null && (
            <span className="text-xs/5 font-light">
              {lineItem.inventoryMessages.quantityReadyToShipMessage}
            </span>
          )}
          {lineItem.inventoryMessages?.quantityBackorderedMessage != null && (
            <span className="text-xs/5 font-light">
              {lineItem.inventoryMessages.quantityBackorderedMessage}
            </span>
          )}
          {lineItem.inventoryMessages?.backorderMessage != null && (
            <span className="text-xs/5 font-light">
              {lineItem.inventoryMessages.backorderMessage}
            </span>
          )}
        </div>
        {lineItem.lineTotal ? (
          <span className="hidden text-right text-sm font-semibold tabular-nums @xl:block">
            {lineItem.lineTotal}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function CheckoutButton({
  action,
  isCartUpdatePending,
  ...props
}: {
  action: Action<SubmissionResult | null, FormData> | string;
  isCartUpdatePending: boolean;
} & ComponentPropsWithoutRef<typeof Button>) {
  const [lastResult, formAction] = useActionState(
    async (state: SubmissionResult | null, formData: FormData) => {
      if (typeof action === 'string') {
        await new Promise<void>(() => {
          window.location.assign(action);
        });

        return null;
      }

      return action(state, formData);
    },
    null,
  );

  const [form] = useForm({ lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  return (
    <form action={formAction}>
      <SubmitButton {...props} isCartUpdatePending={isCartUpdatePending} />
    </form>
  );
}

function SubmitButton({
  isCartUpdatePending,
  ...props
}: { isCartUpdatePending: boolean } & ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      disabled={pending || isCartUpdatePending}
      loading={pending || isCartUpdatePending}
      type="submit"
    />
  );
}
