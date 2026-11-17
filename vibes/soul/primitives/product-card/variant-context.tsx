'use client';

import { clsx } from 'clsx';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';

import { type Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

// What a swatch chosen on the card swaps in: that variant's own photo and price. Keyed by the
// option value id the swatch carries.
export interface CardVariant {
  image?: { src: string; alt: string };
  price?: Price;
  purchasable: boolean;
}

export type CardVariants = Record<string, CardVariant>;

interface VariantState {
  /** The option the swatches belong to (for links that carry the choice to the product page). */
  optionId: number | undefined;
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
  optionId,
  initial,
  children,
}: {
  variants?: CardVariants;
  optionId?: number;
  initial?: number;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(initial != null ? String(initial) : undefined);
  const [pending, startTransition] = useTransition();

  if (variants == null) return children;

  return (
    <VariantContext.Provider
      value={{
        optionId,
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

// The card photo: the chosen variant's when there is one, else the product's. A change
// cross-fades: the photo on screen stays until the next one has loaded, then the new one fades
// in over it, so there is never a blank frame or a pop. With `hoverSrc` the product's second
// photo sits on top and fades in while the card is hovered (not once a swatch has swapped the
// photo for a variant's own).
export function CardImage({
  src,
  alt,
  hover: hoverImage,
  className,
  sizes,
  preload,
}: {
  src: string;
  alt: string;
  hover?: { src: string; alt: string };
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  const state = useCardVariant();
  const target = state?.variant?.image ?? { src, alt };
  const [shown, setShown] = useState(target);
  const [ready, setReady] = useState(true);
  const incoming = target.src !== shown.src ? target : null;
  const hoverSrc = hoverImage?.src;
  const hover =
    hoverSrc != null && hoverSrc !== shown.src && state?.variant?.image == null && incoming == null
      ? hoverSrc
      : null;

  useEffect(() => {
    if (incoming != null) setReady(false);
  }, [incoming]);

  // Once the new photo has loaded and faded in, it becomes the one on screen and the old one
  // is dropped (the fade is 300ms; wait a touch longer so it has finished).
  useEffect(() => {
    if (incoming == null || !ready) return;

    const timer = window.setTimeout(() => setShown(incoming), 350);

    return () => window.clearTimeout(timer);
  }, [incoming, ready]);

  return (
    <>
      <Image
        alt={shown.alt}
        className={clsx(
          className,
          'transition-opacity duration-300',
          // Dimmed while the next photo loads (the click registered), gone once it has faded in.
          incoming != null && (ready ? 'opacity-0' : 'opacity-60'),
          hover != null && 'group-hover:opacity-0',
        )}
        fill
        preload={preload}
        sizes={sizes}
        src={shown.src}
      />
      {incoming != null && (
        <Image
          alt={incoming.alt}
          className={clsx(
            className,
            'transition-opacity duration-300',
            ready ? 'opacity-100' : 'opacity-0',
          )}
          fill
          key={incoming.src}
          onLoad={() => setReady(true)}
          sizes={sizes}
          src={incoming.src}
        />
      )}
      {hover != null && (
        <Image
          alt=""
          aria-hidden
          className={clsx(
            className,
            'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          )}
          fill
          sizes={sizes}
          src={hover}
        />
      )}
    </>
  );
}

// The card's link to the product page, carrying the chosen swatch (?optionId=valueId) so the
// page opens on that variant.
export function CardLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  id?: string;
  'aria-label'?: string;
}) {
  const state = useCardVariant();
  const withChoice =
    state?.optionId != null && state.selected != null
      ? `${href}${href.includes('?') ? '&' : '?'}${state.optionId}=${state.selected}`
      : href;

  return (
    <Link className={className} href={withChoice} {...rest}>
      {children}
    </Link>
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
