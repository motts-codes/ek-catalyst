import { clsx } from 'clsx';
import * as React from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { FieldError } from '@/vibes/soul/form/field-error';
import { Label } from '@/vibes/soul/form/label';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  id?: string;
  className?: string;
  label?: string;
  options: Option[];
  errors?: string[];
  name?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  colorScheme?: 'light' | 'dark';
  required?: boolean;
}

export function CheckboxGroup({
  className,
  label,
  options,
  errors,
  name,
  value,
  onValueChange,
  colorScheme = 'light',
  required,
}: Props) {
  const id = React.useId();

  return (
    <div className={clsx('space-y-2', className)}>
      {label !== undefined && label !== '' && (
        <Label colorScheme={colorScheme} id={id} required={required}>
          {label}
        </Label>
      )}
      <div
        aria-labelledby={id}
        className={clsx(
          // Options flow in a row and wrap as the space allows (same panel as the radio group).
          'flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg px-5 py-3.5',
          colorScheme === 'light' && 'bg-[var(--checkbox-group-light-panel,transparent)]',
        )}
      >
        {options.map((option) => (
          <Checkbox
            checked={value.includes(option.value)}
            colorScheme={colorScheme}
            key={option.value}
            label={option.label}
            name={name}
            onCheckedChange={(checked) =>
              onValueChange(
                checked === true
                  ? [...value, option.value]
                  : value.filter((v) => v !== option.value),
              )
            }
            value={option.value}
          />
        ))}
      </div>
      {errors?.map((error) => (
        <FieldError key={error}>{error}</FieldError>
      ))}
    </div>
  );
}
