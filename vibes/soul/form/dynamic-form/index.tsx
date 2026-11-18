/* eslint-disable complexity */
'use client';

import {
  FieldMetadata,
  FormProvider,
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import {
  type FocusEvent,
  FormEvent,
  MouseEvent,
  ReactNode,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormStatus } from 'react-dom';
import RecaptchaWidget from 'react-google-recaptcha';
import { z } from 'zod';

import { AntiSpamFields } from '@/vibes/soul/form/anti-spam-fields';
import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { CheckboxGroup } from '@/vibes/soul/form/checkbox-group';
import { DatePicker, parseISODate, startOfToday, toISODate } from '@/vibes/soul/form/date-picker';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { PictureRadioGroup } from '@/vibes/soul/form/picture-radio-group';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Select } from '@/vibes/soul/form/select';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Textarea } from '@/vibes/soul/form/textarea';
import { TrackingFields } from '@/vibes/soul/form/tracking-fields';
import { Button, ButtonProps } from '@/vibes/soul/primitives/button';

import { formatUsPhone } from './phone';
import {
  Field,
  FieldGroup,
  FormErrorTranslationMap,
  PasswordComplexitySettings,
  schema,
} from './schema';
import { removeOptionsFromFields } from './utils';

// Which days a date field greys out: before its minimum, after its maximum, or both. `'today'`
// is the visitor's own date, worked out in their browser, so yesterday is never offered.
function dateBounds(field: { minDate?: string; maxDate?: string }) {
  const before = field.minDate === 'today' ? startOfToday() : parseISODate(field.minDate);
  const after = parseISODate(field.maxDate);

  if (before && after) return { before, after };
  if (before) return { before };
  if (after) return { after };

  return undefined;
}

export interface DynamicFormActionArgs<F extends Field> {
  fields: Array<F | FieldGroup<F>>;
  passwordComplexity?: PasswordComplexitySettings | null;
  /**
   * value → label for every option-bearing field, so a server action can report what the visitor
   * saw ("Under $5,000") instead of the stored value ("lt5"). Options themselves are stripped from
   * `fields` to keep the request small; this map is just the strings.
   */
  optionLabels?: Record<string, Record<string, string>>;
}

function collectOptionLabels<F extends Field>(
  fields: Array<F | FieldGroup<F>>,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};

  fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .forEach((field) => {
      if (!('options' in field) || !Array.isArray(field.options)) return;

      const labels: Record<string, string> = {};

      field.options.forEach((option: { label?: string; value?: string }) => {
        if (typeof option.value === 'string' && typeof option.label === 'string') {
          labels[option.value] = option.label;
        }
      });

      if (Object.keys(labels).length > 0) out[field.name] = labels;
    });

  return out;
}

type Action<F extends Field, S, P> = (
  args: DynamicFormActionArgs<F>,
  state: Awaited<S>,
  payload: P,
) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type DynamicFormAction<F extends Field> = Action<F, State, FormData>;

// Current string values of a form, by field name (files are skipped).
function readFormValues(formId: string): Record<string, string> {
  const values: Record<string, string> = {};
  const element = document.getElementById(formId);

  if (element instanceof HTMLFormElement) {
    new FormData(element).forEach((value, key) => {
      if (typeof value === 'string') values[key] = value;
    });
  }

  return values;
}

export interface DynamicFormProps<F extends Field> {
  fields: Array<F | FieldGroup<F>>;
  action: DynamicFormAction<F>;
  buttonSize?: ButtonProps['size'];
  cancelLabel?: string;
  submitLabel?: string;
  submitName?: string;
  submitValue?: string;
  onCancel?: (e: MouseEvent<HTMLButtonElement>) => void;
  onChange?: (e: FormEvent<HTMLFormElement>) => void;
  onSuccess?: (lastResult: SubmissionResult, successMessage: ReactNode) => void;
  passwordComplexity?: PasswordComplexitySettings | null;
  errorTranslations?: FormErrorTranslationMap;
  recaptchaSiteKey?: string;
  /**
   * Split the form into steps (each lists the field names it shows). Fields stay mounted, so
   * values survive going back; Next validates just that step; Submit appears on the last step.
   */
  steps?: FormStep[];
  /**
   * Server-side check for a step, run when Next is pressed and the step is clean client-side
   * (e.g. "is this email already registered?"). Return field errors to stay on the step, or null
   * to move on. Failures move on too, so the check can never block the form.
   */
  validateStep?: StepValidator;
  /**
   * Field names whose validateStep check also runs as soon as the field loses focus (e.g. the
   * email), so the visitor hears early. The Next check still runs as the backstop.
   */
  checkOnBlur?: string[];
}

