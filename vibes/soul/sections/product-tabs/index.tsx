'use client';

import { clsx } from 'clsx';
import { createContext, ReactNode, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { CarouselButtons } from '@/vibes/soul/primitives/carousel';
import { HomeProductCard } from '@/vibes/soul/primitives/home-product-card';
import {
  type Product,
  type ProductCardAddToCartAction,
} from '@/vibes/soul/primitives/product-card';
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

// Where the active panel's carousel arrows go: a slot at the right end of the tab row.
const ArrowSlotContext = createContext<HTMLElement | null>(null);

// Carousel arrows rendered into the tab row. Must be rendered inside a <Carousel> (it reads the
// carousel context, which survives the portal) that itself sits inside a ProductTabsShell panel.
export function TabRowArrows() {
  const slot = useContext(ArrowSlotContext);

  if (!slot) return null;

  return createPortal(<CarouselButtons />, slot);
}

// The tab row + active panel, with no opinion about what a panel contains. `ProductTabs` (below)
// and the Makeswift "Home / Product Tabs" component both build on it. Underline tabs: one rule
// under the row, the active label bold with a red underline; the row scrolls sideways on phones.
export function ProductTabsShell<T extends TabDescriptor>({
  tabs,
  renderPanel,
  className,
}: ShellProps<T>) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const [arrowSlot, setArrowSlot] = useState<HTMLElement | null>(null);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!active) return null;

  return (
    <div className={clsx('@container', className)}>
      <div className="mb-6 flex items-end justify-between gap-6 border-b border-contrast-200">
        <div
          className="-mb-px flex min-w-0 gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active.id;

            return (
              <button
                aria-selected={isActive}
                className={clsx(
                  'whitespace-nowrap border-b-2 px-0.5 pb-3 pt-2 text-[15px] transition-colors focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  isActive
                    ? 'border-[var(--button-primary-background,#d90716)] font-bold text-foreground'
                    : 'border-transparent text-contrast-500 hover:text-foreground',
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
        <div className="shrink-0 pb-2.5" ref={setArrowSlot} />
      </div>
      <div key={active.id} role="tabpanel">
        <ArrowSlotContext.Provider value={arrowSlot}>
          {renderPanel(active)}
        </ArrowSlotContext.Provider>
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
  /** Direct add-to-cart for no-option products; the card then says "Add to Cart", not "Shop Now". */
  addToCartAction?: ProductCardAddToCartAction;
}

// "Shop what's moving" — tabs by reason to buy now (Trending, New, Best selling, On sale…), each a
// product carousel fed by store data.
export function ProductTabs({ tabs, aspectRatio = '1:1', className, addToCartAction }: Props) {
  return (
    <ProductTabsShell
      className={className}
      renderPanel={(tab) => (
        <ProductCarousel
          CardComponent={HomeProductCard}
          addToCartAction={addToCartAction}
          aspectRatio={aspectRatio}
          controls={<TabRowArrows />}
          density="compact"
          emptyStateSubtitle="Nothing here yet — check the other tabs."
          emptyStateTitle="No products in this tab"
          products={tab.products}
        />
      )}
      tabs={tabs}
    />
  );
}
