'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { SectionLayout } from '@/vibes/soul/sections/section-layout';

export interface CabinetFaqItem {
  q: string;
  a: string;
}

export interface CabinetFaqData {
  headline: string;
  items: CabinetFaqItem[];
}

interface Props {
  data: CabinetFaqData | null;
  className?: string;
}

/**
 * Collapsible FAQ section for cabinet pages. Used for both the per-collection FAQ (on Avon/Dover
 * collection detail pages) and the program-wide FAQ (on the /cabinets/* listing pages) — the
 * data source differs, the presentation is the same. Program awareness lives in the caller: it
 * passes in the already-resolved list for the current program.
 *
 * Renders nothing when there is no FAQ (no headline, or no non-empty rows), so pages/programs
 * without an authored FAQ don't show an empty section.
 */
export function CabinetFaq({ data, className }: Props) {
  const items = (data?.items ?? []).filter((i) => i.q.trim() !== '' || i.a.trim() !== '');

  if (data == null || items.length === 0) {
    return null;
  }

  return (
    <SectionLayout className={className} containerSize="2xl">
      <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
        {data.headline || 'Frequently Asked Questions'}
      </h2>

      <dl className="divide-y divide-contrast-100 border-t border-contrast-100">
        {items.map((item, index) => (
          <FaqRow a={item.a} key={index} q={item.q} />
        ))}
      </dl>
    </SectionLayout>
  );
}

// One question row. Collapsed by default; the first row opens so the section reads as populated.
function FaqRow({ q, a }: CabinetFaqItem) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <dt>
        <button
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-4 text-left"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="font-[family-name:var(--font-family-heading)] text-base font-semibold leading-snug @xl:text-lg">
            {q}
          </span>
          <span
            aria-hidden
            className="relative size-5 shrink-0 text-contrast-400"
          >
            {/* +/- toggle */}
            <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-current" />
            <span
              className={clsx(
                'absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 bg-current transition-transform duration-200',
                open && 'rotate-90 opacity-0',
              )}
            />
          </span>
        </button>
      </dt>
      <dd
        className={clsx(
          'grid overflow-hidden transition-all duration-200 ease-out',
          open ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <p className="leading-relaxed text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
            {a}
          </p>
        </div>
      </dd>
    </div>
  );
}
