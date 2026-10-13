import { clsx } from 'clsx';

import { DynamicForm, type DynamicFormAction } from '@/vibes/soul/form/dynamic-form';
import { type Field } from '@/vibes/soul/form/dynamic-form/schema';
import { homeHeadingClassName } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';

interface Props<F extends Field> {
  /** Anchor id the "Request a quote" buttons jump to. */
  id: string;
  action: DynamicFormAction<F>;
  /** Fields, or rows of fields rendered side by side. */
  fields: Array<F | F[]>;
  /** The stone being quoted (PDP); names it in the heading. */
  product?: string;
  /** Photo for the left column (the product on a PDP, the category hero on a listing). */
  image?: { src: string; alt: string };
}

// The countertop quote form as one rounded card: photo on the left, a short two-column form
// centred on the right (client reference: a login card). No band tint.
export function CountertopQuote<F extends Field>({ id, action, fields, product, image }: Props<F>) {
  return (
    <section className="scroll-mt-24 @container" id={id}>
      <div className="mx-auto max-w-screen-2xl px-6 py-14 @xl:px-9 @xl:py-16 @4xl:px-14 @4xl:py-20">
        {/* One rounded card, like the reference: the photo fills the left half (inset, rounded),
            the form sits centred on the right. */}
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
            <div className="mx-auto w-full max-w-lg">
              <p className="mb-1.5 text-center text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
                Get a countertop quote
              </p>
              <h2 className={clsx(homeHeadingClassName, 'text-center')}>
                {product ? `Request a quote for ${product}` : 'Request your quote'}
              </h2>
              <p className="mx-auto mt-2 max-w-[48ch] text-center text-sm leading-relaxed text-contrast-500">
                {product
                  ? `Tell us roughly how much you need and we'll price it, usually the same day. A rough number is fine: we measure before we cut.`
                  : "Tell us your counters and we'll price them, usually the same day. A rough number is fine: we measure before we cut."}
              </p>
              {/* Compact inputs: the shared form controls are sized for standalone pages. */}
              <div className="mt-7 @container [&_.space-y-6]:space-y-4 [&_button[role=combobox]]:!h-11 [&_button[role=combobox]]:!pl-4 [&_button[role=combobox]]:!text-sm [&_button[type=submit]]:w-full [&_input]:!px-4 [&_input]:!py-2.5 [&_input]:!text-sm [&_textarea]:!min-h-20 [&_textarea]:!px-4 [&_textarea]:!py-2.5 [&_textarea]:!text-sm">
                <DynamicForm action={action} fields={fields} submitLabel="Request my quote" />
              </div>
              <p className="mt-4 text-center text-xs text-contrast-500">
                Your details stay with us. No spam, ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
