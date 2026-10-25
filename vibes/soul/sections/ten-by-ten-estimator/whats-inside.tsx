'use client';

import { clsx } from 'clsx';
import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Image } from '~/components/image';
import type { TenByTenCabinet } from '~/lib/estimator/ten-by-ten';

const DWELL_MS = 3200;

// "What's in our 10×10": the cabinet list on the left, one line per cabinet group separated by
// rules, the current one red; its product photo on the right. Cycles on its own, pauses while
// hovered or focused, and any line can be clicked. Still under reduced motion.
export function WhatsInside({ items, title }: { items: TenByTenCabinet[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || stopped || still || items.length < 2) return;

    const timer = window.setInterval(() => setIndex((i) => (i + 1) % items.length), DWELL_MS);

    return () => window.clearInterval(timer);
  }, [paused, stopped, still, items.length, index]);

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
        <div aria-hidden className="mt-4 h-px w-4/5 bg-contrast-100" />
        <ul>
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
                </button>
                <span aria-hidden className="relative block h-px w-4/5 bg-contrast-100">
                  {on && !still && !paused && !stopped ? (
                    <span
                      className="absolute inset-y-0 left-0 bg-[var(--button-primary-background,#d90716)] motion-safe:animate-[whats-inside-fill_3.2s_linear]"
                      key={index}
                    />
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        {items.map((item, i) => (
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
        ))}
        {still ? null : (
          <button
            aria-label={stopped ? 'Play the cabinet tour' : 'Pause the cabinet tour'}
            aria-pressed={stopped}
            className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg border border-contrast-200 bg-white text-foreground transition-colors hover:border-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setStopped((v) => !v)}
            type="button"
          >
            {stopped ? (
              <Play aria-hidden size={14} strokeWidth={2} />
            ) : (
              <Pause aria-hidden size={14} strokeWidth={2} />
            )}
          </button>
        )}
        <p aria-live="polite" className="sr-only">
          {current?.label}
        </p>
      </div>
      <style>{'@keyframes whats-inside-fill{from{width:0}to{width:100%}}'}</style>
    </div>
  );
}
