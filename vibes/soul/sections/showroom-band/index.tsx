'use client';

import { clsx } from 'clsx';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { HomeSection, MediaPlaceholder } from '@/vibes/soul/sections/home-section';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface Showroom {
  name: string;
  href: string;
  /** e.g. "factory outlet" */
  badge?: string;
  image?: { src: string; alt: string };
}

interface Props {
  kicker?: string;
  title?: string;
  description?: string;
  showrooms: Showroom[];
  /** Auto-cycle interval, ms. 0 disables. */
  interval?: number;
  tint?: boolean;
  className?: string;
}

// "Six showrooms across Connecticut." — a list of showroom pills with a progress line that times
// the auto-cycle; the photo on the right crossfades to the active showroom and carries its name
// as a caption chip. Hover a pill to hold it, click to open the showroom page.
export function ShowroomBand({
  kicker = 'Your local design studio',
  title = 'Six showrooms across Connecticut.',
  description,
  showrooms,
  interval = 3500,
  tint = false,
  className,
}: Props) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const cycling = !held && interval > 0 && showrooms.length > 1;

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
    <HomeSection className={className} tint={tint}>
      <style>{`@keyframes ek-showroom-progress { from { width: 0; } to { width: 100%; } }`}</style>
      <div className="grid items-center gap-8 @3xl:grid-cols-[1fr_1.15fr] @3xl:gap-14">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-contrast-400">
            {kicker}
          </p>
          <h2 className="font-heading text-2xl font-medium leading-tight @xl:text-3xl @4xl:text-4xl">
            {title}
          </h2>
          {Boolean(description) && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base">
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
                <li key={showroom.name}>
                  <Link
                    className={clsx(
                      'relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-foreground bg-foreground text-white'
                        : 'border-contrast-200 bg-white text-contrast-500 hover:border-foreground hover:text-foreground',
                    )}
                    href={showroom.href}
                    onFocus={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                  >
                    <MapPin aria-hidden size={14} strokeWidth={2} />
                    {showroom.name}
                    {Boolean(showroom.badge) && (
                      <span className="text-[11px] font-normal opacity-75">· {showroom.badge}</span>
                    )}
                    {/* Progress line: fills over one interval while this pill is the active one. */}
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
          </ul>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-contrast-100 ring-1 ring-contrast-100 @3xl:aspect-[5/4]">
          {showrooms.map((showroom, index) => (
            <div
              className={clsx(
                'absolute inset-0 transition-opacity duration-700 ease-out',
                index === active ? 'opacity-100' : 'opacity-0',
              )}
              key={showroom.name}
            >
              {showroom.image ? (
                <Image
                  alt={showroom.image.alt}
                  className="object-cover"
                  fill
                  sizes="(min-width: 56rem) 55vw, 100vw"
                  src={showroom.image.src}
                />
              ) : (
                <MediaPlaceholder label={`${showroom.name} showroom`} />
              )}
            </div>
          ))}
          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-foreground shadow-md">
            <MapPin
              aria-hidden
              className="text-[var(--button-primary-background,#d90716)]"
              size={15}
            />
            {current.name}
            {Boolean(current.badge) && (
              <span className="font-normal text-contrast-500">· {current.badge}</span>
            )}
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
