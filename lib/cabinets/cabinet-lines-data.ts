import { cache } from 'react';

import { CabinetLine } from '@/vibes/soul/sections/cabinet-lines';
import { CabinetFaqData } from '@/vibes/soul/sections/cabinet-faq';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getAudienceMode } from '~/lib/navigation/audience-mode';

// The "Cabinets" category (parent). When the category page resolves this id, it renders the
// cabinet-lines view (a card per child line/finish) instead of the normal product grid.
export const CABINETS_CATEGORY_ID = 863;

export type CabinetProgram = 'assembled' | 'rta';

/** Last non-empty path segment as a slug: "/cabinets/avon/" -> "avon" (trailing-slash safe). */
export function slugFromPath(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? '';
}

export interface CabinetCollectionRef {
  entityId: number;
  name: string;
  slug: string;
  path: string;
  image?: { src: string; alt: string };
}

/** All cabinet collections (children of Cabinets) as light refs — for slug resolution + listings. */
export const getCabinetCollectionRefs = cache(async (): Promise<CabinetCollectionRef[]> => {
  const { data } = await client.fetch({
    document: CabinetLinesQuery,
    variables: { rootEntityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });

  const root = data.site.categoryTree.find((c) => c.entityId === CABINETS_CATEGORY_ID);

  return (root?.children ?? []).map((c) => ({
    entityId: c.entityId,
    name: c.name,
    slug: slugFromPath(c.path),
    path: c.path,
    image: c.image ? { src: c.image.url, alt: c.image.altText } : undefined,
  }));
});

/** Resolve a collection slug (e.g. "avon") to its category ref, or null when unknown. */
export async function resolveCabinetCollectionBySlug(
  slug: string,
): Promise<CabinetCollectionRef | null> {
  const refs = await getCabinetCollectionRefs();

  return refs.find((r) => r.slug === slug.toLowerCase()) ?? null;
}

// One query: the Cabinets subtree (child ids/names/paths/images) + each child's metafields. The
// storefront Category type has no `children`, so children come from categoryTree; metafields are
// read per-child via `category(entityId:)`.
const CabinetLinesQuery = graphql(`
  query CabinetLinesQuery($rootEntityId: Int!) {
    site {
      categoryTree(rootEntityId: $rootEntityId) {
        entityId
        name
        children {
          entityId
          name
          path
          image {
            url: url(width: 600)
            altText
          }
        }
      }
    }
  }
`);

// Metafields are stringified JSON; keyed per namespace. Fetched per child.
const CabinetLineMetafieldsQuery = graphql(`
  query CabinetLineMetafieldsQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        pricing: metafields(namespace: "pricing_10x10") {
          edges {
            node {
              key
              value
            }
          }
        }
        fulfillment: metafields(namespace: "fulfillment") {
          edges {
            node {
              key
              value
            }
          }
        }
        sample: metafields(namespace: "sample") {
          edges {
            node {
              key
              value
            }
          }
        }
        media: metafields(namespace: "media") {
          edges {
            node {
              key
              value
            }
          }
        }
        spec: metafields(namespace: "spec") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  }
`);

// The product-line master list on the Cabinets parent (spec.info.product_line_id points into it).
const CabinetProductLinesQuery = graphql(`
  query CabinetProductLinesQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        attributes: metafields(namespace: "attributes") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  }
`);

const getProductLineNames = cache(async (): Promise<Map<string, string>> => {
  const { data } = await client.fetch({
    document: CabinetProductLinesQuery,
    variables: { entityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });
  const raw = data.site.category?.attributes.edges?.find((e) => e.node.key === 'product_lines')
    ?.node.value;
  const rows = parseJson<Array<{ id: string; name: string }>>(raw) ?? [];

  return new Map(rows.map((row) => [row.id, row.name]));
});

// Product-line filter on the Assembled / RTA listings. Options are the lines present among the
// collections sold in that program, in this order (Arun's), so RTA shows only Star and Euro Max.
const CABINET_LINE_ORDER = ['Star', 'Prism', 'Euro Value', 'Euro Max'];

export interface CabinetLineOption {
  label: string;
  slug: string;
  /** Collections in this line for the program. */
  count: number;
}

/** URL slug for a product line name: "Euro Max" -> "euro-max". */
export function cabinetLineSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The product lines present in a set of collections, ordered for the filter. */
export function cabinetLineOptions(lines: CabinetLine[]): CabinetLineOption[] {
  const present = new Set(lines.map((line) => line.productLine).filter((n): n is string => !!n));
  const ordered = [
    ...CABINET_LINE_ORDER.filter((n) => present.has(n)),
    ...[...present].filter((n) => !CABINET_LINE_ORDER.includes(n)).sort(),
  ];

  return ordered.map((label) => ({
    label,
    slug: cabinetLineSlug(label),
    count: lines.filter((line) => line.productLine === label).length,
  }));
}

/** Collections in the selected line (slug), or all of them when no line is selected. */
export function filterCabinetLines(lines: CabinetLine[], slug: string | null): CabinetLine[] {
  if (!slug) return lines;

  return lines.filter((line) => line.productLine && cabinetLineSlug(line.productLine) === slug);
}

function parseJson<T>(value: string | undefined): T | undefined {
  if (value == null || value === '') return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

interface ProgramPricing {
  price?: string;
  strike_price?: string;
  emi_text?: string;
}

// Audience-aware card imagery. Gallery order is [door-sample, …, kitchen] (image 1 = door sample,
// last image = kitchen). Homeowners get the aspirational kitchen as the cover with the door sample
// revealed on hover; contractors get the door sample straight up with no hover flourish.
function pickCardImages(
  { door: doorSample, kitchen }: { door?: string; kitchen?: string },
  audience: 'homeowner' | 'pro',
): { cover?: string; hover?: string; containCover?: boolean } {
  if (audience === 'homeowner' && kitchen) {
    // Kitchen is a lifestyle shot — fill the card (object-cover).
    return { cover: kitchen, hover: doorSample };
  }

  // Contractor (or homeowner with no kitchen image): door-sample cover — contain it so the whole
  // sample is visible (not cropped).
  return { cover: doorSample, hover: undefined, containCover: true };
}

/**
 * Fetch the cabinet lines (child categories of Cabinets) with the pricing/delivery/sample data for
 * the given program (Assembled or RTA), shaped for the CabinetLines section. Card imagery is
 * audience-aware (see pickCardImages).
 */
export const getCabinetLines = cache(async (program: CabinetProgram): Promise<CabinetLine[]> => {
  const audience = await getAudienceMode();
  const { data } = await client.fetch({
    document: CabinetLinesQuery,
    variables: { rootEntityId: CABINETS_CATEGORY_ID },
    fetchOptions: { next: { revalidate } },
  });

  const root = data.site.categoryTree.find((c) => c.entityId === CABINETS_CATEGORY_ID);
  const children = root?.children ?? [];
  const lineNames = await getProductLineNames();

  const lines = await Promise.all(
    children.map(async (child): Promise<CabinetLine> => {
      const { data: mf } = await client.fetch({
        document: CabinetLineMetafieldsQuery,
        variables: { entityId: child.entityId },
        fetchOptions: { next: { revalidate } },
      });

      const cat = mf.site.category;

      // pricing_10x10.pricing = { rta: {...}, assembled: {...} }
      const pricingRaw = cat?.pricing.edges?.find((e) => e.node.key === 'pricing')?.node.value;
      const pricing = parseJson<Record<string, ProgramPricing>>(pricingRaw)?.[program];

      // fulfillment.delivery = { rta: "2 Weeks", assembled: "3 Weeks" }
      const deliveryRaw = cat?.fulfillment.edges?.find((e) => e.node.key === 'delivery')?.node
        .value;
      const delivery = parseJson<Record<string, string>>(deliveryRaw)?.[program];

      // Carry the program in the URL so the collection detail page scopes its grid + header to
      // the same program (Assembled / RTA) the visitor came from.
      const href = `${child.path}?program=${program}`;

      // media.images = [door-sample, …, kitchen]. Cover + hover are chosen by audience.
      const mediaValue = (key: string) =>
        cat?.media?.edges?.find((e) => e.node.key === key)?.node.value;
      const gallery = (parseJson<string[]>(mediaValue('images')) ?? []).filter(
        (u): u is string => typeof u === 'string' && u !== '',
      );
      // Named photos (media.door_image / media.kitchen_image) win; older seeds fall back to the
      // gallery convention (first = door sample, last = kitchen).
      const named = {
        door: mediaValue('door_image') || gallery[0],
        kitchen: mediaValue('kitchen_image') || (gallery.length > 1 ? gallery.at(-1) : undefined),
      };
      const { cover, hover, containCover } = pickCardImages(named, audience);
      const mainSrc = cover ?? child.image?.url; // fall back to native BC category image
      const image = mainSrc ? { src: mainSrc, alt: child.name } : undefined;
      const hoverImage = hover ? { src: hover, alt: `${child.name} door sample` } : undefined;

      // spec.info.product_line_id -> master-list name ("Star", "Prism", …) for the line filter.
      const specRaw = cat?.spec.edges?.find((e) => e.node.key === 'info')?.node.value;
      const productLineId = parseJson<{ product_line_id?: string }>(specRaw)?.product_line_id;
      const productLine = productLineId ? lineNames.get(productLineId) : undefined;

      // sample.order_sample = { product_id, price, url } — the card's "Order sample" goes to the
      // collection's own sample link; collection page when none is set.
      const sampleRaw = cat?.sample.edges?.find((e) => e.node.key === 'order_sample')?.node.value;
      const sampleUrl = parseJson<{ url?: string }>(sampleRaw)?.url;

      return {
        productLine,
        entityId: child.entityId,
        name: child.name,
        href,
        image,
        containCover: containCover ?? false,
        hoverImage,
        price: pricing?.price,
        strikePrice: pricing?.strike_price,
        emiText: pricing?.emi_text,
        deliveryTime: delivery,
        orderSampleHref: sampleUrl || href,
      };
    }),
  );

  // A collection with no price for this program isn't sold in it (e.g. Rochelle is Assembled
  // only), so it stays off that program's listing rather than showing a card with no price.
  return lines.filter((line) => line.price != null && line.price !== '');
});

// Program-wide FAQ shown on the /cabinets/* listing listing pages (one FAQ per program, not per
// collection). Stored on the Cabinets parent (863) as faq.by_program = { assembled, rta } — the
// same shape the per-collection editor uses, but authored on the parent category.
const CabinetProgramFaqQuery = graphql(`
  query CabinetProgramFaqQuery($entityId: Int!) {
    site {
      category(entityId: $entityId) {
        faq: metafields(namespace: "faq") {
          edges {
            node {
              key
              value
            }
          }
        }
      }
    }
  }
`);

interface FaqSide {
  headline?: string;
  items?: Array<{ q?: string; a?: string }>;
}

/** The program-wide FAQ (Assembled or RTA) for the cabinet shop pages, or null when none authored. */
export const getCabinetProgramFaq = cache(
  async (program: CabinetProgram): Promise<CabinetFaqData | null> => {
    const { data } = await client.fetch({
      document: CabinetProgramFaqQuery,
      variables: { entityId: CABINETS_CATEGORY_ID },
      fetchOptions: { next: { revalidate } },
    });

    const raw = data.site.category?.faq.edges?.find((e) => e.node.key === 'by_program')?.node.value;
    const side = parseJson<Partial<Record<CabinetProgram, FaqSide>>>(raw)?.[program];

    if (!side) return null;

    const items = (side.items ?? [])
      .map((it) => ({ q: (it.q ?? '').trim(), a: (it.a ?? '').trim() }))
      .filter((it) => it.q !== '' || it.a !== '');

    if (items.length === 0) return null;

    return { headline: side.headline?.trim() || 'Frequently Asked Questions', items };
  },
);
