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
      className={clsx(
        // Solid white background so the inactive side never shows the utility bar / page content
        // bleeding through (the control is otherwise transparent).
        'inline-flex items-center rounded-full border bg-white p-0.5 text-xs font-medium',
        // Outline matches the active mode: red for Homeowner, blue for Pro.
        mode === 'pro' ? 'border-[#a9d6e0]' : 'border-[var(--button-tertiary-border,#96050f)]',
      )}
      data-pending={isPending ? true : null}
      role="group"
    >
      {OPTIONS.map((option) => {
        const active = option.value === mode;
        // Active pill color per mode: Homeowner = brand red (white text), Pro = light blue
        // #A9D6E0 (dark text, since the blue is light).
        const activeClass =
          option.value === 'pro'
            ? 'bg-[#a9d6e0] text-foreground'
            : 'bg-[var(--button-primary-background,hsl(var(--primary)))] text-white';

        return (
          <button
            aria-pressed={active}
            className={clsx(
              'rounded-full px-3 py-1 uppercase tracking-wide transition-colors',
              active ? activeClass : 'text-contrast-500 hover:text-foreground',
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
