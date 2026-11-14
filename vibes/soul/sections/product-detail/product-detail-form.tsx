'use client';

import {
  FieldMetadata,
  FormProvider,
  FormStateInput,
  getFormProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { CircleDollarSign, Drill, LucideIcon, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createSerializer, parseAsString, useQueryStates } from 'nuqs';
import {
  ReactNode,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { DatePicker } from '@/vibes/soul/form/date-picker';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Label } from '@/vibes/soul/form/label';
import { RequiredMarks } from '@/vibes/soul/form/label/required-marks';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Select } from '@/vibes/soul/form/select';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Textarea } from '@/vibes/soul/form/textarea';
import { animatedUnderlineClassName } from '@/vibes/soul/primitives/animated-underline';
import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { type CartDrawerData, openCartDrawer } from '@/vibes/soul/primitives/cart-drawer/store';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useEvents } from '~/components/analytics/events';
import { Link } from '~/components/link';
import { usePathname, useRouter } from '~/i18n/routing';

import { revalidateCart } from './actions/revalidate-cart';
import { FulfillmentIcon } from './fulfillment-icon';
import { Field, schema, SchemaRawShape } from './schema';

// Trust/service reassurances shown under the purchase panel. Each is a link to its policy page
// (hrefs are '#' placeholders for now). Icons are the supplied brand SVGs, which keep their own
// colors (the white background rect from each source file is dropped). Order: pickup, secure,
// price match, returns.
// `href` undefined → plain text (no page to send people to, e.g. installation).
// Lucide icons (same set as the cart / header), 1.5 stroke so they sit quietly next to 12px text.
const trustIcon = (Icon: LucideIcon) => <Icon aria-hidden size={15} strokeWidth={1.5} />;

