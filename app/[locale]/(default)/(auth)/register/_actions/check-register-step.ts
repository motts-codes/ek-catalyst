'use server';

import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { emailHasAccount } from '~/lib/bigcommerce/customer-lookup';

// Runs when the visitor presses Next on the step that holds the email: a taken email is reported
// on the field right away instead of after the whole form. Anything other than a confirmed match
// returns null (no error), so a lookup hiccup never blocks sign-up; BigCommerce's own
// EmailAlreadyInUseError still backs this up at submit.
export async function checkRegisterStep(
  names: string[],
  values: Record<string, string>,
): Promise<Record<string, string[]> | null> {
  if (!names.includes('email')) return null;

  const email = z.string().trim().email().safeParse(values.email);

  if (!email.success) return null;

  if ((await emailHasAccount(email.data)) !== true) return null;

  const t = await getTranslations('Auth.Register');

  return { email: [t('FieldErrors.emailInUse')] };
}
