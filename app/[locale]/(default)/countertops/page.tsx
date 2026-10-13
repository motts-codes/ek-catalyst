import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import {
  CategoryHero,
  CategoryPoints,
  SubcategoryTiles,
} from '@/vibes/soul/sections/category-hero';
import { CountertopQuote } from '@/vibes/soul/sections/countertop-quote';
import { PageBreadcrumbs, Prose } from '@/vibes/soul/sections/page-kit';
import { COUNTERTOP_QUOTE_FIELDS } from '~/lib/countertops/quote-form';
import { submitQuoteLead } from '~/lib/forms/submit-lead';

export const metadata: Metadata = {
  title: 'Countertops — Granite from $49.99, Quartz from $59.99 per sq ft',
  description:
    'Granite, quartz, laminate and prefabricated countertops at some of the lowest prices per square foot anywhere. Request a quote or call to order.',
};

export default async function Countertops({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Kitchen', href: '/cabinets' },
          { label: 'Countertops', href: '/countertops' },
        ]}
      />
      <CategoryHero
        actions={[
          { label: 'Get a countertop quote', href: '#quote' },
          { label: 'Call 860-247-1000', href: 'tel:+18602471000' },
        ]}
        description="Granite from $49.99 and quartz from $59.99 a square foot: some of the lowest prices per square foot you'll find anywhere, on stone from quarries around the world, cut and polished at our own facility in Bristol. Because every countertop is sized to your kitchen, the price is a quote rather than a cart. Tell us the rough size and we'll price it, usually the same day — or simply call and order over the phone."
        imageLabel="A quartz countertop in a finished kitchen"
        title="Countertops at prices other shops can't match"
      />
      <CategoryPoints
        fine="Quote turnaround to be confirmed."
        points={[
          { icon: 'price', label: 'Granite $49.99 · Quartz $59.99 per sq ft' },
          { icon: 'clock', label: 'Quote back within [X] hours' },
          { icon: 'phone', label: 'Or phone and order' },
        ]}
      />
      <SubcategoryTiles
        items={[
          { name: 'Granite', href: '#quote' },
          { name: 'Quartz', href: '#quote' },
          { name: 'Laminate', href: '#quote' },
          { name: 'Prefabricated', href: '#quote' },
        ]}
        title="Shop by material"
      />
      <SubcategoryTiles
        items={[
          { name: 'Whites', href: '#quote' },
          { name: 'Grays', href: '#quote' },
          { name: 'Blacks', href: '#quote' },
          { name: 'Veined', href: '#quote' },
          { name: 'Warm tones', href: '#quote' },
        ]}
        title="Shop by colour family"
      />
      <SubcategoryTiles
        items={[
          { name: 'Eased', href: '#quote' },
          { name: 'Bevel', href: '#quote' },
          { name: 'Bullnose', href: '#quote' },
          { name: 'Ogee', href: '#quote' },
          { name: 'Waterfall end', href: '#quote' },
        ]}
        title="Shop by edge profile"
      />
      <CountertopQuote action={submitQuoteLead} fields={COUNTERTOP_QUOTE_FIELDS} id="quote" />
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
