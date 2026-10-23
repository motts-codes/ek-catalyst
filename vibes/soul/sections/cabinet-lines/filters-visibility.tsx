'use client';

import { clsx } from 'clsx';
import { SlidersHorizontal } from 'lucide-react';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { Link } from '~/components/link';

const ASIDE_ID = 'listing-filters';

const Visibility = createContext<{ visible: boolean; setVisible: (v: boolean) => void }>({
  visible: false,
  setVisible: () => undefined,
});

// Show / hide for the listings' filters sidebar, mirroring the category pages' FiltersAside: the
// sidebar is always in the page and slides open or shut. The URL (?filters=1 / 0) is the source
// of truth — `open` comes from it — but the click flips the state at once so the slide starts
// before the navigation lands.
export function ListingFiltersProvider({ open, children }: { open: boolean; children: ReactNode }) {
  const [visible, setVisible] = useState(open);

  useEffect(() => setVisible(open), [open]);

  return <Visibility.Provider value={{ visible, setVisible }}>{children}</Visibility.Provider>;
}

export function ListingFiltersToggle({ href, className }: { href: string; className?: string }) {
  const { visible, setVisible } = useContext(Visibility);

  return (
    <Link
      aria-controls={ASIDE_ID}
      aria-expanded={visible}
      className={className}
      href={href}
      onClick={() => setVisible(!visible)}
      scroll={false}
    >
      <SlidersHorizontal size={13} strokeWidth={2} />
      {visible ? 'Hide filters' : 'Show all filters'}
    </Link>
  );
}

// The outer box animates its width (and the gap beside it) while the inner column keeps its full
// width so the filters never reflow mid-motion. Hidden, it is `inert` and collapsed on phones too.
export function ListingFiltersAside({ children }: { children: ReactNode }) {
  const { visible } = useContext(Visibility);

  return (
    <aside
      className={clsx(
        'shrink-0 overflow-hidden transition-[width,opacity,margin,transform,max-height] duration-300 ease-smooth motion-reduce:transition-none',
        '@3xl:sticky @3xl:top-4 @3xl:max-h-[calc(100vh-2rem)]',
        visible
          ? 'max-h-[200rem] translate-x-0 opacity-100 @3xl:w-52 @3xl:overflow-y-auto @4xl:w-60'
          : '-mb-8 max-h-0 -translate-x-4 opacity-0 @3xl:-mr-8 @3xl:mb-0 @3xl:w-0 @4xl:-mr-10',
      )}
      id={ASIDE_ID}
      inert={!visible}
    >
      <div className="@3xl:w-52 @3xl:border-r @3xl:border-contrast-100 @3xl:pr-8 @4xl:w-60 @4xl:pr-10">
        {children}
      </div>
    </aside>
  );
}
