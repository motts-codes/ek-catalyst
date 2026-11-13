import { clsx } from 'clsx';

import { DynamicForm, DynamicFormAction, type FormStep } from '@/vibes/soul/form/dynamic-form';
import {
  Field,
  FieldGroup,
  FormErrorTranslationMap,
  PasswordComplexitySettings,
} from '@/vibes/soul/form/dynamic-form/schema';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface Props<F extends Field> {
  title?: string;
  subtitle?: string;
  action: DynamicFormAction<F>;
  fields: Array<F | FieldGroup<F>>;
  submitLabel?: string;
  className?: string;
  passwordComplexity?: PasswordComplexitySettings | null;
  errorTranslations?: FormErrorTranslationMap;
  recaptchaSiteKey?: string;
  /** Split the form into steps (see DynamicForm). */
  steps?: FormStep[];
}

export function DynamicFormSection<F extends Field>({
  className,
  title,
  subtitle,
  fields,
  submitLabel,
  action,
  passwordComplexity,
  errorTranslations,
  recaptchaSiteKey,
  steps,
}: Props<F>) {
  return (
    <SectionLayout className={clsx('mx-auto w-full max-w-2xl', className)} containerSize="lg">
      {title != null && title !== '' && (
        <header className="pb-6 @2xl:pb-8">
          <h1 className="mb-3 font-heading text-2xl font-semibold leading-none @xl:text-3xl">
            {title}
          </h1>
          {subtitle != null && subtitle !== '' && (
            <p className="mb-6 text-sm leading-snug text-contrast-500 @xl:text-base">{subtitle}</p>
          )}
        </header>
      )}
      <DynamicForm
        action={action}
        errorTranslations={errorTranslations}
        fields={fields}
        passwordComplexity={passwordComplexity}
        recaptchaSiteKey={recaptchaSiteKey}
        steps={steps}
        submitLabel={submitLabel}
      />
    </SectionLayout>
  );
}
