'use client';

import { clsx } from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Link } from '~/components/link';

export interface LineTab {
  label: string;
  /** null is "All". */
  slug: string | null;
  href: string;
  count: number;
}

const RED = 'var(--button-primary-background,#d90716)';

const TAB =
  'inline-flex items-center gap-1 whitespace-nowrap px-0.5 pb-3 pt-2 text-base transition-colors duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--button-primary-background,#d90716)]';

// The tab row, as on the home page's product tabs: one red underline that glides to the selected
// tab instead of a border that jumps from label to label. The tabs are links (the selection lives
// in the URL), so the underline moves as soon as a tab is clicked and the page catches up; this
// component keeps its state across that soft navigation, which is what makes the slide visible.
export function LineTabs({ tabs, selected }: { tabs: LineTab[]; selected: string | null }) {
  const [active, setActive] = useState(selected);
  const refs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // The URL is the source of truth once the navigation lands (back/forward included).
  useEffect(() => setActive(selected), [selected]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current.get(active ?? 'all');

      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };

    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, [active]);

  return (
    // The row scrolls sideways on phones rather than wrapping.
    <ul className="relative flex min-w-0 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const key = tab.slug ?? 'all';
        const isActive = tab.slug === active;

        return (
          <li key={key}>
            <Link
              aria-current={tab.slug === selected ? 'true' : undefined}
              className={clsx(
                TAB,
                isActive
                  ? 'font-bold text-[var(--button-primary-background,#d90716)]'
                  : 'text-contrast-500 hover:text-foreground',
                // Until the underline has been measured (server render, first paint) the selected
                // tab carries a static one, so nothing flashes.
                indicator == null &&
                  isActive &&
                  'shadow-[inset_0_-2px_0_0_var(--button-primary-background,#d90716)]',
              )}
              href={tab.href}
              onClick={() => setActive(tab.slug)}
              ref={(el) => {
                if (el) refs.current.set(key, el);
                else refs.current.delete(key);
              }}
            >
              {tab.label}
              <span className="sr-only">
                , {tab.count} {tab.count === 1 ? 'collection' : 'collections'}
              </span>
              {tab.slug === selected && <span className="sr-only"> (selected)</span>}
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
      {indicator != null && (
        <span
          aria-hidden
          className="absolute bottom-0 h-0.5 transition-[left,width] duration-300 ease-smooth motion-reduce:transition-none"
          style={{ left: indicator.left, width: indicator.width, backgroundColor: RED }}
        />
      )}
    </ul>
  );
}
