'use client';

import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Link } from '~/components/link';

export interface GlossaryTerm {
  term: string;
  definition: string;
}

const CYCLE_MS = 3500;

// The glossary as a run of words: the active one is lit, its meaning sits beneath, and the
// active word moves on every few seconds until someone points at or picks a word themselves.
// People who prefer reduced motion get a still list that only changes on click.
export function GlossaryWords({
  terms,
  link,
}: {
  terms: GlossaryTerm[];
  link?: { label: string; href: string };
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => setActive((i) => (i + 1) % terms.length), CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [paused, terms.length]);

  const current = terms[active];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ul className="flex flex-wrap gap-x-2 gap-y-2" role="tablist">
        {terms.map((entry, index) => {
          const on = index === active;

          return (
            <li key={entry.term} role="presentation">
              <button
                aria-selected={on}
                className={clsx(
                  'rounded-full px-3 py-1 font-heading text-sm font-semibold transition-colors duration-300',
                  on
                    ? 'bg-[var(--button-primary-background,#d90716)] text-white'
                    : 'text-white/70 hover:text-white',
                )}
                onClick={() => {
                  setActive(index);
                  setPaused(true);
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
      {/* A fixed-height well so the panel doesn't jump as definitions change length. */}
      <div className="mt-6 min-h-[5.5rem]" role="tabpanel">
        <p className="font-heading text-lg font-semibold text-white">{current?.term}</p>
        <p className="mt-1 text-sm leading-relaxed text-white/80 @xl:text-base">
          {current?.definition}
        </p>
      </div>
      {link && (
        <Link
          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
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
