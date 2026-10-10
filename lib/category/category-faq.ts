import { type CabinetFaqData } from '@/vibes/soul/sections/cabinet-faq';

interface FaqEdge {
  node: { key: string; value: string };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

// A category's generic FAQ: the `faq.list` metafield = { headline, items: [{ q, a }] }, seeded by
// scripts/seed-categories-and-faqs.py. Null when absent or malformed.
export function parseCategoryFaq(edges: FaqEdge[] | null | undefined): CabinetFaqData | null {
  const raw = edges?.find((edge) => edge.node.key === 'list')?.node.value;

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || !Array.isArray(parsed.items)) return null;

    return {
      headline: text(parsed.headline),
      items: parsed.items.filter(isRecord).map((item) => ({ q: text(item.q), a: text(item.a) })),
    };
  } catch {
    return null;
  }
}

// The cabinet pages' program-aware FAQ wins; everything else falls back to `faq.list`.
export const pickFaq = (cabinetFaq: CabinetFaqData | null, edges: FaqEdge[] | null | undefined) =>
  cabinetFaq ?? parseCategoryFaq(edges);
