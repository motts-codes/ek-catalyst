'use server';

import { revalidatePath } from 'next/cache';

import {
  adminSignIn,
  adminSignOut,
  getAdminEmail,
  isAdminAuthenticated,
} from '~/lib/cabinet-admin/admin-auth';
import {
  type CabinetAttributes,
  writeCabinetAttributes,
} from '~/lib/cabinet-admin/attributes-shape';
import {
  type CollectionMetafields,
  type ProgramFaq,
  writeCollectionMetafields,
  writeProgramFaq,
} from '~/lib/cabinet-admin/collection-shape';
import { writeGalleryConfig } from '~/lib/cabinet-admin/gallery-shape';
import { type CabinetOffer, writeCabinetOffers } from '~/lib/cabinet-admin/offers-shape';
import { type ProductContent, writeProductContent } from '~/lib/cabinet-admin/product-shape';
import type { GalleryConfig } from '~/lib/inspiration/kitchen-gallery-config';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Start Google sign-in (redirects to Google). Allowlist is enforced in the signIn callback. */
export async function googleSignInAction(): Promise<void> {
  await adminSignIn('google', { redirectTo: '/cabinet-admin' });
}

/** Start Microsoft 365 sign-in (redirects to Entra ID). Same allowlist applies. */
export async function microsoftSignInAction(): Promise<void> {
  await adminSignIn('microsoft-entra-id', { redirectTo: '/cabinet-admin' });
}

export async function signOutAction(): Promise<void> {
  await adminSignOut({ redirectTo: '/cabinet-admin' });
}

/**
 * Save a collection's metafields. Re-checks auth server-side (never trust the client). The admin's
 * email is captured here so the change log can attribute the edit once logging is added.
 */
export async function saveCollectionAction(
  categoryId: number,
  data: CollectionMetafields,
): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    // TODO(change-log): record { adminEmail, ts, categoryId, field, old -> new } once log storage
    // is chosen. The per-user identity is already available here via adminEmail.
    await writeCollectionMetafields(categoryId, data);
    revalidatePath('/cabinet-admin');
    revalidatePath('/cabinets/assembled-cabinets');
    revalidatePath('/cabinets/rta-cabinets');
    // Refresh the collection detail pages (Avon, Dover…) where the header, overview, gallery,
    // specifications, disclaimer, FAQ and assembly videos render — on both the shopping route
    // (/cabinets/*) and the explainers (/mykitchen/what-are-*-cabinets).
    revalidatePath('/cabinets', 'layout');
    revalidatePath('/mykitchen', 'layout');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}

/** Save the cabinet attribute master-lists (category 863): product lines, constructions, colors. */
export async function saveAttributesAction(data: CabinetAttributes): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeCabinetAttributes(data);
    revalidatePath('/cabinet-admin');
    // Attribute changes (e.g. a hex fix) propagate to every collection page (both journeys).
    revalidatePath('/cabinets', 'layout');
    revalidatePath('/mykitchen', 'layout');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}

/** Save the cabinet offers registry (category 863, offers.list). */
export async function saveOffersAction(offers: CabinetOffer[]): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeCabinetOffers(offers);
    revalidatePath('/cabinet-admin');
    // Offers render on every collection page.
    revalidatePath('/cabinets', 'layout');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}

/**
 * Save a product's editable CONTENT metafields (features grid, FAQ, product-info). View-only fields
 * (name/SKU/visibility/categories/sibling) are never written here — those stay in BC admin.
 */
export async function saveProductAction(
  productId: number,
  content: ProductContent,
): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeProductContent(productId, content);
    revalidatePath('/cabinet-admin');
    // Product content renders on the PDP; revalidate all product pages (slug not handy here).
    revalidatePath('/product', 'layout');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}

/** Save the program-wide FAQ (category 863), shown on the /cabinets/* pages. */
export async function saveProgramFaqAction(data: ProgramFaq): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeProgramFaq(data);
    revalidatePath('/cabinet-admin');
    revalidatePath('/cabinets/assembled-cabinets');
    revalidatePath('/cabinets/rta-cabinets');
    revalidatePath('/mykitchen', 'layout');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}

// Save the best-sellers gallery layout (category 863, gallery.best_sellers).
export async function saveGalleryAction(config: GalleryConfig): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeGalleryConfig(config);
    revalidatePath('/cabinet-admin');
    revalidatePath('/inspiration/best-sellers');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}
