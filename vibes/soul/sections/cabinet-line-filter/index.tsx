import { clsx } from 'clsx';

import { Link } from '~/components/link';

export interface CabinetLineFilterOption {
  label: string;
  slug: string;
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
// the product lines present in that program (Star, Prism, Euro Value, Euro Max). The selected
// pill is solid brand red; the state also carries aria-current so it doesn't rely on colour.
export function CabinetLineFilter({
  title = 'Filter by line',
  options,
  selected,
  hrefFor,
  className,
}: Props) {
  if (options.length < 2) return null;

  const pills = [{ label: 'All', slug: null }, ...options.map((o) => ({ ...o, slug: o.slug }))];

  return (
    <nav aria-label={title} className={clsx('@container', className)}>
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-4 gap-y-3 px-6 @xl:px-9 @4xl:px-14">
        <h2 className="font-heading text-lg font-bold leading-tight">{title}</h2>
        <ul className="flex flex-wrap gap-2">
          {pills.map((pill) => {
            const active = pill.slug === selected;

            return (
              <li key={pill.slug ?? 'all'}>
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
                  {active && <span className="sr-only"> (selected)</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
