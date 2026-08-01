import { clsx } from 'clsx';
import { ReactNode } from 'react';

import { Link } from '~/components/link';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import {
  AnimatedUnderline,
  animatedUnderlineClassName,
} from '@/vibes/soul/primitives/animated-underline';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { type Breadcrumb, Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
import { AboutThisItem } from '@/vibes/soul/sections/product-detail/about-this-item';
import {
  ProductGallery,
  ProductGalleryLoadMoreAction,
} from '@/vibes/soul/sections/product-detail/product-gallery';
import { ReviewForm, SubmitReviewAction } from '@/vibes/soul/sections/reviews/review-form';

import {
  BackorderDisplayData,
  ProductDetailForm,
  ProductDetailFormAction,
  StockDisplayData,
} from './product-detail-form';
import { RatingLink } from './rating-link';
import { Field } from './schema';

interface ProductDetailProduct {
  id: string;
  title: string;
  href: string;
  images: Streamable<{
    images: Array<{ src: string; alt: string }>;
    pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  }>;
  price?: Streamable<Price | null>;
  subtitle?: string;
  subtitleHref?: string;
  /** Variant-specific SKU, shown under the product name. */
  sku?: Streamable<string | null>;
  /** Units sold in the past month (from the __bought_last_month custom field). Drives the small
   *  grey social-proof badge under the name; shown only when >= the display threshold. */
  boughtLastMonth?: number;
  badge?: string;
  /**
   * Marketing pills shown above the product name (e.g. Bestseller, Trending).
   * Rendered absolutely-positioned so they never shift the product name's baseline.
   */
  badges?: Array<{ label: string; color: string }>;
  rating?: Streamable<number | null>;
  reviewsEnabled?: boolean;
  showRating?: boolean;
  numberOfReviews?: number;
  summary?: Streamable<string>;
  description?: Streamable<string | ReactNode | null>;
  accordions?: Streamable<
    Array<{
      title: string;
      content: ReactNode;
    }>
  >;
  minQuantity?: Streamable<number | null>;
  maxQuantity?: Streamable<number | null>;
  stockDisplayData?: Streamable<StockDisplayData | null>;
  backorderDisplayData?: Streamable<BackorderDisplayData | null>;
}

export interface ProductDetailProps<F extends Field> {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  product: Streamable<ProductDetailProduct | null>;
  action: ProductDetailFormAction<F>;
  fields: Streamable<F[]>;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  emptySelectPlaceholder?: string;
  ctaLabel?: Streamable<string | null>;
  ctaDisabled?: Streamable<boolean | null>;
  stockStatus?: Streamable<'in' | 'out' | { low: number } | null>;
  prefetch?: boolean;
  thumbnailLabel?: string;
  additionalInformationTitle?: string;
  additionalActions?: ReactNode;
  reviewFormEmailLabel?: string;
  reviewFormModalTitle?: string;
  reviewFormNameLabel?: string;
  reviewFormRatingLabel?: string;
  reviewFormReviewLabel?: string;
  reviewFormSubmitLabel?: string;
  reviewFormTitleLabel?: string;
  reviewFormAction: SubmitReviewAction;
  user: Streamable<{ email: string; name: string }>;
  loadMoreImagesAction?: ProductGalleryLoadMoreAction;
  recaptchaSiteKey?: string;
  // Map of option-value entityId -> co-occurring option-value entityIds (from other options),
  // built from the product's variants. Enables dependent option filtering (e.g. Width -> Heights).
  optionDependencyMap?: Record<number, number[]>;
  // Delivery/pickup message (from the __fulfillment custom field). Shown in the purchase panel.
  fulfillmentMessage?: string;
  // First trust-block row label (from the __delivery custom field, e.g. "Same Day Pickup").
  deliveryMessage?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-detail-border: hsl(var(--contrast-100));
 *   --product-detail-subtitle-font-family: var(--font-family-mono);
 *   --product-detail-title-font-family: var(--font-family-heading);
 *   --product-detail-primary-text: hsl(var(--foreground));
 *   --product-detail-secondary-text:  hsl(var(--contrast-500));
 * }
 * ```
 */
// The "bought in past month" badge is only shown when more than this many were sold (a very low
// count shouldn't advertise weak demand). Counts of 5 or fewer hide the line entirely.
const BOUGHT_BADGE_MIN = 5;

function boughtBadgeLabel(count?: number): string | null {
  if (count == null || !Number.isFinite(count) || count <= BOUGHT_BADGE_MIN) {
    return null;
  }

  // Larger counts round DOWN to a friendly "N+" bucket; small counts (6–49) show the exact number
  // so we never over-state (e.g. 8 sold shouldn't read as "25+").
  if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
  if (count >= 100) return `${Math.floor(count / 100) * 100}+`;
  if (count >= 50) return '50+';

  return `${count}`;
}

export function ProductDetail<F extends Field>({
  product: streamableProduct,
  action,
  fields: streamableFields,
  breadcrumbs,
  quantityLabel,
  incrementLabel,
  decrementLabel,
  emptySelectPlaceholder,
  ctaLabel: streamableCtaLabel,
  ctaDisabled: streamableCtaDisabled,
  stockStatus: streamableStockStatus,
  prefetch,
  thumbnailLabel,
  additionalInformationTitle = 'Additional information',
  additionalActions,
  reviewFormEmailLabel,
  reviewFormModalTitle,
  reviewFormNameLabel,
  reviewFormRatingLabel,
  reviewFormReviewLabel,
  reviewFormSubmitLabel,
  reviewFormTitleLabel,
  reviewFormAction,
  user,
  loadMoreImagesAction,
  recaptchaSiteKey,
  optionDependencyMap,
  fulfillmentMessage,
  deliveryMessage,
}: ProductDetailProps<F>) {
  return (
    <section className="@container">
      <div className="group/product-detail mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-[15px] @xl:px-6 @xl:pb-14 @4xl:px-8 @4xl:pb-20">
        {breadcrumbs && (
          // Smaller gap below the breadcrumb on mobile (name sits right below it there); larger on
          // desktop where the gap separates the breadcrumb from the gallery/details row.
          <div className="group/breadcrumbs mb-4 @2xl:mb-16">
            <Breadcrumbs
              breadcrumbs={breadcrumbs}
              className="[&_a:hover_span]:!text-foreground [&_a]:!text-contrast-300 [&_ol]:!text-[10px] [&_span]:!text-contrast-300 [&_svg]:!text-contrast-300"
            />
          </div>
        )}
        <Stream fallback={<ProductDetailSkeleton />} value={streamableProduct}>
          {(product) =>
            product && (
              <div className="grid grid-cols-1 items-stretch gap-x-8 gap-y-8 @2xl:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] @5xl:gap-x-12">
                {/* Mobile gallery: shown FIRST (image above all details). Forced to a shorter 4:3
                    frame so it isn't full-width-tall on phones. Hidden at @2xl where the gallery
                    lives in its own grid column instead. */}
                <div className="group/product-gallery -mt-1 mb-2 [&_.aspect-square]:!aspect-[4/3] @2xl:hidden">
                  <Stream fallback={<ProductGallerySkeleton />} value={product.images}>
                    {(imagesData) => (
                      <ProductGallery
                        aspectRatio="1:1"
                        images={imagesData.images}
                        loadMoreAction={loadMoreImagesAction}
                        pageInfo={imagesData.pageInfo}
                        productId={Number(product.id)}
                        thumbnailLabel={thumbnailLabel}
                      />
                    )}
                  </Stream>
                </div>
                <div className="group/product-gallery hidden @2xl:-mt-3 @2xl:block">
                  <Stream fallback={<ProductGallerySkeleton />} value={product.images}>
                    {(imagesData) => (
                      <ProductGallery
                        aspectRatio="1:1"
                        images={imagesData.images}
                        loadMoreAction={loadMoreImagesAction}
                        pageInfo={imagesData.pageInfo}
                        productId={Number(product.id)}
                      />
                    )}
                  </Stream>
                </div>
                {/* Product Details */}
                <div className="text-[var(--product-detail-primary-text,hsl(var(--foreground)))] @2xl:border-l @2xl:border-[hsl(var(--product-detail-divider))] @2xl:pl-8 @5xl:pl-12">
                  <div className="group/product-detail-form">
                    <Stream
                      fallback={<ProductDetailFormSkeleton />}
                      value={Streamable.all([
                        streamableFields,
                        streamableCtaLabel,
                        streamableCtaDisabled,
                        product.minQuantity,
                        product.maxQuantity,
                        product.stockDisplayData,
                        product.backorderDisplayData,
                        streamableStockStatus ?? Streamable.from(async () => null),
                      ])}
                    >
                      {([
                        fields,
                        ctaLabel,
                        ctaDisabled,
                        minQuantity,
                        maxQuantity,
                        stockDisplayData,
                        backorderDisplayData,
                        stockStatus,
                      ]) => (
                        <ProductDetailForm
                          action={action}
                          backorderDisplayData={backorderDisplayData ?? undefined}
                          ctaDisabled={ctaDisabled ?? undefined}
                          ctaLabel={ctaLabel ?? undefined}
                          decrementLabel={decrementLabel}
                          stockStatus={stockStatus ?? undefined}
                          emptySelectPlaceholder={emptySelectPlaceholder}
                          descriptionSlot={
                            <Stream
                              fallback={<ProductDescriptionSkeleton />}
                              value={product.description}
                            >
                              {(description) =>
                                Boolean(description) && (
                                  // Accordion at every size (user can always open/close). Defaults
                                  // open on desktop, closed on mobile (keeps add-to-cart in the first
                                  // fold). "+"/"−" indicator after the heading.
                                  <AboutThisItem>{description}</AboutThisItem>
                                )
                              }
                            </Stream>
                          }
                          fields={fields}
                          fulfillmentMessage={fulfillmentMessage}
                          deliveryMessage={deliveryMessage}
                          optionDependencyMap={optionDependencyMap}
                          header={
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div className="relative min-w-0 pt-1">
                                  {product.badges && product.badges.length > 0 && (
                                    <div className="absolute bottom-full left-0 mb-1 flex flex-wrap gap-1.5">
                                      {product.badges.map((badge) => (
                                        <span
                                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground"
                                          key={badge.label}
                                          style={{ backgroundColor: badge.color }}
                                        >
                                          {badge.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <h1 className="mb-0 pb-0 font-[family-name:var(--product-detail-title-font-family,var(--font-family-heading))] text-lg font-semibold leading-tight @xl:text-2xl @4xl:text-[1.65rem]">
                                    {product.title}
                                  </h1>
                                  {/* Always rendered and height-reserved (min-h-[1lh]) even when
                                      the product/variant has no SKU, so the content below never
                                      shifts as a SKU appears (e.g. once a variant is chosen). */}
                                  <p className="mb-2 mt-1 min-h-[1lh] text-xs text-contrast-400">
                                    <Stream fallback={null} value={product.sku ?? null}>
                                      {(sku) => (sku != null && sku !== '' ? `SKU: ${sku}` : null)}
                                    </Stream>
                                  </p>
                                  {Boolean(product.subtitle) &&
                                    (product.subtitleHref ? (
                                      <Link
                                        className={clsx(
                                          'mt-1 inline-block font-[family-name:var(--product-detail-subtitle-font-family,var(--font-family-mono))] text-[10px] uppercase text-contrast-300',
                                          // Same animated red-underline hover as breadcrumbs / trust links.
                                          animatedUnderlineClassName,
                                        )}
                                        href={product.subtitleHref}
                                      >
                                        Shop {product.subtitle}
                                      </Link>
                                    ) : (
                                      <p className="mt-1 font-[family-name:var(--product-detail-subtitle-font-family,var(--font-family-mono))] text-[10px] uppercase text-contrast-300">
                                        {product.subtitle}
                                      </p>
                                    ))}
                                </div>
                                {additionalActions && (
                                  <div className="shrink-0">{additionalActions}</div>
                                )}
                              </div>
                              {product.reviewsEnabled && (
                                <div className="group/product-rating">
                                  <ReviewForm
                                    action={reviewFormAction}
                                    formEmailLabel={reviewFormEmailLabel}
                                    formModalTitle={reviewFormModalTitle}
                                    formNameLabel={reviewFormNameLabel}
                                    formRatingLabel={reviewFormRatingLabel}
                                    formReviewLabel={reviewFormReviewLabel}
                                    formSubmitLabel={reviewFormSubmitLabel}
                                    formTitleLabel={reviewFormTitleLabel}
                                    productId={Number(product.id)}
                                    recaptchaSiteKey={recaptchaSiteKey}
                                    streamableImages={product.images}
                                    streamableProduct={{ name: product.title }}
                                    streamableUser={user}
                                    trigger={
                                      <AnimatedUnderline className="cursor-pointer">
                                        Write a review
                                      </AnimatedUnderline>
                                    }
                                  />
                                </div>
                              )}
                              {product.showRating && (
                                // Rating number and "N reviews" toned to the same grey as the
                                // brand line; the shared Rating primitive keeps its own defaults
                                // everywhere else (product cards etc.).
                                <div className="group/product-rating flex items-center gap-2 [&_span.text-contrast-400]:!text-contrast-300 [&_span.text-contrast-500]:!text-contrast-300">
                                  <Stream
                                    fallback={<RatingSkeleton />}
                                    value={Streamable.all([
                                      product.rating,
                                      product.numberOfReviews,
                                    ])}
                                  >
                                    {([rating, numberOfReviews]) => (
                                      <RatingLink
                                        numberOfReviews={numberOfReviews ?? 0}
                                        rating={rating ?? 0}
                                        scrollTargetId="reviews"
                                      />
                                    )}
                                  </Stream>
                                  <span
                                    aria-hidden="true"
                                    className="h-4 w-px bg-contrast-200"
                                  />
                                  <ReviewForm
                                    action={reviewFormAction}
                                    formEmailLabel={reviewFormEmailLabel}
                                    formModalTitle={reviewFormModalTitle}
                                    formNameLabel={reviewFormNameLabel}
                                    formRatingLabel={reviewFormRatingLabel}
                                    formReviewLabel={reviewFormReviewLabel}
                                    formSubmitLabel={reviewFormSubmitLabel}
                                    formTitleLabel={reviewFormTitleLabel}
                                    productId={Number(product.id)}
                                    recaptchaSiteKey={recaptchaSiteKey}
                                    streamableImages={product.images}
                                    streamableProduct={{ name: product.title }}
                                    streamableUser={user}
                                    trigger={
                                      <AnimatedUnderline className="cursor-pointer text-xs !font-normal text-contrast-300">
                                        Write a Review
                                      </AnimatedUnderline>
                                    }
                                  />
                                </div>
                              )}
                              {/* <hr className="mb-3 mt-1 w-full border-t border-contrast-100" /> */}
                              <div className="group/product-price">
                                <Stream fallback={<PriceLabelSkeleton />} value={product.price}>
                                  {(price) => (
                                    <PriceLabel
                                      className="my-2 text-2xl @xl:text-3xl"
                                      price={price ?? ''}
                                      showSavings
                                    />
                                  )}
                                </Stream>
                              </div>
                              {/* "N+ bought in past month" social proof — plain grey text, above the
                                  divider below the price. Driven by the __bought_last_month custom
                                  field (threshold + bucketing via boughtBadgeLabel). */}
                              {boughtBadgeLabel(product.boughtLastMonth) != null && (
                                <p className="mb-3 mt-3 text-xs text-contrast-400">
                                  {/* "N+ bought" in black for emphasis; "in past month" stays grey. */}
                                  <span className="font-semibold text-foreground">
                                    {boughtBadgeLabel(product.boughtLastMonth)} bought
                                  </span>{' '}
                                  in past month
                                </p>
                              )}
                              {/* >1rem gap below the divider before the options/summary. */}
                              <hr className="mb-8 w-full border-t border-[hsl(var(--product-detail-divider))]" />
                              {/* Mobile gallery moved to the top of the grid (image-first layout);
                                  it no longer renders here between price and summary. */}
                              <div className="group/product-summary">
                                <Stream
                                  fallback={<ProductSummarySkeleton />}
                                  value={product.summary}
                                >
                                  {(summary) =>
                                    Boolean(summary) && (
                                      <p className="text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">
                                        {summary}
                                      </p>
                                    )
                                  }
                                </Stream>
                              </div>
                            </>
                          }
                          incrementLabel={incrementLabel}
                          maxQuantity={maxQuantity ?? undefined}
                          minQuantity={minQuantity ?? undefined}
                          prefetch={prefetch}
                          productId={product.id}
                          quantityLabel={quantityLabel}
                          stockDisplayData={stockDisplayData ?? undefined}
                        />
                      )}
                    </Stream>
                  </div>
                  <h2 className="sr-only">{additionalInformationTitle}</h2>
                  <div className="group/product-accordion">
                    <Stream fallback={<ProductAccordionsSkeleton />} value={product.accordions}>
                      {(accordions) =>
                        accordions != null &&
                        accordions.length > 0 && (
                          <Accordion
                            className="border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] pt-4 [&_button]:!py-1"
                            type="multiple"
                          >
                            {accordions.map((accordion, index) => (
                              <AccordionItem
                                key={index}
                                title={accordion.title}
                                value={index.toString()}
                              >
                                {accordion.content}
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )
                      }
                    </Stream>
                  </div>
                </div>
              </div>
            )
          }
        </Stream>
      </div>
    </section>
  );
}

function ProductGallerySkeleton() {
  return (
    <Skeleton.Root className="group-has-[[data-pending]]/product-gallery:animate-pulse" pending>
      <div className="w-full overflow-hidden rounded-xl @xl:rounded-2xl">
        <div className="flex">
          <Skeleton.Box className="aspect-[4/5] h-full w-full shrink-0 grow-0 basis-full" />
        </div>
      </div>
      <div className="mt-2 flex max-w-full gap-2 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton.Box className="h-12 w-12 shrink-0 rounded-lg @md:h-16 @md:w-16" key={idx} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

function PriceLabelSkeleton() {
  return <Skeleton.Box className="my-5 h-4 w-20 rounded-md" />;
}

function RatingSkeleton() {
  return (
    <Skeleton.Root
      className="flex w-[136px] items-center gap-1 group-has-[[data-pending]]/product-rating:animate-pulse"
      pending
    >
      <Skeleton.Box className="h-4 w-[100px] rounded-md" />
      <Skeleton.Box className="h-6 w-8 rounded-xl" />
    </Skeleton.Root>
  );
}

function ProductSummarySkeleton() {
  return (
    <Skeleton.Root
      className="flex w-full flex-col gap-3.5 pb-6 group-has-[[data-pending]]/product-summary:animate-pulse"
      pending
    >
      {Array.from({ length: 3 }).map((_, idx) => (
        <Skeleton.Box className="h-2.5 w-full" key={idx} />
      ))}
    </Skeleton.Root>
  );
}

function ProductDescriptionSkeleton() {
  return (
    <Skeleton.Root
      className="flex w-full flex-col gap-3.5 pb-6 group-has-[[data-pending]]/product-description:animate-pulse"
      pending
    >
      {Array.from({ length: 2 }).map((_, idx) => (
        <Skeleton.Box className="h-2.5 w-full" key={idx} />
      ))}
      <Skeleton.Box className="h-2.5 w-3/4" />
    </Skeleton.Root>
  );
}

function ProductDetailFormSkeleton() {
  return (
    <Skeleton.Root
      className="flex flex-col gap-8 py-8 group-has-[[data-pending]]/product-detail-form:animate-pulse"
      pending
    >
      <div className="flex flex-col gap-5">
        <Skeleton.Box className="h-2 w-10 rounded-md" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton.Box className="h-11 w-[72px] rounded-full" key={idx} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Skeleton.Box className="h-3 w-16 rounded-md" />
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton.Box className="h-10 w-10 rounded-full" key={idx} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton.Box className="h-12 w-[120px] rounded-lg" />
        <Skeleton.Box className="h-12 w-[216px] rounded-full" />
      </div>
    </Skeleton.Root>
  );
}

function ProductAccordionsSkeleton() {
  return (
    <Skeleton.Root
      className="flex h-[600px] w-full flex-col gap-8 pt-4 group-has-[[data-pending]]/product-accordion:animate-pulse"
      pending
    >
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-20 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-sm" />
      </div>
      <div className="mb-1 flex flex-col gap-4">
        <Skeleton.Box className="h-3 w-full rounded-sm" />
        <Skeleton.Box className="h-3 w-full rounded-sm" />
        <Skeleton.Box className="h-3 w-3/5 rounded-sm" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-24 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-20 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton.Box className="h-2 w-32 rounded-sm" />
        <Skeleton.Box className="h-3 w-3 rounded-full" />
      </div>
    </Skeleton.Root>
  );
}

export function ProductDetailSkeleton() {
  return (
    <Skeleton.Root
      className="grid grid-cols-1 items-stretch gap-x-6 gap-y-8 group-has-[[data-pending]]/product-detail:animate-pulse @2xl:grid-cols-2 @5xl:gap-x-12"
      pending
    >
      {/* Mobile: gallery-first (matches the live image-above-details order). */}
      <div className="mb-2 @2xl:hidden">
        <ProductGallerySkeleton />
      </div>
      <div className="hidden @2xl:block">
        <ProductGallerySkeleton />
      </div>
      <div>
        <Skeleton.Box className="mb-6 h-4 w-20 rounded-lg" />
        <Skeleton.Box className="mb-6 h-6 w-72 rounded-lg" />
        <RatingSkeleton />
        <PriceLabelSkeleton />
        <ProductSummarySkeleton />
        <ProductDetailFormSkeleton />
      </div>
    </Skeleton.Root>
  );
}
