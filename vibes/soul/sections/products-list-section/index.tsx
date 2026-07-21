import { clsx } from 'clsx';
import { Sliders } from 'lucide-react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPagination, CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Product } from '@/vibes/soul/primitives/product-card';
import * as SidePanel from '@/vibes/soul/primitives/side-panel';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { ProductList } from '@/vibes/soul/sections/product-list';
import { Filter, FiltersPanel } from '@/vibes/soul/sections/products-list-section/filters-panel';
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
  totalCount: Streamable<string>;
  products: Streamable<Product[]>;
  filters: Streamable<Filter[]>;
  sortOptions: Streamable<SortOption[]>;
  compareProducts?: Streamable<Product[]>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  compareHref?: string;
  compareLabel?: Streamable<string>;
  showCompare?: Streamable<boolean>;
  filterLabel?: string;
  filtersPanelTitle?: Streamable<string>;
  resetFiltersLabel?: Streamable<string>;
  showRating?: boolean;
  rangeFilterApplyLabel?: Streamable<string>;
  sortLabel?: Streamable<string | null>;
  sortPlaceholder?: Streamable<string | null>;
  sortParamName?: string;
  sortDefaultValue?: string;
  compareParamName?: string;
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
  totalCount,
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
  filterLabel = 'Filters',
  filtersPanelTitle: streamableFiltersPanelTitle = 'Filters',
  resetFiltersLabel,
  rangeFilterApplyLabel,
  sortLabel: streamableSortLabel,
  sortPlaceholder: streamableSortPlaceholder,
  sortParamName,
  compareParamName,
  emptyStateSubtitle,
  emptyStateTitle,
  placeholderCount = 8,
  removeLabel,
  maxItems,
  maxCompareLimitMessage,
}: Props) {
  return (
    <div className="group/products-list-section @container">
      <div className="mx-auto max-w-screen-2xl px-4 pb-10 pt-[15px] @xl:px-6 @xl:pb-14 @4xl:px-8 @4xl:pb-12">
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
              hideHeader ? 'justify-start pb-4 pt-2' : 'justify-between pb-8 pt-6',
            )}
          >
            {!hideHeader && (
              <h1 className="flex items-center gap-2 font-heading text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl">
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
                  <span className="text-contrast-300">{totalCount}</span>
                </Suspense>
              </h1>
            )}
            <div className="flex gap-2">
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
              <div className="block @3xl:hidden">
                <SidePanel.Root>
                  <SidePanel.Trigger asChild>
                    <Button size="medium" variant="secondary">
                      {filterLabel}
                      <span className="hidden @xl:block">
                        <Sliders size={20} />
                      </span>
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
            </div>
          </div>
        </div>
        <div className="flex items-stretch gap-8 @4xl:gap-10">
          <aside className="hidden w-52 @3xl:block @4xl:w-60 @3xl:border-r @3xl:border-contrast-100 @3xl:pr-8 @4xl:pr-10">
            <Stream value={streamableFiltersPanelTitle}>
              {(filtersPanelTitle) => <h2 className="sr-only">{filtersPanelTitle}</h2>}
            </Stream>
            <FiltersPanel
              className="sticky top-4"
              filters={filters}
              paginationInfo={paginationInfo}
              rangeFilterApplyLabel={rangeFilterApplyLabel}
              resetFiltersLabel={resetFiltersLabel}
            />
          </aside>

          <div className="group-has-data-pending/products-list-section:animate-pulse flex-1">
            <ProductList
              compareHref={compareHref}
              compareLabel={compareLabel}
              compareParamName={compareParamName}
              compareProducts={compareProducts}
              emptyStateSubtitle={emptyStateSubtitle}
              emptyStateTitle={emptyStateTitle}
              maxCompareLimitMessage={maxCompareLimitMessage}
              maxItems={maxItems}
              placeholderCount={placeholderCount}
              products={products}
              removeLabel={removeLabel}
              showCompare={showCompare}
              showRating={showRating}
            />

            {paginationInfo && <CursorPagination info={paginationInfo} />}
          </div>
        </div>
      </div>
    </div>
  );
}
