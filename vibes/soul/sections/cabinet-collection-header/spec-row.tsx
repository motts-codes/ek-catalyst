'use client';

import { clsx } from 'clsx';
import { Download, Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { animatedUnderlineClassName } from '@/vibes/soul/primitives/animated-underline';

// Shared body-copy style for the collection header: the overview paragraph and the specification
// list use the same size, colour and leading (13px on phones, 14px from tablet, 150% line-height).
export const HEADER_COPY_CLASS =
  'prose max-w-none text-[13px] leading-[1.5] text-contrast-500 @xl:text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-[#2162a1] [&_li]:my-1 [&_li]:text-contrast-500 [&_p]:my-2 [&_p]:leading-[1.5] [&_p]:text-contrast-500 [&_ul]:list-disc [&_ul]:pl-5';

// An expandable row (Specifications, Offers): label at the link's 14px size, rotating plus, smooth
// height animation (CSS grid rows 0fr → 1fr), optional element pinned to the row's right.
export function AccordionRow({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="relative border-b border-contrast-100">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        // `.font-heading` forces bold (!important) in globals.css; use the family directly.
        className="flex w-full cursor-pointer items-center gap-2.5 py-4 pr-48 text-left font-[family-name:var(--font-family-heading)] text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Plus
          className={clsx('transition-transform duration-300', open && 'rotate-45')}
          size={16}
          strokeWidth={2}
        />
        {title}
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-smooth',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={panelId}
      >
        <div className="overflow-hidden">
          <div className="pb-5">{children}</div>
        </div>
      </div>
      {aside != null && <div className="absolute right-0 top-3.5">{aside}</div>}
    </div>
  );
}

// Specifications (the staff-authored HTML; its own leading "Specifications" heading is hidden)
// with the spec-sheet download pinned right. With no copy, just the link; with neither, nothing.
export function SpecRow({
  specifications = '',
  specSheetUrl = '',
}: {
  specifications?: string;
  specSheetUrl?: string;
}) {
  const specSheetLink = specSheetUrl !== '' && (
    <a
      className="inline-flex min-h-6 items-center gap-1.5 py-1 text-sm font-normal"
      href={specSheetUrl}
      rel="noreferrer"
      target="_blank"
    >
      <Download size={15} strokeWidth={1.75} />
      {/* The breadcrumb's animated red underline on hover. */}
      <span className={animatedUnderlineClassName}>Download spec sheet</span>
    </a>
  );

  if (specifications === '') return specSheetLink || null;

  return (
    <AccordionRow aside={specSheetLink || undefined} title="Specifications">
      <div
        className={clsx(
          HEADER_COPY_CLASS,
          '[&>h3:first-child]:hidden [&_table]:w-full [&_td]:border [&_td]:border-contrast-100 [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-contrast-100 [&_th]:px-3 [&_th]:py-1.5',
        )}
        dangerouslySetInnerHTML={{ __html: specifications }}
      />
    </AccordionRow>
  );
}

// Standing offers, the same for every collection. The key detail of each (code, threshold) is
// picked out in black.
export const COLLECTION_OFFERS: Array<{ text: string; highlight: string }> = [
  { text: 'First two quarter-door samples free with code FREESAMPLES.', highlight: 'FREESAMPLES' },
  { text: 'Free shipping on purchases above $2,500.', highlight: '$2,500' },
];

function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  const i = text.indexOf(highlight);

  if (i < 0) return text;

  return (
    <>
      {text.slice(0, i)}
      <span className="font-medium text-foreground">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}

export function OffersRow() {
  return (
    <AccordionRow title="Offers">
      <div className={HEADER_COPY_CLASS}>
        <ul>
          {COLLECTION_OFFERS.map((offer) => (
            <li key={offer.text}>
              <Highlighted highlight={offer.highlight} text={offer.text} />
            </li>
          ))}
        </ul>
      </div>
    </AccordionRow>
  );
}
