import { CABINETS_PARENT_CATEGORY_ID } from './collection-shape-const';
import { listMetafields, type Metafield, upsertMetafield } from './metafields-api';

// Reusable cabinet attribute master-lists, stored ONCE on the Cabinets parent category (863) and
// chosen per-collection via dropdown / multi-select. The client manages these lists in the admin
// "Attributes" tab; collections reference options by stable id (see collection-shape.ts).
//
// Stored as metafields on 863:
//   attributes.product_lines = ProductLineOption[]   (Star, Prism, Euro Max, Euro Value)
//   attributes.constructions = ConstructionOption[]  (Framed, Frameless, Slab)
//   attributes.colors        = ColorOption[]         (name + hex + image url)

export interface ProductLineOption {
  id: string;
  name: string;
}

export interface ConstructionOption {
  id: string;
  name: string;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  image: string; // image URL (swatch)
}

export interface CabinetAttributes {
  productLines: ProductLineOption[];
  constructions: ConstructionOption[];
  colors: ColorOption[];
}

export function emptyCabinetAttributes(): CabinetAttributes {
  return { productLines: [], constructions: [], colors: [] };
}

// Parse a metafield value into an array of loosely-typed records. Callers normalize each row into a
// concrete option type; the stored JSON may be missing fields, so rows are Partial.
function parseRows(
  mfs: Metafield[],
  namespace: string,
  key: string,
): Array<Record<string, unknown>> {
  const raw = mfs.find((m) => m.namespace === namespace && m.key === key)?.value;

  if (raw == null || raw === '') return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (row): row is Record<string, unknown> => typeof row === 'object' && row !== null,
    );
  } catch {
    return [];
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Read the attribute master-lists (product lines, constructions, colors) from category 863. */
export async function readCabinetAttributes(): Promise<CabinetAttributes> {
  const mfs = await listMetafields('categories', CABINETS_PARENT_CATEGORY_ID);

  return {
    productLines: parseRows(mfs, 'attributes', 'product_lines').map((o) => ({
      id: str(o.id),
      name: str(o.name),
    })),
    constructions: parseRows(mfs, 'attributes', 'constructions').map((o) => ({
      id: str(o.id),
      name: str(o.name),
    })),
    colors: parseRows(mfs, 'attributes', 'colors').map((c) => ({
      id: str(c.id),
      name: str(c.name),
      hex: str(c.hex),
      image: str(c.image),
    })),
  };
}

/** Write the attribute master-lists back to category 863 (drops rows with no name). */
export async function writeCabinetAttributes(data: CabinetAttributes): Promise<void> {
  const lines = data.productLines.filter((o) => o.name.trim() !== '');
  const constructions = data.constructions.filter((o) => o.name.trim() !== '');
  const colors = data.colors.filter((o) => o.name.trim() !== '');

  await upsertMetafield(
    'categories',
    CABINETS_PARENT_CATEGORY_ID,
    'attributes',
    'product_lines',
    JSON.stringify(lines),
  );
  await upsertMetafield(
    'categories',
    CABINETS_PARENT_CATEGORY_ID,
    'attributes',
    'constructions',
    JSON.stringify(constructions),
  );
  await upsertMetafield(
    'categories',
    CABINETS_PARENT_CATEGORY_ID,
    'attributes',
    'colors',
    JSON.stringify(colors),
  );
}
