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
  /** Count for "All": every collection listed, including any with no line set. Defaults to the
   *  sum of the options. */
  total?: number;
  /** A line of copy per slug ("all" for no selection), shown to the right of the pills. */
  descriptions?: Record<string, string>;
  className?: string;
}

const TAB =
  'inline-flex items-center gap-1 whitespace-nowrap border-b-[3px] px-0.5 pb-3 pt-2 text-[15px] transition-colors duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--button-primary-background,#d90716)]';

// "Filter by line" — underline tabs under the program hero on the Assembled / RTA listings, in the
// home page's product-tabs style: one rule under the row, the selected line bold with a red
// underline, the rest grey. All, then the product lines present in that program (Star, Prism,
// Euro Value, Euro Max), each followed by a raised light blue (#C0EDF6) count circle (a fixed 18px, so
// 7 and 37 look the same). The state also carries aria-current so it doesn't rely on colour, and
// the count is read out as text.
export function CabinetLineFilter({
  title = 'Filter by line',
  options,
  selected,
  hrefFor,
  total,
  descriptions,
  className,
}: Props) {
  if (options.length < 2) return null;

  const allCount = total ?? options.reduce((sum, o) => sum + o.count, 0);
  const tabs = [{ label: 'All', slug: null, count: allCount }, ...options];
  const description = descriptions?.[selected ?? 'all'];

  return (
    <nav aria-label={title} className={clsx('@container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <h2 className="pb-3 pt-2 font-heading text-lg font-bold leading-tight">{title}</h2>
          {/* The row scrolls sideways on phones rather than wrapping. */}
          <ul className="flex min-w-0 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const active = tab.slug === selected;

              return (
                <li key={tab.slug ?? 'all'}>
                  <Link
                    aria-current={active ? 'true' : undefined}
                    className={clsx(
                      TAB,
                      active
                        ? 'border-[var(--button-primary-background,#d90716)] font-bold text-foreground'
                        : 'border-transparent text-contrast-500 hover:text-foreground',
                    )}
                    href={hrefFor(tab.slug)}
                  >
                    {tab.label}
                    <span className="sr-only">
                      , {tab.count} {tab.count === 1 ? 'collection' : 'collections'}
                    </span>
                    {active && <span className="sr-only"> (selected)</span>}
                    {/* Count, raised like a superscript after the label: light blue circle, black text. */}
                    <span
                      aria-hidden
                      className="inline-flex size-[18px] -translate-y-1.5 items-center justify-center rounded-full bg-[#C0EDF6] font-body text-[10px] font-semibold leading-none text-foreground"
                    >
                      {tab.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* The selected line's one-liner, at the right end of the row on wide screens; hidden on phones. */}
          {Boolean(description) && (
            <p
              aria-live="polite"
              className="order-last hidden basis-full pb-3 text-xs text-contrast-500 @3xl:ml-auto @3xl:block @3xl:max-w-md @3xl:basis-auto @3xl:text-right"
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </nav>
  );
}
