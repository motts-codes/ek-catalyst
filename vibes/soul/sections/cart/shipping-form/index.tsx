'use client';

import {
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Label } from '@/vibes/soul/form/label';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Button } from '@/vibes/soul/primitives/button';

import { shippingActionFormDataSchema } from '../schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface ShippingFormState {
  lastResult: SubmissionResult | null;
  address: Address | null;
  shippingOptions: ShippingOption[] | null;
  shippingOption: ShippingOption | null;
  form: 'address' | 'shipping' | null;
}

interface ShippingOption {
  label: string;
  value: string;
  price: string;
  /** Secondary line, e.g. "Delivers Tue, Nov 17". */
  detail?: string;
}

interface Address {
  country: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface Props {
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
  /** The visitor's remembered ZIP (utility bar), to pre-fill the field. */
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

// "Bristol, CT 06010", or the ZIP alone when the town isn't known.
function formatAddress(address: Address | null): string {
  if (!address) return '';

  const place = [address.city, address.state].filter(Boolean).join(', ');

  return [place, address.postalCode].filter(Boolean).join(' ');
}

// The shipping estimate in the cart summary. EK ships within the US only, so the whole address is
// one ZIP field: BigCommerce quotes the options for it, and the visitor picks one. Town and state
// are filled in from the ZIP on the server when known.
export function ShippingForm({
  action,
  address,
  shippingOptions,
  shippingOption,
  shippingLabel = 'Shipping',
  addLabel = 'Add',
  changeLabel = 'Change',
  postalCodeLabel = 'ZIP code',
  postalCodeHint,
  estimateNote,
  defaultPostalCode,
  updateShippingOptionsLabel = 'Update shipping options',
  viewShippingOptionsLabel = 'View shipping options',
  cancelLabel = 'Cancel',
  editAddressLabel = 'Change ZIP',
  shippingOptionsLabel = 'Shipping options',
  updateShippingLabel = 'Update shipping',
  addShippingLabel = 'Add shipping',
  showShippingForm = false,
  noShippingOptionsLabel = 'There are no shipping options available for your address',
}: Props) {
  const t = useTranslations('Cart.CheckoutSummary.Shipping');
  const schema = shippingActionFormDataSchema({ required_error: t('zipRequired') });
  const [showForms, setShowForms] = useState(showShippingForm);
  const [showAddressForm, setShowAddressForm] = useState(!address);

  const [state, formAction] = useActionState(action, {
    lastResult: null,
    address: address ?? null,
    shippingOptions: shippingOptions ?? null,
    shippingOption: shippingOption ?? null,
    form: null,
  });

  const [addressForm, addressFields] = useForm({
    lastResult: state.form === 'address' ? state.lastResult : null,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      country: 'US',
      postalCode: state.address?.postalCode ?? defaultPostalCode,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
        setShowAddressForm(false);
      });
    },
  });

  const [shippingOptionsForm, shippingOptionsFields] = useForm({
    lastResult: state.form === 'shipping' ? state.lastResult : null,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      shippingOption: state.shippingOption?.value,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
        setShowForms(false);
      });
    },
  });

  useEffect(() => {
    if (addressForm.errors && addressForm.errors.length > 0) {
      if (state.shippingOptions) {
        setShowForms(true);
        setShowAddressForm(true);
      }
    }
  }, [setShowForms, setShowAddressForm, addressForm.errors, state.shippingOptions]);

  useEffect(() => {
    if (shippingOptionsForm.errors && shippingOptionsForm.errors.length > 0) {
      setShowForms(true);
    }
  }, [setShowForms, shippingOptionsForm.errors]);

  const shippingOptionsControl = useInputControl(shippingOptionsFields.shippingOption);
  const formattedAddress = formatAddress(state.address);

  return (
    <div className="py-4">
      <div>
        <div className="flex justify-between">
          <span>{shippingLabel}</span>
          {state.shippingOption ? (
            <span>{state.shippingOption.price}</span>
          ) : (
            !showForms && (
              <button
                className="font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                onClick={() => setShowForms(!showForms)}
              >
                {addLabel}
              </button>
            )
          )}
        </div>

        {state.shippingOption && (
          <div className="flex flex-wrap gap-x-1.5 text-xs">
            <span className="font-medium text-contrast-400">
              {[state.shippingOption.label, formattedAddress].filter(Boolean).join(' · ')}
            </span>
            {!showForms && (
              <button
                className="font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                onClick={() => setShowForms(true)}
              >
                {changeLabel}
              </button>
            )}
          </div>
        )}
        {state.shippingOption && estimateNote ? (
          <p className="mt-0.5 text-xs text-contrast-400">{estimateNote}</p>
        ) : null}
      </div>

      <div className={clsx('space-y-4', { hidden: !showForms })}>
        <form
          {...getFormProps(addressForm)}
          action={formAction}
          className={clsx('mt-4 space-y-3', { hidden: !showAddressForm })}
        >
          {/* EK ships within the US only: the country rides along, fixed. */}
          <input {...getInputProps(addressFields.country, { type: 'hidden' })} value="US" />
          <Input
            {...getInputProps(addressFields.postalCode, { type: 'text' })}
            autoComplete="postal-code"
            errors={addressFields.postalCode.errors}
            inputMode="numeric"
            key={addressFields.postalCode.id}
            label={postalCodeLabel}
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="06010"
            required
          />
          {postalCodeHint ? <p className="text-xs text-contrast-400">{postalCodeHint}</p> : null}

          {addressForm.errors?.map((error, index) => (
            <FormStatus key={index} type="error">
              {error}
            </FormStatus>
          ))}

          <div className="flex gap-1.5">
            <SubmitButton className="grow" name="intent" value="add-address">
              {state.address ? updateShippingOptionsLabel : viewShippingOptionsLabel}
            </SubmitButton>
            <Button
              className="shrink-0"
              onClick={() =>
                state.shippingOptions && state.shippingOptions.length > 0
                  ? setShowAddressForm(false)
                  : setShowForms(false)
              }
              size="small"
              type="button"
              variant="tertiary"
            >
              {cancelLabel}
            </Button>
          </div>
        </form>

        <div
          className={clsx('mt-4 flex flex-wrap items-center justify-between gap-2', {
            hidden: showAddressForm,
          })}
        >
          <span className="text-sm">{formattedAddress}</span>
          <Button
            onClick={() => setShowAddressForm(true)}
            size="small"
            type="button"
            variant="tertiary"
          >
            {editAddressLabel}
          </Button>
        </div>

        <form
          className={clsx('space-y-4', {
            hidden: state.shippingOptions === null || state.shippingOptions.length === 0,
          })}
          {...getFormProps(shippingOptionsForm)}
          action={formAction}
        >
          <div className="mt-4 space-y-3">
            <RadioGroup
              {...getInputProps(shippingOptionsFields.shippingOption, {
                type: 'radio',
                required: true,
              })}
              errors={shippingOptionsFields.shippingOption.errors}
              key={shippingOptionsFields.shippingOption.id}
              label={shippingOptionsLabel}
              layout="stacked"
              name="shippingOption"
              onBlur={shippingOptionsControl.blur}
              onFocus={shippingOptionsControl.focus}
              onValueChange={shippingOptionsControl.change}
              options={
                state.shippingOptions?.map((option) => ({
                  label: option.label,
                  value: option.value,
                  description: option.price,
                  detail: option.detail,
                })) ?? []
              }
              // Cream panel (same pair as the delivery map) instead of the rose form panel.
              panelClassName="border border-[#f6ebd6] [--radio-group-light-panel:#fbf5ea]"
              required
              value={shippingOptionsControl.value}
            />

            {shippingOptionsForm.errors?.map((error, index) => (
              <FormStatus key={index} type="error">
                {error}
              </FormStatus>
            ))}
          </div>

          <div className="flex gap-1.5">
            <SubmitButton className="grow" name="intent" value="add-shipping">
              {shippingOption ? updateShippingLabel : addShippingLabel}
            </SubmitButton>
            <Button
              className="shrink-0"
              onClick={() => {
                setShowForms(false);
                setShowAddressForm(false);
              }}
              size="small"
              type="button"
              variant="tertiary"
            >
              {cancelLabel}
            </Button>
          </div>
        </form>

        <div
          className={clsx('mt-6 space-y-3', {
            hidden: state.shippingOptions === null || state.shippingOptions.length > 0,
          })}
        >
          <Label>{shippingOptionsLabel}</Label>
          <p>{noShippingOptionsLabel}</p>
        </div>
      </div>
    </div>
  );
}

function SubmitButton(props: React.ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return <Button {...props} loading={pending} size="small" type="submit" variant="secondary" />;
}
