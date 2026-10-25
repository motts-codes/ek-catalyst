'use client';

import { clsx } from 'clsx';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Link } from '~/components/link';

export interface GlossaryTerm {
  term: string;
  definition: string;
}

const CYCLE_MS = 3500;

// The glossary as a run of words: the active one is lit red, its meaning sits beneath, and the
// active word moves on every few seconds. Pointing at the words or picking one holds it, and the
// pause button stops the cycling outright (WCAG 2.2.2). People who prefer reduced motion get a
// still list that only changes on click. Drawn for a light panel: dark text, red accent.
export function GlossaryWords({
  terms,
  link,
}: {
  terms: GlossaryTerm[];
  link?: { label: string; href: string };
}) {
  const [active, setActive] = useState(0);
  // Hovering or picking a word holds the cycle; the pause button stops it until pressed again.
  const [held, setHeld] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStopped(true);
    }
  }, []);

  useEffect(() => {
    if (held || stopped) return;

    const timer = window.setInterval(() => setActive((i) => (i + 1) % terms.length), CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [held, stopped, terms.length]);

  const current = terms[active];

  return (
    <div onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}>
      <div className="flex items-start justify-between gap-4">
        <ul className="flex flex-wrap gap-x-2 gap-y-2" role="tablist">
          {terms.map((entry, index) => {
            const on = index === active;

            return (
              <li key={entry.term} role="presentation">
                <button
                  aria-selected={on}
                  className={clsx(
                    'rounded-full border px-3 py-1 font-heading text-sm font-semibold transition-colors duration-300',
                    on
                      ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                      : 'border-white text-foreground/80 hover:bg-white/50 hover:text-foreground',
                  )}
                  onClick={() => {
                    setActive(index);
                    setStopped(true);
                  }}
                  onFocus={() => setActive(index)}
                  role="tab"
                  type="button"
                >
                  {entry.term}
                </button>
              </li>
            );
          })}
        </ul>
        <button
          aria-label={
            stopped ? 'Resume cycling through the words' : 'Pause cycling through the words'
          }
          aria-pressed={stopped}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/30 bg-white/60 text-foreground transition-colors hover:bg-white focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-foreground"
          onClick={() => setStopped((v) => !v)}
          type="button"
        >
          {stopped ? (
            <Play aria-hidden size={14} strokeWidth={2} />
          ) : (
            <Pause aria-hidden size={14} strokeWidth={2} />
          )}
        </button>
      </div>
      {/* A fixed-height well so the panel doesn't jump as definitions change length. */}
      <div aria-live="polite" className="mt-6 min-h-[5.5rem]" role="tabpanel">
        <p className="font-heading text-lg font-semibold text-foreground">{current?.term}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#404040] @xl:text-base">
          {current?.definition}
        </p>
      </div>
      {link && (
        <Link
          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          href={link.href}
        >
          {link.label}
          <ArrowRight
            className="transition-transform group-hover:translate-x-0.5"
            size={16}
            strokeWidth={2.5}
          />
        </Link>
      )}
    </div>
  );
}
