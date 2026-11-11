'use client';

import { clsx } from 'clsx';
import { LocateFixed, Search } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { geocodeZip, isUsZip, type SearchOrigin } from '~/lib/pages/showroom-distance';

interface Props {
  /** The Mapbox public token the geocoder uses. Without one the form isn't shown. */
  token?: string;
  onLocate: (origin: SearchOrigin) => void;
  className?: string;
}

type Busy = 'idle' | 'zip' | 'geo';

const MESSAGES = {
  invalid: 'Enter a 5-digit ZIP code.',
  unknown: "We couldn't find that ZIP code. Check it and try again.",
  failed: "We couldn't look that up just now. Try again in a moment.",
  denied: "We couldn't get your location. Enter your ZIP code instead.",
} as const;

// "Find your nearest showroom": a ZIP code field with a button, and a link that uses the browser's
// location instead. ZIP only, by design: the six showrooms are all in Connecticut, and a ZIP is
// what people know. The result is handed up; the locator does the ranking.
export function ZipSearch({ token, onLocate, className }: Props) {
  const id = useId();
  const [zip, setZip] = useState('');
  const [busy, setBusy] = useState<Busy>('idle');
  const [message, setMessage] = useState<string | null>(null);

  if (!token) return null;

  const submit = async () => {
    const value = zip.trim();

    if (!isUsZip(value)) {
      setMessage(MESSAGES.invalid);

      return;
    }

    setBusy('zip');
    setMessage(null);

    try {
      const origin = await geocodeZip(value, token);

      if (origin) onLocate(origin);
      else setMessage(MESSAGES.unknown);
    } catch {
      setMessage(MESSAGES.failed);
    } finally {
      setBusy('idle');
    }
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setMessage(MESSAGES.denied);

      return;
    }

    setBusy('geo');
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy('idle');
        onLocate({ lat: coords.latitude, lng: coords.longitude, label: 'your location' });
      },
      () => {
        setBusy('idle');
        setMessage(MESSAGES.denied);
      },
      { maximumAge: 300_000, timeout: 10_000 },
    );
  };

  return (
    <form
      className={className}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <label className="sr-only" htmlFor={`${id}-zip`}>
        Your ZIP code
      </label>
      <div
        className={clsx(
          'focus-within:ring-[var(--button-primary-background,#d90716)]/20 flex items-center gap-2 rounded-full border bg-white p-1.5 pl-4 transition-colors focus-within:border-[var(--button-primary-background,#d90716)] focus-within:ring-2',
          message ? 'border-[var(--button-primary-background,#d90716)]' : 'border-[#fcb6bb]',
        )}
      >
        <Search aria-hidden className="shrink-0 text-contrast-400" size={18} strokeWidth={2} />
        <input
          aria-describedby={message ? `${id}-message` : undefined}
          aria-invalid={message ? true : undefined}
          autoComplete="postal-code"
          className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-contrast-400 focus:outline-none"
          id={`${id}-zip`}
          inputMode="numeric"
          maxLength={5}
          name="zip"
          onChange={(event) => {
            setZip(event.target.value.replace(/\D/g, '').slice(0, 5));
            if (message) setMessage(null);
          }}
          pattern="[0-9]{5}"
          placeholder="Enter your ZIP code"
          type="text"
          value={zip}
        />
        <Button
          className="shrink-0"
          loading={busy === 'zip'}
          shape="pill"
          size="small"
          type="submit"
          variant="primary"
        >
          Find nearest
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-[13px]">
        <button
          className="inline-flex items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:text-[var(--button-primary-background,#d90716)] hover:underline focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2 disabled:opacity-60"
          disabled={busy !== 'idle'}
          onClick={useMyLocation}
          type="button"
        >
          <LocateFixed aria-hidden size={15} strokeWidth={2.25} />
          {busy === 'geo' ? 'Finding you…' : 'Use my location'}
        </button>
        {message ? (
          <p
            className="text-[var(--button-primary-background,#d90716)]"
            id={`${id}-message`}
            role="alert"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
