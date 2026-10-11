'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';

type Action<State, Payload> = (
  prevState: Awaited<State>,
  formData: Payload,
) => State | Promise<State>;

export function InlineEmailForm({
  className,
  action,
  submitLabel = 'Submit',
  placeholder = 'Enter your email',
}: {
  className?: string;
  placeholder?: string;
  submitLabel?: string;
  action: Action<{ lastResult: SubmissionResult | null; successMessage?: string }, FormData>;
}) {
  const t = useTranslations('Components.Subscribe');
  const subscribeSchema = schema({
    requiredMessage: t('Errors.emailRequired'),
    invalidMessage: t('Errors.invalidEmail'),
  });

  const [{ lastResult, successMessage }, formAction, isPending] = useActionState(action, {
    lastResult: null,
  });

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: subscribeSchema });
    },
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
  });

  return (
    <form {...getFormProps(form)} action={formAction} className={clsx('space-y-2', className)}>
      <div
        className={clsx(
          'relative rounded-full border bg-background text-sm transition-colors duration-200 focus-within:border-primary focus:outline-none',
          form.errors?.length || fields.email.errors?.length
            ? 'border-error focus-within:border-error'
            : 'border-black focus-within:border-primary',
        )}
      >
        <input
          {...getInputProps(fields.email, { type: 'email' })}
          className="h-11 w-full bg-transparent pl-5 pr-14 text-foreground placeholder:font-normal placeholder:text-contrast-500 focus:outline-none"
          data-1p-ignore
          key={fields.email.id}
          placeholder={placeholder}
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-1">
          <Button
            aria-label={submitLabel}
            loading={isPending}
            shape="circle"
            size="x-small"
            type="submit"
            variant="secondary"
          >
            <ArrowRight size={16} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
      {fields.email.errors?.map((error) => (
        <FieldError key={error}>{error}</FieldError>
      ))}
      {form.errors?.map((error, index) => (
        <FormStatus key={index} type="error">
          {error}
        </FormStatus>
      ))}
      {form.status === 'success' && successMessage != null && (
        <FormStatus>{successMessage}</FormStatus>
      )}
    </form>
  );
}
