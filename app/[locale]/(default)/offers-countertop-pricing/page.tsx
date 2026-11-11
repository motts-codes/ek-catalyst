import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { OfferPage } from '@/vibes/soul/sections/offer-page';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Granite from $49.99, Quartz from $59.99',
  description:
    'Buy $3,000 or more in cabinets and get granite from $49.99 and quartz from $59.99 a square foot. Until Dec 31, 2026.',
};

// Offer page for the countertop pricing with $3,000 in cabinets (until Dec 31, 2026).
export default async function CountertopPricingOffer({
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
          { label: 'Countertop pricing', href: '/offers-countertop-pricing' },
        ]}
      />
      <OfferPage
        actions={[
          { label: 'Shop cabinets', href: '/cabinets', primary: true },
          { label: 'Get a countertop quote', href: '/countertops/get-a-quote', style: 'outline' },
        ]}
        banner={{
          src: '/images/offers/banners/countertop-pricing.webp',
          alt: 'Start with $3,000 in cabinets, then explore granite and quartz options. Granite from $49.99 per square foot: Everest Mist, Gray Atlantico, Valle Nevado. Quartz from $59.99 per square foot: Aruca White, Blanca Arabescato, Calacatta Arno, Calacatta Botanica, Calacatta Sierra, Calacatta Trevi, Carrara Mist, Macabo Gray, New Carrara Marmi. Offer valid until November 30, 2026.',
          width: 2080,
        }}
        details={{
          rows: [
            ['You get', 'Granite from $49.99 a sq ft, quartz from $59.99 a sq ft'],
            ['When you buy', '$3,000 or more in cabinets'],
            ['Granite', 'Everest Mist, Gray Atlantico, Valle Nevado'],
            [
              'Quartz',
              'Aruca White, Blanca Arabescato, Calacatta Arno, Calacatta Botanica, Calacatta Sierra, Calacatta Trevi, Carrara Mist, Macabo Gray, New Carrara Marmi',
            ],
            ['How to claim', 'Order your cabinets, then request a countertop quote'],
            ['Valid until', 'December 31, 2026'],
          ],
        }}
        faq={[
          {
            q: 'Which cabinets count toward the $3,000?',
            a: '(EK to confirm: all lines, or Star only like the countertop credit?)',
          },
          {
            q: "What's included in the price per square foot?",
            a: '(EK to confirm.)',
          },
          {
            q: 'Can I see the stone before I order?',
            a: 'Yes, in any of our showrooms.',
          },
          {
            q: 'Can I use it with the countertop credit?',
            a: '(EK to confirm. If yes: "Yes. On Star purchases, the credit comes off your countertop quote at these prices.")',
          },
        ]}
        faqHeadline="Questions about countertop pricing"
        terms={[
          'Applies to cabinet purchases of $3,000 or more before tax.',
          'Prices are per square foot, on the colors listed. (EK to confirm what the asterisk on the banner covers: fabrication, edges, cutouts, installation.)',
          "Countertops are cut to your measurements. Online orders don't include installation. On showroom orders, we can template and install.",
          'Valid on purchases made by December 31, 2026. Express Kitchens may change or end the offer at any time. Orders already placed are honored.',
        ]}
        title="Granite from $49.99 and quartz from $59.99 a square foot with $3,000 in cabinets"
      />
    </>
  );
}
