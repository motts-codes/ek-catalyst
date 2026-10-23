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

// The "Show all filters" panel on the Assembled / RTA listings: one column per group (Color,
// Construction, Style, Finish type), each a checklist. Every row is a link that toggles that value
// (several can be on at once); the count beside it is how many collections it leaves given the
// other filters. Sits between the line tabs and the cards, on the cards' grey band.
export function CabinetFilterPanel({ groups, resetHref, className }: Props) {
  if (groups.length === 0) return null;

  return (
    <section aria-label="All filters" className={clsx('bg-[#f9fafd] @container', className)}>
      <div className="mx-auto max-w-screen-2xl px-6 @xl:px-9 @4xl:px-14">
        <div className="rounded-2xl border border-contrast-100 bg-white px-5 py-4 @xl:px-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 @xl:grid-cols-[2fr_1fr_1fr_1fr]">
            {groups.map((group) => (
              <div
                className={clsx(group.options.length > 8 && 'col-span-2 @xl:col-span-1')}
                key={group.key}
              >
                <h3 className="mb-2 font-[family-name:var(--font-family-heading)] text-sm font-medium">
                  {group.label}
                </h3>
                {/* A long list (the colours) flows into two columns. */}
                <ul className={clsx(group.options.length > 8 && 'columns-2 gap-x-4')}>
                  {group.options.map((option) => (
                    <li className="break-inside-avoid" key={option.value}>
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
                        <span className={clsx(option.active && 'font-semibold')}>
                          {option.value}
                        </span>
                        <span className="text-xs text-contrast-400">{option.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {resetHref != null && (
            <div className="mt-4 flex justify-end border-t border-contrast-100 pt-3">
              <Link
                className="inline-flex items-center gap-1 text-xs text-contrast-500 underline decoration-contrast-300 underline-offset-4 transition-colors hover:text-foreground hover:decoration-[var(--button-primary-background,#d90716)]"
                href={resetHref}
              >
                <X size={12} strokeWidth={2} />
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
