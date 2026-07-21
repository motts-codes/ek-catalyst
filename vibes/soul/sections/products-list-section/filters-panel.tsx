/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

// The category/brand/search filter sidebar. Customizations (see docs/CATEGORY-PAGE.md):
//  - Sections are always open (no accordion) — FilterSection: bold title + options below.
//  - Multi-option facets render as vertical checkbox lists (not toggle chips).
//  - The subcategory link-group heading is the current category's own name, subcategories indented.
//  - Marketing-flag facets (__is_bestseller/__is_trending/__is_new) are hidden here — they surface
//    as pills on the card/PDP instead (see MARKETING_FLAG_LABELS / isMarketingFlagFacet).
//  - Compact price range inputs; 12px titles.

import { clsx } from 'clsx';
import { parseAsString, useQueryStates } from 'nuqs';
import { useOptimistic, useTransition } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { RangeInput } from '@/vibes/soul/form/range-input';
import { Stream, Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { Rating } from '@/vibes/soul/primitives/rating';
import { Link } from '~/components/link';

import { getFilterParsers } from './filter-parsers';

export interface LinkGroupFilter {
  type: 'link-group';
  label: string;
  links: Array<{ label: string; href: string }>;
}

export interface ToggleGroupFilter {
  type: 'toggle-group';
  paramName: string;
  label: string;
  options: Array<{ label: string; value: string; disabled?: boolean }>;
}

export interface RatingFilter {
  type: 'rating';
  paramName: string;
  label: string;
  disabled?: boolean;
}

export interface RangeFilter {
  type: 'range';
  label: string;
  minParamName: string;
  maxParamName: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  minPrepend?: React.ReactNode;
  maxPrepend?: React.ReactNode;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  disabled?: boolean;
}

export type Filter = ToggleGroupFilter | RangeFilter | RatingFilter | LinkGroupFilter;

interface Props {
  className?: string;
  filters: Streamable<Filter[]>;
  resetFiltersLabel?: Streamable<string>;
  paginationInfo?: Streamable<CursorPaginationInfo>;
  rangeFilterApplyLabel?: Streamable<string>;
}

type InnerProps = Props & { filters: Filter[] };

// An always-open filter section: a bold title with its options below (no accordion toggle).
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-body text-xs font-bold uppercase text-foreground">{title}</h3>
      {children}
    </div>
  );
}

// Marketing-flag facets (__is_bestseller / __is_trending / __is_new). These are internal
// merchandising flags surfaced via the PDP pills, so they're hidden from the filter sidebar.
// Keyed by the facet's display label (lower-cased).
const MARKETING_FLAG_LABELS: Record<string, true> = {
  bestseller: true,
  trending: true,
  new: true,
};

function getParamCountLabel(params: Record<string, string | null | string[]>, key: string) {
  const value = params[key];

  if (Array.isArray(value) && value.length > 0) return `(${value.length})`;

  return '';
}

export function FiltersPanel({
  className,
  filters: streamableFilters,
  resetFiltersLabel,
  rangeFilterApplyLabel,
}: Props) {
  return (
    <Stream fallback={<FiltersSkeleton />} value={streamableFilters}>
      {(filters) => (
        <FiltersPanelInner
          className={className}
          filters={filters}
          rangeFilterApplyLabel={rangeFilterApplyLabel}
          resetFiltersLabel={resetFiltersLabel}
        />
      )}
    </Stream>
  );
}

