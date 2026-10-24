import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createLoader, SearchParams } from 'nuqs/server';
import { cache } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { createCompareLoader } from '@/vibes/soul/primitives/compare-drawer/loader';
import { CabinetAssembly } from '@/vibes/soul/sections/cabinet-assembly';
import { CabinetCollectionHeader } from '@/vibes/soul/sections/cabinet-collection-header';
import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CabinetSizeFilter, type SizeDimension } from '@/vibes/soul/sections/cabinet-size-filter';
import { CabinetSpecs } from '@/vibes/soul/sections/cabinet-specs';
import {
  CABINET_TYPES,
  CabinetTypeFilter,
  type CabinetTypeValue,
} from '@/vibes/soul/sections/cabinet-type-filter';
import { CountertopQuote } from '@/vibes/soul/sections/countertop-quote';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { SeoContentSection } from '@/vibes/soul/sections/seo-content';
import { getSessionCustomerAccessToken } from '~/auth';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import {
  cabinetFinishContext,
  cabinetProgramContext,
  cabinetProgramSearchParam,
  getCabinetAssemblyVideos,
  getCabinetCollectionContent,
  getCabinetCollectionFaq,
  getCabinetCollectionHeader,
  getCabinetOffers,
  getRecommendedTypeOrder,
  isCabinetCollection,
} from '~/lib/cabinets/cabinet-collection';
import {
  type CabinetGridFilters,
  cabinetSizeOptions,
  DEFAULT_TYPE_ORDER,
  fetchCabinetProductsFiltered,
  hasGridFilters,
  hasProductTypeFacet,
  isFallbackCursor,
  RECOMMENDED_SORT,
} from '~/lib/cabinets/type-filter-fallback';
import { pickFaq } from '~/lib/category/category-faq';
import { parseSeoContent } from '~/lib/category/category-seo';
import {
  COUNTERTOP_QUOTE_FIELDS,
  COUNTERTOP_QUOTE_IMAGE,
  QUOTE_ANCHOR,
} from '~/lib/countertops/quote-form';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { submitQuoteLead } from '~/lib/forms/submit-lead';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { EditableSection } from '~/lib/makeswift/components/editable-section';
import { CATEGORY_HEADER_TYPE } from '~/lib/makeswift/components/section-types';
import { Slot } from '~/lib/makeswift/slot';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts } from '../../fetch-compare-products';
import { fetchFacetedSearch } from '../../fetch-faceted-search';
import {
  DEFAULT_PAGE_SIZE,
  numberedPaginationInfo,
  PAGE_PARAM,
  pageNumber,
  resolvePageCursor,
} from '../../paged-search';
import { productCardAddToCartAction } from '../../product-card-add-to-cart';

import {
  CategoryBreadcrumbs,
  CollectionConsult,
  getCategoryHeaderDefaults,
} from './_components/category-header';
import { CategoryViewed } from './_components/category-viewed';
import { getCategoryPageData } from './page-data';

const getCachedCategory = cache((categoryId: number) => {
  return {
    category: categoryId,
  };
});

const compareLoader = createCompareLoader();

type Program = 'assembled' | 'rta';

const PROGRAM_WORD = { assembled: 'assembled', rta: 'RTA' };

// On a collection page the grid heading names the program being shown ("Avon assembled cabinets").
function getGridTitle(name: string, isCabinet: boolean, program: Program | null) {
  if (!isCabinet) return name;

  return program ? `${name} ${PROGRAM_WORD[program]} cabinets` : `${name} cabinets`;
}

// The same collection in the other program ("Switch to RTA").
function getSwitchHref(path: string, program: Program) {
  return `${path}?program=${program === 'rta' ? 'assembled' : 'rta'}`;
}

// "Filter by type" on collection pages uses the products' "Product Type" custom field, which is a
// search facet (attr_Product Type) — the same mechanism as the Program facet, so it filters before
// pagination. See docs/CABINET-FACETS.md.
const CABINET_TYPE_PARAM = 'attr_Product Type';

