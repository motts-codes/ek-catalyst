import { clsx } from 'clsx';
import { X } from 'lucide-react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

/** The six cabinet types, matching the products' "Product Type" custom field values. */
export const CABINET_TYPES = [
  { value: 'WALL CABINET', label: 'Wall cabinet', icon: 'wall' },
  { value: 'BASE CABINET', label: 'Base cabinet', icon: 'base' },
  { value: 'SINK BASE CABINET', label: 'Sink base cabinet', icon: 'sink-base' },
  { value: 'TALL CABINET', label: 'Tall cabinet', icon: 'tall' },
  { value: 'TRIM & DECORATIVE', label: 'Trim & decorative', icon: 'trim-decorative' },
  { value: 'VANITY CABINET', label: 'Vanity cabinet', icon: 'vanity' },
] as const;

export type CabinetTypeValue = (typeof CABINET_TYPES)[number]['value'];

interface Props {
  title?: string;
  /** The selected type values (any number). */
  selected?: string[];
  /** Builds the link that toggles a type in or out of the selection. */
  hrefFor: (value: CabinetTypeValue) => string;
  /** "Clear all" — the collection with every grid filter removed; shown only when given. */
  resetHref?: string;
  className?: string;
}

const LINE = 'border-[#ffa1a4]';

// "Filter by type" — six icon tiles under the collection header. One pink-ruled row on wide
// screens (three, then two, per row below that). Hover and the selected tile tint #fdf3f5; the
// selected one also carries a red rule under its icon and an sr-only "selected" so the state
// doesn't rely on colour alone. Tiles toggle, so several types can be on at once; "Clear all"
// beside the title removes every grid filter (types, widths, heights).
export function CabinetTypeFilter({
  title = 'Filter by type',
  selected = [],
  hrefFor,
  resetHref,
  className,
}: Props) {
  return (
    <nav aria-label={title} className={clsx('@container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="font-heading text-lg font-bold leading-tight">{title}</h2>
          {resetHref != null && (
            <Link
              className="inline-flex items-center gap-1 text-xs text-contrast-500 underline decoration-contrast-300 underline-offset-4 transition-colors hover:text-foreground hover:decoration-[var(--button-primary-background,#d90716)]"
              href={resetHref}
            >
              <X size={12} strokeWidth={2} />
              Clear all filters
            </Link>
          )}
        </div>
        {/* gap-px over the line colour draws the dividers, whatever the wrap. */}
        <ul
          className={clsx(
            'grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-[#ffa1a4] @3xl:grid-cols-6',
            LINE,
          )}
        >
          {CABINET_TYPES.map((type) => {
            const active = selected.includes(type.value);

            return (
              <li className="bg-white" key={type.value}>
                <Link
                  aria-current={active ? 'true' : undefined}
                  className={clsx(
                    'flex h-full flex-col items-center gap-2 px-2 pb-3 pt-3 text-center transition-colors duration-300 ease-smooth hover:bg-[#fdf3f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--button-primary-background,#d90716)] @lg:px-3 @lg:pb-4',
                    active && 'bg-[#fdf3f5]',
                  )}
                  href={hrefFor(type.value)}
                >
                  <Image
                    alt=""
                    className={clsx(
                      'h-auto w-[116px] max-w-full border-b-2',
                      active
                        ? 'border-[var(--button-primary-background,#d90716)]'
                        : 'border-transparent',
                    )}
                    height={96}
                    src={`/images/cabinets/types/${type.icon}.svg`}
                    unoptimized
                    width={116}
                  />
                  <span className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-foreground @lg:text-[13px]">
                    {type.label}
                    {active && <span className="sr-only"> (selected)</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
