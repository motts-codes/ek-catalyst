'use client';

import { ReactNode, useEffect, useState } from 'react';

// Desktop breakpoint (px) matching the PDP's @2xl container switch. At/above this the accordion
// defaults to OPEN; below it (mobile) it defaults to CLOSED so the add-to-cart stays in the first
// fold. It stays a real toggle at every size (accordion feel on desktop too).
const DESKTOP_MIN = 672;

/**
 * "About this item" — a client-side accordion. Real open/close toggle at all sizes, but the initial
 * open state is responsive: open on desktop, closed on mobile. Heading matches the option labels
 * (FINISH / CAPACITY) with a "+"/"−" indicator right after the text.
 */
export function AboutThisItem({ children }: { children: ReactNode }) {
  // Start closed on the server (SSR has no viewport); a layout effect sets the real default before
  // paint so desktop doesn't flash closed.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`).matches);
  }, []);

  return (
    <div className="mt-6">
      <button
        aria-expanded={open}
        className="flex w-fit cursor-pointer items-center gap-2 font-mono text-xs uppercase text-[var(--label-light-text,hsl(var(--contrast-500)))]"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span>About this item</span>
        <span aria-hidden className="text-base leading-none text-contrast-400">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="prose prose-sm mt-2 max-w-none [&>div>*:first-child]:mt-0 [&>div>*:last-child]:mb-0 [&_li]:before:mr-2 [&_li]:before:content-['–'] [&_ul>li]:pl-0 [&_ul]:list-none [&_ul]:pl-0">
          {children}
        </div>
      )}
    </div>
  );
}
