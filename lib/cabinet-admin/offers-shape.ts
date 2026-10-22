import 'server-only';

import { CABINETS_PARENT_CATEGORY_ID } from './collection-shape-const';
import { listMetafields, upsertMetafield } from './metafields-api';

// Cabinet offers registry — one metafield on the Cabinets parent (offers.list). Each offer says
// where it shows: every cabinet collection, one product line (Star), or one collection with a
// program (Avon Assembled). The collection page's "Offers" row reads this. Non-cabinet categories
// are deliberately out of scope (they have no collection page; an ad-hoc band can cover them).

export type OfferScope = 'all' | 'line' | 'collection';
export type OfferProgram = 'both' | 'assembled' | 'rta';

export interface CabinetOffer {
  id: string;
  /** The offer sentence as shown. */
  text: string;
  /** A substring of `text` picked out in black (the code, the amount). Empty = none. */
  highlight: string;
  /** Optional link to the full offer / terms (a path or URL); shown as an arrow after the text. */
  url: string;
  scope: OfferScope;
  /** attributes.product_lines id when scope is "line". */
  lineId: string;
  /** Collection category id (as a string) when scope is "collection". */
  collectionId: string;
  /** Program filter when scope is "collection" (ignored otherwise). */
  program: OfferProgram;
  active: boolean;
  /** Optional YYYY-MM-DD bounds; empty = open-ended. */
  startsOn: string;
  endsOn: string;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const isScope = (v: unknown): v is OfferScope => v === 'all' || v === 'line' || v === 'collection';
const isProgram = (v: unknown): v is OfferProgram =>
  v === 'both' || v === 'assembled' || v === 'rta';

const isRecord = (v: unknown): v is Record<string, unknown> => v != null && typeof v === 'object';

// Normalise a stored row (unknown JSON) into a CabinetOffer; rows without text are dropped.
export function normalizeOffer(raw: unknown): CabinetOffer | null {
  if (!isRecord(raw)) return null;

  const row = raw;
  const text = str(row.text).trim();

  if (text === '') return null;

  return {
    id: str(row.id) || `offer-${Math.random().toString(36).slice(2, 10)}`,
    text,
    highlight: str(row.highlight),
    url: str(row.url).trim(),
    scope: isScope(row.scope) ? row.scope : 'all',
    lineId: str(row.lineId),
    collectionId: str(row.collectionId),
    program: isProgram(row.program) ? row.program : 'both',
    active: row.active !== false,
    startsOn: str(row.startsOn),
    endsOn: str(row.endsOn),
  };
}

export async function readCabinetOffers(): Promise<CabinetOffer[]> {
  const mfs = await listMetafields('categories', CABINETS_PARENT_CATEGORY_ID);
  const raw = mfs.find((m) => m.namespace === 'offers' && m.key === 'list')?.value;

  try {
    const rows: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(rows)
      ? rows.map(normalizeOffer).filter((o): o is CabinetOffer => o != null)
      : [];
  } catch {
    return [];
  }
}

export async function writeCabinetOffers(offers: CabinetOffer[]): Promise<void> {
  const rows = offers.map(normalizeOffer).filter((o): o is CabinetOffer => o != null);

  await upsertMetafield(
    'categories',
    CABINETS_PARENT_CATEGORY_ID,
    'offers',
    'list',
    JSON.stringify(rows),
  );
}
