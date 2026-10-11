'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { homeHeadingClassName } from '@/vibes/soul/sections/home-section';

import { prefersReducedMotion } from './scroll-utils';

interface Lane {
  label: string;
  value: string;
  /** Bar length, 0–100, to scale. */
  width: number;
  highlight?: boolean;
}

interface Props {
  kicker: string;
  title: string;
  description: string;
  lanes: Lane[];
  note?: string;
}

// "Why wait 14 weeks?": two bars drawn to scale, the industry's in grey and ours in red, that
// grow from zero the first time they scroll into view.
export function WaitBand({ kicker, title, description, lanes, note }: Props) {
  const raceRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const race = raceRef.current;

    if (!race || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setRevealed(true);

      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    io.observe(race);

    return () => io.disconnect();
  }, []);

  return (
    <section className="bg-[#f9fafd] @container">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 @xl:px-9 @xl:py-24 @4xl:px-14 @4xl:py-32">
        {/* Brand red rather than the lighter pink the client asked for: #F9858D is 2.3:1 on
            this band, below the 4.5:1 small text needs; the nearest passing shade of that hue is
            this red. */}
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--button-primary-background,#d90716)]">
          {kicker}
        </p>
        <h2 className={clsx(homeHeadingClassName, '@4xl:text-4xl')}>{title}</h2>
        <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-contrast-500 @xl:text-lg">
          {description}
        </p>
        <div className="mt-10 grid gap-6" ref={raceRef}>
          {lanes.map((lane) => (
            <div className="grid gap-2" key={lane.label}>
              <div className="flex justify-between gap-3 text-sm font-semibold @xl:text-base">
                <span>{lane.label}</span>
                <span className="font-heading tabular-nums">{lane.value}</span>
              </div>
              <div className="h-[18px] overflow-hidden rounded-sm bg-contrast-100">
                <span
                  className={clsx(
                    'block h-full origin-left transition-transform ease-smooth',
                    lane.highlight
                      ? 'bg-[var(--button-primary-background,#d90716)] duration-700'
                      : 'duration-[2400ms] bg-contrast-400',
                    revealed ? 'scale-x-100' : 'scale-x-0',
                  )}
                  style={{ width: `${lane.width}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {Boolean(note) && <p className="mt-4 text-xs text-contrast-500">{note}</p>}
      </div>
    </section>
  );
}
