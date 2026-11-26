import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { CompareDrawer, CompareDrawerProvider } from '@/vibes/soul/primitives/compare-drawer';
import {
  type CardSavedItems,
  type Product,
  ProductCard,
  type ProductCardAddToCartAction,
  ProductCardSkeleton,
  type ProductCardWishlistAction,
} from '@/vibes/soul/primitives/product-card';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

interface ProductListProps {
  products: Streamable<Product[]>;
  showRating?: boolean;
  compareProducts?: Streamable<Product[]>;
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showCompare?: Streamable<boolean>;
  compareHref?: string;
  compareLabel?: Streamable<string>;
  compareParamName?: string;
  addToCartAction?: ProductCardAddToCartAction;
  /** In-page anchor for quote-only products' CTA (pages that render the quote form below). */
  quoteHref?: string;
  /** Wish-list heart on each card; `savedItems` (null for guests) fills the saved ones. */
  wishlistAction?: ProductCardWishlistAction;
  savedItems?: Streamable<CardSavedItems | null>;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  placeholderCount?: number;
  removeLabel?: Streamable<string>;
  maxItems?: number;
  maxCompareLimitMessage?: Streamable<string>;
  /** "compact": the listing grid — 4 columns beside the filter sidebar, 5 with it hidden, so a
   *  card keeps roughly the same size either way. */
  density?: 'default' | 'compact';
}

// Default (non-listing uses): capped at 4 columns.
// Compact (listings): 4 columns beside the filter sidebar, 5 once it's hidden (the grid passes
// 80rem), never more — so a card stays ~250px either way instead of growing or shrinking.
const GRID_CLASS = {
  default:
    'mx-auto grid grid-cols-2 gap-x-4 gap-y-6 @2xl:grid-cols-3 @2xl:gap-x-6 @2xl:gap-y-8 @5xl:grid-cols-4',
  compact:
    'mx-auto grid grid-cols-2 gap-x-3 gap-y-5 @md:gap-x-4 @md:gap-y-6 @2xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5',
} as const;

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-list-light-empty-title: hsl(var(--foreground));
 *   --product-list-light-empty-subtitle: hsl(var(--contrast-500));
 *   --product-list-dark-empty-title: hsl(var(--background));
 *   --product-list-dark-empty-subtitle: hsl(var(--contrast-100));
 *   --product-list-empty-state-title-font-family: var(--font-family-heading);
 *   --product-list-empty-state-subtitle-font-family: var(--font-family-body);
 * }
 * ```
 */
export function ProductList({
  products: streamableProducts,
  showRating,
  className,
  colorScheme = 'light',
  aspectRatio = '1:1',
  showCompare: streamableShowCompare = true,
  compareHref,
  compareProducts: streamableCompareProducts = [],
  compareLabel: streamableCompareLabel = 'Compare',
  compareParamName = 'compare',
  addToCartAction,
  quoteHref,
  wishlistAction,
  savedItems: streamableSavedItems = null,
  emptyStateTitle = 'No products found',
  emptyStateSubtitle = 'Try browsing our complete catalog of products.',
  placeholderCount = 8,
  removeLabel: streamableRemoveLabel,
  maxItems,
  maxCompareLimitMessage: streamableMaxCompareLimitMessage,
  density = 'default',
}: ProductListProps) {
  return (
    <Stream
      fallback={<ProductListSkeleton placeholderCount={placeholderCount} />}
      value={Streamable.all([
        streamableProducts,
        streamableCompareLabel,
        streamableShowCompare,
        streamableCompareProducts,
        streamableRemoveLabel,
        streamableMaxCompareLimitMessage,
        streamableSavedItems,
      ])}
    >
      {([
        products,
        compareLabel,
        showCompare,
        compareProducts,
        removeLabel,
        maxCompareLimitMessage,
        savedItems,
      ]) => {
        if (products.length === 0) {
          return (
            <ProductListEmptyState
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
            />
          );
        }

        return (
          <CompareDrawerProvider
            items={compareProducts}
            maxCompareLimitMessage={maxCompareLimitMessage}
            maxItems={maxItems}
          >
            <div className={clsx('w-full @container', className)}>
              <div className={GRID_CLASS[density]}>
                {products.map((product) => (
                  <ProductCard
                    addToCartAction={addToCartAction}
                    aspectRatio={aspectRatio}
                    colorScheme={colorScheme}
                    compareLabel={compareLabel}
                    compareParamName={compareParamName}
                    imageSizes="(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw"
                    key={product.id}
                    product={product}
                    quoteHref={quoteHref}
                    showCompare={showCompare}
                    showRating={showRating}
                    wishlist={
                      savedItems?.items[product.id] ??
                      (savedItems ? { wishlistId: savedItems.defaultWishlistId } : undefined)
                    }
                    wishlistAction={wishlistAction}
                  />
                ))}
              </div>
            </div>
            {showCompare && compareProducts.length > 0 && (
              <CompareDrawer
                href={compareHref}
                paramName={compareParamName}
                removeLabel={removeLabel}
                submitLabel={compareLabel}
              />
            )}
          </CompareDrawerProvider>
        );
      }}
    </Stream>
  );
}

export function ProductListSkeleton({
  className,
  placeholderCount = 8,
  density = 'default',
}: Pick<ProductListProps, 'className' | 'placeholderCount' | 'density'>) {
  return (
    <Skeleton.Root
      className={clsx('group-has-data-pending/product-list:animate-pulse', className)}
      pending
    >
      <div className={GRID_CLASS[density]}>
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

export function ProductListEmptyState({
  className,
  emptyStateTitle,
  emptyStateSubtitle,
}: Pick<
  ProductListProps,
  'className' | 'placeholderCount' | 'emptyStateTitle' | 'emptyStateSubtitle'
>) {
  // Just the message, in the soft panel the FAQ and glossary use for "nothing matches". The
  // stock Catalyst version drew a faded grid of ghost product cards behind it, which EK's audit
  // read as loading skeletons stuck on the page (26 Nov 2026).
  return (
    <div
      className={clsx(
        'rounded-3xl border border-contrast-100 bg-[#fdf8f8] px-6 py-14 text-center @4xl:py-20',
        className,
      )}
    >
      <div className="mx-auto max-w-xl space-y-2 @4xl:space-y-3">
        <h3 className="font-[family-name:var(--product-list-empty-state-title-font-family,var(--font-family-heading))] text-2xl font-semibold leading-tight text-[var(--product-list-empty-state-title,hsl(var(--foreground)))] @4xl:text-3xl">
          {emptyStateTitle}
        </h3>
        <p className="font-[family-name:var(--product-list-empty-state-subtitle-font-family,var(--font-family-body))] text-sm text-[var(--product-list-empty-state-subtitle,hsl(var(--contrast-500)))] @4xl:text-base">
          {emptyStateSubtitle}
        </p>
      </div>
    </div>
  );
}
