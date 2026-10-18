'use client';

import { Loader2, Search, X } from 'lucide-react';
import { parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState, useTransition } from 'react';

// A search box for the listing: filters the whole result set (every page) by the "term" search
// param, which the faceted search already understands, so it combines with the sidebar filters,
// the type tiles and the program. Submitting resets to page one.
export function ListSearch({ placeholder = 'Search products' }: { placeholder?: string }) {
  const [params, setParams] = useQueryStates(
    { term: parseAsString, before: parseAsString, after: parseAsString, page: parseAsString },
    { shallow: false, history: 'push' },
  );
  const [value, setValue] = useState(params.term ?? '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(params.term ?? '');
  }, [params.term]);

  const apply = (term: string) => {
    startTransition(async () => {
      await setParams({ term: term.trim() || null, before: null, after: null, page: null });
    });
  };

  return (
    <form
      // Full width on its own line in a narrow toolbar; inline beside the sort control otherwise.
      className="relative flex h-8 min-w-0 basis-full items-center rounded-full border border-[hsl(var(--primary)/40%)] bg-white pl-3 pr-1 text-xs focus-within:border-[hsl(var(--primary))] @sm:basis-auto"
      onSubmit={(event) => {
        event.preventDefault();
        apply(value);
      }}
      role="search"
    >
      <Search aria-hidden className="shrink-0 text-contrast-400" size={14} strokeWidth={1.75} />
      <input
        aria-label={placeholder}
        className="h-full w-full min-w-0 bg-transparent px-2 text-xs placeholder:text-contrast-400 focus:outline-none @md:w-40 @2xl:w-56"
        name="term"
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {isPending ? (
        <Loader2 aria-hidden className="shrink-0 animate-spin text-contrast-400" size={14} />
      ) : (
        value !== '' && (
          <button
            aria-label="Clear search"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-contrast-400 hover:text-foreground"
            onClick={() => {
              setValue('');
              apply('');
            }}
            type="button"
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        )
      )}
    </form>
  );
}
