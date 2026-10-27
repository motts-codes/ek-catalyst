import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { FinePrint, PageBreadcrumbs, PageHero, Prose } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Countertop Credit Offer',
  description:
    'Get up to $500 toward your countertop with every Star Cabinets purchase above $3,000. Granite from $49.99 and quartz from $59.99 per square foot.',
};

// Offer page for the Star countertop credit. Linked from the "Offers" row on Star collection
// pages via the offers registry in /cabinet-admin (scope: product line Star).
export default async function CountertopOffer({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Offers', href: '/promotions' },
          { label: 'Countertop credit', href: '/offers-countertop' },
        ]}
      />
      <PageHero
        actions={[
          {
            label: 'Shop Star cabinets',
            href: '/cabinets/assembled-cabinets?line=star',
            primary: true,
          },
          { label: 'Countertops', href: '/countertops' },
          { label: 'The terms', href: '#terms' },
        ]}
        description="Cabinets and the countertop that sits on them are one decision, so we price them that way. Order Star Cabinets worth $3,000 or more, assembled or ready-to-assemble, and we put up to $500 toward your countertop. Granite starts at $49.99 a square foot, quartz at $59.99, and the credit comes off your countertop quote."
        image={{
          src: '/images/pages/offers/countertop-install.jpg',
          alt: 'Installers lowering a quartz countertop onto white shaker base cabinets',
        }}
        imageLabel="A white quartz countertop being lowered onto Star shaker base cabinets"
        kicker="Current offer, Star Cabinets"
        title="Up to $500 toward your countertop."
      />
      <CategoryPoints
        fine="Star Cabinets orders of $3,000 or more. One credit per kitchen; details below."
        points={[
          { icon: 'stock', label: 'Every Star collection' },
          { icon: 'zap', label: 'Assembled or RTA' },
          { icon: 'price', label: 'Granite from $49.99 / sq ft' },
          { icon: 'returns', label: 'Quartz from $59.99 / sq ft' },
        ]}
      />
      <CardsRow
        cards={[
          {
            title: 'Order your Star cabinets',
            description:
              'Any Star collection, Avon to Northampton, assembled or ready-to-assemble. The credit unlocks when the cabinet subtotal reaches $3,000.',
            imageLabel: 'Step 1',
          },
          {
            title: 'Request a countertop quote',
            description:
              'Pick a granite, quartz or laminate from the countertops page and send us your measurements, or ask for a template. Mention your cabinet order number.',
            imageLabel: 'Step 2',
          },
          {
            title: 'The credit comes off the quote',
            description:
              'We take $500 off a countertop quote of $2,000 or more, or 25% of a smaller quote. It shows as a line on the quote itself.',
            imageLabel: 'Step 3',
          },
        ]}
        hideImages
        kicker="How it works"
        tint
        title="Three steps, one kitchen"
      />
      <div id="terms" />
      <Prose
        body={[
          'The credit applies to a countertop quoted by Express Kitchens for the same kitchen as a Star Cabinets order with a cabinet subtotal of $3,000 or more before tax. Prism, Euro Max and Euro Value collections are not included.',
          'The credit is $500 on countertop quotes of $2,000 or more, and 25% of the quote below that. It is applied to the countertop quote, not paid in cash, and one credit applies per kitchen.',
          'The countertop quote must be requested within 60 days of the cabinet order. If the cabinet order is cancelled or falls below $3,000 after returns, the credit is withdrawn.',
          'Countertops are supplied cut to your measurements; Express Kitchens does not install. Express Kitchens may change or end the offer at any time; orders already placed are honoured. (Terms to be confirmed.)',
        ]}
        kicker="The terms, in plain words"
        tint
        title="What the offer covers"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about the countertop credit',
          items: [
            {
              q: 'Which collections count as Star Cabinets?',
              a: 'Every collection in the Star line: Avon, Barcelona, Beacon Hill, Birmingham, Brunswick, Cambridge, Derry, Dover, Dublin, Edinburgh, Lasalle, Lexington, Mero, Northampton and Rochelle.',
            },
            {
              q: 'Can I use it with the price match guarantee or financing?',
              a: 'Yes to financing. A price-matched cabinet order still qualifies as long as the matched subtotal is $3,000 or more. (To confirm.)',
            },
            {
              q: 'What if my countertop quote is under $2,000?',
              a: 'You still get 25% of the quote as a credit. Most 10×10 kitchens come in above $2,000 in granite or quartz, so most orders get the full $500.',
            },
          ],
        }}
      />
      <FinePrint>
        The threshold, the credit amount below $2,000, the 60-day window and the exclusions are to
        be confirmed by Express Kitchens before launch.
      </FinePrint>
    </>
  );
}
