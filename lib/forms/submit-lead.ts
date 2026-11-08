'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale } from 'next-intl/server';

import { DynamicFormActionArgs } from '@/vibes/soul/form/dynamic-form';
import { Field, schema } from '@/vibes/soul/form/dynamic-form/schema';
import { redirect } from '~/i18n/routing';

import { createMondayLead, isMondayConfigured } from '../leads/monday';

import { guardForm } from './anti-spam';

// One server action for every lead form on the site (design consult, contact, quotes, Pro
// Program, referrals…). Validates against the form's own field schema, then hands off.
//
// Delivery goes to monday.com (lib/leads/monday.ts) when MONDAY_API_TOKEN and MONDAY_BOARD_ID
// are set. Until then a valid submission is logged on the server and the visitor is sent to the
// form's confirmation page either way.
interface LeadMeta {
  /** Which form this came from, e.g. "free-design". */
  form: string;
  /** Where to send the visitor after a valid submission. */
  confirmPath: string;
}

async function deliverLead(form: string, value: Record<string, unknown>) {
  if (!isMondayConfigured()) {
    // eslint-disable-next-line no-console
    console.info(`[lead:${form}]`, JSON.stringify(value));

    return;
  }

  const result = await createMondayLead({ form, values: value });

  if (!result.ok) {
    // The visitor still gets the confirmation page (they did nothing wrong); the lead is kept in
    // the logs so it can be re-entered by hand. Grep for "[lead:undelivered]".
    // eslint-disable-next-line no-console
    console.error(`[lead:undelivered] ${form} ${result.error}`, JSON.stringify(value));
  }
}

async function submitLead<F extends Field>(
  meta: LeadMeta,
  { fields }: DynamicFormActionArgs<F>,
  _prevState: { lastResult: SubmissionResult | null },
  formData: FormData,
) {
  // Bot signals first, before validation, so a bot gets no field-level feedback. A blocked
  // submission takes the same "thanks" path as a real one; it just is not delivered.
  const guard = await guardForm(meta.form, formData, { minMs: 3000 });

  if (guard.blocked) {
    return redirect({ href: meta.confirmPath, locale: await getLocale() });
  }

  const submission = parseWithZod(formData, { schema: schema(fields) });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  await deliverLead(meta.form, submission.value);

  return redirect({ href: meta.confirmPath, locale: await getLocale() });
}

// Named actions per form (server actions must be plain exported async functions; binding meta
// in a page component trips the no-bind lint rule).
export async function submitContactLead<F extends Field>(
  args: DynamicFormActionArgs<F>,
  prevState: { lastResult: SubmissionResult | null },
  formData: FormData,
) {
  return submitLead(
    { form: 'contact', confirmPath: '/contact/confirmed' },
    args,
    prevState,
    formData,
  );
}

export async function submitDesignLead<F extends Field>(
  args: DynamicFormActionArgs<F>,
  prevState: { lastResult: SubmissionResult | null },
  formData: FormData,
) {
  return submitLead(
    { form: 'free-design', confirmPath: '/mykitchen/free-design-consult/confirmed' },
    args,
    prevState,
    formData,
  );
}

// Support-type forms (returns, price match, general support, referrals). A "use server"
// module may only export plain async functions, so each is written out rather than generated.
type LeadArgs<F extends Field> = [
  DynamicFormActionArgs<F>,
  { lastResult: SubmissionResult | null },
  FormData,
];

export async function submitReturnLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'return-authorization', confirmPath: '/contact/confirmed' }, ...a);
}

export async function submitPriceMatchLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'price-match', confirmPath: '/contact/confirmed' }, ...a);
}

export async function submitSupportLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'support', confirmPath: '/contact/confirmed' }, ...a);
}

export async function submitReferralLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'refer-a-friend', confirmPath: '/refer-a-friend/confirmed' }, ...a);
}

export async function submitProProgramLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead(
    { form: 'pro-program', confirmPath: '/pro-program/confirmed' },
    a[0],
    a[1],
    a[2],
  );
}

export async function submitIndustryLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'industry', confirmPath: '/quote/confirmed' }, a[0], a[1], a[2]);
}

export async function submitBookingLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'booking', confirmPath: '/book/confirmed' }, a[0], a[1], a[2]);
}

export async function submitQuoteLead<F extends Field>(...a: LeadArgs<F>) {
  return submitLead({ form: 'quote', confirmPath: '/quote/confirmed' }, a[0], a[1], a[2]);
}

// The estimator's "email me this estimate": stays on the page and confirms inline rather than
// redirecting, so the number never leaves the screen.
export async function submitEstimateLead<F extends Field>(
  { fields }: DynamicFormActionArgs<F>,
  _prevState: { lastResult: SubmissionResult | null },
  formData: FormData,
) {
  const submission = parseWithZod(formData, { schema: schema(fields) });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  await deliverLead('estimate', submission.value);

  return {
    lastResult: submission.reply({ resetForm: true }),
    successMessage: 'Sent. Check your inbox in a minute; the estimate stays on screen too.',
  };
}
