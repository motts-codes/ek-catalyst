'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { BadgePercent } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useOptimistic } from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';

import { CodeField } from '../code-field';
import { couponCodeActionFormDataSchema } from '../schema';

import { CouponChip } from './coupon-chip';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface CouponCodeFormState {
  couponCodes: string[];
  lastResult: SubmissionResult | null;
}

export interface CouponCodeFormProps {
  action: Action<CouponCodeFormState, FormData>;
  couponCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

export function CouponCodeForm({
  action,
  couponCodes,
  ctaLabel = 'Apply',
  disabled = false,
  label = 'Coupon code',
  placeholder = 'Enter coupon code',
  removeLabel,
}: CouponCodeFormProps) {
  const t = useTranslations('Cart.CheckoutSummary.CouponCode');
  const schema = couponCodeActionFormDataSchema({ required_error: t('invalidCouponCode') });
  const [state, formAction] = useActionState(action, {
    couponCodes: couponCodes ?? [],
    lastResult: null,
  });

  const [optimisticCouponCodes, setOptimisticCouponCodes] = useOptimistic<string[], FormData>(
    state.couponCodes,
    (prevState, formData) => {
      const submission = parseWithZod(formData, { schema });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'delete': {
          const couponCode = submission.value.couponCode;

          return prevState.filter((code) => code !== couponCode);
        }

        default:
          return prevState;
      }
    },
  );

  const [form, fields] = useForm({
    lastResult: state.lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
        setOptimisticCouponCodes(formData);
      });
    },
  });

  return (
    <div className="space-y-2 py-3.5">
      <form {...getFormProps(form)} action={formAction} className="space-y-2">
        <CodeField
          ctaLabel={ctaLabel}
          disabled={disabled}
          icon={<BadgePercent size={22} strokeWidth={1.5} />}
          inputProps={getInputProps(fields.couponCode, { required: true, type: 'text' })}
          invalid={Boolean(fields.couponCode.errors?.length)}
          key={fields.couponCode.id}
          label={label}
          placeholder={placeholder}
        />
        {fields.couponCode.errors?.map((error, index) => (
          <FieldError key={index}>{error}</FieldError>
        ))}
      </form>
      {optimisticCouponCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {optimisticCouponCodes.map((couponCode) => (
            <CouponChip
              action={formAction}
              couponCode={couponCode}
              key={couponCode}
              onSubmit={(formData) => {
                startTransition(() => {
                  formAction(formData);
                  setOptimisticCouponCodes(formData);
                });
              }}
              removeLabel={removeLabel}
            />
          ))}
        </div>
      )}
      {form.errors?.map((error, index) => (
        <FieldError key={index}>{error}</FieldError>
      ))}
    </div>
  );
}
