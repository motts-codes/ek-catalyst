'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { clamp01, onScrollFrame, pinnedProgress, prefersReducedMotion } from './scroll-utils';

interface Props {
  /** One entry per line; words reveal one at a time, line by line, as the section scrolls. */
  lines: string[];
  /** Words to set in brand red (matched without punctuation, case-insensitive). */
  accentWords?: string[];
  className?: string;
}

// A pinned statement: three big centred lines (each kept to one line from tablet up) whose words fade and lift
// into place one by one as you scroll through the section, then the page carries on. Under reduced motion every word is
// simply there. The text is real text throughout (screen readers get the whole statement).
export function StatementReveal({ lines, accentWords = [], className }: Props) {
  const accents = new Set(accentWords.map((w) => w.toLowerCase()));
  const isAccent = (word: string) => accents.has(word.toLowerCase().replace(/[^a-z0-9']/g, ''));
  const ref = useRef<HTMLElement>(null);
  const words = lines.flatMap((line, lineIndex) =>
    line.split(' ').map((word) => ({ word, lineIndex })),
  );
  const [shown, setShown] = useState(() => words.length);

  useEffect(() => {
    const section = ref.current;

    if (!section || prefersReducedMotion()) return;

    setShown(0);

    return onScrollFrame(() => {
      // The reveal runs over the first 80% of the pinned travel, so the finished statement holds
      // for a beat before the section scrolls away.
      const progress = clamp01(pinnedProgress(section) / 0.8);

      setShown(Math.round(progress * words.length));
    });
  }, [words.length]);

  let index = 0;

  return (
    <section className={clsx('relative h-[220vh] bg-white @container', className)} ref={ref}>
      <div className="sticky top-0 flex h-screen items-center justify-center px-6 @xl:px-9">
        <p className="max-w-5xl text-center font-heading text-[1.75rem] font-bold leading-[1.15] tracking-tight @md:text-4xl @3xl:text-[44px] @5xl:text-[52px]">
          {lines.map((line, lineIndex) => (
            <span className="block @md:whitespace-nowrap" key={line}>
              {line.split(' ').map((word, wordIndex) => {
                const visible = index < shown;

                index += 1;

                return (
                  <span
                    className={clsx(
                      'inline-block transition-[opacity,transform] duration-500 ease-smooth motion-reduce:transition-none',
                      isAccent(word) && 'text-[var(--button-primary-background,#d90716)]',
                      visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                    )}
                    key={`${lineIndex}-${wordIndex}`}
                  >
                    {word}
                    {wordIndex < line.split(' ').length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
