'use client';

import { Loader2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { parseAsString, useQueryStates } from 'nuqs';
import { useTransition } from 'react';

// Says, above the grid, that the listing is narrowed by a search term (typed, or from a "Shop by
// finish / type / width" tile, which narrows by term too) and offers to clear it in one click.
// Without a term it renders nothing.
export function ActiveTerm() {
  const [, setParams] = useQueryStates(
    { term: parseAsString, before: parseAsString, after: parseAsString, page: parseAsString },
    { shallow: false, history: 'push' },
  );
  const [isPending, startTransition] = useTransition();
  // Read from the URL itself: the nuqs value lags behind a client-side navigation (a "Shop by"
  // tile is a plain link), and the chip must appear the moment the tile lands.
  const term = useSearchParams().get('term')?.trim();

  if (!term) return null;

  const clear = () => {
    startTransition(async () => {
      await setParams({ term: null, before: null, after: null, page: null });
    });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-contrast-500">
      <span>Showing results for</span>
      <button
        aria-label={`Clear “${term}” and show everything`}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#fcb6bb] bg-[#fdf3f5] py-1 pl-3 pr-2 text-sm font-semibold capitalize text-[var(--button-primary-background,#d90716)] transition-colors hover:border-[var(--button-primary-background,#d90716)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-2"
        onClick={clear}
        type="button"
      >
        {term}
        {isPending ? (
          <Loader2 aria-hidden className="animate-spin" size={14} />
        ) : (
          <X aria-hidden size={14} strokeWidth={2.25} />
        )}
      </button>
      <span className="text-xs text-contrast-400">Click to clear</span>
    </div>
  );
}
