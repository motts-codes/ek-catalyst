import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CountertopQuote } from '@/vibes/soul/sections/countertop-quote';
import { PageBreadcrumbs, PageHero, Prose, StepsRow } from '@/vibes/soul/sections/page-kit';
import {
  COUNTERTOP_PHONE,
  COUNTERTOP_QUOTE_IMAGE,
  countertopQuoteFields,
  QUOTE_ANCHOR,
  QUOTE_PAGE_HREF,
} from '~/lib/countertops/quote-form';
import { submitQuoteLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Countertop Quote: Granite and Quartz',
  description:
    'Tell us the rough size, material and cut-outs and we price your countertop within one business day. Granite from $49.99 and quartz from $59.99 per square foot.',
};

// The one countertop quote page. Product cards and product pages in the countertop categories
// send shoppers here with ?product=<name>, so the quote names the stone they were looking at.
// Countertops are cut to the kitchen, so the price is a quote rather than a cart.
export default async function CountertopQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const [{ locale }, { product: rawProduct }] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);

  const product = rawProduct?.trim().slice(0, 120) || undefined;

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Countertops', href: '/countertops' },
          { label: 'Get a quote', href: QUOTE_PAGE_HREF },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Request my quote', href: `#${QUOTE_ANCHOR}`, primary: true },
          { label: 'Call 860-247-1000', href: COUNTERTOP_PHONE.href },
        ]}
        chipStyle="checks"
        chips={[
          'Granite from $49.99 per sq ft',
          'Quartz from $59.99 per sq ft',
          'Quoted within 1 business day',
          'Measured before we cut',
        ]}
        description={
          product
            ? `Tell us the rough size of your kitchen and we'll price ${product} for you within 1 business day. Every countertop is cut to your cabinets, so the price is a quote rather than a cart. If you'd rather talk it through, call and we can take the order over the phone.`
            : "Granite from $49.99 and quartz from $59.99 a square foot, on stone cut and polished at our own facility in Bristol. Every countertop is sized to your kitchen, so the price is a quote rather than a cart. Tell us the rough size and we'll price it within 1 business day, or call and order over the phone."
        }
        image={COUNTERTOP_QUOTE_IMAGE}
        imageStyle="plain"
        kicker="Countertops"
        title={product ? `Request a quote for ${product}` : 'Get your countertop quote'}
      />
      <StepsRow
        look="red-box"
        note="Prefer to talk? Call 860-247-1000 and we can take the measurements and the order with you."
        steps={[
          {
            title: 'Tell us the rough size',
            description: 'Square feet, the material you like and any sink or cooktop cut-outs.',
          },
          {
            title: 'We price it',
            description: 'A quote back within 1 business day, by email or a quick call.',
          },
          {
            title: 'We measure before we cut',
            description: 'A template of your kitchen, so the top fits the first time.',
          },
          {
            title: 'Your installer fits it',
            description: 'We supply and deliver; your installer or contractor sets it in place.',
          },
        ]}
        title="How a countertop quote works"
      />
      <CountertopQuote
        action={submitQuoteLead}
        fields={countertopQuoteFields(product)}
        id={QUOTE_ANCHOR}
        image={COUNTERTOP_QUOTE_IMAGE}
        product={product}
      />
      <Prose
        body={[
          "We supply the countertop: measured, cut and polished to your kitchen, and delivered. We don't install it. Your installer or contractor sets it in place, and if you need one, the Find a pro page will help you choose well.",
        ]}
        kicker="Good to know"
        title="Supplied by us, fitted by your installer"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about countertops',
          items: [
            {
              q: 'Why is it a quote and not a price?',
              a: "Every countertop is cut to your kitchen, so the price depends on the square footage, the material, the edge and the cut-outs. Tell us the rough size and we'll quote it; the per-square-foot prices above are the starting point.",
            },
            {
              q: 'Can I order over the phone?',
              a: 'Yes. Call 860-247-1000 and we can take the order and the measurements with you.',
            },
            {
              q: 'Do you install countertops?',
              a: "No. We don't install anything we sell; your installer or contractor fits it.",
            },
            {
              q: 'Can I return a countertop?',
              a: "No, because it's cut to your kitchen. That's why we measure before we cut.",
            },
          ],
        }}
      />
    </>
  );
}
