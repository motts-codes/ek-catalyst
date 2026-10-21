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
  cabinetProgramContext,
  cabinetProgramSearchParam,
  getCabinetAssemblyVideos,
  getCabinetCollectionContent,
  getCabinetCollectionFaq,
  cabinetFinishContext,
  getCabinetCollectionHeader,
  isCabinetCollection,
} from '~/lib/cabinets/cabinet-collection';
import {
  fetchCabinetProductsByType,
  hasProductTypeFacet,
  isFallbackCursor,
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

function selectedCabinetType(value: string | string[] | undefined): CabinetTypeValue | null {
  const first = Array.isArray(value) ? value[0] : value;
  const match = CABINET_TYPES.find((type) => type.value === first);

  return match ? match.value : null;
}

// The facet filter for a selected type ({} when none), applied like the Program facet.
function cabinetTypeSearchParam(value: CabinetTypeValue | null): Record<string, string[]> {
  return value ? { [CABINET_TYPE_PARAM]: [value] } : {};
}

// Multi-finish collections (Prism): ?finish=<slug> selects a finish. Header pricing/photos follow it
// and the grid narrows through the products' "Finish" custom field (a search facet, like Program).
const FINISH_PARAM = 'finish';

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

// The collection URL with the type set (or cleared), keeping the program and dropping the page.
function getTypeHref(
  path: string,
  searchParams: Record<string, string | string[] | undefined>,
  value: CabinetTypeValue | null,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, raw]) => {
    // Switching type starts from page one: drop the page and cursor params.
    if (
      key === CABINET_TYPE_PARAM ||
      key === 'page' ||
      key === 'after' ||
      key === 'before' ||
      raw == null
    )
      return;

    (Array.isArray(raw) ? raw : [raw]).forEach((item) => params.append(key, item));
  });

  if (value) params.set(CABINET_TYPE_PARAM, value);

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
  const searchParamsForLinks = await props.searchParams;
  const selectedType = selectedCabinetType(searchParamsForLinks[CABINET_TYPE_PARAM]);
  // ?finish= → the finish name (null when absent/unknown) and the grid filter for it.
  const { name: selectedFinish, filter: finishFilter } = await cabinetFinishContext(
    isCabinet,
    categoryId,
    searchParamsForLinks[FINISH_PARAM],
  );

  if (!category) {
    return notFound();
  }

  // Home / <category trail>, matching the PDP. Prepending Home means top-level categories
  // (whose own trail is a single crumb) still render a breadcrumb. Consecutive duplicate labels
  // are collapsed — the category data can repeat the current category (e.g. "Windows / Windows").
  const categoryCrumbs = removeEdgesAndNodes(category.breadcrumbs)
    .map(({ name, path }) => ({ label: name, href: path ?? '#' }))
    .filter((crumb, index, all) => index === 0 || crumb.label !== all[index - 1]?.label);
  const breadcrumbs = [{ label: 'Home', href: '/' }, ...categoryCrumbs];

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
    const typeFilter = cabinetTypeSearchParam(selectedType);

    // The in-code type fallback (below) pages with plain page-number cursors ("p2"), which
    // BigCommerce would reject; real cursors are opaque encoded strings. Keep those away from it.
    const fallbackCursors =
      isFallbackCursor(searchParams.after) || isFallbackCursor(searchParams.before);
    const baseParams = {
      ...searchParams,
      ...parsedSearchParams,
      ...programFilter,
      ...typeFilter,
      ...finishFilter,
      category: categoryId,
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
    if (selectedType && !hasProductTypeFacet(search)) {
      return fetchCabinetProductsByType({
        searchParams: {
          ...searchParams,
          ...parsedSearchParams,
          ...programFilter,
          ...finishFilter,
          category: categoryId,
        },
        type: selectedType,
        search,
        currencyCode,
        customerAccessToken,
      });
    }

    return search;
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
            program={cabinetProgram}
            specifications={cabinetContent?.specifications}
            switchHref={
              programSwitchable ? getSwitchHref(category.path, cabinetProgram) : undefined
            }
          />
          <CabinetTypeFilter
            className="pb-8 @4xl:pb-10"
            hrefFor={(value) => getTypeHref(category.path, searchParamsForLinks, value)}
            selected={selectedType}
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
          emptyStateSubtitle={t('Category.Empty.subtitle')}
          emptyStateTitle={t('Category.Empty.title')}
          filterLabel={t('FacetedSearch.filters')}
          filters={streamableFilters}
          filtersPanelTitle={t('FacetedSearch.filters')}
          headingLevel={2}
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
          sortDefaultValue="featured"
          sortLabel={t('SortBy.sortBy')}
          sortOptions={[
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
