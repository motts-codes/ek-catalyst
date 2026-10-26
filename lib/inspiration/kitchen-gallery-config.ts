// The best-sellers gallery's hand-picked layout: columns of slots, each slot a kitchen photo
// from a collection (or one of its finishes) or a custom picture. Stored as a metafield on the
// Cabinets parent category (gallery.best_sellers) and edited in /cabinet-admin. Plain types and
// parsing only, so both the storefront and the admin can use them.

/** "c:123" = collection 123's kitchen; "f:123:Lakehouse" = that finish's kitchen; "custom". */
export type GalleryRef = string;

export interface GallerySlot {
  ref: GalleryRef;
  /** Custom slots only: the picture, its name and where it links. */
  src?: string;
  name?: string;
  href?: string;
}

export interface GalleryConfig {
  columns: GallerySlot[][];
}

export const GALLERY_NAMESPACE = 'gallery';
export const GALLERY_KEY = 'best_sellers';

export const collectionRef = (id: number | string) => `c:${id}`;
export const finishRef = (id: number | string, finish: string) => `f:${id}:${finish}`;
export const CUSTOM_REF = 'custom';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const isRecord = (v: unknown): v is Record<string, unknown> => v != null && typeof v === 'object';

function normalizeSlot(raw: unknown): GallerySlot | null {
  if (!isRecord(raw)) return null;

  const ref = str(raw.ref).trim();

  if (ref === '') return null;
  if (ref === CUSTOM_REF && str(raw.src).trim() === '') return null;

  return ref === CUSTOM_REF
    ? { ref, src: str(raw.src).trim(), name: str(raw.name).trim(), href: str(raw.href).trim() }
    : { ref };
}

// Parse stored JSON (or anything) into a config; empty columns are kept so the editor can show
// them, but a config with no slots at all is null (the page then falls back to its own mix).
export function normalizeGalleryConfig(raw: unknown): GalleryConfig | null {
  const value = typeof raw === 'string' ? safeParse(raw) : raw;

  if (!isRecord(value) || !Array.isArray(value.columns)) return null;

  const columns = value.columns.map((col) =>
    Array.isArray(col) ? col.map(normalizeSlot).filter((s): s is GallerySlot => s != null) : [],
  );

  return columns.some((col) => col.length > 0) ? { columns } : null;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
