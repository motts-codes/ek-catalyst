'use client';

import { clsx } from 'clsx';
import { useId, useState } from 'react';

// The legal text of a policy (warranty terms, say), collapsed behind a single heading-styled
// row so the plain-English page stays short. Same quiet +/- row as the FAQ accordion.
export function LegalAccordion({
  title,
  paragraphs,
  defaultOpen = false,
}: {
  title: string;
  /** The text, word for word, one string per paragraph. */
  paragraphs: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="max-w-3xl border-y border-contrast-100">
      <h2>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-4 text-left"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="font-[family-name:var(--font-family-heading)] text-base font-semibold leading-snug @xl:text-lg">
            {title}
          </span>
          <span aria-hidden className="relative size-5 shrink-0 text-contrast-400">
            <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-current" />
            <span
              className={clsx(
                'absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 bg-current transition-transform duration-200',
                open && 'rotate-90 opacity-0',
              )}
            />
          </span>
        </button>
      </h2>
      <div
        className={clsx(
          'grid overflow-hidden transition-all duration-200 ease-out',
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
        id={panelId}
      >
        <div className="min-h-0 space-y-3 text-sm leading-relaxed text-contrast-500">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
