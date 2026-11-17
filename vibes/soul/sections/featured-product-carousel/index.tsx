import { Streamable } from '@/vibes/soul/lib/streamable';
import { AnimatedUnderline } from '@/vibes/soul/primitives/animated-underline';
import {
  type CardSavedItems,
  type ProductCardAddToCartAction,
  type ProductCardWishlistAction,
} from '@/vibes/soul/primitives/product-card';
import { CarouselProduct, ProductCarousel } from '@/vibes/soul/sections/product-carousel';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { Link } from '~/components/link';

interface Link {
  label: string;
  href: string;
}

export interface FeaturedProductCarouselProps {
  title: string;
  description?: string;
  cta?: Link;
  products: Streamable<CarouselProduct[]>;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  placeholderCount?: number;
  scrollbarLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  hideOverflow?: boolean;
  /** `compact` fits five cards per row on desktop, the size the category grids use. */
  density?: 'default' | 'compact';
  /** Direct add-to-cart for the cards (swatches, Add to Cart); without it they link to the PDP. */
  addToCartAction?: ProductCardAddToCartAction;
  /** Wish-list heart on each card; `savedItems` (null for guests) fills the saved ones. */
  wishlistAction?: ProductCardWishlistAction;
  savedItems?: Streamable<CardSavedItems | null>;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --featured-product-carousel-font-family: var(--font-family-body);
 *   --featured-product-carousel-title-font-family: var(--font-family-heading);
 *   --featured-product-carousel-title: hsl(var(--foreground));
 *   --featured-product-carousel-description: hsl(var(--contrast-500));
 * }
 * ```
 */
export function FeaturedProductCarousel({
  title,
  description,
  cta,
  products,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount,
  scrollbarLabel,
  previousLabel,
  nextLabel,
  hideOverflow = false,
  density = 'default',
  addToCartAction,
  wishlistAction,
  savedItems,
}: FeaturedProductCarouselProps) {
  return (
    <SectionLayout containerSize="2xl">
      <div className="mb-6 flex w-full flex-row flex-wrap items-end justify-between gap-x-8 gap-y-6 @4xl:mb-8">
        <header className="font-[family-name:var(--featured-product-carousel-font-family,var(--font-family-body))]">
          <h2 className="font-[family-name:var(--featured-product-carousel-title-font-family,var(--font-family-heading))] text-2xl font-semibold leading-tight text-[var(--secondary-heading-color)] @xl:text-3xl">
            {title}
          </h2>
          {description != null && description !== '' && (
            <p className="mt-3 max-w-xl leading-relaxed text-[var(--featured-product-carousel-description,hsl(var(--contrast-500)))]">
              {description}
            </p>
          )}
        </header>
        {cta != null && cta.href !== '' && cta.label !== '' && (
          <Link className="group/underline focus:outline-none" href={cta.href}>
            <AnimatedUnderline className="mr-3">{cta.label}</AnimatedUnderline>
          </Link>
        )}
      </div>
      <div className="group/product-carousel">
        <ProductCarousel
          addToCartAction={addToCartAction}
          density={density}
          emptyStateSubtitle={emptyStateSubtitle}
          emptyStateTitle={emptyStateTitle}
          hideOverflow={hideOverflow}
          nextLabel={nextLabel}
          placeholderCount={placeholderCount}
          previousLabel={previousLabel}
          products={products}
          savedItems={savedItems}
          scrollbarLabel={scrollbarLabel}
          wishlistAction={wishlistAction}
        />
      </div>
    </SectionLayout>
  );
}
