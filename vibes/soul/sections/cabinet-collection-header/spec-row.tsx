'use client';

import { clsx } from 'clsx';
import { Download, Plus } from 'lucide-react';
import { useId, useState } from 'react';

// Shared body-copy style for the collection header: the overview paragraph and the specification
// list use the same size, colour and leading (13px on phones, 14px from tablet, 150% line-height).
export const HEADER_COPY_CLASS =
  'prose max-w-none text-[13px] leading-[1.5] text-contrast-500 @xl:text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-[#2162a1] [&_li]:my-1 [&_li]:text-contrast-500 [&_p]:my-2 [&_p]:leading-[1.5] [&_p]:text-contrast-500 [&_ul]:list-disc [&_ul]:pl-5';

// Expandable Specification with the spec-sheet download on the same row. With no specification
// copy, just the download link; with neither, nothing. Opens with a smooth height animation (CSS
// grid rows 0fr → 1fr) and hides the copy's own leading "Specifications" heading, which would
// repeat the row's label.
export function SpecRow({
  specifications = '',
  specSheetUrl = '',
}: {
  specifications?: string;
  specSheetUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const specSheetLink = specSheetUrl !== '' && (
    <a
      className="inline-flex min-h-6 items-center gap-1.5 py-1 text-sm font-semibold underline underline-offset-4 hover:text-[var(--button-primary-background,#d90716)]"
      href={specSheetUrl}
      rel="noreferrer"
      target="_blank"
    >
      <Download size={15} strokeWidth={2} />
      Download spec sheet
    </a>
  );

  if (specifications === '') return specSheetLink || null;

  return (
    <div className="relative border-y border-contrast-100">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        // `.font-heading` forces bold (!important) in globals.css; use the family directly for regular weight.
        className="flex w-full cursor-pointer items-center gap-2.5 py-4 pr-48 text-left font-[family-name:var(--font-family-heading)] text-lg font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Plus
          className={clsx('transition-transform duration-300', open && 'rotate-45')}
          size={18}
          strokeWidth={2}
        />
        Specification
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-smooth',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={panelId}
      >
        <div className="overflow-hidden">
          <div
            className={clsx(
              HEADER_COPY_CLASS,
              'pb-5 [&>h3:first-child]:hidden [&_table]:w-full [&_td]:border [&_td]:border-contrast-100 [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-contrast-100 [&_th]:px-3 [&_th]:py-1.5',
            )}
            dangerouslySetInnerHTML={{ __html: specifications }}
          />
        </div>
      </div>
      {Boolean(specSheetLink) && <div className="absolute right-0 top-3.5">{specSheetLink}</div>}
    </div>
  );
}
