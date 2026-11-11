import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { OfferPage } from '@/vibes/soul/sections/offer-page';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Free Appliance with Every Kitchen',
  description:
    'Get up to $1,100 in appliance credit with your kitchen, plus up to 4 bonus gifts. Frigidaire, GE, Whirlpool, Samsung, LG and more. Until Nov 30, 2026.',
};

// Offer page for the appliance credit (until Nov 30, 2026). Appliances are sold in stock only
// and delivered within EK's Connecticut zones.
export default async function FreeApplianceOffer({
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
          { label: 'Free appliance', href: '/offers-free-appliance' },
        ]}
      />
      <OfferPage
        actions={[
          { label: 'Shop appliances', href: '/appliances', primary: true },
          { label: 'Shop cabinets', href: '/cabinets', style: 'outline' },
        ]}
        banner={{
          src: '/images/offers/banners/free-appliance.webp',
          alt: 'Free appliance with every kitchen. Appliance credit of $500 on kitchens of $3,000 or more, $700 on $5,000 or more, $900 on $7,500 or more, and $1,100 on $9,000 or more. Plus up to 4 bonus gifts: roll-out trays, cabinet organizers, designer handles and a pull-down faucet. Brands include Frigidaire, GE Appliances, Whirlpool, Samsung, Haier, LG, JennAir and Miele. Now through November 30, 2026.',
          width: 2078,
          height: 757,
        }}
        details={{
          columns: ['Kitchen purchase', 'Appliance credit'],
          rows: [
            ['$3,000 or more', '$500'],
            ['$5,000 or more', '$700'],
            ['$7,500 or more', '$900'],
            ['$9,000 or more', '$1,100'],
            [
              'Plus',
              'Up to 4 bonus gifts: roll-out trays, cabinet organizers, designer handles, a pull-down faucet',
            ],
            ['Brands', 'Frigidaire, GE Appliances, Whirlpool, Samsung, Haier, LG, JennAir, Miele'],
            ["How it's applied", 'As a credit toward appliances from Express Kitchens, not cash'],
            ['Valid until', 'November 30, 2026'],
          ],
        }}
        faq={[
          {
            q: 'Is the appliance actually free?',
            a: "You get an appliance credit of $500 to $1,100, depending on your kitchen purchase. Pick an appliance up to that amount and it's free; above it, you pay the difference.",
          },
          {
            q: 'Which appliances can I choose?',
            a: 'Any in-stock appliance from Express Kitchens, from brands including Frigidaire, GE, Whirlpool, Samsung, Haier, LG, JennAir and Miele.',
          },
          {
            q: 'How do I get the bonus gifts?',
            a: '(EK to confirm.)',
          },
          {
            q: 'I live outside Connecticut. Can I still use it?',
            a: '(EK to confirm. Appliance delivery is limited to Connecticut zones.)',
          },
          {
            q: 'Can I combine it with the countertop credit or the price match?',
            a: '(EK to confirm.)',
          },
        ]}
        faqHeadline="Questions about the free appliance"
        terms={[
          'The credit is based on your kitchen purchase before tax. (EK to confirm: cabinets only, or cabinets plus countertops?)',
          "The credit applies to appliances bought from Express Kitchens with the same kitchen. It can't be exchanged for cash. Any balance over the credit is paid at the normal price.",
          'Appliances are subject to stock. Appliance delivery is limited to our Connecticut delivery zones. (EK to confirm: can customers outside CT pick up at the Factory Outlet?)',
          "Bonus gifts: (EK to confirm how they're earned, e.g. one gift per tier.)",
          'One credit per kitchen.',
          'Valid on purchases made by November 30, 2026. Express Kitchens may change or end the offer at any time. Orders already placed are honored.',
        ]}
        title="Free appliance with every kitchen: up to $1,100 in appliance credit"
      />
    </>
  );
}
