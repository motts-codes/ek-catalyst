import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { OfferPage } from '@/vibes/soul/sections/offer-page';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'First 2 Door Samples Free',
  description:
    'Hold the real door before you choose. Your first 2 door samples are free with code FREESAMPLES.',
};

// Offer page for the free-samples promotion (no end date). Linked from the "Offers" row
// on every cabinet collection page via the offers registry in /cabinet-admin.
export default async function FreeSamplesOffer({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Offers', href: '/promotions' },
          { label: 'Free door samples', href: '/offers-freesamples' },
        ]}
      />
      <OfferPage
        actions={[{ label: 'Order your samples', href: '/samples', primary: true }]}
        banner={{
          src: '/images/offers/banners/free-samples.webp',
          alt: 'Quality you can hold before you choose. Feel the quality before you buy. First 2 samples free with code FREESAMPLES. Offer valid until November 30, 2026.',
        }}
        details={{
          rows: [
            ['You get', 'Your first 2 door samples free'],
            ['Code', 'FREESAMPLES, at checkout'],
            ['From', 'Any cabinet collection'],
            ['Shipping', 'Free on a samples-only order'],
          ],
        }}
        faq={[
          {
            q: 'Which collections can I choose from?',
            a: 'Any of them: Star, Prism, Euro Max and Euro Value.',
          },
          {
            q: 'What if I want more than two?',
            a: 'Add as many as you like. The first two are free with the code; the rest are charged at the listed sample price.',
          },
          {
            q: 'Do I have to send them back?',
            a: 'No. The samples are yours, whether or not you order a kitchen.',
          },
          {
            q: 'Can I see them in person instead?',
            a: 'Yes. Every collection is on display in our showrooms.',
          },
        ]}
        faqHeadline="Questions about the samples"
        terms={[
          'Two quarter-door samples per household, from any cabinet collection, on one order with code FREESAMPLES.',
          'Extra samples on the same order are charged at their listed price.',
          "Full-size doors, countertop samples and accessories aren't included.",
          "Samples ship to the 48 contiguous states. They're yours to keep, and there's nothing to return.",
          'Express Kitchens may change or end the offer at any time. Orders already placed are honored.',
        ]}
        title="Your first 2 door samples are free with code FREESAMPLES"
      />
    </>
  );
}
