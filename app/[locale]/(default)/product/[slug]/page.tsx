import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { Faq } from '@/vibes/soul/sections/faq';
import { FeaturesGrid } from '@/vibes/soul/sections/features-grid';
import { ProductInformation } from '@/vibes/soul/sections/product-information';
import { auth, getSessionCustomerAccessToken } from '~/auth';
import { rewriteWysiwygContentUrls } from '~/data-transformers/html-content-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { faqTransformer } from '~/data-transformers/faq-transformer';
import { featuresGridTransformer } from '~/data-transformers/features-grid-transformer';
import { productInfoFeaturesTransformer } from '~/data-transformers/product-info-features-transformer';
import { buildOptionDependencyMap } from '~/data-transformers/option-dependency-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { ProductDetail } from '~/lib/makeswift/components/product-detail';
import { getRecaptchaSiteKey } from '~/lib/recaptcha';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { addToCart } from './_actions/add-to-cart';
import { getMoreProductImages } from './_actions/get-more-images';
import { submitReview } from './_actions/submit-review';
import { ProductAnalyticsProvider } from './_components/product-analytics-provider';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { Reviews } from './_components/reviews';
import { WishlistButton } from './_components/wishlist-button';
import { WishlistButtonForm } from './_components/wishlist-button/form';
import {
  getProduct,
  getProductPageMetadata,
  getProductPricingAndRelatedProducts,
  getStreamableInventorySettingsQuery,
  getStreamableProduct,
  getStreamableProductInventory,
  getStreamableProductVariantInventory,
} from './page-data';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const productId = Number(slug);

  const product = await getProductPageMetadata(productId, customerAccessToken);

  if (!product) {
    return notFound();
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: product.path, locale });

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: makeswiftMetadata?.title || pageTitle || product.name,
    description:
      makeswiftMetadata?.description ||
      metaDescription ||
      `${product.plainTextDescription.replaceAll(/\s+/g, ' ').trim().slice(0, 150)}...`,
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    alternates: await getMetadataAlternates({ path: product.path, locale }),
    ...(url && { openGraph: { images: [{ url, alt }] } }),
  };
}

