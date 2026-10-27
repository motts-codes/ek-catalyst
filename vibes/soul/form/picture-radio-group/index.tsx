'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import { Check, CircleHelp } from 'lucide-react';
import * as React from 'react';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';
import { Image } from '~/components/image';

export interface PictureRadioOption {
  value: string;
  label: string;
  /** The tile's picture; without one the tile shows a question mark (for "Not sure yet"). */
  image?: { src: string; alt?: string };
  disabled?: boolean;
}

const RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2';

// Picture tiles as a radio group: the estimator's layout cards (white tile, picture, bold label,
// red check badge and red outline when chosen) inside a lead form.
export const PictureRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    label?: string;
    options: PictureRadioOption[];
    errors?: string[];
    /** Tiles per row from the small breakpoint up (two or three on phones). Four or five make
     *  small tiles: a single compact row of layouts. */
    columns?: 2 | 3 | 4 | 5;
  }
>(({ label, options, errors, columns = 2, className, required, ...rest }, ref) => {
  const id = React.useId();
  const small = columns >= 4;

  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && (
        <Label id={id} required={required}>
          {label}
        </Label>
      )}
      <RadioGroupPrimitive.Root
        {...rest}
        aria-labelledby={id}
        className={clsx(
          'grid',
          small ? 'gap-2' : 'gap-3',
          {
            2: 'grid-cols-2',
            3: 'grid-cols-2 @sm:grid-cols-3',
            4: 'grid-cols-2 @sm:grid-cols-4',
            5: 'grid-cols-3 @sm:grid-cols-5',
          }[columns],
        )}
        ref={ref}
        required={required}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            className={clsx(
              'group flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left transition-[border-color,box-shadow]',
              RING,
              'data-[state=checked]:border-[var(--button-primary-background,#d90716)] data-[state=checked]:shadow-[0_0_0_1px_var(--button-primary-background,#d90716),0_24px_48px_-28px_rgb(0_0_0/0.3)]',
              'data-[state=unchecked]:border-contrast-200 data-[state=unchecked]:hover:border-[#fcb6bb] data-[state=unchecked]:hover:shadow-[0_18px_36px_-28px_rgb(0_0_0/0.3)]',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              errors != null && errors.length > 0 && 'data-[state=unchecked]:border-error',
            )}
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            <span className="relative block aspect-[4/3] w-full bg-[#f6f6f8]">
              {option.image ? (
                <Image
                  alt={option.image.alt ?? ''}
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(min-width: 48rem) 12rem, 45vw"
                  src={option.image.src}
                />
              ) : (
                <span className="flex h-full items-center justify-center text-contrast-300">
                  <CircleHelp aria-hidden size={small ? 24 : 36} strokeWidth={1.5} />
                </span>
              )}
              <span
                aria-hidden
                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-white opacity-0 transition-opacity group-data-[state=checked]:opacity-100"
              >
                <Check size={12} strokeWidth={3} />
              </span>
            </span>
            <span
              className={clsx(
                'block w-full font-heading font-bold leading-tight',
                small ? 'px-2 py-1.5 text-xs' : 'px-3 py-2.5 text-sm',
              )}
            >
              {option.label}
            </span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      {errors?.map((error) => (
        <FieldError key={error}>{error}</FieldError>
      ))}
    </div>
  );
});

PictureRadioGroup.displayName = 'PictureRadioGroup';
