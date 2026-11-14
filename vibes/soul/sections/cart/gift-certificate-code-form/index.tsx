'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useOptimistic } from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';

import { CodeField } from '../code-field';
import { giftCertificateCodeActionFormDataSchema } from '../schema';

import { GiftCertificateChip } from './gift-certificate-chip';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface GiftCertificateCodeFormState {
  giftCertificateCodes: string[];
  lastResult: SubmissionResult | null;
}

export interface GiftCertificateCodeFormProps {
  action: Action<GiftCertificateCodeFormState, FormData>;
  giftCertificateCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

export function GiftCertificateCodeForm({
  action,
  giftCertificateCodes,
  ctaLabel = 'Apply',
  disabled = false,
  label = 'Gift certificate code',
  placeholder = 'Enter gift certificate code',
  removeLabel,
}: GiftCertificateCodeFormProps) {
  const t = useTranslations('Cart.GiftCertificate');
  const [state, formAction] = useActionState(action, {
    giftCertificateCodes: giftCertificateCodes ?? [],
    lastResult: null,
  });

  const schema = giftCertificateCodeActionFormDataSchema({
    required_error: t('invalidGiftCertificate'),
  });

  const [optimisticGiftCertificateCodes, setOptimisticGiftCertificateCodes] = useOptimistic<
    string[],
    FormData
  >(state.giftCertificateCodes, (prevState, formData) => {
    const submission = parseWithZod(formData, { schema });

    if (submission.status !== 'success') return prevState;

    switch (submission.value.intent) {
      case 'delete': {
        const giftCertificateCode = submission.value.giftCertificateCode;

        return prevState.filter((code) => code !== giftCertificateCode);
      }

      default:
        return prevState;
    }
  });

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
        setOptimisticGiftCertificateCodes(formData);
      });
    },
  });

  return (
    <div className="space-y-2 py-3.5">
      <form {...getFormProps(form)} action={formAction} className="space-y-2">
        <CodeField
          ctaLabel={ctaLabel}
          disabled={disabled}
          icon={<Gift size={22} strokeWidth={1.5} />}
          inputProps={getInputProps(fields.giftCertificateCode, { required: true, type: 'text' })}
          invalid={Boolean(fields.giftCertificateCode.errors?.length)}
          key={fields.giftCertificateCode.id}
          label={label}
          placeholder={placeholder}
        />
        {fields.giftCertificateCode.errors?.map((error, index) => (
          <FieldError key={index}>{error}</FieldError>
        ))}
      </form>
      {optimisticGiftCertificateCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {optimisticGiftCertificateCodes.map((giftCertificateCode) => (
            <GiftCertificateChip
              action={formAction}
              giftCertificateCode={giftCertificateCode}
              key={giftCertificateCode}
              onSubmit={(formData) => {
                startTransition(() => {
                  formAction(formData);
                  setOptimisticGiftCertificateCodes(formData);
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
