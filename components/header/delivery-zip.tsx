'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { LocateFixed, Truck } from 'lucide-react';
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

const LOCATION_MESSAGES = {
  denied: 'Location access is blocked in your browser. Enter your ZIP instead.',
  'outside-us':
    "Looks like you're outside the US. We deliver within the US only, so enter a US ZIP.",
  unknown: "We couldn't work out your ZIP from your location. Enter it instead.",
} as const;

type LocateResult = { status: 'ok'; value: ZipInput } | { status: keyof typeof LOCATION_MESSAGES };

interface ZipInput {
  zip: string;
  town?: string;
  state?: string;
}

// Browser position → ZIP (plus town/state) through Mapbox. Only asked for on the button, never on
// load: an unprompted permission dialog is easy to deny for good. Coordinates are not kept.
async function locateZip(token: string): Promise<LocateResult> {
  if (!('geolocation' in navigator)) return { status: 'unknown' };

  const position = await new Promise<
    { coords: GeolocationCoordinates } | { deniedOrFailed: 'denied' | 'unknown' }
  >((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ coords }),
      (error) =>
        resolve({ deniedOrFailed: error.code === error.PERMISSION_DENIED ? 'denied' : 'unknown' }),
      { maximumAge: 300_000, timeout: 10_000 },
    );
  });

  if ('deniedOrFailed' in position) return { status: position.deniedOrFailed };

  const { reverseGeocodeZip } = await import('~/lib/pages/showroom-distance');
  const result = await reverseGeocodeZip(
    { lat: position.coords.latitude, lng: position.coords.longitude },
    token,
  );

  if (result.status !== 'ok') return { status: result.status };

  const { origin } = result;

  return { status: 'ok', value: { zip: origin.label, town: origin.town, state: origin.state } };
}

// Name a typed ZIP in the browser when we can (a URL-locked Mapbox token only works here); the
// action falls back to its own lookup, and to the bare ZIP, when we can't.
async function nameZip(zip: string, token?: string): Promise<ZipInput> {
  if (!token) return { zip };

  try {
    const { geocodeZip } = await import('~/lib/pages/showroom-distance');
    const origin = await geocodeZip(zip, token);

    return { zip, town: origin?.town, state: origin?.state };
  } catch {
    return { zip };
  }
}

// "Deliver to 06010" in the utility strip, after the call number. Click for a small popover with a
// "Use my location" button and a single ZIP field; saving sets the ek_zip cookie, re-quotes the
// cart's shipping, and the label updates in place. EK ships within the US only, so a ZIP is all
// that's asked for.
export function DeliveryZip({ value, mapboxToken }: Props) {
  const id = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(value);
  const [zip, setZip] = useState(value?.zip ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);

  const persist = async (input: ZipInput) => {
    const result = await saveDeliveryZip(input);

    if (!result.ok) {
      setError(result.error);

      return;
    }

    setCurrent(result.value);
    setOpen(false);
    // Pages that read the cookie (cart, showrooms) pick up the new ZIP.
    router.refresh();
  };

  const submit = () => {
    const trimmed = zip.trim();

    if (!/^\d{5}$/.test(trimmed)) {
      setError('Enter a 5-digit ZIP code.');

      return;
    }

    setError(null);
    startTransition(async () => {
      await persist(await nameZip(trimmed, mapboxToken));
    });
  };

  const useMyLocation = () => {
    if (!mapboxToken) return;

    setError(null);
    setLocating(true);
    startTransition(async () => {
      try {
        const found = await locateZip(mapboxToken);

        if (found.status === 'ok') {
          setZip(found.value.zip);
          await persist(found.value);
        } else {
          setError(LOCATION_MESSAGES[found.status]);
        }
      } catch {
        setError(LOCATION_MESSAGES.unknown);
      } finally {
        setLocating(false);
      }
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
            {mapboxToken ? (
              <>
                <button
                  aria-busy={locating || undefined}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-contrast-200 bg-white px-3 text-sm font-medium text-foreground transition-colors hover:border-[var(--button-primary-background,#d90716)] hover:text-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 disabled:opacity-60"
                  disabled={pending}
                  onClick={useMyLocation}
                  type="button"
                >
                  <LocateFixed aria-hidden size={16} strokeWidth={1.75} />
                  {locating ? 'Finding your ZIP…' : 'Use my location'}
                </button>
                <p
                  aria-hidden
                  className="my-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-contrast-400 before:h-px before:flex-1 before:bg-contrast-100 after:h-px after:flex-1 after:bg-contrast-100"
                >
                  or
                </p>
              </>
            ) : null}
            <div className={clsx('flex gap-2', !mapboxToken && 'mt-3')}>
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
