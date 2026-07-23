'use client';

import { clsx } from 'clsx';
import { useTransition } from 'react';

import { AudienceMode } from '~/lib/navigation/menu-config';
import { switchAudienceMode } from '~/lib/navigation/switch-audience-action';

interface Props {
  mode: AudienceMode;
}

const OPTIONS: Array<{ value: AudienceMode; label: string }> = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'pro', label: 'Pro' },
];

/**
 * Homeowner | Pro audience toggle — a small segmented control. Clicking the inactive side sets the
 * ek_audience cookie via a server action and revalidates, so the header (and page) re-render in the
 * new mode. (Cookie + reload; /pro routing layers on later.)
 */
export function AudienceToggle({ mode }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="inline-flex items-center rounded-full border border-[var(--button-tertiary-border,#96050f)] p-0.5 text-xs font-medium"
      data-pending={isPending ? true : null}
      role="group"
    >
      {OPTIONS.map((option) => {
        const active = option.value === mode;

        return (
          <button
            aria-pressed={active}
            className={clsx(
              'rounded-full px-3 py-1 uppercase tracking-wide transition-colors',
              active
                ? 'bg-[var(--button-primary-background,hsl(var(--primary)))] text-white'
                : 'text-contrast-500 hover:text-foreground',
            )}
            disabled={isPending || active}
            key={option.value}
            onClick={() =>
              startTransition(async () => {
                await switchAudienceMode(option.value);
                // Full reload so the server re-reads the cookie and re-renders the header in the new
                // mode. (router.refresh() doesn't reliably bust the cached header shell here.)
                window.location.reload();
              })
            }
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
