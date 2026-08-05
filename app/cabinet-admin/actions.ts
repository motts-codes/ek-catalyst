'use server';

import { revalidatePath } from 'next/cache';

import {
  adminSignIn,
  adminSignOut,
  getAdminEmail,
  isAdminAuthenticated,
} from '~/lib/cabinet-admin/admin-auth';
import {
  type CollectionMetafields,
  type ProgramFaq,
  writeCollectionMetafields,
  writeProgramFaq,
} from '~/lib/cabinet-admin/collection-shape';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Start Google sign-in (redirects to Google). Allowlist is enforced in the signIn callback. */
export async function googleSignInAction(): Promise<void> {
  await adminSignIn('google', { redirectTo: '/cabinet-admin' });
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
    revalidatePath('/cabinets/shop/assembled-cabinets');
    revalidatePath('/cabinets/shop/rta-cabinets');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}

/** Save the program-wide FAQ (category 863), shown on the /cabinets/shop/* pages. */
export async function saveProgramFaqAction(data: ProgramFaq): Promise<ActionResult> {
  const adminEmail = await getAdminEmail();

  if (!adminEmail || !(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeProgramFaq(data);
    revalidatePath('/cabinet-admin');
    revalidatePath('/cabinets/shop/assembled-cabinets');
    revalidatePath('/cabinets/shop/rta-cabinets');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}
