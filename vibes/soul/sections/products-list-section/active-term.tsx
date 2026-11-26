'use client';

import { Loader2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { parseAsString, useQueryStates } from 'nuqs';
import { useTransition } from 'react';

// The search term the listing is narrowed by (typed, or from a "Shop by finish / type / width"
// tile, which narrows by term too), shown inline after the product count as
// "18 products | fingerprint ×", the × clearing it. Without a term it renders nothing.
export function ActiveTerm() {
  const [, setParams] = useQueryStates(
    { term: parseAsString, before: parseAsString, after: parseAsString, page: parseAsString },
    { shallow: false, history: 'push' },
  );
  const [isPending, startTransition] = useTransition();
  // Read from the URL itself: the nuqs value lags behind a client-side navigation (a "Shop by"
  // tile is a plain link), and the term must show the moment the tile lands.
  const term = useSearchParams().get('term')?.trim();

  if (!term) return null;

  const clear = () => {
    startTransition(async () => {
      await setParams({ term: null, before: null, after: null, page: null });
    });
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-normal text-foreground">
      <span aria-hidden className="text-contrast-300">
        |
      </span>
      <span>
        <span className="sr-only">matching </span>
        {term}
      </span>
      <button
        aria-label={`Clear “${term}” and show everything`}
        className="flex size-5 items-center justify-center rounded-full text-contrast-400 transition-colors hover:bg-contrast-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]"
        onClick={clear}
        type="button"
      >
        {isPending ? (
          <Loader2 aria-hidden className="animate-spin" size={13} />
        ) : (
          <X aria-hidden size={13} strokeWidth={2.25} />
        )}
      </button>
    </span>
  );
}
