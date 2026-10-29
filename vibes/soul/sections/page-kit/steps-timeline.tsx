'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

interface Props {
  steps: Array<{ title: string; description: string }>;
  className?: string;
}

const STEP_DELAY_MS = 220;

// Numbered steps down a line: each number is joined to the next by a hairline, and the steps
// appear one after another once the list scrolls into view (all at once with reduced motion).
export function StepsTimeline({ steps, className }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = list.current;

    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setShown(true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <ol className={clsx('space-y-8', className)} data-shown={shown} ref={list}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;

        return (
          <li
            className={clsx(
              'relative flex gap-4 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
              shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            key={step.title}
            style={{ transitionDelay: shown ? `${index * STEP_DELAY_MS}ms` : '0ms' }}
          >
            {/* The line to the next number: grows down from this one as the next appears. */}
            {!last && (
              <span
                aria-hidden
                className={clsx(
                  'absolute left-4 top-8 h-[calc(100%+2rem)] w-px origin-top -translate-x-px bg-[#fcb6bb] transition-transform duration-500 ease-out motion-reduce:transition-none',
                  shown ? 'scale-y-100' : 'scale-y-0',
                )}
                style={{ transitionDelay: shown ? `${index * STEP_DELAY_MS + 150}ms` : '0ms' }}
              />
            )}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-background,#d90716)] text-sm font-bold text-white ring-4 ring-white">
              {index + 1}
            </span>
            <div className="pt-1">
              <p className="font-semibold leading-tight">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-contrast-500">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
