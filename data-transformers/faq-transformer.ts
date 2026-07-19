import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Faq {
  headline: string;
  items: FaqItem[];
  image?: string;
}

interface MetafieldConnection {
  edges: Array<{ node: { value: string } }> | null;
}

/**
 * Parse the `faq/list` product metafield (a JSON string) into a typed Faq.
 * Returns null when the metafield is absent, empty, or malformed — the FAQ section then renders
 * nothing (products without an FAQ simply don't show it).
 */
export function faqTransformer(metafields: MetafieldConnection | null | undefined): Faq | null {
  const raw = removeEdgesAndNodes(metafields ?? { edges: [] })[0]?.value;

  if (raw == null || raw === '') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Faq>;

    const items = (parsed.items ?? []).filter(
      (item): item is FaqItem => Boolean(item?.q) && Boolean(item?.a),
    );

    if (items.length === 0) {
      return null;
    }

    return {
      headline: parsed.headline ?? '',
      items,
      image: parsed.image?.trim() || undefined,
    };
  } catch {
    return null;
  }
}
