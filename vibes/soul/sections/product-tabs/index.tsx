'use client';

import { clsx } from 'clsx';
import { ReactNode, useState } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { type Product } from '@/vibes/soul/primitives/product-card';
import { ProductCarousel } from '@/vibes/soul/sections/product-carousel';

export interface TabDescriptor {
  id: string;
  label: string;
}

interface ShellProps<T extends TabDescriptor> {
  tabs: T[];
  /** Renders the active tab's panel. Only the active panel is mounted. */
  renderPanel: (tab: T) => ReactNode;
  className?: string;
}

// The tab row + active panel, with no opinion about what a panel contains. `ProductTabs` (below)
// and the Makeswift "Home / Product Tabs" component both build on it.
export function ProductTabsShell<T extends TabDescriptor>({
  tabs,
  renderPanel,
  className,
}: ShellProps<T>) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!active) return null;

  return (
    <div className={clsx('@container', className)}>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;

          return (
            <button
              aria-selected={isActive}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'border-foreground bg-foreground text-white'
                  : 'border-contrast-200 bg-white text-contrast-500 hover:border-foreground hover:text-foreground',
              )}
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div key={active.id} role="tabpanel">
        {renderPanel(active)}
      </div>
    </div>
  );
}

export interface ProductTab extends TabDescriptor {
  products: Streamable<Product[]>;
}

interface Props {
  tabs: ProductTab[];
  aspectRatio?: '5:6' | '3:4' | '1:1';
  className?: string;
}

// "Shop what's moving." — tabs by reason to buy now (Trending, New, Best selling, On sale…), each a
// product carousel fed by store data.
export function ProductTabs({ tabs, aspectRatio = '1:1', className }: Props) {
  return (
    <ProductTabsShell
      className={className}
      renderPanel={(tab) => (
        <ProductCarousel
          aspectRatio={aspectRatio}
          emptyStateSubtitle="Nothing here yet — check the other tabs."
          emptyStateTitle="No products in this tab"
          products={tab.products}
          showScrollbar={false}
        />
      )}
      tabs={tabs}
    />
  );
}
