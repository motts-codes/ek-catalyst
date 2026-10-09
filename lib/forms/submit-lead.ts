'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getLocale } from 'next-intl/server';

import { DynamicFormActionArgs } from '@/vibes/soul/form/dynamic-form';
import { Field, schema } from '@/vibes/soul/form/dynamic-form/schema';
import { redirect } from '~/i18n/routing';

// One server action for every lead form on the site (design consult, contact, quotes, Pro
// Program, referrals…). Validates against the form's own field schema, then hands off.
//
// DELIVERY IS NOT WIRED YET: there is no CRM / inbox integration in the sandbox, so a valid
// submission is logged on the server and the visitor is sent to the form's confirmation page.
// Wire `deliverLead` to the business's CRM, email or BigCommerce contact form before launch.
interface LeadMeta {
  /** Which form this came from, e.g. "free-design". */
  form: string;
  /** Where to send the visitor after a valid submission. */
  confirmPath: string;
}

function deliverLead(form: string, value: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.info(`[lead:${form}]`, JSON.stringify(value));
}

async function submitLead<F extends Field>(
  meta: LeadMeta,
  { fields }: DynamicFormActionArgs<F>,
  _prevState: { lastResult: SubmissionResult | null },
  formData: FormData,
) {
  const submission = parseWithZod(formData, { schema: schema(fields) });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  deliverLead(meta.form, submission.value);

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
    { form: 'free-design', confirmPath: '/free-design/confirmed' },
    args,
    prevState,
    formData,
  );
}
