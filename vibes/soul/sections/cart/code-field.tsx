'use client';

import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { slideFillPositioned } from '@/vibes/soul/lib/slide-fill';

// One row of the cart's "Offers & rewards" card: an icon, a pill-shaped code input and an Apply
// button tucked inside the pill. Shared by the coupon and gift certificate forms.
interface Props {
  icon: ReactNode;
  inputProps: ComponentPropsWithoutRef<'input'>;
  label: string;
  placeholder?: string;
  ctaLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
}

export function CodeField({
  icon,
  inputProps,
  label,
  placeholder,
  ctaLabel = 'Apply',
  disabled = false,
  invalid = false,
}: Props) {
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center text-contrast-500"
      >
        {icon}
      </span>
      <div className="relative min-w-0 flex-1">
        <label className="sr-only" htmlFor={inputProps.id}>
          {label}
        </label>
        <input
          {...inputProps}
          aria-invalid={invalid || undefined}
          autoCapitalize="characters"
          autoComplete="off"
          className={clsx(
            'focus:ring-[var(--button-primary-background,#d90716)]/20 h-12 w-full rounded-full border bg-white pl-5 pr-24 text-sm text-foreground placeholder:text-contrast-400 focus:border-[var(--button-primary-background,#d90716)] focus:outline-none focus:ring-2 disabled:opacity-60',
            invalid ? 'border-[var(--button-primary-background,#d90716)]' : 'border-contrast-200',
          )}
          disabled={disabled}
          onInput={(event) => setHasValue(event.currentTarget.value.trim() !== '')}
          placeholder={placeholder}
          spellCheck={false}
        />
        <ApplyButton disabled={disabled || !hasValue}>{ctaLabel}</ApplyButton>
      </div>
    </div>
  );
}

function ApplyButton({ children, disabled }: { children: ReactNode; disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending || undefined}
      className={clsx(
        slideFillPositioned,
        'absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-[var(--button-primary-background,#d90716)] after:rounded-full after:bg-[#fdf3f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] disabled:pointer-events-none disabled:opacity-40',
      )}
      disabled={disabled || pending}
      name="intent"
      type="submit"
      value="apply"
    >
      {pending ? <Loader2 aria-hidden className="animate-spin" size={14} /> : null}
      {children}
    </button>
  );
}