export default async function Product({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const options = await searchParams;

  const optionValueIds = Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(options[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );

  const customerAccessToken = await getSessionCustomerAccessToken();
  const detachedWishlistFormId = 'product-add-to-wishlist-form';

  setRequestLocale(locale);

  const t = await getTranslations('Product');
  const format = await getFormatter();

  const productId = Number(slug);

  const [{ product: baseProduct, settings }, recaptchaSiteKey] = await Promise.all([
    getProduct(productId, customerAccessToken),
    getRecaptchaSiteKey(),
  ]);

  const reviewsEnabled = Boolean(settings?.reviews.enabled && !settings.display.showProductRating);
  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);
  const taxDisplay = settings?.tax?.pdp;

  if (!baseProduct) {
    return notFound();
  }

  // Breadcrumbs: Home / <category trail> / <product name>.
  // A product can be assigned to several categories at once — including both a parent
  // (e.g. "Appliances") and its child ("Fridges & Freezers"). BigCommerce returns them in
  // assignment order, not deepest-first, so we pick the category whose breadcrumb trail is
  // longest (the most specific one) to get the full trail down to the subcategory.
  const categories = removeEdgesAndNodes(baseProduct.categories);
  const deepestCategory = categories.reduce<(typeof categories)[number] | undefined>(
    (deepest, category) => {
      const depth = removeEdgesAndNodes(category.breadcrumbs).length;
      const deepestDepth = deepest ? removeEdgesAndNodes(deepest.breadcrumbs).length : 0;

      return depth > deepestDepth ? category : deepest;
    },
    undefined,
  );
  const categoryCrumbs = deepestCategory
    ? removeEdgesAndNodes(deepestCategory.breadcrumbs).map(({ name, path }) => ({
        label: name,
        href: path ?? '#',
      }))
    : [];
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...categoryCrumbs,
    { label: baseProduct.name, href: baseProduct.path },
  ];

  // The __fulfillment custom field (delivery/pickup message) is shown in the purchase panel, not
  // in specifications. Present on products across categories; absent -> no fulfillment box.
  const fulfillmentMessage = removeEdgesAndNodes(baseProduct.customFields)
    .find((field) => field.name === '__fulfillment')
    ?.value?.trim();

  // Marketing pills above the product name, driven by the __is_bestseller / __is_trending custom
  // fields (only when the value is exactly "yes"). Bestseller shows first. Products without these
  // fields show no pills. The __ prefix keeps them out of the Product Details spec table (which
  // filters out all __-prefixed fields).
  const productFlags = removeEdgesAndNodes(baseProduct.customFields);
  const isFlagYes = (name: string) =>
    productFlags.find((field) => field.name === name)?.value?.trim().toLowerCase() === 'yes';
  const badges = [
    isFlagYes('__is_new') && { label: 'New', color: 'var(--pill-new-background)' },
    isFlagYes('__is_bestseller') && {
      label: 'Bestseller',
      color: 'var(--pill-bestseller-background)',
    },
    isFlagYes('__is_trending') && { label: 'Trending', color: 'var(--pill-trending-background)' },
  ].filter((badge): badge is { label: string; color: string } => Boolean(badge));

  // Features grid (from the `features/grid` JSON metafield). Null when the product has none.
  const featuresGrid = featuresGridTransformer(baseProduct.featuresMetafield);

  // FAQ (from the `faq/list` JSON metafield). Null when the product has none.
  const faq = faqTransformer(baseProduct.faqMetafield);

  // Product Information > Features list (product_info/features metafield). Null -> col 1 hidden.
  const productInfoFeatures = productInfoFeaturesTransformer(
    baseProduct.productInfoFeaturesMetafield,
  );

  const streamableProduct = Streamable.from(async () => {
    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
    };

    const product = await getStreamableProduct(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamableProductSku = Streamable.from(async () => (await streamableProduct).sku);

  const streamableProductInventory = Streamable.from(async () => {
    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
    };

    const product = await getStreamableProductInventory(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamableProductVariantInventory = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (!product.inventory.hasVariantInventory) {
      return undefined;
    }

    const variables = {
      productId,
      sku: product.sku,
    };

    const variants = await getStreamableProductVariantInventory(variables, customerAccessToken);

    if (!variants) {
      return undefined;
    }

    return removeEdgesAndNodes(variants).find((v) => v.sku === product.sku);
  });

  const streamableProductPricingAndRelatedProducts = Streamable.from(async () => {
    const currencyCode = await getPreferredCurrencyCode();

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
      currencyCode,
    };

    return await getProductPricingAndRelatedProducts(variables, customerAccessToken);
  });

  const streamablePrices = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return null;
    }

    return pricesTransformer(product, format, taxDisplay) ?? null;
  });

  const streamableImages = Streamable.from(async () => {
    const product = await streamableProduct;

    const images = removeEdgesAndNodes(product.images)
      .filter((image) => image.url !== product.defaultImage?.url)
      .map((image) => ({
        src: image.url,
        alt: image.altText,
      }));

    return {
      images: product.defaultImage
        ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
        : images,
      pageInfo: product.images.pageInfo,
    };
  });

  const streameableCtaLabel = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return t('ProductDetails.Submit.unavailable');
    }

    if (product.availabilityV2.status === 'Preorder') {
      return t('ProductDetails.Submit.preorder');
    }

    if (!product.inventory.isInStock) {
      return t('ProductDetails.Submit.outOfStock');
    }

    return t('ProductDetails.Submit.addToCart');
  });

  const streameableCtaDisabled = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return true;
    }

    if (product.availabilityV2.status === 'Preorder') {
      return false;
    }

    if (!product.inventory.isInStock) {
      return true;
    }

    return false;
  });

  // Stock badge state — variant-aware (same inventory stream as the CTA) and consistent with the
  // Add-to-cart button: only 'out' when genuinely not purchasable. Preorder is purchasable, so it
  // is treated as in-stock for the badge (never shows red next to an enabled button).
  // 'limited' when the available quantity is 1–4 (needs a real quantity; if the store doesn't
  // expose stock levels, availableToSell is null and we fall back to plain 'in').
  // DEPENDENCY: the 'limited' state requires the store's "Display stock levels on storefront"
  // inventory setting to be ON — that's what exposes availableToSell to the storefront API. If
  // that setting is turned off, availableToSell goes null and 'limited' silently stops firing
  // (everything in-stock just shows 'in'). Do not hide the stock UI by toggling that setting off.
  // Available stock as a number (variant-aware), or null when the store doesn't expose stock
  // levels or the product tracks nothing meaningful. Shared by the stock badge AND the quantity
  // cap so they read one computation and re-resolve together on variant change.
  // Preorder returns null (uncapped by stock — it's purchasable beyond on-hand quantity).
  const streamableAvailableStock = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Preorder') {
      return null;
    }

    // streamableProductInventory is queried WITH the selected optionValueIds, so
    // product.inventory.aggregated.availableToSell is already the selected variant's quantity —
    // no separate by-SKU variant lookup needed (and variant SKUs can be empty, which broke that).
    return product.inventory.aggregated?.availableToSell ?? null;
  });

  // Badge state: 'out' | 'in' | { low: N } (shows "Only N in stock" when 1–4 available).
  const streamableStockStatus = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return 'out' as const;
    }

    if (product.availabilityV2.status === 'Preorder') {
      return 'in' as const;
    }

    if (!product.inventory.isInStock) {
      return 'out' as const;
    }

    const availableToSell = await streamableAvailableStock;

    if (availableToSell != null && availableToSell > 0 && availableToSell < 5) {
      return { low: availableToSell };
    }

    return 'in' as const;
  });

  const streamableInventorySettings = Streamable.from(async () => {
    return await getStreamableInventorySettingsQuery(customerAccessToken);
  });

  const getBackorderAvailabilityPrompt = ({
    showBackorderAvailabilityPrompt,
    backorderAvailabilityPrompt,
    availableForBackorder,
    unlimitedBackorder,
  }: {
    showBackorderAvailabilityPrompt: boolean;
    backorderAvailabilityPrompt: string | null;
    availableForBackorder?: number | null;
    unlimitedBackorder?: boolean;
  }) => {
    if (!showBackorderAvailabilityPrompt || !backorderAvailabilityPrompt) {
      return null;
    }

    const hasBackorderAvailablity = !!availableForBackorder || unlimitedBackorder;

    if (!hasBackorderAvailablity) {
      return null;
    }

    return backorderAvailabilityPrompt;
  };

  const streamableStockDisplayData = Streamable.from(async () => {
    const [product, variant, inventorySetting] = await Streamable.all([
      streamableProductInventory,
      streamableProductVariantInventory,
      streamableInventorySettings,
    ]);

    if (!inventorySetting) {
      return null;
    }

    let inventory;

    if (product.inventory.hasVariantInventory) {
      inventory = variant?.inventory;
    } else {
      inventory = product.inventory;
    }

    if (!inventory) {
      return null;
    }

    const {
      showOutOfStockMessage,
      stockLevelDisplay,
      defaultOutOfStockMessage,
      showBackorderAvailabilityPrompt,
      showBackorderMessage,
      showQuantityOnBackorder,
      backorderAvailabilityPrompt,
    } = inventorySetting;

    if (!inventory.isInStock) {
      return showOutOfStockMessage
        ? { stockLevelMessage: defaultOutOfStockMessage, backorderAvailabilityPrompt: null }
        : null;
    }

    const {
      availableToSell,
      warningLevel,
      availableOnHand,
      availableForBackorder,
      unlimitedBackorder,
    } = inventory.aggregated ?? {};

    if (stockLevelDisplay === 'DONT_SHOW') {
      return null;
    }

    const showsBackorderInfo =
      showBackorderAvailabilityPrompt || showBackorderMessage || showQuantityOnBackorder;

    // if no backorder info is to be displayed, then availableToSell is the stock quantity to be used
    const stockQuantity = showsBackorderInfo ? availableOnHand : availableToSell;

    if (!showsBackorderInfo && !stockQuantity) {
      return null;
    }

    if (stockLevelDisplay === 'SHOW_WHEN_LOW') {
      if (!warningLevel) {
        return null;
      }

      if (stockQuantity && stockQuantity > warningLevel) {
        return null;
      }
    }

    const availabilityMessage = getBackorderAvailabilityPrompt({
      showBackorderAvailabilityPrompt,
      backorderAvailabilityPrompt,
      availableForBackorder,
      unlimitedBackorder,
    });

    if (!availabilityMessage && stockQuantity === undefined) {
      return null;
    }

    return {
      stockLevelMessage: t('ProductDetails.currentStock', {
        quantity: stockQuantity ?? 0,
      }),
      backorderAvailabilityPrompt: availabilityMessage,
    };
  });

  const streamableBackorderDisplayData = Streamable.from(async () => {
    const [product, variant, inventorySetting] = await Streamable.all([
      streamableProductInventory,
      streamableProductVariantInventory,
      streamableInventorySettings,
    ]);

    let inventory;

    if (!product.inventory.hasVariantInventory) {
      inventory = product.inventory;
    } else {
      inventory = variant?.inventory;
    }

    if (!inventory?.aggregated || !inventorySetting) {
      return {
        availableOnHand: 0,
        availableForBackorder: 0,
        unlimitedBackorder: false,
        showQuantityOnBackorder: false,
        backorderMessage: null,
      };
    }

    const inventoryData = {
      availableOnHand: inventory.aggregated.availableOnHand,
      availableForBackorder: inventory.aggregated.availableForBackorder ?? 0,
      unlimitedBackorder: inventory.aggregated.unlimitedBackorder,
    };

    const { showQuantityOnBackorder, showBackorderMessage } = inventorySetting;

    const hasBackorderAvailablity =
      inventoryData.availableForBackorder > 0 || inventoryData.unlimitedBackorder;

    if (!hasBackorderAvailablity || !showBackorderMessage) {
      return {
        ...inventoryData,
        showQuantityOnBackorder: showQuantityOnBackorder && hasBackorderAvailablity,
        backorderMessage: null,
      };
    }

    let variantLocations;

    if (product.inventory.hasVariantInventory) {
      variantLocations = variant?.inventory?.byLocation;
    } else {
      const variants = removeEdgesAndNodes(product.variants);
      const baseVariant = variants.find((v) => v.sku === product.sku);

      variantLocations = baseVariant?.inventory?.byLocation;
    }

    if (!variantLocations) {
      return {
        ...inventoryData,
        showQuantityOnBackorder,
        backorderMessage: null,
      };
    }

    const inventoryByLocation = removeEdgesAndNodes(variantLocations).at(0);

    return {
      ...inventoryData,
      showQuantityOnBackorder,
      backorderMessage: inventoryByLocation?.backorderMessage || null,
    };
  });

  // The specification rows (SKU, weight, condition, custom fields). Extracted so they feed the
  // "Product Information" section's Product Details table, and are NO LONGER in the accordion.
  const streamableSpecifications = Streamable.from(async () => {
    const product = await streamableProduct;

    const customFields = removeEdgesAndNodes(product.customFields);

    return [
      { name: t('ProductDetails.Accordions.sku'), value: product.sku },
      {
        name: t('ProductDetails.Accordions.weight'),
        value:
          product.weight?.value != null ? `${product.weight.value} ${product.weight.unit}` : '',
      },
      { name: t('ProductDetails.Accordions.condition'), value: product.condition },
      ...customFields
        // Exclude all __-prefixed fields — they drive UI (fulfillment box, marketing pills), not
        // spec rows.
        .filter((field) => !field.name.startsWith('__'))
        .map((field) => ({ name: field.name, value: field.value })),
    ]
      // Drop any spec row without a value (empty SKU/condition, missing custom fields, etc.).
      .filter((spec) => spec.value != null && spec.value.trim() !== '');
  });

  const streameableAccordions = Streamable.from(async () => {
    const product = await streamableProduct;

    return [
      ...(product.warranty
        ? [
            {
              title: t('ProductDetails.Accordions.warranty'),
              content: (
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{
                    __html: rewriteWysiwygContentUrls(product.warranty),
                  }}
                />
              ),
            },
          ]
        : []),
    ];
  });

  const streameableRelatedProducts = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return [];
    }

    const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

    return productCardTransformer(relatedProducts, format, undefined, undefined, taxDisplay);
  });

  const streamableMinQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.minPurchaseQuantity;
  });

  // Effective quantity cap = min(available stock, max-purchase-quantity setting). Whichever are
  // set constrain it; if neither, no cap (undefined). This flows to the form's `maxQuantity`,
  // which caps BOTH the +/- input AND the zod validation, so typing and clicking agree with the
  // server. `maxPurchaseQuantity` of 0 means "no limit" in BigCommerce. Falls back to the
  // purchase-limit only when stock is unknown (store setting off) or preorder (availableStock null).
  const streamableMaxQuantity = Streamable.from(async () => {
    const product = await streamableProduct;
    const availableStock = await streamableAvailableStock;

    const purchaseLimit =
      product.maxPurchaseQuantity != null && product.maxPurchaseQuantity > 0
        ? product.maxPurchaseQuantity
        : undefined;

    const caps = [purchaseLimit, availableStock ?? undefined].filter(
      (n): n is number => typeof n === 'number',
    );

    return caps.length > 0 ? Math.min(...caps) : undefined;
  });

  const streamableAnalyticsData = Streamable.from(async () => {
    const [extendedProduct, pricingProduct] = await Streamable.all([
      streamableProduct,
      streamableProductPricingAndRelatedProducts,
    ]);

    return {
      id: extendedProduct.entityId,
      name: extendedProduct.name,
      sku: extendedProduct.sku,
      brand: extendedProduct.brand?.name ?? '',
      price: pricingProduct?.pricesIncludingTax?.price.value ?? 0,
      currency: pricingProduct?.pricesIncludingTax?.price.currencyCode ?? '',
    };
  });

  const streamableUser = Streamable.from(async () => {
    const session = await auth();
    const firstName = session?.user?.firstName ?? '';
    const lastName = session?.user?.lastName ?? '';

    if (!firstName || !lastName) {
      return { email: session?.user?.email ?? '', name: '' };
    }

    const lastInitial = lastName.charAt(0).toUpperCase();
    const obfuscatedName = `${firstName} ${lastInitial}.`;

    return { email: session?.user?.email ?? '', name: obfuscatedName };
  });

  return (
    <>
      <ProductAnalyticsProvider data={streamableAnalyticsData}>
        <ProductDetail
          action={addToCart}
          breadcrumbs={breadcrumbs}
          additionalActions={
            <WishlistButton
              formId={detachedWishlistFormId}
              productId={productId}
              productSku={streamableProductSku}
            />
          }
          additionalInformationTitle={t('ProductDetails.additionalInformation')}
          ctaDisabled={streameableCtaDisabled}
          ctaLabel={streameableCtaLabel}
          stockStatus={streamableStockStatus}
          decrementLabel={t('ProductDetails.decreaseQuantity')}
          emptySelectPlaceholder={t('ProductDetails.emptySelectPlaceholder')}
          fields={productOptionsTransformer(baseProduct.productOptions)}
          optionDependencyMap={buildOptionDependencyMap(baseProduct.variants?.edges)}
          fulfillmentMessage={fulfillmentMessage}
          incrementLabel={t('ProductDetails.increaseQuantity')}
          loadMoreImagesAction={getMoreProductImages}
          prefetch={true}
          product={{
            id: baseProduct.entityId.toString(),
            title: baseProduct.name,
            description: (
              <div
                dangerouslySetInnerHTML={{
                  __html: rewriteWysiwygContentUrls(baseProduct.description),
                }}
              />
            ),
            href: baseProduct.path,
            images: streamableImages,
            price: streamablePrices,
            reviewsEnabled,
            showRating,
            numberOfReviews: baseProduct.reviewSummary.numberOfReviews,
            subtitle: baseProduct.brand?.name,
            subtitleHref: baseProduct.brand?.path,
            badges,
            rating: baseProduct.reviewSummary.averageRating,
            accordions: streameableAccordions,
            minQuantity: streamableMinQuantity,
            maxQuantity: streamableMaxQuantity,
            stockDisplayData: streamableStockDisplayData,
            backorderDisplayData: streamableBackorderDisplayData,
          }}
          productId={baseProduct.entityId}
          quantityLabel={t('ProductDetails.quantity')}
          recaptchaSiteKey={recaptchaSiteKey}
          reviewFormAction={submitReview}
          thumbnailLabel={t('ProductDetails.thumbnail')}
          user={streamableUser}
        />
      </ProductAnalyticsProvider>

      {/* Full-width (edge-to-edge) separator between the main product area and the sections below.
          Rendered here (not inside ProductInformation) so it always shows, even when a product has
          no Product Information content. */}
      <hr className="w-full border-t border-contrast-100" />

      <Stream fallback={null} value={streamableSpecifications}>
        {(specifications) => (
          <ProductInformation features={productInfoFeatures} specifications={specifications} />
        )}
      </Stream>

      <FeaturesGrid featuresGrid={featuresGrid} />

      <FeaturedProductCarousel
        cta={{ label: t('RelatedProducts.cta'), href: '/shop-all' }}
        emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
        emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
        nextLabel={t('RelatedProducts.nextProducts')}
        previousLabel={t('RelatedProducts.previousProducts')}
        products={streameableRelatedProducts}
        scrollbarLabel={t('RelatedProducts.scrollbar')}
        title={t('RelatedProducts.title')}
      />

      {showRating && baseProduct.reviewSummary.numberOfReviews > 0 && (
        <div id="reviews">
          <Reviews
            productId={productId}
            recaptchaSiteKey={recaptchaSiteKey}
            searchParams={searchParams}
            streamableImages={streamableImages}
            streamableProduct={streamableProduct}
          />
        </div>
      )}

      <Stream
        fallback={null}
        value={Streamable.from(async () =>
          Streamable.all([streamableProduct, streamableProductPricingAndRelatedProducts]),
        )}
      >
        {([extendedProduct, pricingProduct]) => (
          <>
            <ProductSchema
              product={{
                ...extendedProduct,
                pricesIncludingTax: pricingProduct?.pricesIncludingTax ?? null,
                pricesExcludingTax: pricingProduct?.pricesExcludingTax ?? null,
              }}
              taxDisplay={taxDisplay}
            />
            <ProductViewed
              product={{
                ...extendedProduct,
                pricesIncludingTax: pricingProduct?.pricesIncludingTax ?? null,
                pricesExcludingTax: pricingProduct?.pricesExcludingTax ?? null,
              }}
              taxDisplay={taxDisplay}
            />
          </>
        )}
      </Stream>

      <Faq faq={faq} />

      <WishlistButtonForm
        formId={detachedWishlistFormId}
        productId={productId}
        productSku={streamableProductSku}
        searchParams={searchParams}
      />
    </>
  );
}
