import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';

import { Link } from '~/components/link';

export interface FilterPanelOption {
  value: string;
  count: number;
  active: boolean;
  href: string;
}

export interface FilterPanelGroup {
  key: string;
  label: string;
  options: FilterPanelOption[];
}

interface Props {
  groups: FilterPanelGroup[];
  /** The listing with every panel filter cleared; shown as "Clear all" only when given. */
  resetHref?: string;
  className?: string;
}

// The listings' filters sidebar (opened by "Show all filters" beside the line tabs): one group
// after another — Color, Construction, Style, Finish type — each a checklist under a hairline, in
// the style of the category pages' facet sidebar. Every row is a link that toggles that value
// (several can be on at once); the count beside it is how many collections it leaves given the
// other filters. "Clear all" sits at the top while anything is ticked.
export function CabinetFilterPanel({ groups, resetHref, className }: Props) {
  if (groups.length === 0) return null;

  return (
    <div className={clsx('text-sm', className)}>
      <div className="flex items-center justify-between pb-3">
        <h2 className="font-heading text-base font-bold">Filters</h2>
        {resetHref != null && (
          <Link
            className="inline-flex items-center gap-1 text-xs text-contrast-500 underline decoration-contrast-300 underline-offset-4 transition-colors hover:text-foreground hover:decoration-[var(--button-primary-background,#d90716)]"
            href={resetHref}
          >
            <X size={12} strokeWidth={2} />
            Clear all
          </Link>
        )}
      </div>
      {groups.map((group) => (
        <section className="border-t border-contrast-100 py-4" key={group.key}>
          <h3 className="mb-2 font-[family-name:var(--font-family-heading)] text-sm font-medium">
            {group.label}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {group.options.map((option) => (
              <li key={option.value}>
                <Link
                  aria-checked={option.active}
                  className={clsx(
                    'flex items-center gap-2 rounded-md py-1 pr-1 text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]',
                    option.active ? 'text-foreground' : 'text-contrast-500',
                    option.count === 0 && !option.active && 'opacity-50',
                  )}
                  href={option.href}
                  role="checkbox"
                >
                  <span
                    aria-hidden
                    className={clsx(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      option.active
                        ? 'border-[var(--button-primary-background,#d90716)] bg-[var(--button-primary-background,#d90716)] text-white'
                        : 'border-contrast-300 bg-white',
                    )}
                  >
                    {option.active && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={clsx('flex-1', option.active && 'font-semibold')}>
                    {option.value}
                  </span>
                  <span className="text-xs text-contrast-400">{option.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