export function FiltersPanelInner({
  className,
  filters,
  resetFiltersLabel: streamableResetFiltersLabel,
  rangeFilterApplyLabel: streamableRangeFilterApplyLabel,
  paginationInfo: streamablePaginationInfo,
}: InnerProps) {
  const resetFiltersLabel = useStreamable(streamableResetFiltersLabel) ?? 'Reset filters';
  const rangeFilterApplyLabel = useStreamable(streamableRangeFilterApplyLabel);
  const paginationInfo = useStreamable(streamablePaginationInfo);
  const startCursorParamName = paginationInfo?.startCursorParamName ?? 'before';
  const endCursorParamName = paginationInfo?.endCursorParamName ?? 'after';
  const [params, setParams] = useQueryStates(
    {
      ...getFilterParsers(filters),
      [startCursorParamName]: parseAsString,
      [endCursorParamName]: parseAsString,
    },
    {
      shallow: false,
      history: 'push',
    },
  );
  const [isPending, startTransition] = useTransition();
  const [optimisticParams, setOptimisticParams] = useOptimistic(params);

  // Marketing-flag facets (Bestseller / Trending / New) are internal merchandising flags — hidden
  // from the filter sidebar entirely.
  const isMarketingFlagFacet = (filter: Filter) =>
    filter.type === 'toggle-group' && filter.label.trim().toLowerCase() in MARKETING_FLAG_LABELS;

  const accordionItems = filters
    .filter((filter) => filter.type !== 'link-group' && !isMarketingFlagFacet(filter))
    .map((filter) => ({ key: filter.label.toLowerCase(), filter }));

  if (filters.length === 0) return null;

  const linkGroupFilters = filters.filter(
    (filter): filter is LinkGroupFilter => filter.type === 'link-group',
  );

  return (
    <div className={clsx('space-y-3', className)} data-pending={isPending ? true : null}>
      {linkGroupFilters.map((linkGroup, index) => (
        <div key={index.toString()}>
          {/* Main category name as a bold heading (matches the filter section titles), with its
              subcategories listed indented beneath. */}
          <h3 className="mb-2 font-body text-xs font-bold uppercase text-foreground">
            {linkGroup.label}
          </h3>
          <ul className="space-y-1 pl-3">
            {linkGroup.links.map((link, linkIndex) => (
              <li key={linkIndex.toString()}>
                <Link
                  className="font-body text-xs font-medium text-contrast-500 transition-colors duration-300 ease-out hover:text-foreground"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {/* Filter sections are always open (no accordion toggle). Each has a bold title and its
          options listed below. */}
      <div className="space-y-5">
        {accordionItems.map((accordionItem) => {
          const { key, filter } = accordionItem;

          switch (filter.type) {
            case 'toggle-group':
              return (
                <FilterSection
                  key={key}
                  title={`${filter.label}${getParamCountLabel(optimisticParams, filter.paramName)}`}
                >
                  <div className="space-y-2">
                    {filter.options.map((option) => {
                      const selectedValues = optimisticParams[filter.paramName] ?? [];
                      const checked = selectedValues.includes(option.value);

                      return (
                        <Checkbox
                          checked={checked}
                          className="text-xs [&_label]:!text-xs [&_label]:!font-normal"
                          disabled={option.disabled}
                          key={option.value}
                          label={option.label}
                          onCheckedChange={(isChecked) =>
                            startTransition(async () => {
                              const next = new Set(selectedValues);

                              if (isChecked === true) next.add(option.value);
                              else next.delete(option.value);

                              const values = Array.from(next);
                              const nextParams = {
                                ...optimisticParams,
                                [startCursorParamName]: null,
                                [endCursorParamName]: null,
                                [filter.paramName]: values.length === 0 ? null : values,
                              };

                              setOptimisticParams(nextParams);
                              await setParams(nextParams);
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </FilterSection>
              );

            case 'range':
              return (
                <FilterSection key={key} title={filter.label}>
                  {/* Compact price range: Min/Max + apply circle in one row, with narrower inputs
                      (12px, tighter padding) and a smaller apply circle than the defaults. The
                      input wrappers are flex-1 by default; cap them so the fields stay compact. */}
                  <div className="[&>div>div]:!max-w-20 [&_button>span]:!size-7 [&_button>span]:!min-h-0 [&_button>span]:!min-w-0 [&_input]:!px-2 [&_input]:!py-1.5 [&_input]:!text-xs [&_svg]:!size-3.5">
                    <RangeInput
                    applyLabel={rangeFilterApplyLabel}
                    disabled={filter.disabled}
                    max={filter.max}
                    maxLabel={filter.maxLabel}
                    maxName={filter.maxParamName}
                    maxPlaceholder={filter.maxPlaceholder}
                    maxPrepend={filter.maxPrepend}
                    min={filter.min}
                    minLabel={filter.minLabel}
                    minName={filter.minParamName}
                    minPlaceholder={filter.minPlaceholder}
                    minPrepend={filter.minPrepend}
                    onChange={({ min, max }) => {
                      startTransition(async () => {
                        const nextParams = {
                          ...optimisticParams,
                          [filter.minParamName]: min,
                          [filter.maxParamName]: max,
                          [startCursorParamName]: null,
                          [endCursorParamName]: null,
                        };

                        setOptimisticParams(nextParams);
                        await setParams(nextParams);
                      });
                    }}
                    value={{
                      min: optimisticParams[filter.minParamName] ?? null,
                      max: optimisticParams[filter.maxParamName] ?? null,
                    }}
                    />
                  </div>
                </FilterSection>
              );

            case 'rating':
              return (
                <FilterSection key={key} title={filter.label}>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Checkbox
                        checked={
                          optimisticParams[filter.paramName]?.includes(rating.toString()) ?? false
                        }
                        disabled={filter.disabled}
                        key={rating}
                        label={<Rating rating={rating} showRating={false} />}
                        onCheckedChange={(checked) =>
                          startTransition(async () => {
                            const ratings = new Set(optimisticParams[filter.paramName]);

                            if (checked === true) ratings.add(rating.toString());
                            else ratings.delete(rating.toString());

                            const nextParams = {
                              ...optimisticParams,
                              [filter.paramName]: Array.from(ratings),
                              [startCursorParamName]: null,
                              [endCursorParamName]: null,
                            };

                            setOptimisticParams(nextParams);
                            await setParams(nextParams);
                          })
                        }
                      />
                    ))}
                  </div>
                </FilterSection>
              );

            default:
              return null;
          }
        })}
      </div>

      <Button
        className="!mt-6"
        onClick={() => {
          startTransition(async () => {
            const nextParams = {
              ...Object.fromEntries(Object.entries(optimisticParams).map(([key]) => [key, null])),
              [startCursorParamName]: optimisticParams[startCursorParamName],
              [endCursorParamName]: optimisticParams[endCursorParamName],
            };

            setOptimisticParams(nextParams);
            await setParams(nextParams);
          });
        }}
        size="x-small"
        variant="secondary"
      >
        {resetFiltersLabel}
      </Button>
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="space-y-5">
      <AccordionSkeleton>
        <ToggleGroupSkeleton options={4} seed={2} />
      </AccordionSkeleton>
      <AccordionSkeleton>
        <ToggleGroupSkeleton options={3} seed={1} />
      </AccordionSkeleton>
      <AccordionSkeleton>
        <RangeSkeleton />
      </AccordionSkeleton>
      {/* Reset Filters Button */}
      <div className="h-10 w-[10ch] animate-pulse rounded-full bg-contrast-100" />
    </div>
  );
}

function AccordionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="items-start py-3 font-mono text-sm uppercase last:flex @md:py-4">
        <div className="inline-flex h-[1lh] items-center">
          <div className="h-2 w-[10ch] flex-1 animate-pulse rounded-sm bg-contrast-100" />
        </div>
      </div>
      <div className="pb-5">{children}</div>
    </div>
  );
}

function ToggleGroupSkeleton({ options, seed = 0 }: { options: number; seed?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: options }, (_, i) => {
        const width = Math.floor(((i * 3 + 7 + seed) % 8) + 6);

        return (
          <div
            className="h-12 w-[var(--width)] animate-pulse rounded-full bg-contrast-100 px-4"
            key={i}
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            style={{ '--width': `${width}ch` } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

function RangeSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-12 w-[10ch] animate-pulse rounded-lg bg-contrast-100" />
      <div className="h-12 w-[10ch] animate-pulse rounded-lg bg-contrast-100" />
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-contrast-100" />
    </div>
  );
}
