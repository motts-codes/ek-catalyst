'use client';

import { clsx } from 'clsx';
import { MapPin, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  homeHeadingClassName,
  HomeSection,
  MediaPlaceholder,
} from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { type Showroom, showroomHref } from '~/lib/pages/showrooms';

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  showrooms: Showroom[];
  /** A Mapbox public token for the static maps. Without one a placeholder panel is shown. */
  token?: string;
  /** Auto-cycle interval, ms. 0 disables. */
  interval?: number;
  tint?: boolean;
  /** Red panel (default, matches the home page); false for the white version. */
  dark?: boolean;
  className?: string;
}

const MAP_STYLE = 'mapbox/light-v11';
const MAP_ZOOM = 14;
// 16:10, the panel's shape; @2x for sharp text on retina screens.
const MAP_SIZE = '1200x750@2x';
const PIN = 'd90716';

// A Mapbox static map centred on a showroom with a brand-red pin. One image per showroom, so the
// band can crossfade between them exactly as the photo version does.
const staticMapSrc = (showroom: Showroom, token: string) => {
  const { lat, lng } = showroom.coords;
  const pin = `pin-l+${PIN}(${lng},${lat})`;

  return `https://api.mapbox.com/styles/v1/${MAP_STYLE}/static/${pin}/${lng},${lat},${MAP_ZOOM},0/${MAP_SIZE}?access_token=${encodeURIComponent(token)}`;
};

// The showroom band without showroom photos (EK asked for none until the showrooms are
// refinished): the same pills, progress line and auto-cycle, but the right panel is a map of the
// active showroom with its Project Manager on a red card. `ShowroomBand` keeps the photo version
// for when the new photos arrive.
export function ShowroomMapBand({
  kicker = 'Six showrooms across Connecticut',
  title = 'Open the drawers before you buy them.',
  description = 'Bring your Pinterest saves, your measurements, or just an idea. See the real colours in real light, feel the finishes, test the soft-close, and sit down with a Project Manager who’ll price your kitchen, free.',
  showrooms,
  token,
  interval = 3500,
  tint = false,
  dark = true,
  className,
}: Props) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  // The visitor's stop/start button (WCAG 2.2.2); `held` is only the pointer resting on the pills.
  const [stopped, setStopped] = useState(false);
  const cycling = !held && !stopped && interval > 0 && showrooms.length > 1;

  useEffect(() => {
    if (!cycling) return;

    const timer = window.setInterval(
      () => setActive((activeIndex) => (activeIndex + 1) % showrooms.length),
      interval,
    );

    return () => window.clearInterval(timer);
  }, [cycling, interval, showrooms.length]);

  const current = showrooms[active] ?? showrooms[0];

  if (!current) return null;

  return (
    <HomeSection
      className={clsx(dark && 'bg-[#9f3632] text-white', className)}
      tint={tint && !dark}
    >
      <style>{`@keyframes ek-showroom-progress { from { width: 0; } to { width: 100%; } }`}</style>
      <div className="grid items-center gap-8 @3xl:grid-cols-[1fr_1.15fr] @3xl:gap-14">
        <div>
          <p
            className={clsx(
              'mb-1.5 text-xs font-semibold uppercase tracking-wide',
              dark ? 'text-white' : 'text-[var(--button-primary-background,#d90716)]',
            )}
          >
            {kicker}
          </p>
          <h2 className={homeHeadingClassName}>{title}</h2>
          {Boolean(description) && (
            <p
              className={clsx(
                'mt-3 max-w-xl text-sm leading-relaxed @xl:text-base',
                dark ? 'text-white/85' : 'text-contrast-500',
              )}
            >
              {description}
            </p>
          )}
          <ul
            className="mt-7 flex flex-wrap gap-2.5"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
          >
            {showrooms.map((showroom, index) => {
              const isActive = index === active;

              return (
                <li key={showroom.slug}>
                  <Link
                    className={clsx(
                      'relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      isActive &&
                        (dark
                          ? 'border-white bg-white text-foreground'
                          : 'border-foreground bg-foreground text-white'),
                      !isActive &&
                        (dark
                          ? 'border-white/70 bg-transparent text-white hover:border-white'
                          : 'border-contrast-200 bg-white text-contrast-500 hover:border-foreground hover:text-foreground'),
                    )}
                    href={showroomHref(showroom.slug)}
                    onFocus={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                  >
                    <MapPin aria-hidden size={14} strokeWidth={2} />
                    {showroom.name}
                    {isActive && cycling && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--button-primary-background,#d90716)]"
                        key={`${index}-${active}`}
                        style={{ animation: `ek-showroom-progress ${interval}ms linear forwards` }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
            {showrooms.length > 1 && interval > 0 && (
              <li className="flex items-center">
                <button
                  aria-label={stopped ? 'Play showroom rotation' : 'Pause showroom rotation'}
                  aria-pressed={stopped}
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
                    dark
                      ? 'border-white/70 bg-transparent text-white hover:border-white'
                      : 'border-contrast-200 bg-white text-foreground hover:border-foreground',
                  )}
                  onClick={() => setStopped((value) => !value)}
                  type="button"
                >
                  {stopped ? (
                    <Play aria-hidden size={14} strokeWidth={2} />
                  ) : (
                    <Pause aria-hidden size={14} strokeWidth={2} />
                  )}
                </button>
              </li>
            )}
          </ul>
        </div>

        <MapPanel active={active} current={current} showrooms={showrooms} token={token} />
      </div>
    </HomeSection>
  );
}

// The right panel: one static map per showroom, crossfading to the active one, with the showroom
// lead Project Manager on a red card: headshot, name, role, and the showroom name with a pin.
function MapPanel({
  showrooms,
  active,
  current,
  token,
}: {
  showrooms: Showroom[];
  active: number;
  current: Showroom;
  token?: string;
}) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-contrast-100">
      {token ? (
        showrooms.map((showroom, index) => (
          <div
            className={clsx(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              index === active ? 'opacity-100' : 'opacity-0',
            )}
            key={showroom.slug}
          >
            {/* A plain img: the map comes ready-sized from Mapbox, so Next's optimizer would
                only add a hop (and the host isn't in its allow-list). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Map of the ${showroom.name} showroom at ${showroom.address}`}
              className="h-full w-full object-cover"
              decoding="async"
              loading={index === 0 ? 'eager' : 'lazy'}
              src={staticMapSrc(showroom, token)}
            />
          </div>
        ))
      ) : (
        <MediaPlaceholder label={`Map of the ${current.name} showroom`} />
      )}

      <div className="absolute inset-x-4 bottom-4 flex flex-col items-start @xl:inset-x-5 @xl:bottom-5">
        <Link
          className="group/pm flex items-center gap-3 rounded-2xl bg-[var(--button-primary-background,#d90716)] p-2 pr-5 text-white shadow-md transition-colors hover:bg-[#9f3632] focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-white"
          href={showroomHref(current.slug)}
        >
          {current.pm.photo ? (
            <Image
              alt=""
              className="size-14 shrink-0 rounded-full object-cover ring-2 ring-white/80"
              height={56}
              src={current.pm.photo.src}
              width={56}
            />
          ) : (
            <span
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold"
            >
              {current.pm.name.charAt(0)}
            </span>
          )}
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-semibold">{current.pm.name}</span>
            <span className="text-[11px] text-white/80">{current.pm.role}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white">
              <MapPin aria-hidden size={12} strokeWidth={2.25} />
              {current.name}
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
