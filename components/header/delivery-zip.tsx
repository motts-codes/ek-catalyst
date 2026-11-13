'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { Truck } from 'lucide-react';
import { useId, useState, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { useRouter } from '~/i18n/routing';
import { saveDeliveryZip } from '~/lib/delivery/delivery-zip-action';
import { DeliveryZip as DeliveryZipValue, formatDeliveryZip } from '~/lib/delivery/zip-shared';

interface Props {
  /** The remembered ZIP from the cookie, if any. */
  value: DeliveryZipValue | null;
  /** The Mapbox public token; with it the ZIP is named ("Bristol, CT") in the browser. */
  mapboxToken?: string;
}

// "Deliver to 06010" in the utility strip, after the call number. Click for a small popover with a
// single ZIP field; saving sets the ek_zip cookie, re-quotes the cart's shipping, and the label
// updates in place. EK ships within the US only, so a ZIP is all that's asked for.
export function DeliveryZip({ value, mapboxToken }: Props) {
  const id = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(value);
  const [zip, setZip] = useState(value?.zip ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const trimmed = zip.trim();

    if (!/^\d{5}$/.test(trimmed)) {
      setError('Enter a 5-digit ZIP code.');

      return;
    }

    setError(null);
    startTransition(async () => {
      // Name the ZIP in the browser when we can (a URL-locked Mapbox token only works here); the
      // action falls back to its own lookup, and to the bare ZIP, when we can't.
      let town: string | undefined;
      let state: string | undefined;

      if (mapboxToken) {
        try {
          const { geocodeZip } = await import('~/lib/pages/showroom-distance');
          const origin = await geocodeZip(trimmed, mapboxToken);

          town = origin?.town;
          state = origin?.state;
        } catch {
          // Fine: the server will try, or the ZIP goes through on its own.
        }
      }

      const result = await saveDeliveryZip({ zip: trimmed, town, state });

      if (!result.ok) {
        setError(result.error);

        return;
      }

      setCurrent(result.value);
      setOpen(false);
      // Pages that read the cookie (cart, showrooms) pick up the new ZIP.
      router.refresh();
    });
  };

  const label = current ? formatDeliveryZip(current) : null;

  return (
    <Popover.Root
      onOpenChange={(next) => {
        setOpen(next);

        if (next) {
          setZip(current?.zip ?? '');
          setError(null);
        }
      }}
      open={open}
    >
      <Popover.Trigger
        aria-label={current ? `Delivery ZIP ${current.zip}. Change` : 'Set your delivery ZIP code'}
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium transition-colors hover:text-[var(--utility-bar-text-hover,#fff)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-1"
      >
        <Truck aria-hidden size={14} strokeWidth={1.75} />
        {current ? (
          <>
            <span className="hidden sm:inline">Deliver to </span>
            <span className="text-[var(--button-primary-background,#d90716)]">{current.zip}</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Delivery ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-50 w-72 rounded-2xl bg-white p-4 text-foreground shadow-xl ring-1 ring-contrast-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          sideOffset={8}
        >
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label className="block text-sm font-semibold" htmlFor={`${id}-zip`}>
              Where should we deliver?
            </label>
            <p className="mt-0.5 text-xs text-contrast-500">
              {label
                ? `Showing delivery for ${label}.`
                : 'Your ZIP code gives you a shipping estimate in the cart and your nearest showroom.'}
            </p>
            <div className="mt-3 flex gap-2">
              <input
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error ? true : undefined}
                autoComplete="postal-code"
                className={clsx(
                  'focus:ring-[var(--button-primary-background,#d90716)]/20 h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm text-foreground placeholder:text-contrast-400 focus:outline-none focus:ring-2',
                  error
                    ? 'border-[var(--button-primary-background,#d90716)]'
                    : 'border-contrast-200 focus:border-[var(--button-primary-background,#d90716)]',
                )}
                id={`${id}-zip`}
                inputMode="numeric"
                maxLength={5}
                name="zip"
                onChange={(event) => {
                  setZip(event.target.value.replace(/\D/g, '').slice(0, 5));
                  if (error) setError(null);
                }}
                pattern="[0-9]{5}"
                placeholder="ZIP code"
                type="text"
                value={zip}
              />
              <Button loading={pending} size="small" type="submit" variant="primary">
                Save
              </Button>
            </div>
            {error ? (
              <p
                className="mt-2 text-xs text-[var(--button-primary-background,#d90716)]"
                id={`${id}-error`}
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </form>
          <Popover.Arrow className="fill-white" height={6} width={12} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
