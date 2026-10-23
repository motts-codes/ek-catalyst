import { clsx } from 'clsx';

import { Stream, type Streamable } from '@/vibes/soul/lib/streamable';
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
  className?: string;
}

const CHIP =
  'inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-1';

function Row({
  label,
  chips,
  selected,
  hrefFor,
}: {
  label: string;
  chips: SizeChip[];
  selected: string[];
  hrefFor: (value: string) => string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h3 className="w-14 shrink-0 font-[family-name:var(--font-family-heading)] text-sm">
        {label}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = selected.includes(chip.value);

          return (
            <li key={chip.value}>
              <Link
                aria-current={active ? 'true' : undefined}
                className={clsx(
                  CHIP,
                  active
                    ? 'border-[0.5px] border-[var(--button-primary-background,#d90716)] font-semibold text-foreground'
                    : 'border-contrast-100 text-contrast-500 hover:border-contrast-300 hover:text-foreground',
                )}
                href={hrefFor(chip.value)}
              >
                {chip.label}
                <span className="text-[10px] text-contrast-400">{chip.count}</span>
                {active && <span className="sr-only"> (selected)</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Width and height chips under the type tiles on a collection page. Each chip toggles one value
// (several can be on at once); the count beside it is how many products that value leaves given
// the other filters. Nothing to choose → nothing rendered.
export function CabinetSizeFilter({ options, selected, hrefFor, className }: Props) {
  return (
    <Stream fallback={null} value={options}>
      {(data) =>
        data != null && (data.widths.length > 0 || data.heights.length > 0) ? (
          <section aria-label="Filter by size" className={clsx('@container', className)}>
            <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-6 @xl:px-9 @4xl:px-14">
              <Row
                chips={data.widths}
                hrefFor={(value) => hrefFor('width', value)}
                label="Width"
                selected={selected.widths}
              />
              <Row
                chips={data.heights}
                hrefFor={(value) => hrefFor('height', value)}
                label="Height"
                selected={selected.heights}
              />
            </div>
          </section>
        ) : null
      }
    </Stream>
  );
}
