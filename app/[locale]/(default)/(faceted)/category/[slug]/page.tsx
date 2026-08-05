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
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { getSessionCustomerAccessToken } from '~/auth';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pageInfoTransformer } from '~/data-transformers/page-info-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { Slot } from '~/lib/makeswift/slot';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { MAX_COMPARE_LIMIT } from '../../../compare/page-data';
import { getCompareProducts } from '../../fetch-compare-products';
import { fetchFacetedSearch } from '../../fetch-faceted-search';
import { productCardAddToCartAction } from '../../product-card-add-to-cart';

import {
  cabinetProgramSearchParam,
  getCabinetAssemblyVideos,
  getCabinetCollectionContent,
  getCabinetCollectionFaq,
  getCabinetCollectionHeader,
  isCabinetCollection,
  parseCabinetProgram,
} from '~/lib/cabinets/cabinet-collection';

import { CategoryViewed } from './_components/category-viewed';
import { getCategoryPageData } from './page-data';

const getCachedCategory = cache((categoryId: number) => {
  return {
    category: categoryId,
  };
});

const compareLoader = createCompareLoader();

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

  // Cabinet collection pages (Avon, Dover) scope their grid + header to a program (Assembled / RTA)
  // carried in ?program=. The RTA/Assembled split is by product name; accessories (neither) show
  // under both.
  const isCabinet = await isCabinetCollection(categoryId);
  const cabinetProgram = isCabinet
    ? parseCabinetProgram((await props.searchParams).program)
    : undefined;

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

    // On cabinet collection pages, scope the grid to the program via the Program facet
    // (attr_Program=Assembled/RTA). Inert until the facet is configured in BigCommerce; then it
    // filters server-side, correctly paginated. See docs/CABINET-FACETS.md.
    const programFilter =
      isCabinet && cabinetProgram ? cabinetProgramSearchParam(cabinetProgram) : {};

    const search = await fetchFacetedSearch(
      {
        ...searchParams,
        ...parsedSearchParams,
        ...programFilter,
        category: categoryId,
      },
      currencyCode,
      customerAccessToken,
    );

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
    const search = await streamableFacetedSearch;

    return pageInfoTransformer(search.products.pageInfo);
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
      ? await getCabinetCollectionHeader(categoryId, cabinetProgram)
      : null;

  // Per-collection FAQ (Avon's Assembled FAQ, etc.), shown below the grid. Program-aware; null when
  // this collection has no FAQ authored for the current program.
  const cabinetFaq =
    isCabinet && cabinetProgram
      ? await getCabinetCollectionFaq(categoryId, cabinetProgram)
      : null;

  // Assembly-instruction videos (per collection, not program-specific).
  const cabinetAssembly = isCabinet ? await getCabinetAssemblyVideos(categoryId) : [];
  // Specifications + disclaimer (per collection).
  const cabinetContent = isCabinet ? await getCabinetCollectionContent(categoryId) : null;

  return (
    <>
      <Slot
        label={`${category.name} top content`}
        snapshotId={`category-${categoryId}-top-content`}
      />
      {cabinetHeader && cabinetProgram && (
        <CabinetCollectionHeader data={cabinetHeader} program={cabinetProgram} />
      )}
      <ProductsListSection
        breadcrumbs={breadcrumbs}
        // Hide the category name + count so the Makeswift "top content" (images/banner) leads the
        // page; the sort control moves to the left.
        hideHeader
        addToCartAction={productCardAddToCartAction}
        compareLabel={t('Compare.compare')}
        compareProducts={streamableCompareProducts}
        emptyStateSubtitle={t('Category.Empty.subtitle')}
        emptyStateTitle={t('Category.Empty.title')}
        filterLabel={t('FacetedSearch.filters')}
        filters={streamableFilters}
        filtersPanelTitle={t('FacetedSearch.filters')}
        maxCompareLimitMessage={t('Compare.maxCompareLimit')}
        maxItems={MAX_COMPARE_LIMIT}
        paginationInfo={streamablePagination}
        products={streamableProducts}
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
        title={category.name}
        totalCount={streamableTotalCount}
      />
      <Slot
        label={`${category.name} bottom content`}
        snapshotId={`category-${categoryId}-bottom-content`}
      />
      {Boolean(cabinetContent?.specifications) && (
        <CabinetSpecs specifications={cabinetContent?.specifications} />
      )}
      {cabinetAssembly.length > 0 && <CabinetAssembly videos={cabinetAssembly} />}
      {cabinetFaq && <CabinetFaq data={cabinetFaq} />}
      {Boolean(cabinetContent?.disclaimer) && (
        <CabinetSpecs disclaimer={cabinetContent?.disclaimer} />
      )}
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
