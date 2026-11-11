import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { OfferPage } from '@/vibes/soul/sections/offer-page';
import { PageBreadcrumbs } from '@/vibes/soul/sections/page-kit';

export const metadata: Metadata = {
  title: 'Up to $500 Toward Your Countertop',
  description:
    'Buy $3,000 or more of Star Cabinets and get up to $500 toward your countertop, in full from $5,000. Granite from $49.99, quartz from $59.99 a sq ft. Until Dec 31, 2026.',
};

// Offer page for the Star countertop credit (until Dec 31, 2026). Linked from the "Offers" row
// on Star collection pages via the offers registry in /cabinet-admin (scope: product line Star).
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
      <OfferPage
        actions={[
          {
            label: 'Shop Star cabinets',
            href: '/cabinets/assembled-cabinets?line=star',
            primary: true,
          },
          { label: 'See countertops', href: '/countertops', style: 'outline' },
        ]}
        banner={{
          src: '/images/offers/banners/countertop-credit.webp',
          alt: 'Get up to $500 toward your countertop with every Star Cabinets purchase. Available on purchases of $3,000 or more, and in full on purchases of $5,000 or more. Offer valid until November 30, 2026.',
        }}
        details={{
          rows: [
            ['You get', 'Up to $500 toward your countertop'],
            ['On', 'Star Cabinets, assembled or RTA'],
            ['Star purchase of $5,000 or more', 'The full $500'],
            ['Star purchase of $3,000–$4,999', 'A partial credit (amount to confirm)'],
            ["How it's applied", 'As a credit on your countertop quote, not cash'],
            ['Countertops', 'Granite from $49.99 a sq ft, quartz from $59.99'],
            ['Valid until', 'December 31, 2026'],
          ],
        }}
        faq={[
          {
            q: 'Which cabinets qualify?',
            a: 'Every collection in the Star line, assembled or RTA.',
          },
          {
            q: 'How much do I get if my order is under $5,000?',
            a: 'On Star purchases of $3,000 to $4,999, you get part of the $500. (EK to confirm the amount.) From $5,000, you get the full $500.',
          },
          {
            q: 'How do I use the credit?',
            a: 'Order your Star cabinets, then request a countertop quote. The credit comes off the quote as a line item.',
          },
          {
            q: 'Can I combine it with financing?',
            a: 'Financing is available on showroom orders, and the credit still applies.',
          },
          {
            q: 'Do you install the countertop?',
            a: "On showroom orders, yes, including templating. Online orders don't include installation.",
          },
        ]}
        faqHeadline="Questions about the countertop credit"
        terms={[
          'Applies to Star Cabinets purchases of $3,000 or more before tax. The full $500 applies to purchases of $5,000 or more.',
          "Prism, Euro Max and Euro Value don't qualify.",
          "The credit applies to a countertop from Express Kitchens for the same kitchen. It's applied to the countertop quote and can't be exchanged for cash.",
          'One credit per kitchen.',
          'If returns bring the cabinet purchase below $3,000, the credit is withdrawn.',
          "Online orders don't include installation. On showroom orders, we can template and install your countertop.",
          'Valid on purchases made by December 31, 2026. Express Kitchens may change or end the offer at any time. Orders already placed are honored.',
        ]}
        title="Up to $500 toward your countertop with Star Cabinets"
      />
    </>
  );
}
