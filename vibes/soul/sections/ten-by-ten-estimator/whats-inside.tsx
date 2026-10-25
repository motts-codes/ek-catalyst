'use client';

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import { Image } from '~/components/image';
import type { TenByTenCabinetPhoto } from '~/lib/estimator/ten-by-ten-bom';

const DWELL_MS = 3200;

// "What's in our 10×10": the cabinet list on the left, one line per cabinet group separated by
// rules, the current one red; its product photo on the right. Cycles on its own, pauses while
// hovered or focused, and any line can be clicked. Still under reduced motion.
export function WhatsInside({ items, title }: { items: TenByTenCabinetPhoto[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || still || items.length < 2) return;

    const timer = window.setInterval(() => setIndex((i) => (i + 1) % items.length), DWELL_MS);

    return () => window.clearInterval(timer);
  }, [paused, still, items.length, index]);

  const current = items[index];

  return (
    <div
      className="grid items-center gap-8 @3xl:grid-cols-[1fr_1fr] @3xl:gap-14"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div>
        <h3 className="font-heading text-xl font-bold @xl:text-2xl">{title}</h3>
        <ul className="mt-4 divide-y divide-contrast-100 border-y border-contrast-100">
          {items.map((item, i) => {
            const on = i === index;

            return (
              <li key={item.label}>
                <button
                  aria-current={on ? 'true' : undefined}
                  className={clsx(
                    'relative flex w-full items-center gap-3 py-3.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2',
                    on
                      ? 'font-semibold text-foreground'
                      : 'text-contrast-500 hover:text-foreground',
                  )}
                  onClick={() => setIndex(i)}
                  type="button"
                >
                  <span
                    aria-hidden
                    className={clsx(
                      'size-2 shrink-0 rounded-full transition-colors',
                      on ? 'bg-[var(--button-primary-background,#d90716)]' : 'bg-contrast-200',
                    )}
                  />
                  {item.label}
                  {on && !still && !paused ? (
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 h-0.5 rounded-full bg-[var(--button-primary-background,#d90716)] motion-safe:animate-[whats-inside-fill_3.2s_linear]"
                      key={index}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        {items.map((item, i) =>
          item.image ? (
            <Image
              alt={item.image.alt}
              aria-hidden={i !== index}
              className={clsx(
                'object-contain transition-opacity duration-500',
                i === index ? 'opacity-100' : 'opacity-0',
              )}
              fill
              key={item.label}
              sizes="(min-width: 56rem) 28rem, 100vw"
              src={item.image.src}
            />
          ) : null,
        )}
        <p aria-live="polite" className="sr-only">
          {current?.label}
        </p>
      </div>
      <style>{'@keyframes whats-inside-fill{from{width:0}to{width:100%}}'}</style>
    </div>
  );
}
