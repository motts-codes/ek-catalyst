export type SeoBlock =
  { type: 'p'; text: string } | { type: 'h3'; text: string } | { type: 'ul'; items: string[] };

export interface SeoContent {
  headline: string;
  blocks: SeoBlock[];
}

interface MetafieldEdge {
  node: { key: string; value: string };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

function parseBlock(raw: unknown): SeoBlock | null {
  if (!isRecord(raw)) return null;

  if (raw.type === 'ul' && Array.isArray(raw.items)) {
    const items = raw.items.filter((item): item is string => typeof item === 'string');

    return items.length > 0 ? { type: 'ul', items } : null;
  }

  if ((raw.type === 'p' || raw.type === 'h3') && typeof raw.text === 'string' && raw.text !== '') {
    return { type: raw.type, text: raw.text };
  }

  return null;
}

// A category's SEO copy: the `seo.content` metafield = { headline, blocks: [{ type: 'p' | 'h3',
// text } | { type: 'ul', items }] }, seeded by scripts/seed-categories-and-faqs.py. Null when
// absent or malformed.
export function parseSeoContent(edges: MetafieldEdge[] | null | undefined): SeoContent | null {
  const raw = edges?.find((edge) => edge.node.key === 'content')?.node.value;

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || !Array.isArray(parsed.blocks)) return null;

    const blocks = parsed.blocks
      .map(parseBlock)
      .filter((block): block is SeoBlock => block !== null);

    return blocks.length > 0 ? { headline: text(parsed.headline), blocks } : null;
  } catch {
    return null;
  }
}
