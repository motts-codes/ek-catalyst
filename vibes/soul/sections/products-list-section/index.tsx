import { clsx } from 'clsx';
import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import {
  NumberedPagination,
  type NumberedPaginationInfo,
} from '@/vibes/soul/primitives/numbered-pagination';
import {
  type CardSavedItems,
  Product,
  type ProductCardAddToCartAction,
  type ProductCardWishlistAction,
} from '@/vibes/soul/primitives/product-card';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { ActiveTerm } from '@/vibes/soul/sections/products-list-section/active-term';
import { Filter, FiltersPanel } from '@/vibes/soul/sections/products-list-section/filters-panel';
import {
  FiltersAside,
  FiltersToggle,
  FiltersVisibilityProvider,
} from '@/vibes/soul/sections/products-list-section/filters-visibility';
import { ListSearch } from '@/vibes/soul/sections/products-list-section/list-search';
import {
  Sorting,
  SortingSkeleton,
  Option as SortOption,
} from '@/vibes/soul/sections/products-list-section/sorting';

interface Props {
  breadcrumbs?: Streamable<Breadcrumb[]>;
  title?: Streamable<string | null>;
  /** Hide the page heading (title + product count); the sort control moves to the left. */
  hideHeader?: boolean;
  /** The heading already names the search term (the search page), so don't repeat it inline. */
  hideActiveTerm?: boolean;
  /** 2 when the page already has its own h1 above the grid (smaller, section-sized heading). */
  headingLevel?: 1 | 2;
  totalCount: Streamable<string>;
  /** "90 products": shown at the left of the toolbar when the heading (and its count) is hidden. */
  countLabel?: Streamable<string>;
  products: Streamable<Product[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<Product[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  /** Numbered pages (?page=N). When given, replaces the cursor arrows. */
  pagination?: Streamable<NumberedPaginationInfo>;
  /** Grid density; "compact" keeps cards ~220px wide (cabinet collections). */
  density?: 'default' | 'compact';
  compareHref?: string;
  compareLabel?: Streamable<string>;
  showCompare?: Streamable<boolean>;
  filterLabel?: string;
  /** Placeholder for the search box that filters the whole listing by term. */
  searchPlaceholder?: string;
  showFiltersLabel?: string;
  hideFiltersLabel?: string;
  filtersPanelTitle?: Streamable<string>;
  resetFiltersLabel?: Streamable<string>;
  /** No sidebar, no filters toggle: for listings that carry their own filters above the grid. */
  hideFilters?: boolean;
  showRating?: boolean;
  rangeFilterApplyLabel?: Streamable<string>;
  sortLabel?: Streamable<string | null>;
  sortPlaceholder?: Streamable<string | null>;
  sortParamName?: string;
  sortDefaultValue?: string;
  compareParamName?: string;
  addToCartAction?: ProductCardAddToCartAction;
  /** In-page anchor for quote-only products' CTA (when the page renders the quote form). */
  quoteHref?: string;
  wishlistAction?: ProductCardWishlistAction;
  savedItems?: Streamable<CardSavedItems | null>;
  emptyStateSubtitle?: Streamable<string>;
  emptyStateTitle?: Streamable<string>;
  placeholderCount?: number;
  removeLabel?: Streamable<string>;
  maxItems?: number;
  maxCompareLimitMessage?: Streamable<string>;
}

export function ProductsListSection({
  breadcrumbs: streamableBreadcrumbs,
  title = 'Products',
  hideHeader = false,
  hideActiveTerm = false,
  headingLevel = 1,
  totalCount,
  countLabel,
  products,
  showRating,
  compareProducts,
  sortOptions: streamableSortOptions,
  sortDefaultValue,
  filters,
  compareHref,
  compareLabel,
  showCompare,
  paginationInfo,
  pagination,
  density = 'default',
  filterLabel = 'Filters',
  searchPlaceholder = 'Search products',
  showFiltersLabel = 'Show filters',
  hideFiltersLabel = 'Hide filters',
  filtersPanelTitle: streamableFiltersPanelTitle = 'Filters',
  resetFiltersLabel,
  hideFilters = false,
  rangeFilterApplyLabel,
  sortLabel: streamableSortLabel,
  sortPlaceholder: streamableSortPlaceholder,
  sortParamName,
  compareParamName,
  addToCartAction,
  quoteHref,
  wishlistAction,
  savedItems,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount = 8,
  removeLabel,
  maxItems,
  maxCompareLimitMessage,
}: Props) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <FiltersVisibilityProvider>
      <div className="group/products-list-section bg-[#f9fafd] @container">
        <div className="mx-auto max-w-screen-2xl px-6 pb-10 pt-[15px] @xl:px-9 @xl:pb-14 @4xl:px-14 @4xl:pb-12">
          <div>
            <Stream fallback={<BreadcrumbsSkeleton />} value={streamableBreadcrumbs}>
              {(breadcrumbs) =>
                breadcrumbs &&
                breadcrumbs.length > 1 && (
                  // Match the PDP breadcrumb treatment: 10px, light grey.
                  <Breadcrumbs
                    breadcrumbs={breadcrumbs}
                    className="[&_a]:!text-contrast-300 [&_ol]:!text-[10px] [&_span]:!text-contrast-300 [&_svg]:!text-contrast-300"
                  />
                )
              }
            </Stream>
            <div
              className={clsx(
                'flex flex-wrap items-center gap-4 text-foreground',
                // With the big heading hidden, the row holds only the compact sort control, so it
                // needs far less vertical padding above the grid.
                hideHeader ? 'justify-between pb-4 pt-2' : 'justify-between pb-8 pt-6',
              )}
            >
              {hideHeader && countLabel != null && (
                <Suspense
                  fallback={
                    <span className="inline-flex h-5 w-[9ch] animate-pulse rounded-lg bg-contrast-100" />
                  }
                >
                  <p
                    aria-live="polite"
                    className="flex items-center gap-1.5 text-sm font-bold text-foreground"
                  >
                    {countLabel}
                    {/* "18 products | fingerprint ×" when a term narrows the grid. */}
                    <ActiveTerm />
                  </p>
                </Suspense>
              )}
              {!hideHeader && (
                <Heading
                  className={clsx(
                    'flex items-center gap-2 font-heading',
                    headingLevel === 2
                      ? 'text-lg font-bold leading-tight @xl:text-xl'
                      : // Brand and search pages: a listing title, not a hero (48px read as too big
                        // next to the 2xl category heroes, per EK 26 Nov 2026).
                        'text-2xl font-medium leading-none @lg:text-3xl',
                  )}
                >
                  <Suspense
                    fallback={
                      <span className="inline-flex h-[1lh] w-[6ch] animate-pulse rounded-lg bg-contrast-100" />
                    }
                  >
                    {title}
                  </Suspense>
                  <Suspense
                    fallback={
                      <span className="inline-flex h-[1lh] w-[2ch] animate-pulse rounded-lg bg-contrast-100" />
                    }
                  >
                    <span className="text-contrast-400">{totalCount}</span>
                  </Suspense>
                  {!hideActiveTerm && <ActiveTerm />}
                </Heading>
              )}
              <div
                className={clsx(
                  'flex items-center gap-2',
                  // Search, sort and the filters toggle sit together at the right end of the row.
                  hideHeader && 'ml-auto justify-end',
                  hideHeader && countLabel == null && 'w-full',
                  // Narrow toolbars put the search on its own line (see ListSearch).
                  '[&>div:first-child]:min-w-0 [&>div:first-child]:flex-1 @md:[&>div:first-child]:flex-none',
                )}
              >
                <div className="flex flex-wrap items-center justify-end gap-2 @md:flex-nowrap">
                  <ListSearch placeholder={searchPlaceholder} />
                  {/* Sort + (phone) Filters stay together on one line when the search wraps. */}
                  <div className="flex items-center gap-2">
                    <Stream
                      fallback={<SortingSkeleton />}
                      value={Streamable.all([
                        streamableSortLabel,
                        streamableSortOptions,
                        streamableSortPlaceholder,
                      ])}
                    >
                      {([label, options, placeholder]) => (
                        <Sorting
                          defaultValue={sortDefaultValue}
                          label={label}
                          options={options}
                          paramName={sortParamName}
                          placeholder={placeholder}
                        />
                      )}
                    </Stream>
                    {!hideFilters && (
                      <div className="block @3xl:hidden">
                        <SidePanel.Root>
                          <SidePanel.Trigger asChild>
                            <Button
                              className="!h-8 text-xs [&>span]:!min-h-0"
                              size="x-small"
                              variant="secondary"
                            >
                              {filterLabel}
                              <Sliders size={15} />
                            </Button>
                          </SidePanel.Trigger>
                          <Stream value={streamableFiltersPanelTitle}>
                            {(filtersPanelTitle) => (
                              <SidePanel.Content title={filtersPanelTitle}>
                                <FiltersPanel
                                  filters={filters}
                                  paginationInfo={paginationInfo}
                                  rangeFilterApplyLabel={rangeFilterApplyLabel}
                                  resetFiltersLabel={resetFiltersLabel}
                                />
                              </SidePanel.Content>
                            )}
                          </Stream>
                        </SidePanel.Root>
                      </div>
                    )}
                    {/* Desktop: show / hide the sidebar, last in the group. */}
                    {!hideFilters && (
                      <div className="hidden @3xl:block">
                        <FiltersToggle hideLabel={hideFiltersLabel} showLabel={showFiltersLabel} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-stretch gap-8 @4xl:gap-10">
            {!hideFilters && (
              <FiltersAside>
                <Stream value={streamableFiltersPanelTitle}>
                  {(filtersPanelTitle) => <h2 className="sr-only">{filtersPanelTitle}</h2>}
                </Stream>
                <FiltersPanel
                  filters={filters}
                  paginationInfo={paginationInfo}
                  rangeFilterApplyLabel={rangeFilterApplyLabel}
                  resetFiltersLabel={resetFiltersLabel}
                />
              </FiltersAside>
            )}

            <div className="group-has-data-pending/products-list-section:animate-pulse min-w-0 flex-1">
              <ProductList
                addToCartAction={addToCartAction}
                compareHref={compareHref}
                compareLabel={compareLabel}
                compareParamName={compareParamName}
                compareProducts={compareProducts}
                density={density}
                emptyStateSubtitle={emptyStateSubtitle}
                emptyStateTitle={emptyStateTitle}
                maxCompareLimitMessage={maxCompareLimitMessage}
                maxItems={maxItems}
                placeholderCount={placeholderCount}
                products={products}
                quoteHref={quoteHref}
                removeLabel={removeLabel}
                savedItems={savedItems}
                showCompare={showCompare}
                showRating={showRating}
                wishlistAction={wishlistAction}
              />

              {pagination ? (
                <NumberedPagination info={pagination} />
              ) : (
                paginationInfo && <CursorPagination info={paginationInfo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </FiltersVisibilityProvider>
  );
}
