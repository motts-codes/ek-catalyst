'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { useOptimistic, useTransition } from 'react';

import { Select } from '@/vibes/soul/form/select';
import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';

export interface Option {
  label: string;
  value: string;
}

export function Sorting({
  label: streamableLabel,
  options: streamableOptions,
  paramName = 'sort',
  defaultValue = '',
  placeholder: streamablePlaceholder,
}: {
  label?: Streamable<string | null>;
  options: Streamable<Option[]>;
  paramName?: string;
  defaultValue?: string;
  placeholder?: Streamable<string | null>;
}) {
  const [params, setParams] = useQueryStates(
    {
      [paramName]: parseAsString.withDefault(defaultValue),
      before: parseAsString,
      after: parseAsString,
    },
    { shallow: false, history: 'push' },
  );
  const [optimisticParam, setOptimisticParam] = useOptimistic(params[paramName] ?? defaultValue);
  const [isPending, startTransition] = useTransition();
  const options = useStreamable(streamableOptions);
  const label = useStreamable(streamableLabel) ?? 'Sort';
  const placeholder = useStreamable(streamablePlaceholder) ?? 'Sort by';

  return (
    <Select
      // Compact sort dropdown: shorter trigger, 12px text, and a light-red (brand) border. The
      // className lands on the wrapper, so target the trigger button within it.
      className="[&_button]:!h-8 [&_button]:!border-[hsl(var(--primary)/40%)] [&_button]:!pl-3 [&_button]:!text-xs"
      hideLabel
      label={label}
      name={paramName}
      onValueChange={(value) => {
        startTransition(async () => {
          setOptimisticParam(value);
          await setParams({
            [paramName]: value,
            before: null,
            after: null,
          });
        });
      }}
      options={options}
      pending={isPending}
      placeholder={placeholder}
      value={optimisticParam}
      variant="round"
    />
  );
}

export function SortingSkeleton() {
  return <div className="h-8 w-[12ch] animate-pulse rounded-full bg-contrast-100" />;
}
