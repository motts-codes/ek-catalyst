'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Link } from '~/components/link';

export interface SizeChip {
  value: string;
  label: string;
  count: number;
}

/** A chip with its toggle link resolved (so the server can hand the client dropdown plain data). */
export interface SizeChoice extends SizeChip {
  href: string;
  active: boolean;
}

// One size dropdown ("Cabinets Width"): a pill trigger in the sort control's style, opening a
// checklist. Every row is a link that toggles that value (the page re-renders with the new
// selection and the list stays open, so several can be ticked in a row). The trigger shows the
// ticked values after the label.
export function SizeDropdown({ label, options }: { label: string; options: SizeChoice[] }) {
  const [open, setOpen] = useState(false);
  const picked = options.filter((o) => o.active).map((o) => o.label);

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger
        className={clsx(
          'inline-flex h-9 items-center gap-2 rounded-full border-[0.5px] bg-white pl-4 pr-3 text-xs transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-1',
          // A hairline outline, black until something is ticked, then brand red.
          picked.length > 0
            ? 'border-[var(--button-primary-background,#d90716)] font-semibold text-foreground'
            : 'border-foreground text-foreground hover:border-[var(--button-primary-background,#d90716)]',
        )}
      >
        <span>{label}</span>
        {picked.length > 0 && (
          <span className="max-w-[14ch] truncate font-normal text-contrast-500">
            {picked.join(', ')}
          </span>
        )}
        <ChevronDown
          className={clsx('transition-transform duration-300', open && 'rotate-180')}
          size={14}
          strokeWidth={2}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-50 max-h-80 w-56 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-contrast-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={6}
        >
          <ul aria-label={label} className="flex flex-col">
            {options.map((option) => {
              const { active } = option;

              return (
                <li key={option.value}>
                  <Link
                    aria-checked={active}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-contrast-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--button-primary-background,#d90716)]"
                    href={option.href}
                    role="menuitemcheckbox"
                  >
                    <span
                      aria-hidden
                      className={clsx(
                        'flex size-4 shrink-0 items-center justify-center rounded border',
                        active
                          ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                          : 'border-contrast-300 bg-white',
                      )}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className={clsx('flex-1', active && 'font-semibold')}>
                      {option.label}
                    </span>
                    <span className="text-xs text-contrast-400">{option.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
