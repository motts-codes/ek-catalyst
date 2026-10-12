'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { prefersReducedMotion } from './scroll-utils';

interface Props {
  /** One entry per line; words appear one at a time, line by line, once the band is in view. */
  lines: string[];
  /** Words to set in brand red (matched without punctuation, case-insensitive). */
  accentWords?: string[];
  className?: string;
}

const WORD_EVERY_MS = 110;

// A statement band: three big centred lines (each kept to one line from tablet up) whose words
// fade and lift into place one after another when the band scrolls into view. Plays once. Under
// reduced motion every word is simply there. The text is real text throughout.
export function StatementReveal({ lines, accentWords = [], className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const accents = new Set(accentWords.map((w) => w.toLowerCase()));
  const isAccent = (word: string) => accents.has(word.toLowerCase().replace(/[^a-z0-9']/g, ''));
  const total = lines.reduce((n, line) => n + line.split(' ').length, 0);
  // Server-rendered with every word (reduced motion / no JS); the effect takes over on mount.
  const [shown, setShown] = useState(() => total);

  useEffect(() => {
    const section = ref.current;

    if (!section || prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    setShown(0);

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();

        let count = 0;
        const tick = () => {
          count += 1;
          setShown(count);
          if (count < total) timer = window.setTimeout(tick, WORD_EVERY_MS);
        };

        timer = window.setTimeout(tick, 150);
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [total]);

  let index = 0;

  return (
    <section className={clsx('bg-white @container', className)} ref={ref}>
      <div className="mx-auto flex max-w-screen-2xl justify-center px-6 py-20 @xl:px-9 @xl:py-28 @4xl:py-36">
        <p className="max-w-5xl text-center font-heading text-[1.75rem] font-bold leading-[1.15] tracking-tight @md:text-4xl @3xl:text-[44px] @5xl:text-[52px]">
          {lines.map((line, lineIndex) => (
            <span className="block @md:whitespace-nowrap" key={line}>
              {line.split(' ').map((word, wordIndex, words) => {
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
                    {wordIndex < words.length - 1 ? ' ' : ''}
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
