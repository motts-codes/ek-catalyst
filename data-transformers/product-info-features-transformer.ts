import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

export interface ProductInfoFeatureItem {
  name: string;
  value: string;
}

export interface ProductInfoFeatures {
  headline: string;
  items: ProductInfoFeatureItem[];
}

interface MetafieldConnection {
  edges: Array<{ node: { value: string } }> | null;
}

/**
 * Parse the `product_info/features` metafield (JSON: { headline, items: string[] }) into a typed
 * list for the "Product Information" section's Features column. Returns null when absent/malformed,
 * so products without it show only the Product Details column.
 */
export function productInfoFeaturesTransformer(
  metafields: MetafieldConnection | null | undefined,
): ProductInfoFeatures | null {
  const raw = removeEdgesAndNodes(metafields ?? { edges: [] })[0]?.value;

  if (raw == null || raw === '') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProductInfoFeatures>;
    const items = (parsed.items ?? [])
      .filter((item): item is ProductInfoFeatureItem => Boolean(item?.name))
      .map((item) => ({ name: item.name, value: item.value ?? '' }));

    if (items.length === 0) {
      return null;
    }

    return { headline: parsed.headline?.trim() || 'Features', items };
  } catch {
    return null;
  }
}
