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
  /** Small print under the note, e.g. where the industry figure comes from. */
  source?: string;
}

// "Why wait 14 weeks?": copy on the left, the lead-time bars on the right — drawn to scale, the
// industry's in grey and ours in red — that grow from zero the first time they scroll into view.
export function WaitBand({ kicker, title, description, lanes, note, source }: Props) {
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
    <section className="bg-[#fdf8f8] @container">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-6 py-14 @xl:px-9 @xl:py-20 @3xl:grid-cols-2 @3xl:items-start @3xl:gap-16 @4xl:px-14 @4xl:py-24">
        <div>
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
        </div>
        <div className="grid gap-5" ref={raceRef}>
          {lanes.map((lane) => (
            <div className="grid gap-2" key={lane.label}>
              <div className="flex justify-between gap-3 text-sm font-semibold @xl:text-base">
                <span>{lane.label}</span>
                <span className="font-heading tabular-nums">{lane.value}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white ring-1 ring-[#fcb6bb]">
                <span
                  className={clsx(
                    'block h-full origin-left rounded-full transition-transform ease-smooth',
                    // The next-day bar is a sliver to scale; keep it at least a dot wide.
                    'min-w-[16px]',
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
          {Boolean(note) && <p className="mt-1 text-xs text-contrast-500">{note}</p>}
          {Boolean(source) && <p className="text-[11px] text-contrast-500">{source}</p>}
        </div>
      </div>
    </section>
  );
}
