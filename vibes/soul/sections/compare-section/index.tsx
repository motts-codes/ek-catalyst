import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { CompareCardSkeleton, type CompareProduct } from '@/vibes/soul/primitives/compare-card';
import {
  AddToCartForm,
  CompareAddToCartAction,
} from '@/vibes/soul/primitives/compare-card/add-to-cart-form';
import { ProductCard, type ProductCardAddToCartAction } from '@/vibes/soul/primitives/product-card';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Reveal } from '@/vibes/soul/primitives/reveal';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';

interface CompareSectionProps {
  className?: string;
  title?: string;
  products: Streamable<CompareProduct[]>;
  emptyStateTitle?: Streamable<string>;
  emptyStateSubtitle?: Streamable<string>;
  addToCartLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  descriptionLabel?: string;
  noDescriptionLabel?: string;
  ratingLabel?: string;
  noRatingsLabel?: string;
  otherDetailsLabel?: string;
  noOtherDetailsLabel?: string;
  viewOptionsLabel?: string;
  preorderLabel?: string;
  showMoreLabel?: string;
  showLessLabel?: string;
  placeholderCount?: number;
  addToCartAction?: CompareAddToCartAction;
  cardAddToCartAction?: ProductCardAddToCartAction;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --compare-section-title-font-family: var(--font-family-heading);
 *   --compare-section-title: hsl(var(--foreground));
 *   --compare-section-count: hsl(var(--contrast-300));
 *   --compare-section-empty-font-family: var(--font-family-body);
 *   --compare-section-empty-title-font-family: var(--font-family-heading);
 *   --compare-section-empty-title: hsl(var(--foreground));
 *   --compare-section-empty-subtitle: hsl(var(--contrast-500));
 * }
 * ```
 */
export function CompareSection({
  className = '',
  title = 'Compare products',
  products: streamableProducts,
  addToCartAction,
  cardAddToCartAction,
  addToCartLabel = 'Add to cart',
  emptyStateTitle = 'No products to compare',
  emptyStateSubtitle = 'Browse our catalog to find products.',
  descriptionLabel,
  noDescriptionLabel,
  ratingLabel,
  noRatingsLabel,
  otherDetailsLabel,
  noOtherDetailsLabel,
  viewOptionsLabel = 'View options',
  preorderLabel = 'Preorder',
  showMoreLabel,
  showLessLabel,
  placeholderCount,
}: CompareSectionProps) {
  return (
    <Stream
      fallback={
        <CompareSectionSkeleton className={className} placeholderCount={placeholderCount} />
      }
      value={streamableProducts}
    >
      {(products) => {
        if (products.length === 0) {
          return (
            <CompareSectionEmptyState
              className={className}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              placeholderCount={placeholderCount}
            />
          );
        }

        // Table-style layout: one grid, a column per product, a row per feature, so every
        // cell in a row shares a height and products can be read across like a table. Field
        // rows come from the union of all products' fields; a product without one shows "—".
        const fieldNames = products.reduce<string[]>((names, product) => {
          (product.customFields ?? []).forEach(({ name }) => {
            if (!names.includes(name)) names.push(name);
          });

          return names;
        }, []);
        // Columns shrink to 12rem before the row scrolls, so five products sit side by side on
        // a laptop and a phone shows two; anything beyond that scrolls sideways.
        const columns = { gridTemplateColumns: `repeat(${products.length}, minmax(12rem, 15rem))` };
        const rowHeading =
          'col-span-full border-b border-[var(--compare-card-divider,hsl(var(--contrast-100)))] pb-2 pt-8 font-[family-name:var(--compare-card-font-family-secondary,var(--font-family-mono))] text-xs font-normal uppercase text-[var(--compare-card-label,hsl(var(--foreground)))]';
        const cell =
          'border-b border-[var(--compare-card-divider,hsl(var(--contrast-100)))] py-3 text-sm';
        const muted = 'text-[var(--compare-card-description,hsl(var(--contrast-400)))]';

        return (
          <div className={clsx('@container', className)}>
            <div className="mx-auto w-full max-w-screen-2xl px-6 py-10 @xl:px-9 @xl:py-14 @4xl:px-14 @4xl:py-20">
              <h1 className="mb-8 font-[family-name:var(--compare-section-title-font-family,var(--font-family-heading))] text-2xl leading-none text-[var(--compare-section-title,hsl(var(--foreground)))] @xl:mb-10 @xl:text-3xl @4xl:text-4xl">
                {title}{' '}
                <span className="text-[var(--compare-section-count,hsl(var(--contrast-300)))]">
                  {products.length}
                </span>
              </h1>
              <div className="overflow-x-auto">
                <div className="grid gap-x-4 @4xl:gap-x-6" style={columns}>
                  {products.map((product) => (
                    <div className="space-y-4" key={product.id}>
                      <ProductCard
                        addToCartAction={cardAddToCartAction}
                        imageSizes="(min-width: 42rem) 25vw, (min-width: 32rem) 33vw, (min-width: 28rem) 50vw, 100vw"
                        product={product}
                      />
                      {addToCartAction &&
                        cardAddToCartAction == null &&
                        (product.hasVariants !== undefined && !product.hasVariants ? (
                          <AddToCartForm
                            addToCartAction={addToCartAction}
                            addToCartLabel={addToCartLabel}
                            disabled={product.disabled}
                            isPreorder={product.isPreorder}
                            preorderLabel={preorderLabel}
                            productId={product.id}
                          />
                        ) : (
                          <ButtonLink className="w-full" href={product.href} size="medium">
                            {viewOptionsLabel}
                          </ButtonLink>
                        ))}
                    </div>
                  ))}

                  <div className={rowHeading}>{ratingLabel}</div>
                  {products.map((product) => (
                    <div className={cell} key={product.id}>
                      {product.rating != null ? (
                        <Rating rating={product.rating} />
                      ) : (
                        <p className={muted}>{noRatingsLabel}</p>
                      )}
                    </div>
                  ))}

                  <div className={rowHeading}>{descriptionLabel}</div>
                  {products.map((product) => (
                    <div className={cell} key={product.id}>
                      {product.description != null && product.description !== '' ? (
                        <Reveal hideLabel={showLessLabel} showLabel={showMoreLabel}>
                          <div className="prose prose-sm [&>div>*:first-child]:mt-0">
                            {product.description}
                          </div>
                        </Reveal>
                      ) : (
                        <p className={muted}>{noDescriptionLabel}</p>
                      )}
                    </div>
                  ))}

                  <div className={rowHeading}>{otherDetailsLabel}</div>
                  {fieldNames.length === 0 &&
                    products.map((product) => (
                      <div className={cell} key={product.id}>
                        <p className={muted}>{noOtherDetailsLabel}</p>
                      </div>
                    ))}
                  {fieldNames.map((name) =>
                    products.map((product) => {
                      const value = product.customFields?.find((f) => f.name === name)?.value;

                      return (
                        <div
                          className={clsx(cell, 'grid grid-cols-[auto_1fr] gap-x-3 text-xs')}
                          key={`${name}-${product.id}`}
                        >
                          <span className="font-semibold text-[var(--compare-card-field,hsl(var(--foreground)))]">
                            {name}:
                          </span>
                          {value != null && value !== '' ? (
                            <span className="text-[var(--compare-card-field,hsl(var(--foreground)))]">
                              {value}
                            </span>
                          ) : (
                            <span className={muted}>Not specified</span>
                          )}
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Stream>
  );
}

export function CompareSectionSkeleton({
  className,
  title = 'Compare products',
  placeholderCount = 4,
}: Pick<CompareSectionProps, 'className' | 'title' | 'placeholderCount'>) {
  return (
    <Skeleton.Root className={clsx('group/compare-section', className)} hideOverflow>
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-10 @xl:px-9 @xl:py-14 @4xl:px-14 @4xl:py-20">
        <div className="relative @container">
          <div className="mb-8 flex w-full items-end justify-between gap-10 @xl:mb-10">
            <h1 className="font-[family-name:var(--compare-section-title-font-family,var(--font-family-heading))] text-2xl leading-none text-[var(--compare-section-title,hsl(var(--foreground)))] @xl:text-3xl @4xl:text-4xl">
              {title}
            </h1>
            <div className="group-has-[[data-pending]]/compare-section:animate-pulse" data-pending>
              <div className="flex gap-2">
                <Skeleton.Icon
                  icon={<ArrowLeft aria-hidden className="h-6 w-6" strokeWidth={1.5} />}
                />
                <Skeleton.Icon
                  icon={<ArrowRight aria-hidden className="h-6 w-6" strokeWidth={1.5} />}
                />
              </div>
            </div>
          </div>
          <div
            className="w-full group-has-[[data-pending]]/compare-section:animate-pulse"
            data-pending
          >
            <div className="-ml-4 flex @2xl:-ml-5">
              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
                  key={index}
                  role="group"
                >
                  <CompareCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Skeleton.Root>
  );
}

export function CompareSectionEmptyState({
  className,
  emptyStateTitle,
  emptyStateSubtitle,
  placeholderCount = 4,
}: Pick<
  CompareSectionProps,
  'className' | 'title' | 'emptyStateTitle' | 'emptyStateSubtitle' | 'placeholderCount'
>) {
  return (
    <div className={clsx('overflow-hidden @container', className)}>
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-10 @xl:px-9 @xl:py-14 @4xl:px-14 @4xl:py-20">
        <div className="@container">
          <div className="relative w-full">
            <div className="-ml-4 flex [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_90%)] @2xl:-ml-5">
              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4 @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4 @2xl:pl-5"
                  key={index}
                  role="group"
                >
                  <CompareCardSkeleton />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 mx-auto px-3 py-16 pb-3 @4xl:px-10 @4xl:pb-10 @4xl:pt-28">
              <header className="mx-auto max-w-xl space-y-2 text-center font-[family-name:var(--compare-section-empty-font-family,var(--font-family-body))] @4xl:space-y-3">
                <h3 className="font-[family-name:var(--compare-section-empty-title-font-family,var(--font-family-heading))] text-2xl leading-tight text-[var(--compare-section-empty-title,hsl(var(--foreground)))] @4xl:text-4xl @4xl:leading-none">
                  {emptyStateTitle}
                </h3>
                <p className="text-sm text-[var(--compare-section-empty-subtitle,hsl(var(--contrast-500)))] @4xl:text-lg">
                  {emptyStateSubtitle}
                </p>
              </header>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
