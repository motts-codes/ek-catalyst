'use client';

import { PropsWithChildren } from 'react';

import { CartDrawer } from '@/vibes/soul/primitives/cart-drawer';
import { Toaster } from '@/vibes/soul/primitives/toaster';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SearchProvider>
      <Toaster position="top-right" />
      <CartDrawer />
      {children}
    </SearchProvider>
  );
}