const TRUST_ITEMS: Array<{ label: string; href?: string; icon: ReactNode }> = [
  { label: 'Shipping policy', href: '/shipping-policy', icon: trustIcon(Truck) },
  { label: 'Secure Transaction', href: '/secure-shopping', icon: trustIcon(ShieldCheck) },
  { label: 'Installation, Not Included', icon: trustIcon(Drill) },
  {
    label: 'Price Match Guarantee',
    href: '/price-match-guarantee',
    icon: trustIcon(CircleDollarSign),
  },
  { label: 'Returns Policy', href: '/returns-policy', icon: trustIcon(RotateCcw) },
];

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State<F extends Field> {
  fields: F[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
  // The cart after the add, for the "added to cart" drawer (falls back to the toast when null).
  cartDrawer?: CartDrawerData | null;
}

export type ProductDetailFormAction<F extends Field> = Action<State<F>, FormData>;

export interface StockDisplayData {
  stockLevelMessage?: string | null;
  backorderAvailabilityPrompt?: string | null;
}

export interface BackorderDisplayData {
  availableOnHand: number;
  availableForBackorder: number;
  unlimitedBackorder: boolean;
  showQuantityOnBackorder: boolean;
  backorderMessage: string | null;
}

// Quote-only mode (countertops): where "Request a quote" and the phone link go.
export interface QuoteActions {
  quoteHref: string;
  phoneHref: string;
  phoneLabel: string;
}

export interface ProductDetailFormProps<F extends Field> {
  fields: F[];
  action: ProductDetailFormAction<F>;
  productId: string;
  // Rendered in the left cell above the variant options, inside the form, so the purchase panel
  // (right cell) sits alongside the product name/price from the top of the column.
  header?: ReactNode;
  // Rendered as its own grid item under the left column on desktop (via col-start-1), but placed
  // AFTER the purchase panel in DOM order so it doesn't push add-to-cart down on mobile.
  descriptionSlot?: ReactNode;
  ctaLabel?: string;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  emptySelectPlaceholder?: string;
  ctaDisabled?: boolean;
  prefetch?: boolean;
  additionalActions?: ReactNode;
  minQuantity?: number;
  maxQuantity?: number;
  stockDisplayData?: StockDisplayData;
  backorderDisplayData?: BackorderDisplayData;
  // Option-value entityId -> co-occurring option-value entityIds. When present, the Height
  // options are filtered to those valid for the selected Width (and vice versa).
  optionDependencyMap?: Record<number, number[]>;
  // Delivery/pickup message (__fulfillment). When set, a grey box with a delivery icon is shown
  // below the purchase panel.
  fulfillmentMessage?: string;
  // First trust-block row label (__delivery custom field, e.g. "Same Day Pickup"). Falls back to
  // the default label when absent.
  deliveryMessage?: string;
  // Variant-aware stock badge above the quantity: 'in' -> green "In stock", { low: N } -> dark red
  // "Only N in stock" (1–4 available), 'out' -> red "Out of stock". Consistent with the CTA.
  stockStatus?: 'in' | 'out' | { low: number };
  // When set, the form shows no options, quantity, cart buttons or trust block: just the header,
  // the two quote buttons and the description, full width.
  quoteOnly?: QuoteActions;
  // Cart line being edited: posted as a hidden field so the action replaces it instead of adding.
  editLineItemId?: string;
  defaultQuantity?: number;
}

// The quantity the form opens on: the cart line's when editing, else the product minimum.
function initialQuantity(defaultQuantity?: number, minQuantity?: number): number {
  return defaultQuantity ?? minQuantity ?? 1;
}

// Hidden cart-line id when the visitor came from "Change options" in the cart.
function EditLineField({ id }: { id?: string }) {
  if (!id) return null;

  return <input name="editLine" type="hidden" value={id} />;
}

export function ProductDetailForm<F extends Field>({
  action,
  fields,
  productId,
  header,
  descriptionSlot,
  ctaLabel = 'Add to cart',
  quantityLabel = 'Quantity',
  incrementLabel = 'Increase quantity',
  decrementLabel = 'Decrease quantity',
  emptySelectPlaceholder = 'Select an option',
  ctaDisabled = false,
  prefetch = false,
  additionalActions,
  minQuantity,
  maxQuantity,
  stockDisplayData,
  backorderDisplayData,
  optionDependencyMap,
  fulfillmentMessage,
  deliveryMessage,
  stockStatus,
  quoteOnly,
  editLineItemId,
  defaultQuantity,
}: ProductDetailFormProps<F>) {
  const router = useRouter();
  const pathname = usePathname();
  const events = useEvents();
  const t = useTranslations('Product.ProductDetails');

  const searchParams = fields.reduce<Record<string, typeof parseAsString>>((acc, field) => {
    return field.persist === true ? { ...acc, [field.name]: parseAsString } : acc;
  }, {});

  const [params] = useQueryStates(searchParams, { shallow: false });

  // A required option the shopper hasn't picked yet (e.g. Width / Height on windows). Until every
  // one is chosen there's no specific variant, so the stock badge would be reporting the whole
  // product's aggregate — showing "In stock" before any choice is made. We show a prompt instead.
  // Only persisted fields are product options (they round-trip through the URL); `quantity` and
  // other non-persisted inputs are also `required` but aren't variant selections.
  const unselectedRequiredOptions = fields.filter(
    (field) =>
      field.persist === true &&
      field.required === true &&
      field.type !== 'checkbox' &&
      (params[field.name] ?? field.defaultValue ?? '') === '',
  );
  const hasUnselectedRequiredOption = unselectedRequiredOptions.length > 0;
  // "Select finish for availability" / "Select size…": name what's still to choose. Width and
  // Height (windows, cabinets) read as "size"; several different options read as "options".
  const unselectedLabel = (() => {
    const names = unselectedRequiredOptions.map((field) => field.label.trim());

    if (names.every((name) => /\b(width|height|size|length|depth)\b/i.test(name))) return 'size';
    if (names.length === 1 && names[0] != null && names[0].length <= 14)
      return names[0].toLowerCase();

    return 'options';
  })();

  const onPrefetch = (fieldName: string, value: string) => {
    if (prefetch) {
      const serialize = createSerializer(searchParams);

      const newUrl = serialize(pathname, { ...params, [fieldName]: value });

      router.prefetch(newUrl);
    }
  };

  const defaultValue = fields.reduce<{
    [Key in keyof SchemaRawShape]?: z.infer<SchemaRawShape[Key]>;
  }>(
    (acc, field) => {
      // Checkbox field has to be handled separately because we want to convert checked or unchecked value to true or undefined respectively.
      // This is because the form expects a boolean value, but we want to store the checked or unchecked value in the query params.
      if (field.type === 'checkbox') {
        if (params[field.name] === field.checkedValue) {
          return {
            ...acc,
            [field.name]: 'true',
          };
        }

        if (params[field.name] === field.uncheckedValue) {
          return {
            ...acc,
            [field.name]: undefined,
          };
        }

        return {
          ...acc,
          [field.name]: field.defaultValue, // Default value is either 'true' or undefined
        };
      }

      return {
        ...acc,
        [field.name]: params[field.name] ?? field.defaultValue,
      };
    },
    { quantity: initialQuantity(defaultQuantity, minQuantity) },
  );

  const [{ lastResult, successMessage, cartDrawer }, formAction] = useActionState(action, {
    fields,
    lastResult: null,
  });

  // Set when the "Buy now" button submits (vs. plain "Add to cart"), so the shared success handler
  // knows to send the shopper to checkout after the item is added. Uses the same form/validation
  // path as Add to cart, so an unselected required option blocks buy-now too.
  const buyNowRef = useRef(false);

  useEffect(() => {
    if (lastResult?.status === 'success') {
      const isBuyNow = buyNowRef.current;

      buyNowRef.current = false;

      if (isBuyNow) {
        startTransition(async () => {
          await revalidateCart();
          // `/checkout` is a route handler that mints a BigCommerce hosted-checkout redirect, so
          // use a full browser navigation rather than the client router.
          window.location.assign('/checkout');
        });

        return;
      }

      // The drawer shows what was added; the toast is the fallback when the cart couldn't be read.
      if (cartDrawer) openCartDrawer(cartDrawer);
      else toast.success(successMessage);

      startTransition(async () => {
        // This is needed to refresh the Data Cache after the product has been added to the cart.
        // The cart id is not picked up after the first time the cart is created/updated.
        await revalidateCart();
      });
    }
  }, [lastResult, successMessage, cartDrawer, router]);

  const [form, formFields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema(fields, minQuantity, maxQuantity)),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema(fields, minQuantity, maxQuantity) });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);

        events.onAddToCart?.(formData);
      });
    },
    // @ts-expect-error: `defaultValue` types are conflicting with `onValidate`.
    defaultValue,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
  });

  const backorderMessages = useMemo(() => {
    const {
      availableForBackorder,
      availableOnHand,
      backorderMessage,
      showQuantityOnBackorder,
      unlimitedBackorder,
    } = backorderDisplayData || { availableForBackorder: 0, availableOnHand: 0 };

    if (!showQuantityOnBackorder && !backorderMessage) {
      return undefined;
    }

    const orderQuantity = Number(formFields.quantity.value);

    if (Number.isNaN(orderQuantity) || orderQuantity <= availableOnHand) {
      return {
        backorderQuantityMessage: undefined,
        backorderInfoMessage: undefined,
      };
    }

    if (!showQuantityOnBackorder) {
      return {
        backorderQuantityMessage: undefined,
        backorderInfoMessage: backorderMessage ?? undefined,
      };
    }

    return {
      backorderQuantityMessage: t('backorderQuantity', {
        quantity: unlimitedBackorder
          ? orderQuantity - availableOnHand
          : Math.min(orderQuantity - availableOnHand, availableForBackorder),
      }),
      backorderInfoMessage: backorderMessage ?? undefined,
    };
  }, [backorderDisplayData, formFields.quantity.value, t]);

  const quantityControl = useInputControl(formFields.quantity);

  if (quoteOnly != null) {
    return <QuoteOnlyPanel actions={quoteOnly} descriptionSlot={descriptionSlot} header={header} />;
  }

  return (
    <FormProvider context={form.context}>
      <FormStateInput />
      <form {...getFormProps(form)} action={formAction}>
        {/* Every option here is required, so the asterisks would be noise. */}
        <RequiredMarks show={false}>
          <input name="id" type="hidden" value={productId} />
          <EditLineField id={editLineItemId} />
          <div className="grid grid-cols-1 gap-6 pb-8 @5xl:grid-cols-[minmax(0,44fr)_minmax(0,21fr)] @5xl:items-start">
            {/* LEFT (70%): product header (title/price/etc.) + variant option groups.
              The header keeps its own internal margins, so it's wrapped in a single element
              (not spread into the space-y-6 flow, which would add 24px between every header row). */}
            <div className="space-y-3">
              <HeaderBox>{header}</HeaderBox>
              <div className="space-y-5">
                {(() => {
                  // Windows-style products expose a "Width (in.)" and "Height (in.)" option. When
                  // both are present, render them side-by-side as `Width [ ] × Height [ ]` instead
                  // of stacked. Keyed on the option labels (not the category, which the form never
                  // receives), so it applies to any product with both dimensions.
                  const widthField = fields.find((f) => /width/i.test(f.label));
                  const heightField = fields.find((f) => /height/i.test(f.label));
                  const paired = widthField != null && heightField != null;

                  const renderField = (field: F) => (
                    <FormField
                      emptySelectPlaceholder={emptySelectPlaceholder}
                      field={field}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      formField={formFields[field.name]!}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      key={formFields[field.name]!.id}
                      onPrefetch={onPrefetch}
                    />
                  );

                  // Sort a select field's options by the numeric value in their label, ascending
                  // (e.g. Width / Height dimensions: 24, 30, 36...). Falls back to a locale string
                  // compare when a label has no leading number. Leaves non-select fields untouched.
                  const sortOptionsAscending = (field: F): F => {
                    if (
                      !('options' in field) ||
                      !Array.isArray((field as { options?: unknown }).options)
                    ) {
                      return field;
                    }

                    // Parse dimension labels to a sortable number. Handles plain numbers ("30",
                    // "30.5") and the "whole-numerator/denominator" fraction format BigCommerce
                    // uses for windows ("17-3/4" -> 17.75, "23-1/4" -> 23.25).
                    const toNum = (label: string) => {
                      const fraction = /^(\d+)-(\d+)\/(\d+)/.exec(label.trim());

                      if (fraction) {
                        const [, whole, num, den] = fraction;

                        return Number(whole) + Number(num) / Number(den);
                      }

                      return parseFloat(label.replace(/[^0-9.]/g, ''));
                    };

                    return {
                      ...field,
                      options: [
                        ...(field as unknown as { options: Array<{ label: string }> }).options,
                      ].sort((a, b) => {
                        const na = toNum(a.label);
                        const nb = toNum(b.label);

                        if (Number.isNaN(na) || Number.isNaN(nb)) {
                          return a.label.localeCompare(b.label, undefined, { numeric: true });
                        }

                        return na - nb;
                      }),
                    };
                  };

                  if (paired) {
                    const rest = fields.filter((f) => f !== widthField && f !== heightField);

                    // Dependent filtering (one-directional): Width always shows ALL options; once a
                    // Width is chosen, Height is restricted to values that co-occur with it in a real
                    // variant. Kept one-way on purpose — if it were bidirectional, picking a Height
                    // would shrink the Width list and the user could get stuck with no way back to
                    // the full set. Derived at render time from the current selection (no local
                    // state, so it never goes stale).
                    const selectedWidth = params[widthField.name] ?? undefined;

                    let filteredHeightField = heightField;

                    if (
                      optionDependencyMap != null &&
                      selectedWidth != null &&
                      'options' in heightField &&
                      Array.isArray((heightField as { options?: unknown }).options)
                    ) {
                      const allowed = optionDependencyMap[Number(selectedWidth)];

                      if (allowed != null) {
                        const allowedSet = new Set(allowed.map((id) => id.toString()));

                        filteredHeightField = {
                          ...heightField,
                          options: (
                            heightField as unknown as { options: Array<{ value: string }> }
                          ).options.filter((option) => allowedSet.has(option.value)),
                        };
                      }
                    }

                    return (
                      <>
                        <div className="flex items-end gap-3">
                          {renderField(sortOptionsAscending(widthField))}
                          <span className="pb-2 text-lg text-contrast-400">×</span>
                          {renderField(sortOptionsAscending(filteredHeightField))}
                        </div>
                        {rest.map(renderField)}
                      </>
                    );
                  }

                  return fields.map(renderField);
                })()}
              </div>
              {form.errors?.map((error, index) => (
                <FormStatus className="pt-3" key={index} type="error">
                  {error}
                </FormStatus>
              ))}

              {/* Reserved slot for backorder messages — collapses to zero height when empty.
              BigCommerce's stock-level count message ("N in stock") is intentionally NOT shown
              here; the stock state is conveyed by the In/Limited/Out badge above the quantity
              instead. */}
              {!!backorderMessages && (
                <div className="h-[1.6rem] @2xl:h-auto sm:h-[1.3rem]">
                  {!!backorderMessages && (
                    <div
                      className={clsx(
                        'mt-1 flex flex-wrap justify-start gap-x-2.5 gap-y-2 text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]',
                        'ease-initial transition-opacity',
                        backorderMessages.backorderQuantityMessage ||
                          backorderMessages.backorderInfoMessage
                          ? 'duration-400 opacity-100'
                          : 'opacity-0 delay-0 duration-100',
                      )}
                    >
                      <div className="flex-none whitespace-nowrap font-semibold text-black">
                        {backorderMessages.backorderQuantityMessage}
                      </div>
                      {!!backorderMessages.backorderInfoMessage && (
                        <div className="flex-none whitespace-nowrap border-s border-gray-300 pl-2.5">
                          {backorderMessages.backorderInfoMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Description at the bottom of the LEFT column (under the options). */}
              <DescriptionBox>{descriptionSlot}</DescriptionBox>
            </div>
            {/* RIGHT (30%): purchase panel (quantity + buttons), the fulfillment box, and a small
              trust/service block (pickup / price match / returns). */}
            <div className="space-y-4 @5xl:sticky @5xl:top-4">
              <div className="space-y-4 rounded-xl border border-contrast-100 bg-[#f5f5f5] p-4">
                {hasUnselectedRequiredOption ? (
                  <p className="text-sm font-semibold text-foreground">
                    Select {unselectedLabel} for availability
                  </p>
                ) : (
                  stockStatus != null && (
                    <p
                      className={clsx(
                        'text-sm font-semibold',
                        stockStatus === 'in' && 'text-[#16A34A]',
                        typeof stockStatus === 'object' && 'text-[#96050F]',
                        stockStatus === 'out' && 'text-error',
                      )}
                    >
                      {stockStatus === 'in' && 'In stock'}
                      {typeof stockStatus === 'object' && `Only ${stockStatus.low} in stock`}
                      {stockStatus === 'out' && 'Out of stock'}
                    </p>
                  )
                )}
                <div>
                  <Label className="mb-2" id="quantity-label" required>
                    {quantityLabel}
                  </Label>
                  <NumberInput
                    aria-label={quantityLabel}
                    // +/- states (scoped to this PDP stepper):
                    //  • regular icon: black (visible) — but NOT on hover (icon turns white there).
                    //  • regular hover: black bg + white icon (from the global vars).
                    //  • disabled (at min/max/stock): faded via disabled:opacity-30, and on hover a light
                    //    (near-white) bg instead of the dark actionable hover, since it can't be used.
                    //  • press: a lighter grey bg so the press reads distinct from the black hover.
                    className={clsx(
                      '[&_button:active]:!bg-[#666666]',
                      // Black icon only when the button is enabled and not hovered/active.
                      '[&_button:not(:hover):not(:disabled)_svg]:!text-foreground',
                      // Disabled buttons: light hover bg + keep the (faded) icon, no dark fill.
                      '[&_button:disabled]:hover:!bg-contrast-100 [&_button:disabled_svg]:!text-foreground',
                    )}
                    decrementLabel={decrementLabel}
                    incrementLabel={incrementLabel}
                    max={maxQuantity}
                    min={minQuantity ?? 1}
                    name={formFields.quantity.name}
                    onBlur={quantityControl.blur}
                    onChange={(e) => quantityControl.change(e.currentTarget.value)}
                    onFocus={quantityControl.focus}
                    required
                    value={quantityControl.value}
                  />
                </div>
                {/* In-flow buttons — desktop only. On mobile they live in the sticky bottom bar. */}
                <div className="hidden flex-col gap-3 @2xl:flex">
                  <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
                  <SubmitButton
                    disabled={ctaDisabled}
                    onClick={() => {
                      buyNowRef.current = true;
                    }}
                    variant="tertiary"
                  >
                    Buy now
                  </SubmitButton>
                </div>
              </div>
              {/* Fulfillment box (__fulfillment custom field): delivery/pickup message with an icon. */}
              {fulfillmentMessage != null && fulfillmentMessage !== '' && (
                <div className="flex items-start gap-3 rounded-xl bg-[var(--product-detail-fulfillment-background,#F6EBD6)] p-4">
                  <FulfillmentIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--product-detail-fulfillment-icon,hsl(var(--foreground)))]" />
                  <p className="text-sm text-[var(--product-detail-fulfillment-text,hsl(var(--contrast-500)))]">
                    {fulfillmentMessage}
                  </p>
                </div>
              )}
              {/* Trust / service block: three small icon + label rows under the purchase panel, each a
              link to its policy page (installation has none, so it's plain text). The first row's label comes from
              the __delivery custom field (deliveryMessage) when set. Only the TEXT is link-colored
              (#2162a1, darker on hover); the icon keeps its own color (SVGs to be supplied). */}
              <ul className="flex flex-col gap-2 rounded-xl border border-contrast-100 p-4 [&_svg]:size-[15px]">
                {TRUST_ITEMS.map((item, idx) => {
                  const isDeliveryRow = idx === 0;

                  // The delivery row (first) shows the __delivery custom field when set; without it
                  // the row still renders, as a plain "Shipping policy" link, so the truck icon and
                  // the shipping page are always one click away.
                  const hasDeliveryMessage = deliveryMessage != null && deliveryMessage !== '';
                  const label = isDeliveryRow && hasDeliveryMessage ? deliveryMessage : item.label;

                  const icon = (
                    <span className="shrink-0 text-[var(--button-primary-background,#d90716)]">
                      {item.icon}
                    </span>
                  );

                  return (
                    <li key={item.label}>
                      {item.href != null ? (
                        <Link className="flex items-center gap-3" href={item.href}>
                          {icon}
                          {/* Same animated red-underline hover as breadcrumbs / "Write a review". */}
                          <span
                            className={clsx(
                              'text-xs font-normal text-[#2162a1]',
                              animatedUnderlineClassName,
                            )}
                          >
                            {label}
                          </span>
                        </Link>
                      ) : (
                        <span className="flex items-center gap-3">
                          {icon}
                          <span className="text-xs font-normal text-contrast-500">{label}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Mobile sticky bottom bar: Add to cart + Buy now side-by-side, fixed to the viewport
            bottom so the CTAs are always reachable while scrolling. Hidden on desktop (@2xl), where
            the in-flow buttons in the purchase panel are shown instead. Inside the <form> so both
            buttons submit correctly. */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 border-t border-contrast-100 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] @2xl:hidden">
            {/* Compact quantity stepper. No `name` — it's display-only and drives quantityControl; the
              actual form value is carried by the (CSS-hidden but still-mounted) desktop input above,
              so we don't submit a duplicate quantity field. Black icons like the main stepper. */}
            <NumberInput
              aria-label={quantityLabel}
              className="shrink-0 [&_button:active]:!bg-[#666666] [&_button:not(:hover):not(:disabled)_svg]:!text-foreground [&_input]:w-6"
              decrementLabel={decrementLabel}
              incrementLabel={incrementLabel}
              max={maxQuantity}
              min={minQuantity ?? 1}
              onBlur={quantityControl.blur}
              onChange={(e) => quantityControl.change(e.currentTarget.value)}
              onFocus={quantityControl.focus}
              value={quantityControl.value}
            />
            <div className="flex-1 [&_button]:h-full [&_button]:w-full">
              <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
            </div>
            <div className="flex-1 [&_button]:h-full [&_button]:w-full">
              <SubmitButton
                disabled={ctaDisabled}
                onClick={() => {
                  buyNowRef.current = true;
                }}
                variant="tertiary"
              >
                Buy now
              </SubmitButton>
            </div>
          </div>
        </RequiredMarks>
      </form>
    </FormProvider>
  );
}

// Quote-only products (countertops): header, the two quote buttons, then the description. No
// options, quantity or cart — the price is a quote, not a cart.
function QuoteOnlyPanel({
  actions,
  header,
  descriptionSlot,
}: {
  actions: QuoteActions;
  header?: ReactNode;
  descriptionSlot?: ReactNode;
}) {
  return (
    <div className="space-y-3 pb-8">
      <HeaderBox>{header}</HeaderBox>
      <div className="flex flex-col gap-3 pt-2 @md:flex-row @md:items-start">
        <ButtonLink
          className="w-full @md:w-auto @md:min-w-52"
          href={actions.quoteHref}
          size="medium"
        >
          Request a quote
        </ButtonLink>
        <ButtonLink
          // White outline (the PDP themes "tertiary" dark red); fills black on hover like the
          // site's other secondary buttons.
          className="w-full !border-foreground !bg-white !text-foreground after:!bg-foreground hover:!text-white @md:w-auto @md:min-w-52"
          href={actions.phoneHref}
          size="medium"
          variant="tertiary"
        >
          {actions.phoneLabel}
        </ButtonLink>
      </div>
      <DescriptionBox>{descriptionSlot}</DescriptionBox>
    </div>
  );
}

// The header / description slots, rendered only when given (keeps the form's own branching down).
function HeaderBox({ children }: { children?: ReactNode }) {
  return children != null ? <div>{children}</div> : null;
}

function DescriptionBox({ children }: { children?: ReactNode }) {
  return children != null ? <div className="pt-2">{children}</div> : null;
}

function SubmitButton({
  children,
  disabled,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      disabled={disabled}
      loading={pending && variant === 'primary'}
      onClick={onClick}
      size="medium"
      type="submit"
      variant={variant}
    >
      {children}
    </Button>
  );
}

// eslint-disable-next-line complexity
function FormField({
  field,
  formField,
  onPrefetch,
  emptySelectPlaceholder,
}: {
  field: Field;
  formField: FieldMetadata<string | number | boolean | Date | undefined>;
  onPrefetch: (fieldName: string, value: string) => void;
  emptySelectPlaceholder?: string;
}) {
  const controls = useInputControl(formField);

  const [, setParams] = useQueryStates(
    field.persist === true ? { [field.name]: parseAsString.withOptions({ shallow: false }) } : {},
  );

  const handleChange = useCallback(
    (value: string) => {
      // Checkbox field has to be handled separately because we want to convert 'true' or '' to the checked or unchecked value respectively.
      if (field.type === 'checkbox') {
        void setParams({ [field.name]: value ? field.checkedValue : field.uncheckedValue });
      } else {
        void setParams({ [field.name]: value || null }); // Passing `null` to remove the value from the query params if fieldValue is falsey
      }

      controls.change(value || ''); // If fieldValue is falsey, we set it to an empty string
    },
    [setParams, field, controls],
  );

  const handleOnOptionMouseEnter = (value: string) => {
    if (field.persist === true) {
      onPrefetch(field.name, value);
    }
  };

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          decrementLabel={field.decrementLabel}
          errors={formField.errors}
          incrementLabel={field.incrementLabel}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'text':
      return (
        <Input
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'date':
      return (
        <DatePicker
          defaultValue={controls.value}
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          maxLength={field.maxLength}
          minLength={field.minLength}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          checked={controls.value === 'true'}
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => handleChange(value ? 'true' : '')}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'select':
      return (
        // Wrap in a fit-content box so the trigger shrinks to its widest option + padding
        // instead of spanning the whole form column. Scoped to the PDP; shared Select is untouched.
        <div className="w-fit max-w-full" key={formField.id}>
          <Select
            errors={formField.errors}
            label={field.label}
            name={formField.name}
            onBlur={controls.blur}
            onFocus={controls.focus}
            onOptionMouseEnter={handleOnOptionMouseEnter}
            onValueChange={handleChange}
            options={field.options}
            placeholder={emptySelectPlaceholder}
            required={formField.required}
            value={controls.value ?? ''}
          />
        </div>
      );

    case 'radio-group':
      return (
        <RadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'swatch-radio-group':
      return (
        <SwatchRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'card-radio-group':
      return (
        <CardRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'button-radio-group':
      return (
        <ButtonRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );
  }
}