export type StepValidator = (
  names: string[],
  values: Record<string, string>,
) => Promise<Record<string, string[]> | null>;

export interface FormStep {
  title: string;
  names: string[];
}

export function DynamicForm<F extends Field>({
  action,
  fields,
  buttonSize = 'medium',
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  submitName,
  submitValue,
  onCancel,
  onChange,
  onSuccess,
  passwordComplexity,
  errorTranslations,
  recaptchaSiteKey,
  steps,
  validateStep,
  checkOnBlur,
}: DynamicFormProps<F>) {
  const t = useTranslations('Form');
  const [step, setStep] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  // Result of the server-side step check, shown through conform like an action result.
  const [stepResult, setStepResult] = useState<SubmissionResult | null>(null);
  const [checking, setChecking] = useState(false);
  // On-blur checks: which field is being checked now, and the last value checked per field, so
  // tabbing in and out of an unchanged field does not query again.
  const [blurChecking, setBlurChecking] = useState<string | null>(null);
  const lastBlurChecked = useRef<Record<string, string>>({});
  const isLastStep = steps == null || step >= steps.length - 1;
  // Remove options from fields before passing to action to reduce payload size
  // Options are only needed for rendering, not for processing form submissions
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const fieldsWithoutOptions = removeOptionsFromFields(fields) as Array<F | FieldGroup<F>>;
  const actionWithFields = action.bind(null, {
    fields: fieldsWithoutOptions,
    passwordComplexity,
    optionLabels: collectOptionLabels(fields),
  });

  const [{ lastResult, successMessage }, formAction] = useActionState(actionWithFields, {
    lastResult: null,
  });

  const dynamicSchema = schema(fields, passwordComplexity, errorTranslations);
  // Field labels, so an empty required field without a translated message still says which
  // field it is ("Phone number is required") rather than a bare "Required".
  const labelByName = new Map<string, string>();

  fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .forEach((field) => labelByName.set(field.name, field.label ?? field.name));

  const requiredMessage = (issue: z.ZodIssueOptionalMessage): string | undefined => {
    const name = issue.path[0];
    const label = typeof name === 'string' ? labelByName.get(name) : undefined;

    return issue.code === z.ZodIssueCode.invalid_type && label ? `${label} is required` : undefined;
  };
  const defaultValue = fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .reduce<z.infer<typeof dynamicSchema>>(
      (acc, field) => ({
        ...acc,
        [field.name]: 'defaultValue' in field ? field.defaultValue : '',
      }),
      {},
    );

  const [form, formFields] = useForm({
    lastResult: stepResult ?? lastResult,
    constraint: getZodConstraint(dynamicSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: dynamicSchema,
        errorMap: (issue) => {
          if (
            !errorTranslations &&
            issue.code === z.ZodIssueCode.invalid_string &&
            issue.validation === 'regex'
          ) {
            return { message: t('Errors.invalidFormat') };
          }

          if (!errorTranslations) {
            return { message: requiredMessage(issue) ?? issue.message ?? t('Errors.invalidInput') };
          }

          const field = issue.path[0];
          const fieldKey = typeof field === 'string' ? field : '';
          const errorMessage = errorTranslations[fieldKey]?.[issue.code];

          return {
            message:
              errorMessage ?? requiredMessage(issue) ?? issue.message ?? t('Errors.invalidInput'),
          };
        },
      });
    },
    defaultValue,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
    onSubmit(event, { formData }) {
      event.preventDefault();
      setStepResult(null);

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  useEffect(() => {
    if (lastResult && lastResult.status === 'success' && successMessage) {
      onSuccess?.(lastResult, successMessage);
    }
  }, [lastResult, successMessage, onSuccess]);

  // A watched field lost focus: run the server check for just that field. Invalid or empty values
  // are the action's call (it returns null for them), and failures stay silent.
  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;

    if (
      validateStep == null ||
      !(target instanceof HTMLInputElement) ||
      !checkOnBlur?.includes(target.name)
    ) {
      return;
    }

    const { name } = target;
    const value = target.value.trim();

    if (value === '' || lastBlurChecked.current[name] === value) return;

    lastBlurChecked.current[name] = value;
    setBlurChecking(name);
    validateStep([name], { [name]: value })
      .then((errors) => {
        if (errors != null && Object.keys(errors).length > 0) {
          // `fields` is what conform treats as touched; keep it to this one field so the
          // untouched rest of the step does not light up on the next keystroke.
          setStepResult({
            status: 'error',
            initialValue: readFormValues(form.id),
            error: errors,
            fields: [name],
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setBlurChecking(null));
  };

  // Stepped form: "Next" validates the current step's fields (conform reports on the next
  // render), then moves on only when they're clean.
  const stepNames = useMemo(() => steps?.[step]?.names ?? [], [steps, step]);
  const stepHasErrors = stepNames.some((name) => (formFields[name]?.errors?.length ?? 0) > 0);

  useEffect(() => {
    if (!advancing) return;

    setAdvancing(false);

    if (stepHasErrors) return;

    if (validateStep == null) {
      setStep((current) => current + 1);

      return;
    }

    const values = readFormValues(form.id);
    const stepValues = Object.fromEntries(stepNames.map((name) => [name, values[name] ?? '']));

    setChecking(true);
    validateStep(stepNames, stepValues)
      .then((errors) => {
        if (errors != null && Object.keys(errors).length > 0) {
          setStepResult({
            status: 'error',
            initialValue: values,
            error: errors,
            // Only this step's fields count as touched; later steps stay untouched.
            fields: stepNames,
          });

          return;
        }

        setStepResult(null);
        setStep((current) => current + 1);
      })
      .catch(() => {
        setStepResult(null);
        setStep((current) => current + 1);
      })
      .finally(() => setChecking(false));
  }, [advancing, stepHasErrors, validateStep, form.id, stepNames]);

  // A failed submit with an error on an earlier step jumps back to that step.
  useEffect(() => {
    if (steps == null || lastResult?.status !== 'error') return;

    const firstBad = steps.findIndex((candidate) =>
      candidate.names.some((name) => (formFields[name]?.errors?.length ?? 0) > 0),
    );

    if (firstBad >= 0) setStep(firstBad);
    // Only when a new result lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult]);

  const stepIndexOf = (name: string) =>
    steps == null
      ? 0
      : Math.max(
          0,
          steps.findIndex((candidate) => candidate.names.includes(name)),
        );
  const stepClass = (name: string) => (steps != null && stepIndexOf(name) !== step ? 'hidden' : '');
  // A field with `showWhen` stays in the form (so its value still posts) but is hidden until the
  // field it depends on holds the right value. Conform keeps `value` current as the user types.
  const hiddenBy = (field: F) => {
    if (field.showWhen == null) return false;

    return formFields[field.showWhen.field]?.value !== field.showWhen.equals;
  };
  const fieldClass = (field: F) => clsx(stepClass(field.name), hiddenBy(field) && 'hidden');

  return (
    <FormProvider context={form.context}>
      <form {...getFormProps(form)} action={formAction} onBlur={handleBlur} onChange={onChange}>
        <AntiSpamFields />
        <TrackingFields />
        {steps != null && (
          <ol
            aria-label={`Step ${step + 1} of ${steps.length}`}
            className="mb-6 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
          >
            {steps.map((candidate, index) => (
              <li
                aria-current={index === step ? 'step' : undefined}
                className={clsx(
                  'border-t-[3px] pt-2 text-xs font-semibold transition-colors',
                  index <= step
                    ? 'border-[var(--button-primary-background,#d90716)] text-foreground'
                    : 'border-contrast-200 text-contrast-400',
                )}
                key={candidate.title}
              >
                <span className="block text-[10px] uppercase tracking-wide text-contrast-500">
                  Step {index + 1}
                </span>
                {candidate.title}
              </li>
            ))}
          </ol>
        )}
        <div className="space-y-6">
          {fields.map((field, index) => {
            if (Array.isArray(field)) {
              const first = field[0];

              return (
                <div
                  className={clsx(
                    'flex flex-col gap-4 @sm:flex-row',
                    first != null && fieldClass(first),
                  )}
                  key={index}
                >
                  {field.map((f) => {
                    const groupFormField = formFields[f.name];

                    if (!groupFormField) return null;

                    return (
                      <DynamicFormField
                        field={f}
                        formField={groupFormField}
                        key={groupFormField.id}
                      />
                    );
                  })}
                </div>
              );
            }

            const formField = formFields[field.name];

            if (formField == null) return null;

            return (
              <div className={fieldClass(field)} key={formField.id}>
                <DynamicFormField field={field} formField={formField} />
                {blurChecking === field.name && (
                  <p aria-live="polite" className="mt-1.5 text-xs text-contrast-400">
                    Checking…
                  </p>
                )}
              </div>
            );
          })}
          {/* On a stepped form the reCAPTCHA belongs with the submit button, on the last step. */}
          {recaptchaSiteKey && isLastStep ? <RecaptchaWidget sitekey={recaptchaSiteKey} /> : null}
          <div
            className={clsx(
              'flex gap-2 pt-3',
              // Stepped forms on a narrow card: the submit / Next button takes the top row in
              // full, and Back sits beneath it, so a long submit label never wraps.
              steps != null &&
                'flex-col-reverse @sm:flex-row [&>button]:w-full @sm:[&>button]:w-auto',
            )}
          >
            {onCancel && (
              <Button
                aria-label={`${cancelLabel} ${submitLabel}`}
                onClick={onCancel}
                size={buttonSize}
                variant="tertiary"
              >
                {cancelLabel}
              </Button>
            )}
            {steps != null && step > 0 && (
              <Button
                // White outline (some pages theme "tertiary" dark red), black fill on hover.
                className="!border-foreground !bg-white !text-foreground after:!bg-foreground hover:!text-white"
                onClick={() => setStep((current) => current - 1)}
                size={buttonSize}
                type="button"
                variant="tertiary"
              >
                Back
              </Button>
            )}
            {isLastStep ? (
              <SubmitButton name={submitName} size={buttonSize} value={submitValue}>
                {submitLabel}
              </SubmitButton>
            ) : (
              <Button
                disabled={checking}
                onClick={() => {
                  stepNames.forEach((name) => form.validate({ name }));
                  setAdvancing(true);
                }}
                size={buttonSize}
                type="button"
              >
                {checking ? 'Checking…' : 'Next'}
              </Button>
            )}
          </div>
          {form.errors?.map((error, index) => (
            <FormStatus key={index} type="error">
              {error}
            </FormStatus>
          ))}
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({
  children,
  name,
  value,
  size,
}: {
  children: ReactNode;
  name?: string;
  value?: string;
  size: ButtonProps['size'];
}) {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} name={name} size={size} type="submit" value={value}>
      {children}
    </Button>
  );
}

function DynamicFormField({
  field,
  formField,
}: {
  field: Field;
  formField: FieldMetadata<string | string[] | number | boolean | Date | undefined>;
}) {
  const controls = useInputControl(formField);

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          {...getInputProps(formField, { type: 'number' })}
          decrementLabel={field.decrementLabel}
          defaultValue={field.defaultValue}
          errors={formField.errors}
          incrementLabel={field.incrementLabel}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'text':
      return (
        <Input
          {...getInputProps(formField, { type: 'text', pattern: field.pattern })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'tel':
      return (
        <Input
          {...getInputProps(formField, { type: 'tel' })}
          autoComplete="tel"
          errors={formField.errors}
          inputMode="tel"
          key={field.name}
          label={field.label}
          onInput={(event) => {
            // Uncontrolled input: rewrite the value in place, so conform reads the formatted one.
            event.currentTarget.value = formatUsPhone(event.currentTarget.value);
          }}
          placeholder={field.placeholder ?? '(860) 555-0123'}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...getInputProps(formField, { type: 'text' })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'password':
    case 'confirm-password':
      return (
        <Input
          {...getInputProps(formField, { type: 'password' })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'email':
      return (
        <Input
          {...getInputProps(formField, { type: 'email' })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          defaultValue={field.defaultValue}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => controls.change(String(value))}
          onFocus={controls.focus}
          required={field.required}
          value={controls.value}
        />
      );

    case 'checkbox-group':
      return (
        <CheckboxGroup
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onValueChange={controls.change}
          options={field.options}
          required={field.required}
          value={Array.isArray(controls.value) ? controls.value : []}
        />
      );

    case 'select':
      return (
        <Select
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          placeholder={field.placeholder}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'radio-group':
      return (
        <RadioGroup
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'swatch-radio-group':
      return (
        <SwatchRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'picture-radio-group':
      return (
        <PictureRadioGroup
          columns={field.columns}
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'card-radio-group':
      return (
        <CardRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'button-radio-group':
      return (
        <ButtonRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'date':
      return (
        <DatePicker
          defaultValue={field.defaultValue}
          disabledDays={dateBounds(field)}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onSelect={(date) => controls.change(date ? toISODate(date) : undefined)}
          required={formField.required}
          selected={typeof controls.value === 'string' ? parseISODate(controls.value) : undefined}
        />
      );

    case 'hidden':
      return <input {...getInputProps(formField, { type: 'hidden' })} key={field.name} />;
  }
}
