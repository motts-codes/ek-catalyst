'use client';

import { clsx } from 'clsx';
import { SlidersHorizontal } from 'lucide-react';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

const STORAGE_KEY = 'ek:filters-visible';
const ASIDE_ID = 'products-filters';

const FiltersVisibility = createContext<{ visible: boolean; toggle: () => void }>({
  visible: true,
  toggle: () => undefined,
});

// Desktop show/hide for the filters sidebar. Visible by default; the choice is remembered in the
// browser (a per-viewer convenience, so it's read after mount to keep server and client markup
// identical). Below @3xl the sidebar is a slide-in panel with its own trigger, untouched by this.
export function FiltersVisibilityProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'false') setVisible(false);
    } catch {
      // Storage unavailable (private mode, blocked): stay visible.
    }
  }, []);

  const toggle = () => {
    setVisible((current) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(!current));
      } catch {
        // Ignore; the toggle still works for this page view.
      }

      return !current;
    });
  };

  return (
    <FiltersVisibility.Provider value={{ visible, toggle }}>{children}</FiltersVisibility.Provider>
  );
}

export function FiltersToggle({ showLabel, hideLabel }: { showLabel: string; hideLabel: string }) {
  const { visible, toggle } = useContext(FiltersVisibility);

  return (
    <Button
      aria-controls={ASIDE_ID}
      aria-expanded={visible}
      className="!h-8 whitespace-nowrap text-xs [&>span]:!min-h-0"
      onClick={toggle}
      size="x-small"
      type="button"
      variant="secondary"
    >
      {visible ? hideLabel : showLabel}
      <SlidersHorizontal aria-hidden size={15} />
    </Button>
  );
}

export function FiltersAside({ children, className }: { children: ReactNode; className?: string }) {
  const { visible } = useContext(FiltersVisibility);

  return (
    <aside className={clsx(className, !visible && '!hidden')} id={ASIDE_ID}>
      {children}
    </aside>
  );
}
