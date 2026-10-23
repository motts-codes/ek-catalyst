import { clsx } from 'clsx';
import { SlidersHorizontal } from 'lucide-react';

import { Link } from '~/components/link';

import { LineTabs } from './line-tabs';

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
  /** "Show all filters" / "Hide filters" at the right end of the row, linking to the listing with
   *  the panel opened or closed. */
  panelToggle?: { href: string; open: boolean };
  className?: string;
}

// "Shop by line" — underline tabs under the program hero on the Assembled / RTA listings, in the
// home page's product-tabs style: one rule under the row, the selected line bold with a red
// underline, the rest grey. All, then the product lines present in that program (Star, Prism,
// Euro Value, Euro Max), each followed by a raised light blue (#C0EDF6) count circle (a fixed 18px, so
// 7 and 37 look the same). The state also carries aria-current so it doesn't rely on colour, and
// the count is read out as text.
export function CabinetLineFilter({
  title = 'Shop by line',
  options,
  selected,
  hrefFor,
  total,
  descriptions,
  panelToggle,
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
          <LineTabs
            selected={selected}
            tabs={tabs.map((tab) => ({ ...tab, href: hrefFor(tab.slug) }))}
          />
          {panelToggle != null && (
            <Link
              aria-expanded={panelToggle.open}
              className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap pb-3 pt-2 text-xs text-contrast-500 underline decoration-contrast-300 underline-offset-4 transition-colors hover:text-foreground hover:decoration-[var(--button-primary-background,#d90716)]"
              href={panelToggle.href}
            >
              <SlidersHorizontal size={13} strokeWidth={2} />
              {panelToggle.open ? 'Hide filters' : 'Show all filters'}
            </Link>
          )}
          {/* The selected line's one-liner, at the right end of the row on wide screens; hidden on phones. */}
          {Boolean(description) && (
            <p
              aria-live="polite"
              className={clsx(
                'order-last hidden basis-full pb-3 text-xs text-contrast-500 @3xl:block @3xl:text-right',
                panelToggle == null && '@3xl:ml-auto @3xl:max-w-md @3xl:basis-auto',
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </nav>
  );
}
