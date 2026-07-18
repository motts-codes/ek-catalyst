import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

/**
 * Map of which option values are valid together, derived from a product's variants.
 * Keyed by option value entityId -> set of option value entityIds (from OTHER options) that
 * co-occur in at least one purchasable variant.
 *
 * Used for dependent option filtering: e.g. once a Width value is selected, the Height dropdown
 * shows only heights that exist as a real variant with that width. Works in both directions
 * (pick width first or height first).
 */
export type OptionDependencyMap = Record<number, number[]>;

interface VariantLike {
  isPurchasable: boolean;
  productOptions: {
    edges: Array<{
      node: {
        __typename?: string;
        entityId: number;
        values?: { edges: Array<{ node: { entityId: number } }> };
      };
    }> | null;
  };
}

/**
 * Build the co-occurrence map from a product's variants. Only purchasable variants count, so
 * unavailable combinations are excluded. Returns an empty map if there are no variants (the
 * common case — most products don't need dependent filtering).
 */
export function buildOptionDependencyMap(
  variants: Array<{ node: VariantLike }> | null | undefined,
): OptionDependencyMap {
  const map: Record<number, Set<number>> = {};

  for (const { node: variant } of variants ?? []) {
    if (!variant.isPurchasable) {
      continue;
    }

    // The option value entityIds that compose this variant (one per option).
    const valueIds = removeEdgesAndNodes(variant.productOptions).flatMap((option) =>
      option.values ? removeEdgesAndNodes(option.values).map((value) => value.entityId) : [],
    );

    // Every value in this variant co-occurs with every other value in it.
    for (const a of valueIds) {
      for (const b of valueIds) {
        if (a === b) {
          continue;
        }

        (map[a] ??= new Set()).add(b);
      }
    }
  }

  return Object.fromEntries(Object.entries(map).map(([k, set]) => [Number(k), [...set]]));
}
