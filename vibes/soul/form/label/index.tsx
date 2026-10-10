'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { ComponentPropsWithoutRef } from 'react';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --label-light-text: hsl(var(--contrast-500));
 *    --label-dark-text: hsl(var(--contrast-100));
 *  }
 * ```
 */
export function Label({
  className,
  colorScheme = 'light',
  required,
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  colorScheme?: 'light' | 'dark';
  required?: boolean;
}) {
  const t = useTranslations('Form');

  return (
    <LabelPrimitive.Root
      {...rest}
      className={clsx(
        'block text-sm font-medium',
        {
          light: 'text-[var(--label-light-text,hsl(var(--foreground)))]',
          dark: 'text-[var(--label-dark-text,hsl(var(--contrast-100)))]',
        }[colorScheme],
        className,
      )}
    >
      {children}
      {!required && <span className="ml-1 font-normal text-contrast-500">({t('optional')})</span>}
    </LabelPrimitive.Root>
  );
}
