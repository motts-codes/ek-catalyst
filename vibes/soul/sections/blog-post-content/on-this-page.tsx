'use client';

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  text: string;
}

// "On this page": one link per section heading. The link for the section currently being read
// turns red: the heading nearest the top of the viewport (just under the floating nav) wins,
// updated on scroll. Tracking is visual only, so the list stays a plain list of links.
export function OnThisPage({ items, className }: { items: TocItem[]; className?: string }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null);

    if (headings.length === 0) return;

    const NAV_OFFSET = 140;
    let frame = 0;

    const update = () => {
      frame = 0;

      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
      // The last heading that has passed the nav line is the section being read; when the page
      // can't scroll any further, it's the last section.
      const passed = headings.reduce<string | null>(
        (found, heading) =>
          heading.getBoundingClientRect().top <= NAV_OFFSET ? heading.id : found,
        headings[0]?.id ?? null,
      );

      setCurrent(atBottom ? (headings[headings.length - 1]?.id ?? passed) : passed);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label="On this page" className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-contrast-500">
        On this page
      </p>
      <ol className="mt-4 space-y-2.5 text-sm">
        {items.map((item) => {
          const active = item.id === current;

          return (
            <li key={item.id}>
              <a
                aria-current={active ? 'location' : undefined}
                className={clsx(
                  'block transition-colors hover:text-[var(--button-primary-background,#d90716)] focus-visible:text-[var(--button-primary-background,#d90716)] focus-visible:outline-none',
                  active
                    ? 'font-semibold text-[var(--button-primary-background,#d90716)]'
                    : 'text-contrast-500',
                )}
                href={`#${item.id}`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
