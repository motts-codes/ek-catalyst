'use client';

import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsString } from 'nuqs';
import { ReactNode, Suspense } from 'react';

import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Link } from '~/components/link';

export interface NumberedPaginationInfo {
  /** Current 1-based page (already clamped to the range). */
  page: number;
  totalPages: number;
  /** 1-based index of the first and last item shown, for "Showing 13–24 of 96". */
  from: number;
  to: number;
  totalItems: number;
  pageParamName?: string;
}

interface Props {
  info: Streamable<NumberedPaginationInfo>;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  itemsLabel?: string;
}

// Numbered pages with previous/next arrows and a "Showing a–b of n" line. Page links keep the
// rest of the query (filters, sort, search term) and drop the legacy cursor params. Renders
// nothing when everything fits on one page.
export function NumberedPagination(props: Props) {
  return (
    <Suspense fallback={null}>
      <NumberedPaginationResolved {...props} />
    </Suspense>
  );
}

// Pills tighten below the @md container width so nine of them (seven pages plus the arrows) fit
// a phone; the row wraps rather than widening the page if they still do not.
const LINK_CLASS =
  'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium ring-primary transition-colors duration-200 focus-visible:outline-0 focus-visible:ring-2 @md:h-10 @md:min-w-10 @md:px-3';

function pageWindow(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  const items: Array<number | 'gap'> = [1];

  if (left > 2) items.push('gap');

  for (let i = left; i <= right; i += 1) items.push(i);

  if (right < total - 1) items.push('gap');

  items.push(total);

  return items;
}

function NumberedPaginationResolved({
  info,
  label = 'Pagination',
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  itemsLabel = 'products',
}: Props) {
  const { page, totalPages, from, to, totalItems, pageParamName = 'page' } = useStreamable(info);
  const searchParams = useSearchParams();
  const serialize = createSerializer({
    [pageParamName]: parseAsString,
    before: parseAsString,
    after: parseAsString,
  });

  if (totalPages <= 1 || totalItems === 0) return null;

  const hrefFor = (target: number) =>
    serialize(searchParams, {
      [pageParamName]: target <= 1 ? null : String(target),
      before: null,
      after: null,
    });

  return (
    <nav aria-label={label} className="flex flex-col items-center gap-4 py-10">
      <ul className="flex flex-wrap items-center justify-center gap-px @md:gap-1.5">
        <li>
          <ArrowLink disabled={page <= 1} href={hrefFor(page - 1)} label={previousLabel}>
            <ChevronLeft aria-hidden size={20} strokeWidth={1.5} />
          </ArrowLink>
        </li>
        {pageWindow(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li aria-hidden className="px-1 text-contrast-400" key={`gap-${index}`}>
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span
                  aria-current="page"
                  className={clsx(
                    LINK_CLASS,
                    'bg-[var(--button-primary-background,#d90716)] text-white',
                  )}
                >
                  {item}
                </span>
              ) : (
                <Link
                  aria-label={`Page ${item}`}
                  className={clsx(LINK_CLASS, 'text-foreground hover:bg-contrast-100')}
                  href={hrefFor(item)}
                >
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          <ArrowLink disabled={page >= totalPages} href={hrefFor(page + 1)} label={nextLabel}>
            <ChevronRight aria-hidden size={20} strokeWidth={1.5} />
          </ArrowLink>
        </li>
      </ul>
      <p className="text-sm text-contrast-500">
        Showing {from}–{to} of {totalItems} {itemsLabel}
      </p>
    </nav>
  );
}

function ArrowLink({
  href,
  label,
  disabled,
  children,
}: {
  href: string;
  label: string;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        aria-label={label}
        className={clsx(LINK_CLASS, 'border border-contrast-100 text-contrast-300')}
        role="link"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      aria-label={label}
      className={clsx(
        LINK_CLASS,
        'border border-contrast-100 text-foreground hover:border-contrast-200 hover:bg-contrast-100',
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
