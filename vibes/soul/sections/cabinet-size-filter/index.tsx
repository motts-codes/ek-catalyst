import { clsx } from 'clsx';

import { Stream, type Streamable } from '@/vibes/soul/lib/streamable';

import { type SizeChip, type SizeChoice, SizeDropdown } from './size-dropdown';

export type { SizeChip };

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
  className?: string;
}

// "Cabinets Width" and "Cabinets Height" dropdowns under the type tiles on a collection page. Each
// opens a checklist of the values in the collection with a count beside each (how many products
// that value leaves given the other filters); several can be ticked. Nothing to choose → nothing.
export function CabinetSizeFilter({ options, selected, hrefFor, className }: Props) {
  // Resolve each value's toggle link here (server side); the client dropdown gets plain data.
  const choices = (dimension: SizeDimension, chips: SizeChip[], picked: string[]): SizeChoice[] =>
    chips.map((chip) => ({
      ...chip,
      href: hrefFor(dimension, chip.value),
      active: picked.includes(chip.value),
    }));

  return (
    <Stream fallback={null} value={options}>
      {(data) =>
        data != null && (data.widths.length > 0 || data.heights.length > 0) ? (
          <section aria-label="Filter by size" className={clsx('@container', className)}>
            {/* Right-aligned, with the grid's sort control below it. */}
            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-end gap-3 px-6 @xl:px-9 @4xl:px-14">
              {data.widths.length > 0 && (
                <SizeDropdown
                  label="Cabinets Width"
                  options={choices('width', data.widths, selected.widths)}
                />
              )}
              {data.heights.length > 0 && (
                <SizeDropdown
                  label="Cabinets Height"
                  options={choices('height', data.heights, selected.heights)}
                />
              )}
            </div>
          </section>
        ) : null
      }
    </Stream>
  );
}
