import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Free Door Samples Offer',
  description:
    'Your first two quarter-door samples are free with code FREESAMPLES. Hold the real door, in the real finish, in your own light before you order.',
};

// Offer page for the free-samples promotion. Linked from the "Offers" row on every cabinet
// collection page (the arrow after the line) via the offers registry in /cabinet-admin.
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
      <PageHero
        actions={[
          { label: 'Order your samples', href: '/samples', primary: true },
          { label: 'The terms', href: '#terms' },
        ]}
        description="A finish looks different on a screen, under showroom lights and in your kitchen at 7am. So before you commit to a collection, hold the real door. Your first two quarter-door samples are on us: pick any two collections, use code FREESAMPLES at checkout, and they ship to your door."
        imageLabel="Two quarter-door samples, white shaker and grey slab, on a kitchen counter"
        kicker="Current offer"
        title="Your first two door samples are free."
      />
      <CategoryPoints
        fine="Use code FREESAMPLES at checkout. Two per household; details below."
        points={[
          { icon: 'stock', label: 'Any two collections' },
          { icon: 'zap', label: 'Real doors, real finish' },
          { icon: 'returns', label: 'Ships to your door' },
          { icon: 'price', label: 'Code FREESAMPLES' },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Pick two',
            description:
              'Every collection page has an "Order sample" button, and the Samples page lists them all. Add any two quarter-door samples to your cart.',
            imageLabel: 'Step 1',
          },
          {
            title: 'Enter the code',
            description:
              'Type FREESAMPLES in the coupon box at checkout. The two samples drop to $0, and shipping on a samples-only order is free too.',
            imageLabel: 'Step 2',
          },
          {
            title: 'Decide at home',
            description:
              'Hold them against your floor, your countertop and your light. When you order the kitchen, the samples are yours to keep.',
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How it works"
        tint
        title="Three steps, no catch"
      />
      <div id="terms" />
      <Prose
        body={[
          'The offer covers two quarter-door samples per household, from any cabinet collections, on one order with code FREESAMPLES. Extra samples on the same order are charged at their listed price.',
          'Full-size door samples, countertop samples and accessories are not included. The code cannot be combined with other sample discounts.',
          'Samples ship to addresses in the continental United States. They are yours to keep, and there is nothing to return.',
          'Express Kitchens may change or end the offer at any time; orders already placed with the code are honoured. (Terms to be confirmed.)',
        ]}
        kicker="The terms, in plain words"
        tint
        title="What the offer covers"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about the samples',
          items: [
            {
              q: 'Which collections can I choose from?',
              a: 'Any of them: Star, Prism, Euro Max and Euro Value, in any finish that collection offers.',
            },
            {
              q: 'What if I want more than two?',
              a: 'Add as many as you like. The first two are free with the code; the rest are charged at the listed sample price.',
            },
            {
              q: 'Do I have to send them back?',
              a: 'No. The samples are yours, whether or not you go on to order a kitchen.',
            },
          ],
        }}
      />
      <FinePrint>
        Offer terms, the per-household limit and the shipping area are to be confirmed by Express
        Kitchens before launch.
      </FinePrint>
    </>
  );
}
