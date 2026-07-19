import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

export interface FeatureCell {
  image: string;
  title: string;
  text: string;
}

export interface FeaturesGrid {
  headline: string;
  description: string;
  features: FeatureCell[];
}

interface MetafieldConnection {
  edges: Array<{ node: { value: string } }> | null;
}

/**
 * Parse the `features/grid` product metafield (a JSON string) into a typed FeaturesGrid.
 * Returns null if the metafield is absent or the JSON is malformed — the section then renders
 * nothing rather than throwing.
 */
export function featuresGridTransformer(
  metafields: MetafieldConnection | null | undefined,
): FeaturesGrid | null {
  const raw = removeEdgesAndNodes(metafields ?? { edges: [] })[0]?.value;

  if (raw == null || raw === '') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FeaturesGrid>;

    if (!Array.isArray(parsed.features) || parsed.features.length === 0) {
      return null;
    }

    return {
      headline: parsed.headline ?? '',
      description: parsed.description ?? '',
      features: parsed.features.map((feature) => ({
        image: feature.image ?? '',
        title: feature.title ?? '',
        text: feature.text ?? '',
      })),
    };
  } catch {
    return null;
  }
}
