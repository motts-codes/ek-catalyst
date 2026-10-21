import { clsx } from 'clsx';

import { Link } from '~/components/link';

export interface CabinetLineFilterOption {
  label: string;
  slug: string;
  /** Collections in the line; "All" shows the total. */
  count: number;
}

interface Props {
  title?: string;
  options: CabinetLineFilterOption[];
  /** The selected line slug, or null for "All". */
  selected: string | null;
  /** Builds the link for a line slug; `null` is "All". */
  hrefFor: (slug: string | null) => string;
  className?: string;
}

const PILL =
  'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2';

// "Filter by line" — a pill row under the program hero on the Assembled / RTA listings: All, then
// the product lines present in that program (Star, Prism, Euro Value, Euro Max), each with a
// black count badge on its top-right corner (a fixed 22px circle, so 7 and 37 look the same). The selected pill is solid brand red; the state also
// carries aria-current so it doesn't rely on colour, and the count is read out as text.
export function CabinetLineFilter({
  title = 'Filter by line',
  options,
  selected,
  hrefFor,
  className,
}: Props) {
  if (options.length < 2) return null;

  const total = options.reduce((sum, o) => sum + o.count, 0);
  const pills = [{ label: 'All', slug: null, count: total }, ...options];

  return (
    <nav aria-label={title} className={clsx('@container', className)}>
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-4 gap-y-3 px-6 @xl:px-9 @4xl:px-14">
        <h2 className="font-heading text-lg font-bold leading-tight">{title}</h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-3">
          {pills.map((pill) => {
            const active = pill.slug === selected;

            return (
              <li className="relative" key={pill.slug ?? 'all'}>
                <Link
                  aria-current={active ? 'true' : undefined}
                  className={clsx(
                    PILL,
                    active
                      ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                      : 'border-[#fcb6bb] bg-white text-foreground hover:bg-[#fdf3f5]',
                  )}
                  href={hrefFor(pill.slug)}
                >
                  {pill.label}
                  <span className="sr-only">
                    , {pill.count} {pill.count === 1 ? 'collection' : 'collections'}
                  </span>
                  {active && <span className="sr-only"> (selected)</span>}
                  {/* Count badge, notification-style: top-right, black with white text. */}
                  <span
                    aria-hidden
                    className="absolute -right-2 -top-2 inline-flex size-[22px] items-center justify-center rounded-full bg-foreground font-body text-[11px] font-semibold leading-none text-white"
                  >
                    {pill.count}
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