// A search param as a list: absent → [], one value → [value], repeated → all of them.
function listParam(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;

  return value == null ? [] : [value];
}

function selectedCabinetTypes(value: string | string[] | undefined): CabinetTypeValue[] {
  const raw = listParam(value);

  return CABINET_TYPES.filter((type) => raw.includes(type.value)).map((type) => type.value);
}

// The facet filter for the selected types ({} when none), applied like the Program facet.
function cabinetTypeSearchParam(values: string[]): Record<string, string[]> {
  return values.length > 0 ? { [CABINET_TYPE_PARAM]: values } : {};
}

// Width / height / depth on collection pages: ?width=12&height=34.5&depth=24 (the products' numeric
// "Width" / "Height" custom fields), narrowed in code with the types (type-filter-fallback).
const SIZE_PARAM: Record<SizeDimension, string> = {
  width: 'width',
  height: 'height',
  depth: 'depth',
};

// The grid filters a collection page carries in its URL; other categories carry none.
function cabinetGridFilters(
  isCollection: boolean,
  searchParams: Record<string, string | string[] | undefined>,
): CabinetGridFilters {
  if (!isCollection) return { types: [], widths: [], heights: [], depths: [] };

  return {
    types: selectedCabinetTypes(searchParams[CABINET_TYPE_PARAM]),
    widths: listParam(searchParams[SIZE_PARAM.width]),
    heights: listParam(searchParams[SIZE_PARAM.height]),
    depths: listParam(searchParams[SIZE_PARAM.depth]),
  };
}

const GRID_FILTER_PARAMS = [
  CABINET_TYPE_PARAM,
  SIZE_PARAM.width,
  SIZE_PARAM.height,
  SIZE_PARAM.depth,
];

// The collection URL with one grid-filter value toggled (or, with no key, every grid filter
// cleared), keeping program and finish and starting from page one.
function toggleFilterHref(
  path: string,
  searchParams: Record<string, string | string[] | undefined>,
  key: string | null,
  value?: string,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([k, raw]) => {
    const dropped = key == null ? GRID_FILTER_PARAMS.includes(k) : k === key;

    if (dropped || k === 'page' || k === 'after' || k === 'before' || raw == null) return;

    listParam(raw).forEach((item) => params.append(k, item));
  });

  if (key != null && value != null) {
    const current = listParam(searchParams[key]);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

    next.forEach((item) => params.append(key, item));
  }

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

// Multi-finish collections (Prism): ?finish=<slug> selects a finish. Header pricing/photos follow it
// and the grid narrows through the products' "Finish" custom field (a search facet, like Program).
const FINISH_PARAM = 'finish';

// The build features as structured data (schema.org ProductGroup additionalProperty), so search
// and AI see "Box material: Plywood" etc. without the copy sounding technical. Nothing without
// properties.
function CollectionSchema({
  name,
  path,
  content,
}: {
  name: string;
  path: string;
  content: { schemaProperties: Array<{ name: string; value: string }> } | null | undefined;
}) {
  const properties = content?.schemaProperties ?? [];

  if (properties.length === 0) return null;

  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name: `${name} cabinets`,
    url: path,
    additionalProperty: properties.map((property) => ({
      '@type': 'PropertyValue',
      name: property.name,
      value: property.value,
    })),
  });

  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}

// Collection pages get a "Recommended" entry at the top of the sort menu, and open on it.
const defaultSort = (isCollection: boolean) => (isCollection ? RECOMMENDED_SORT : 'featured');
const recommendedSortOption = (isCollection: boolean) =>
  isCollection ? [{ value: RECOMMENDED_SORT, label: 'Recommended' }] : [];

// Collection pages open in the "Recommended" cabinet order unless a sort is chosen.
function recommendedOrderFor(
  isCollection: boolean,
  sort: string | string[] | undefined,
): typeof RECOMMENDED_SORT | undefined {
  return isCollection && (sort == null || sort === RECOMMENDED_SORT) ? RECOMMENDED_SORT : undefined;
}

