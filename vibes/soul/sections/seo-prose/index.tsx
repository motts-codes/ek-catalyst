'use client';

import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { HomeSection } from '@/vibes/soul/sections/home-section';

interface Props {
  title: string;
  /** The paragraph that always shows. */
  intro: string;
  /** The paragraphs behind "Read more". */
  body: string[];
  className?: string;
}

// The search copy at the foot of a page: a heading, one paragraph, and the rest behind a
// "Read more" toggle. Quiet type, so it reads as a footnote to the page rather than a section.
export function SeoProse({ title, intro, body, className }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <HomeSection className={className} compact>
      <div className="max-w-4xl text-sm leading-relaxed text-contrast-500">
        <h2 className="font-heading text-lg font-bold leading-tight text-foreground">{title}</h2>
        <p className="mt-3">{intro}</p>
        {body.length > 0 && (
          <>
            <div
              className={clsx(
                'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
              id={id}
              inert={!open}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="space-y-3 pt-3">
                  {body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            <button
              aria-controls={id}
              aria-expanded={open}
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              {open ? 'Read less' : 'Read more'}
              <ChevronDown
                aria-hidden
                className={clsx(
                  'transition-transform duration-300 motion-reduce:transition-none',
                  open && 'rotate-180',
                )}
                size={15}
                strokeWidth={2.25}
              />
            </button>
          </>
        )}
      </div>
    </HomeSection>
  );
}
