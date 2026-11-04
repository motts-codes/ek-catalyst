'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { clamp01, onScrollFrame, prefersReducedMotion } from '@/vibes/soul/sections/why-us-scroll/scroll-utils';

export interface StoryTimelineItem {
  when: string;
  title: string;
  description: string;
}

interface Props {
  items: StoryTimelineItem[];
  /** Where in the viewport (0 = top, 1 = bottom) a marker has to reach to light up. */
  activation?: number;
  /** Inactive items on a tinted band read against that tint. */
  className?: string;
}

const RED = 'var(--button-primary-background,#d90716)';

// Step-by-step story: the year in a circle down a hairline on the left, the big headline and a
// line of copy beside it. A red fill climbs the line as you scroll; each step lights up as the
// fill reaches its circle, and the steps still to come sit faded. Server-rendered fully lit (no
// JS / reduced motion), the effect takes over on mount.
export function StoryTimelineList({ items, activation = 0.5, className }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(() => items.length - 1);

  useEffect(() => {
    const root = list.current;
    const lineEl = line.current;
    const fillEl = fill.current;

    if (!root || !lineEl || !fillEl || prefersReducedMotion()) return;

    const markers = Array.from(root.querySelectorAll<HTMLElement>('[data-marker]'));

    if (markers.length < 2) return;

    let first = 0;
    let span = 0;
    let fractions: number[] = [];

    const measure = () => {
      const base = root.getBoundingClientRect().top;
      const centers = markers.map((marker) => {
        const box = marker.getBoundingClientRect();

        return box.top + box.height / 2 - base;
      });

      first = centers[0] ?? 0;
      span = (centers[centers.length - 1] ?? first) - first;
      lineEl.style.top = `${first}px`;
      lineEl.style.height = `${span}px`;
      fractions = centers.map((center) => (span > 0 ? (center - first) / span : 0));
    };

    const update = () => {
      measure();

      const activationY = window.innerHeight * activation;
      const firstY = root.getBoundingClientRect().top + first;
      const reached = activationY >= firstY;
      const progress = span > 0 ? clamp01((activationY - firstY) / span) : 1;

      fillEl.style.transform = `scaleY(${reached ? progress : 0})`;

      let index = -1;

      if (reached) {
        fractions.forEach((fraction, i) => {
          if (progress + 0.0001 >= fraction) index = i;
        });
      }

      setCurrent(index);
    };

    setCurrent(-1);

    return onScrollFrame(update);
  }, [activation, items.length]);

  return (
    <ol className={clsx('relative mx-auto max-w-2xl', className)} ref={list}>
      <span
        aria-hidden
        className="absolute left-[27px] w-px bg-contrast-200 @xl:left-[31px]"
        ref={line}
        style={{ top: 0, height: '100%' }}
      >
        <span
          className="absolute inset-0 origin-top transition-transform duration-150 ease-linear"
          ref={fill}
          style={{ backgroundColor: RED, transform: 'scaleY(1)' }}
        />
      </span>
      {items.map((item, index) => {
        const active = index <= current;
        const isCurrent = index === current;

        return (
          <li
            className="relative flex gap-6 pb-14 last:pb-0 @xl:gap-10 @xl:pb-20"
            data-status={active ? 'active' : 'inactive'}
            key={item.when + item.title}
          >
            <span className="relative z-10 shrink-0 self-start">
              {/* The soft halo behind the current step's circle, a touch larger and offset. */}
              <span
                aria-hidden
                className={clsx(
                  'absolute -inset-1.5 translate-x-0.5 translate-y-0.5 rounded-full bg-[var(--button-primary-background,#d90716)]',
                  'transition-opacity duration-500 ease-smooth motion-reduce:transition-none',
                  isCurrent ? 'opacity-[0.15]' : 'opacity-0',
                )}
              />
              <span
                className={clsx(
                  'relative flex h-14 w-14 items-center justify-center rounded-full border font-heading text-sm font-bold tabular-nums',
                  'transition-colors duration-500 ease-smooth motion-reduce:transition-none @xl:h-16 @xl:w-16 @xl:text-base',
                  isCurrent && 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white',
                  active && !isCurrent && 'border-[var(--button-primary-background,#d90716)] bg-white text-[var(--button-primary-background,#d90716)]',
                  !active && 'border-contrast-200 bg-white text-contrast-500',
                )}
                data-marker
              >
                {item.when}
              </span>
            </span>
            <div className="pt-3.5 @xl:pt-4">
              {/* Upcoming steps fade, but only as far as WCAG AA allows: the big bold title to
                  60% on phones where it is not yet large text, 50% from tablet up (3:1 as large text), the body to 90% (4.5:1). */}
              <h3
                className={clsx(
                  'font-heading text-lg font-bold leading-tight @xl:text-xl @4xl:text-2xl',
                  'transition-opacity duration-500 ease-smooth motion-reduce:transition-none',
                  !active && 'opacity-60 @xl:opacity-50',
                )}
              >
                {item.title}
              </h3>
              <p
                className={clsx(
                  'mt-2 max-w-xl text-sm leading-relaxed text-contrast-500 @xl:text-base',
                  'transition-opacity duration-500 ease-smooth motion-reduce:transition-none',
                  !active && 'opacity-90',
                )}
              >
                {item.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
