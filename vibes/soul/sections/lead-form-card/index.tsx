import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import { DynamicForm, type DynamicFormAction, type FormStep } from '@/vibes/soul/form/dynamic-form';
import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { homeHeadingClassName } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

interface Props<F extends Field> {
  /** Anchor id for in-page jump links. */
  id?: string;
  kicker?: string;
  title: string;
  /** One short line under the title. */
  description?: string;
  action: DynamicFormAction<F>;
  /** Fields, or rows of fields rendered side by side. */
  fields: Array<F | F[]>;
  submitLabel?: string;
  /** Photo for the left half of the card. Without one the form sits centred on its own. */
  image?: { src: string; alt: string };
  /** Small print under the button; defaults to the privacy line. */
  fine?: ReactNode;
  /** Split the form into steps (see DynamicForm). */
  steps?: FormStep[];
}

// The customer-form template (every lead form except the estimator): one rounded white card,
// photo inset on the left when there is one, the form on the right with a left-aligned heading,
// paired fields on one row and compact inputs. From the client's reference (a login card).
export function LeadFormCard<F extends Field>({
  id,
  kicker,
  title,
  description,
  action,
  fields,
  submitLabel = 'Send',
  image,
  fine = 'Your details stay with us. No spam, ever.',
  steps,
}: Props<F>) {
  return (
    <section className="scroll-mt-24 @container" id={id}>
      <div className="mx-auto max-w-screen-2xl px-6 py-14 @xl:px-9 @xl:py-16 @4xl:px-14 @4xl:py-20">
        <div
          className={clsx(
            'grid overflow-hidden rounded-[2rem] border border-contrast-100 bg-white shadow-[0_24px_60px_-40px_rgb(0_0_0/0.25)]',
            image != null && '@3xl:grid-cols-2',
          )}
        >
          {image != null && (
            <div className="relative hidden p-4 @3xl:block @4xl:p-5">
              <div className="relative h-full min-h-[560px] overflow-hidden rounded-[1.5rem] bg-contrast-100">
                <Image
                  alt={image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 64rem) 50vw, 100vw"
                  src={image.src}
                />
              </div>
            </div>
          )}
          <div className="flex items-center px-6 py-10 @xl:px-10 @3xl:py-14 @4xl:px-16">
            <div
              className={clsx('w-full', image != null ? 'mx-auto max-w-lg' : 'mx-auto max-w-2xl')}
            >
              {Boolean(kicker) && (
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
                  {kicker}
                </p>
              )}
              <h2 className={homeHeadingClassName}>{title}</h2>
              {Boolean(description) && (
                <p className="mt-2 text-sm leading-relaxed text-contrast-500 @xl:text-base">
                  {description}
                </p>
              )}
              {/* Compact inputs with the site's pink hairline (#fcb6bb) instead of the grey default.
                  The wrapper is its own container so paired fields stack when the card is narrow. */}
              <div
                className={clsx(
                  steps == null && '[&_button[type=submit]]:w-full',
                  'mt-6 @container [--checkbox-light-unchecked-border:#fcb6bb] [--input-light-border:#fcb6bb] [--radio-group-light-border:#fcb6bb] [--select-light-trigger-border:#fcb6bb] [--textarea-light-border:#fcb6bb] [&_.space-y-6]:space-y-4 [&_button[role=combobox]]:!h-11 [&_button[role=combobox]]:!pl-4 [&_button[role=combobox]]:!text-sm [&_input]:!px-4 [&_input]:!py-2.5 [&_input]:!text-sm [&_textarea]:!min-h-20 [&_textarea]:!px-4 [&_textarea]:!py-2.5 [&_textarea]:!text-sm',
                )}
              >
                <DynamicForm
                  action={action}
                  fields={fields}
                  steps={steps}
                  submitLabel={submitLabel}
                />
              </div>
              {fine != null && fine !== '' && (
                <p className="mt-4 text-xs text-contrast-500">{fine}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
