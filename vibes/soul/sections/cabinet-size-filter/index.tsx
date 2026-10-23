import { clsx } from 'clsx';
import { X } from 'lucide-react';

import { Stream, type Streamable } from '@/vibes/soul/lib/streamable';
import {
  type ChecklistChoice,
  ChecklistDropdown,
} from '@/vibes/soul/primitives/checklist-dropdown';
import { Link } from '~/components/link';

export interface SizeChip {
  value: string;
  label: string;
  count: number;
}

export interface SizeFilterOptions {
  widths: SizeChip[];
  heights: SizeChip[];
}

export type SizeDimension = 'width' | 'height';

interface Props {
  options: Streamable<SizeFilterOptions | null>;
  /** The selected values per dimension. */
  selected: { widths: string[]; heights: string[] };
  /** Builds the link that toggles one value of one dimension. */
  hrefFor: (dimension: SizeDimension, value: string) => string;
  /** "Clear all filters" — the collection with every grid filter removed; shown only when given. */
  resetHref?: string;
  className?: string;
}

// "Cabinets Width" and "Cabinets Height" dropdowns under the type tiles on a collection page. Each
// opens a checklist of the values in the collection with a count beside each (how many products
// that value leaves given the other filters); several can be ticked. Nothing to choose → nothing.
export function CabinetSizeFilter({ options, selected, hrefFor, resetHref, className }: Props) {
  // Resolve each value's toggle link here (server side); the client dropdown gets plain data.
  const choices = (
    dimension: SizeDimension,
    chips: SizeChip[],
    picked: string[],
  ): ChecklistChoice[] =>
    chips.map((chip) => ({
      ...chip,
      href: hrefFor(dimension, chip.value),
      active: picked.includes(chip.value),
    }));

  return (
    <Stream fallback={null} value={options}>
      {(data) =>
        (data != null && (data.widths.length > 0 || data.heights.length > 0)) ||
        resetHref != null ? (
          <section aria-label="Filter by size" className={clsx('@container', className)}>
            {/* Dropdowns on the left, "Clear all filters" at the right end of the same row. */}
            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3 px-6 @xl:px-9 @4xl:px-14">
              {data != null && data.widths.length > 0 && (
                <ChecklistDropdown
                  label="Cabinets Width"
                  options={choices('width', data.widths, selected.widths)}
                />
              )}
              {data != null && data.heights.length > 0 && (
                <ChecklistDropdown
                  label="Cabinets Height"
                  options={choices('height', data.heights, selected.heights)}
                />
              )}
              {resetHref != null && (
                <Link
                  className="ml-auto inline-flex items-center gap-1 text-xs text-contrast-500 underline decoration-contrast-300 underline-offset-4 transition-colors hover:text-foreground hover:decoration-[var(--button-primary-background,#d90716)]"
                  href={resetHref}
                  scroll={false}
                >
                  <X size={12} strokeWidth={2} />
                  Clear all filters
                </Link>
              )}
            </div>
          </section>
        ) : null
      }
    </Stream>
  );
}
