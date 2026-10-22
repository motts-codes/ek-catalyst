import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Free Shipping Offer',
  description:
    'Free shipping on cabinet orders above $2,500. Assembled or ready-to-assemble, delivered to your door with no delivery charge.',
};

// Offer page for the free-shipping promotion. Linked from the "Offers" row on every cabinet
// collection page via the offers registry in /cabinet-admin.
export default async function FreeShippingOffer({
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
          { label: 'Free shipping', href: '/offers-freeshipping' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Shop assembled', href: '/cabinets/assembled-cabinets', primary: true },
          { label: 'Shop RTA', href: '/cabinets/rta-cabinets' },
          { label: 'The terms', href: '#terms' },
        ]}
        description="Cabinets are heavy, and shipping them is not cheap. On any cabinet order above $2,500 we cover it: assembled or ready-to-assemble, every collection, delivered to your door. The discount applies itself at checkout once your cart passes the threshold."
        imageLabel="A delivery truck unloading wrapped cabinets at a house"
        kicker="Current offer"
        title="Free shipping above $2,500."
      />
      <CategoryPoints
        fine="Applied automatically at checkout. Cabinet orders only; details below."
        points={[
          { icon: 'stock', label: 'Every collection' },
          { icon: 'zap', label: 'Assembled or RTA' },
          { icon: 'returns', label: 'Curbside delivery' },
          { icon: 'price', label: 'No code needed' },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Build your order',
            description:
              'Add your cabinets, trim and accessories. The threshold is the cabinet subtotal before tax, so a 10×10 kitchen clears it on every collection.',
            imageLabel: 'Step 1',
          },
          {
            title: 'Shipping drops to $0',
            description:
              'Once the subtotal passes $2,500 the delivery line in your cart shows free. No code, nothing to remember.',
            imageLabel: 'Step 2',
          },
          {
            title: 'We call to book',
            description:
              'Before delivery we call to agree a day, and again the night before. See our shipping page for how curbside delivery works.',
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How it works"
        tint
        title="Nothing to enter, nothing to claim"
      />
      <div id="terms" />
      <Prose
        actions={[{ label: 'Shipping, delivery and pickup', href: '/shipping-policy' }]}
        body={[
          'Free shipping applies to cabinet orders with a subtotal of $2,500 or more before tax, shipped to one address in the continental United States. Assembled and ready-to-assemble cabinets from every collection qualify, including trim, panels and cabinet accessories on the same order.',
          'Countertops, appliances, windows, doors and samples-only orders are excluded; their delivery is priced separately. Showroom pickup orders are unaffected, since there is nothing to ship.',
          'Delivery is curbside. Inside delivery, carry-up and installation are not included; Express Kitchens does not install.',
          'If part of an order is returned and the remaining subtotal falls below $2,500, the standard shipping charge may be deducted from the refund. Express Kitchens may change or end the offer at any time; orders already placed are honoured. (Terms to be confirmed.)',
        ]}
        kicker="The terms, in plain words"
        tint
        title="What the offer covers"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about free shipping',
          items: [
            {
              q: 'Does the $2,500 include tax or accessories?',
              a: 'It is the cabinet subtotal before tax. Trim, panels and cabinet accessories on the same order count toward it.',
            },
            {
              q: 'Does it apply to countertops or appliances?',
              a: 'No. Countertops are quoted to your kitchen and appliances ship on their own terms, so both are priced separately.',
            },
            {
              q: 'Is delivery inside the house?',
              a: 'Delivery is curbside, to the end of your driveway or the building entrance. Have a helper ready for the heavier boxes.',
            },
          ],
        }}
      />
      <FinePrint>
        The threshold, the shipping area and the exclusions are to be confirmed by Express Kitchens
        before launch.
      </FinePrint>
    </>
  );
}