// "recommended" is not a BigCommerce sort: when it is in force the sort param stays out of the
// search (which sorts its own way; the in-code pass reorders the result).
function withoutRecommendedSort(
  searchParams: Record<string, string | string[] | undefined>,
  order: typeof RECOMMENDED_SORT | undefined,
): Record<string, string | string[] | undefined> {
  if (order == null) return searchParams;

  const { sort, ...rest } = searchParams;

  return rest;
}

// The client's type order from 863, else the built-in one.
async function recommendedTypeOrder(): Promise<string[]> {
  const custom = await getRecommendedTypeOrder();

  return custom.length > 0 ? custom : DEFAULT_TYPE_ORDER;
}

// Every listing uses the compact grid (4 columns beside the filter sidebar, 5 with it hidden) and
// pages 20 at a time, which fills both. Kept as a function so a category can diverge later.
function listingLayout(): { pageSize: number; density: 'compact' } {
  return { pageSize: DEFAULT_PAGE_SIZE, density: 'compact' };
}

// The collection URL with the finish set (or cleared), keeping program and type, dropping the page.
function getFinishHref(
  path: string,
  searchParams: Record<string, string | string[] | undefined>,
  slug: string | null,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, raw]) => {
    if (
      key === FINISH_PARAM ||
      key === 'page' ||
      key === 'after' ||
      key === 'before' ||
      raw == null
    )
      return;

    (Array.isArray(raw) ? raw : [raw]).forEach((item) => params.append(key, item));
  });

  if (slug) params.set(FINISH_PARAM, slug);

  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

const createCategorySearchParamsLoader = cache(
  async (categoryId: number, customerAccessToken?: string) => {
    const cachedCategory = getCachedCategory(categoryId);
    const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);
    const categoryFacets = categorySearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const transformedCategoryFacets = await facetsTransformer({
      refinedFacets: categoryFacets,
      allFacets: categoryFacets,
      searchParams: {},
    });
    const categoryFilters = transformedCategoryFacets.filter((facet) => facet != null);
    const filterParsers = getFilterParsers(categoryFilters);

    // If there are no filters, return `null`, since calling `createLoader` with an empty
    // object will throw the following cryptic error:
    //
    // ```
    // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
    //   See https://err.47ng.com/NUQS-500
    // ```
    if (Object.keys(filterParsers).length === 0) {
      return null;
    }

    return createLoader(filterParsers);
  },
);

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const categoryId = Number(slug);

  const { category } = await getCategoryPageData(categoryId, customerAccessToken);

  if (!category) {
    return notFound();
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: category.path, locale });

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs);
  const categoryPath = breadcrumbs[breadcrumbs.length - 1]?.path;

  return {
    title: makeswiftMetadata?.title || pageTitle || category.name,
    ...((makeswiftMetadata?.description || metaDescription) && {
      description: makeswiftMetadata?.description || metaDescription,
    }),
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(categoryPath && {
      alternates: await getMetadataAlternates({ path: categoryPath, locale }),
    }),
  };
}

// Cabinet collections add the program as a crumb between Cabinets and the collection
// (Home / Cabinets / Assembled / Avon…) so "back" goes to the listing the visitor came from, not
// the Cabinets information page. The program is the one the page is showing.
function programCrumbs(program: Program | undefined) {
  if (program == null) return [];

  return [
    { label: program === 'rta' ? 'RTA' : 'Assembled', href: `/cabinets/${program}-cabinets` },
  ];
}

// Countertops are quoted, not carted: their cards link to a quote form rendered under the grid.
const isCountertopPath = (path: string) => path.startsWith('/countertops');

const quoteHrefFor = (path: string) => (isCountertopPath(path) ? `#${QUOTE_ANCHOR}` : undefined);

function CountertopQuoteBand({ path }: { path: string }) {
  if (!isCountertopPath(path)) return null;

  return (
    <CountertopQuote
      action={submitQuoteLead}
      fields={COUNTERTOP_QUOTE_FIELDS}
      id={QUOTE_ANCHOR}
      image={COUNTERTOP_QUOTE_IMAGE}
    />
  );
}

