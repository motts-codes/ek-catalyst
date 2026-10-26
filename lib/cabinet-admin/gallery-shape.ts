import 'server-only';

import {
  GALLERY_KEY,
  GALLERY_NAMESPACE,
  type GalleryConfig,
  normalizeGalleryConfig,
} from '~/lib/inspiration/kitchen-gallery-config';

import { CABINETS_PARENT_CATEGORY_ID } from './collection-shape-const';
import { listMetafields, upsertMetafield } from './metafields-api';

// The best-sellers gallery layout: one metafield on the Cabinets parent (gallery.best_sellers).

export async function readGalleryConfig(): Promise<GalleryConfig | null> {
  const mfs = await listMetafields('categories', CABINETS_PARENT_CATEGORY_ID);
  const raw = mfs.find((m) => m.namespace === GALLERY_NAMESPACE && m.key === GALLERY_KEY)?.value;

  return normalizeGalleryConfig(raw);
}

export async function writeGalleryConfig(config: GalleryConfig): Promise<void> {
  const clean = normalizeGalleryConfig(config) ?? { columns: [] };

  await upsertMetafield(
    'categories',
    CABINETS_PARENT_CATEGORY_ID,
    GALLERY_NAMESPACE,
    GALLERY_KEY,
    JSON.stringify(clean),
  );
}
