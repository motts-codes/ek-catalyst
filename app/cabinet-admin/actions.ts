'use server';

import { revalidatePath } from 'next/cache';

import {
  clearAdminSession,
  isAdminAuthenticated,
  passwordMatches,
  setAdminSession,
} from '~/lib/cabinet-admin/auth';
import { type CollectionMetafields, writeCollectionMetafields } from '~/lib/cabinet-admin/collection-shape';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Login: verify the shared password, set the session cookie. */
export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get('password') ?? '');

  if (!passwordMatches(password)) {
    return { ok: false, error: 'Incorrect password.' };
  }

  await setAdminSession();
  revalidatePath('/cabinet-admin');

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  revalidatePath('/cabinet-admin');
}

/** Save a collection's metafields. Re-checks auth server-side (never trust the client). */
export async function saveCollectionAction(
  categoryId: number,
  data: CollectionMetafields,
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not authenticated.' };
  }

  try {
    await writeCollectionMetafields(categoryId, data);
    revalidatePath('/cabinet-admin');
    // The storefront cabinet pages read these metafields — revalidate their caches too.
    revalidatePath('/cabinets/shop/assembled-cabinets');
    revalidatePath('/cabinets/shop/rta-cabinets');

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Save failed.' };
  }
}