export default async function Category(props: Props) {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  setRequestLocale(locale);

  const t = await getTranslations('Faceted');

  const categoryId = Number(slug);

  const { category, settings, categoryTree } = await getCategoryPageData(
    categoryId,
    customerAccessToken,
  );

  // Cabinet collection pages (Avon, Dover). Two program notions:
  //  - cabinetProgram: always concrete (defaults to Assembled) — drives the header/pricing/FAQ,
  //    which must show something.
  //  - selectedProgram: the EXPLICIT ?program= selection, or null when absent — drives the GRID
  //    filter, so a bare /cabinets/avon (no ?program) shows ALL products (both programs).
  const isCabinet = await isCabinetCollection(categoryId);
  const programParam = (await props.searchParams).program;
  // A collection sold in one program only (Prism, Euro Value, Rochelle…) ignores a request for the
  // other: header, pricing, FAQ and grid all fall back to the program it actually has.
  const {
    program: cabinetProgram,
    selected: selectedProgram,
    switchable: programSwitchable,
  } = await cabinetProgramContext(isCabinet, categoryId, programParam);
  const { pageSize, density } = listingLayout();
  const searchParamsForLinks = await props.searchParams;
  const gridFiltersBase = cabinetGridFilters(isCabinet, searchParamsForLinks);
  // ?finish= → the finish name (null when absent/unknown) and the grid filter for it.
  // The finish narrows in code (lib/cabinets/type-filter-fallback), not through the search: the
  // products' "Finish" custom field is not an indexed facet, and a filter on it returns nothing.
  const { name: selectedFinish } = await cabinetFinishContext(
    isCabinet,
    categoryId,
    searchParamsForLinks[FINISH_PARAM],
  );
  const gridFilters = { ...gridFiltersBase, finish: selectedFinish };

  if (!category) {
    return notFound();
  }

  // Home / <category trail>, matching the PDP. Prepending Home means top-level categories
  // (whose own trail is a single crumb) still render a breadcrumb. Consecutive duplicate labels
  // are collapsed — the category data can repeat the current category (e.g. "Windows / Windows").
  const categoryCrumbs = removeEdgesAndNodes(category.breadcrumbs)
    .map(({ name, path }) => ({ label: name, href: path ?? '#' }))
    .filter((crumb, index, all) => index === 0 || crumb.label !== all[index - 1]?.label);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...categoryCrumbs.slice(0, -1),
    ...programCrumbs(cabinetProgram),
    ...categoryCrumbs.slice(-1),
  ];

  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);

  const productComparisonsEnabled =
    settings?.storefront.catalog?.productComparisonsEnabled ?? false;

  const taxDisplay = settings?.tax?.plp;

  const streamableFacetedSearch = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const currencyCode = await getPreferredCurrencyCode();

    const loadSearchParams = await createCategorySearchParamsLoader(
      categoryId,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};

    // Scope the grid to the program via the Program facet (attr_Program=Assembled/RTA) ONLY when a
    // program is explicitly selected via ?program=. A bare /cabinets/avon (selectedProgram null)
    // shows all products. See docs/CABINET-FACETS.md.
    const programFilter = selectedProgram ? cabinetProgramSearchParam(selectedProgram) : {};
    const typeFilter = cabinetTypeSearchParam(gridFilters.types);

    // The in-code type fallback (below) pages with plain page-number cursors ("p2"), which
    // BigCommerce would reject; real cursors are opaque encoded strings. Keep those away from it.
    const fallbackCursors =
      isFallbackCursor(searchParams.after) || isFallbackCursor(searchParams.before);
    // Collection pages default to the "recommended" cabinet order, applied in code (it is not a
    // BigCommerce sort), so that value never reaches the search.
    const order = recommendedOrderFor(isCabinet, searchParams.sort);
    const searchParamsForSearch = withoutRecommendedSort(searchParams, order);
    const baseParams = {
      ...searchParamsForSearch,
      ...parsedSearchParams,
      ...programFilter,
      ...typeFilter,
      category: categoryId,
      limit: pageSize,
    };
    // ?page=N is resolved to a BigCommerce cursor (paged-search.ts). Legacy ?after/?before links
    // still work when no page is given.
    const page = pageNumber(searchParams[PAGE_PARAM]);
    const { after: pageCursor } = await resolvePageCursor(baseParams, page, {
      currencyCode,
      customerAccessToken,
    });
    const search = await fetchFacetedSearch(
      {
        ...baseParams,
        ...(page > 1 || fallbackCursors ? { after: pageCursor, before: undefined } : {}),
      },
      currencyCode,
      customerAccessToken,
    );

    // Until BigCommerce indexes the Product Type facet, the attribute filter above is ignored and
    // the grid would show every type. Narrow in code instead (see lib/cabinets/type-filter-fallback).
    if ((order != null || hasGridFilters(gridFilters)) && !hasProductTypeFacet(search)) {
      return fetchCabinetProductsFiltered({
        searchParams: {
          ...searchParamsForSearch,
          ...parsedSearchParams,
          ...programFilter,
          category: categoryId,
        },
        filters: gridFilters,
        order,
        typeOrder: await recommendedTypeOrder(),
        search,
        currencyCode,
        customerAccessToken,
        pageSize,
      });
    }

    return search;
  });

  // Width / height chips (collection pages): distinct values over the collection's products in
  // this program / finish, counted against the other active filters.
  const streamableSizeOptions = Streamable.from(async () => {
    if (!isCabinet) return null;

    const currencyCode = await getPreferredCurrencyCode();
    const programFilter = selectedProgram ? cabinetProgramSearchParam(selectedProgram) : {};

    return cabinetSizeOptions({
      searchParams: { ...programFilter, category: categoryId },
      filters: gridFilters,
      currencyCode,
      customerAccessToken,
    });
  });

  const streamableProducts = Streamable.from(async () => {
    const format = await getFormatter();

    const search = await streamableFacetedSearch;
    const products = search.products.items;

    // Program (Assembled/RTA) filtering is applied via the Program facet, injected into the faceted
    // search above (attr_Program). This filters BEFORE pagination — the correct, complete result —
    // once the "Program" facet is configured in BigCommerce (custom field on products + Faceted
    // Search filter enabled). Until then it's inert and the grid shows all products. Name-based
    // filtering was deliberately removed because it can't paginate correctly. See docs/CABINET-FACETS.md.

    const { defaultOutOfStockMessage, showOutOfStockMessage, showBackorderMessage } =
      settings?.inventory ?? {};

    return productCardTransformer(
      products,
      format,
      showOutOfStockMessage ? defaultOutOfStockMessage : undefined,
      showBackorderMessage,
      taxDisplay,
    );
  });

  const streamableTotalCount = Streamable.from(async () => {
    const format = await getFormatter();
    const search = await streamableFacetedSearch;

    return format.number(search.products.collectionInfo?.totalItems ?? 0);
  });

  const streamablePagination = Streamable.from(async () => {
    const searchParams = await props.searchParams;
    const search = await streamableFacetedSearch;

    return numberedPaginationInfo(
      search.products.collectionInfo?.totalItems ?? 0,
      pageNumber(searchParams[PAGE_PARAM]),
      pageSize,
    );
  });

  const streamableFilters = Streamable.from(async () => {
    const searchParams = await props.searchParams;

    const loadSearchParams = await createCategorySearchParamsLoader(
      categoryId,
      customerAccessToken,
    );
    const parsedSearchParams = loadSearchParams?.(searchParams) ?? {};
    const cachedCategory = getCachedCategory(categoryId);
    const categorySearch = await fetchFacetedSearch(cachedCategory, undefined, customerAccessToken);
    const refinedSearch = await streamableFacetedSearch;

    const allFacets = categorySearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const refinedFacets = refinedSearch.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );

    // NOTE: Subcategory product counts are intentionally NOT shown. BigCommerce does not return a
    // CategorySearchFilter facet when inside this category, and per-subcategory count queries return
    // 0 because the products aren't associated with the subcategories in the search index. Showing
    // "(0)" everywhere would be worse than no count. Revisit once subcategory associations are
    // indexed (then source counts from the category facet by entityId, like brand/attribute facets).

    const transformedFacets = await facetsTransformer({
      refinedFacets,
      allFacets,
      searchParams: { ...searchParams, ...parsedSearchParams },
    });

    const filters = transformedFacets.filter((facet) => facet != null);

    const tree = categoryTree[0];
    const subCategoriesFilters =
      tree == null || tree.children.length === 0
        ? []
        : [
            {
              type: 'link-group' as const,
              // Use the current category's own name as the heading (e.g. "Appliances") with its
              // subcategories listed (indented) beneath, instead of a generic "Categories" label.
              label: tree.name,
              links: tree.children.map((child) => ({
                label: child.name,
                href: child.path,
              })),
            },
          ];

    return [...subCategoriesFilters, ...filters];
  });

  const streamableCompareProducts = Streamable.from(async () => {
    const searchParams = await props.searchParams;

    if (!productComparisonsEnabled) {
      return [];
    }

    const { compare } = compareLoader(searchParams);

    const compareIds = { entityIds: compare ? compare.map((id: string) => Number(id)) : [] };

    const products = await getCompareProducts(compareIds, customerAccessToken);

    return products.map((product) => ({
      id: product.entityId.toString(),
      title: product.name,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      href: product.path,
    }));
  });

  // Cabinet collections (Avon, Dover) show a metafield-driven collection header above the grid,
  // scoped to the same program (Assembled / RTA) the visitor arrived with.
  const cabinetHeader =
    isCabinet && cabinetProgram
      ? await getCabinetCollectionHeader(categoryId, cabinetProgram, selectedFinish)
      : null;

  const cabinetOffers = await getCabinetOffers(categoryId, cabinetProgram);

  // Per-collection FAQ (Avon's Assembled FAQ, etc.), shown below the grid. Program-aware; null when
  // this collection has no FAQ authored for the current program.
  const cabinetFaq =
    isCabinet && cabinetProgram ? await getCabinetCollectionFaq(categoryId, cabinetProgram) : null;

  // Every other category: the generic FAQ authored as the `faq.list` metafield (seeded by
  // scripts/seed-categories-and-faqs.py). Same accordion as the cabinet pages.
  const faq = pickFaq(cabinetFaq, category.faq.edges);
  const seoContent = parseSeoContent(category.seoContent.edges);

  // Assembly-instruction videos + specifications are PER-PROGRAM — scoped to the current program
  // (defaults to Assembled via cabinetProgram, matching the header/pricing).
  const cabinetAssembly =
    isCabinet && cabinetProgram ? await getCabinetAssemblyVideos(categoryId, cabinetProgram) : [];
  const cabinetContent =
    isCabinet && cabinetProgram
      ? await getCabinetCollectionContent(categoryId, cabinetProgram)
      : null;

  return (
    <>
      <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />
      {!isCabinet && (
        <EditableSection
          defaults={{
            categoryHeader: getCategoryHeaderDefaults({
              category,
              subcategories: categoryTree[0]?.children,
              seoIntro: seoContent?.blocks.find((block) => block.type === 'p')?.text,
            }),
          }}
          label={`${category.name} header`}
          snapshotId={`category-${categoryId}-header`}
          type={CATEGORY_HEADER_TYPE}
        />
      )}
      <Slot
        label={`${category.name} top content`}
        snapshotId={`category-${categoryId}-top-content`}
      />
      {cabinetHeader != null && cabinetProgram != null && (
        <>
          <CabinetCollectionHeader
            data={cabinetHeader}
            finishHrefFor={(finishSlug) =>
              getFinishHref(category.path, searchParamsForLinks, finishSlug)
            }
            howBuilt={cabinetContent?.howBuilt}
            offers={cabinetOffers}
            program={cabinetProgram}
            specRows={cabinetContent?.specRows}
            specifications={cabinetContent?.specifications}
            switchHref={
              programSwitchable ? getSwitchHref(category.path, cabinetProgram) : undefined
            }
          />
          <CollectionSchema content={cabinetContent} name={category.name} path={category.path} />
          <CabinetTypeFilter
            className="pb-5"
            hrefFor={(value) =>
              toggleFilterHref(category.path, searchParamsForLinks, CABINET_TYPE_PARAM, value)
            }
            selected={gridFilters.types}
          />
          <CabinetSizeFilter
            className="pb-8 @4xl:pb-10"
            hrefFor={(dimension, value) =>
              toggleFilterHref(category.path, searchParamsForLinks, SIZE_PARAM[dimension], value)
            }
            options={streamableSizeOptions}
            resetHref={
              hasGridFilters(gridFilters)
                ? toggleFilterHref(category.path, searchParamsForLinks, null)
                : undefined
            }
            selected={gridFilters}
          />
        </>
      )}
      <div className="scroll-mt-24" id="products">
        <ProductsListSection
          // The breadcrumb and the category header sit above; only collection pages keep a grid
          // heading ("Avon assembled cabinets" + count). Elsewhere the sort control moves left.
          addToCartAction={productCardAddToCartAction}
          compareLabel={t('Compare.compare')}
          compareProducts={streamableCompareProducts}
          density={density}
          emptyStateSubtitle={t('Category.Empty.subtitle')}
          emptyStateTitle={t('Category.Empty.title')}
          filterLabel={t('FacetedSearch.filters')}
          filters={streamableFilters}
          filtersPanelTitle={t('FacetedSearch.filters')}
          headingLevel={2}
          hideFilters={isCabinet}
          hideHeader={!isCabinet}
          maxCompareLimitMessage={t('Compare.maxCompareLimit')}
          maxItems={MAX_COMPARE_LIMIT}
          pagination={streamablePagination}
          products={streamableProducts}
          quoteHref={quoteHrefFor(category.path)}
          rangeFilterApplyLabel={t('FacetedSearch.Range.apply')}
          removeLabel={t('Compare.remove')}
          resetFiltersLabel={t('FacetedSearch.resetFilters')}
          showCompare={productComparisonsEnabled}
          showRating={showRating}
          sortDefaultValue={defaultSort(isCabinet)}
          sortLabel={t('SortBy.sortBy')}
          sortOptions={[
            ...recommendedSortOption(isCabinet),
            { value: 'featured', label: t('SortBy.featuredItems') },
            { value: 'newest', label: t('SortBy.newestItems') },
            { value: 'best_selling', label: t('SortBy.bestSellingItems') },
            { value: 'a_to_z', label: t('SortBy.aToZ') },
            { value: 'z_to_a', label: t('SortBy.zToA') },
            { value: 'best_reviewed', label: t('SortBy.byReview') },
            { value: 'lowest_price', label: t('SortBy.priceAscending') },
            { value: 'highest_price', label: t('SortBy.priceDescending') },
            { value: 'relevance', label: t('SortBy.relevance') },
          ]}
          sortParamName="sort"
          title={getGridTitle(category.name, isCabinet, selectedProgram)}
          totalCount={streamableTotalCount}
        />
      </div>
      <CountertopQuoteBand path={category.path} />
      <Slot
        label={`${category.name} bottom content`}
        snapshotId={`category-${categoryId}-bottom-content`}
      />
      {cabinetAssembly.length > 0 && <CabinetAssembly videos={cabinetAssembly} />}
      {faq && <CabinetFaq data={faq} />}
      <SeoContentSection content={seoContent} kicker={`About ${category.name.toLowerCase()}`} />
      {Boolean(cabinetContent?.disclaimer) && (
        <CabinetSpecs disclaimer={cabinetContent?.disclaimer} />
      )}
      <CollectionConsult name={category.name} show={isCabinet} />
      <Stream value={streamableFacetedSearch}>
        {(search) => (
          <CategoryViewed
            category={category}
            products={search.products.items}
            taxDisplay={taxDisplay}
          />
        )}
      </Stream>
    </>
  );
}
