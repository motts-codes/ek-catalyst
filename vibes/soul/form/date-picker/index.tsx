import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef, useState } from 'react';

import { Input } from '@/vibes/soul/form/input';
import { Calendar } from '@/vibes/soul/primitives/calendar';

type CalendarProps = ComponentPropsWithoutRef<typeof Calendar>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (date: Date | undefined): date is Date =>
  date != null && !Number.isNaN(date.getTime());

// A calendar day as `yyyy-mm-dd` in the visitor's own time zone (no UTC shift).
export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

// The reverse: `yyyy-mm-dd` to local midnight of that day. Anything else goes through `Date`
// parsing; an unparseable value (a day-first locale string, say) gives undefined, never an
// Invalid Date that would throw inside `Intl.DateTimeFormat`.
export function parseISODate(value: string | Date | undefined): Date | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) return isValidDate(value) ? value : undefined;

  const match = ISO_DATE.exec(value);
  const date = match
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)))
    : new Date(value);

  return isValidDate(date) ? date : undefined;
}

// Local midnight today, in the visitor's browser.
export function startOfToday(): Date {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const formatForDisplay = (date: Date | undefined) =>
  isValidDate(date) ? Intl.DateTimeFormat().format(date) : undefined;

type Props = {
  defaultValue?: string | Date;
  disabledDays?: CalendarProps['disabled'];
  errors?: string[];
  onSelect?: (date: Date | undefined) => void;
  selected?: Date | undefined;
  colorScheme?: 'light' | 'dark';
} & Omit<ComponentPropsWithoutRef<typeof Input>, 'defaultValue' | 'onSelect' | 'value' | 'type'>;

const DatePicker = forwardRef<ComponentRef<typeof Input>, Props>(
  (
    {
      defaultValue,
      disabledDays,
      errors,
      onSelect,
      placeholder = 'MM/DD/YYYY',
      required = false,
      selected,
      colorScheme = 'light',
      name,
      ...props
    },
    ref,
  ) => {
    // State to manage the selected date (uncontrolled use)
    const [date, setDate] = useState<Date | undefined>(() => parseISODate(defaultValue));
    const current = selected ?? date;

    // The visible box shows the day the way the visitor's locale writes it. The form gets the
    // same day as `yyyy-mm-dd` from the hidden input below, so the value never depends on the
    // locale (a day-first "25/11/2026" cannot be parsed back; that crashed the booking form).
    const display = formatForDisplay(current) ?? '';

    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <Input
            {...props}
            colorScheme={colorScheme}
            errors={errors}
            placeholder={placeholder}
            prepend={<CalendarIcon className="h-5 w-5" strokeWidth={1} />}
            readOnly={true}
            ref={ref}
            required={required}
            // Radix sets aria-expanded/aria-haspopup on the trigger; those are only valid on a
            // combobox, not a plain textbox (axe aria-allowed-attr).
            role="combobox"
            type="text"
            value={display}
          />
        </PopoverPrimitive.Trigger>
        {name != null && (
          <input name={name} type="hidden" value={current != null ? toISODate(current) : ''} />
        )}
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            className="z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            sideOffset={8}
          >
            <Calendar
              colorScheme={colorScheme}
              disabled={disabledDays}
              mode="single"
              onSelect={onSelect ?? setDate}
              selected={current}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
