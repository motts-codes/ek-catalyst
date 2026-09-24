'use client';

import { clsx } from 'clsx';
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

// "Six showrooms across Connecticut." — one pill per showroom cycling every few seconds; the
// photo on the right is that showroom's interior. Hover a pill to hold it, click to open it.
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

  useEffect(() => {
    if (held || interval <= 0 || showrooms.length < 2) return;

    const timer = window.setInterval(
      () => setActive((activeIndex) => (activeIndex + 1) % showrooms.length),
      interval,
    );

    return () => window.clearInterval(timer);
  }, [held, interval, showrooms.length]);

  const current = showrooms[active] ?? showrooms[0];

  if (!current) return null;

  return (
    <HomeSection className={className} tint={tint}>
      <div className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-12">
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
            className="mt-6 flex flex-wrap gap-2"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
          >
            {showrooms.map((showroom, index) => (
              <li key={showroom.name}>
                <Link
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    index === active
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-contrast-200 bg-white text-contrast-500 hover:border-foreground hover:text-foreground',
                  )}
                  href={showroom.href}
                  onFocus={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                >
                  {showroom.name}
                  {Boolean(showroom.badge) && (
                    <span className="text-[11px] font-normal opacity-75">· {showroom.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-contrast-100 @3xl:aspect-[5/4]">
          {current.image ? (
            <Image
              alt={current.image.alt}
              className="object-cover"
              fill
              key={current.name}
              sizes="(min-width: 56rem) 50vw, 100vw"
              src={current.image.src}
            />
          ) : (
            <MediaPlaceholder label={`${current.name} showroom`} />
          )}
        </div>
      </div>
    </HomeSection>
  );
}
