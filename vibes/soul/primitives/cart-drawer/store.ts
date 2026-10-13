import { useSyncExternalStore } from 'react';

// What the drawer shows after an add-to-cart: the item just added, the whole cart, and totals.
// Built on the server (lib/cart/drawer-summary.ts) and handed to the client by the action.
export interface CartDrawerItem {
  /** Cart line id. */
  id: string;
  name: string;
  brand?: string;
  href?: string;
  image?: { src: string; alt: string };
  /** "Size: 30 in." style lines from the chosen options. */
  options: string[];
  quantity: number;
  /** Unit price, formatted. */
  price: string;
}

export interface CartDrawerData {
  added: CartDrawerItem;
  items: CartDrawerItem[];
  totalQuantity: number;
  /** Formatted cart subtotal. */
  subtotal: string;
}

// A small module store (no provider needed): any add-to-cart form opens the drawer from anywhere.
let current: CartDrawerData | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function openCartDrawer(data: CartDrawerData) {
  current = data;
  emit();
}

export function closeCartDrawer() {
  current = null;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

export function useCartDrawer(): CartDrawerData | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
