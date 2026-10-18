'use client';

import { clsx } from 'clsx';
import { createContext, type ReactNode, useContext, useState, useTransition } from 'react';

import { type Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';

// What a swatch chosen on the card swaps in: that variant's own photo and price. Keyed by the
// option value id the swatch carries.
export interface CardVariant {
  image?: { src: string; alt: string };
  price?: Price;
  purchasable: boolean;
}

export type CardVariants = Record<string, CardVariant>;

interface VariantState {
  selected: string | undefined;
  variant: CardVariant | undefined;
  select: (valueId: number) => void;
  /** True for the moment between a swatch click and the card showing that variant. */
  pending: boolean;
}

const VariantContext = createContext<VariantState | null>(null);

// Holds which swatch is chosen on a card. The image and price slots below read from it, so a
// click swaps both; the add-to-cart button waits for `pending` to clear.
export function CardVariantProvider({
  variants,
  initial,
  children,
}: {
  variants?: CardVariants;
  initial?: number;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(initial != null ? String(initial) : undefined);
  const [pending, startTransition] = useTransition();

  if (variants == null) return children;

  return (
    <VariantContext.Provider
      value={{
        selected,
        variant: selected != null ? variants[selected] : undefined,
        select: (valueId) => startTransition(() => setSelected(String(valueId))),
        pending,
      }}
    >
      {children}
    </VariantContext.Provider>
  );
}

export function useCardVariant(): VariantState | null {
  return useContext(VariantContext);
}

// The card photo: the chosen variant's when there is one, else the product's. Re-keyed on the
// source so the swap fades in rather than snapping.
export function CardImage({
  src,
  alt,
  className,
  sizes,
  preload,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  const state = useCardVariant();
  const image = state?.variant?.image ?? { src, alt };

  return (
    <Image
      alt={image.alt}
      className={clsx(className, 'duration-300 animate-in fade-in')}
      fill
      key={image.src}
      preload={preload}
      sizes={sizes}
      src={image.src}
    />
  );
}

// The card price: the chosen variant's when there is one, else the product's.
export function CardPrice({
  price,
  unit,
  colorScheme,
}: {
  price?: Price;
  unit?: string;
  colorScheme: 'light' | 'dark';
}) {
  const state = useCardVariant();
  const shown = state?.variant?.price ?? price;

  if (shown == null) return null;

  return (
    <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
      <PriceLabel
        className="text-base @[16rem]:text-lg [&_abbr]:cursor-default [&_abbr]:no-underline"
        colorScheme={colorScheme}
        price={shown}
        superscript
      />
      {Boolean(unit) && <span className="text-xs text-contrast-500">/ {unit}</span>}
    </span>
  );
}
