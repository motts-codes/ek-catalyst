import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { OfferPage } from '@/vibes/soul/sections/offer-page';
import { PageBreadcrumbs, Prose } from '@/vibes/soul/sections/page-kit';
import { SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Price Match Guarantee',
  description:
    "Bring any competitor cabinet quote of $3,000 or more to a showroom. We beat it, plywood boxes and soft-close hardware included, or you get a $500 credit. Until Nov 30, 2026.",
};

// The live offer (until Nov 30, 2026): in-store, at the showrooms, on Star Cabinetry cabinets
// and countertops. The "upgrades" are EK's standard features priced against the competitor's
// quote, not paid extras. No online claim form: the match happens in a showroom.
// NOTE: EK's banner still reads "pay you $500". The $500 is a credit, not cash; EK has been
// asked for a corrected banner ("or give you a $500 credit"). Swap the file when it arrives.
export default async function PriceMatch({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Support', href: '/support' },
          { label: 'Price match guarantee', href: '/price-match-guarantee' },
        ]}
      />
      <OfferPage
        actions={[
          { label: 'Find a showroom', href: '/showrooms', primary: true },
          { label: 'Book a visit', href: '/book', style: 'outline' },
        ]}
        banner={{
          src: '/images/offers/banners/price-match.webp',
          alt: "We'll beat any quote, or give you a $500 credit. Free hinges, free glides. Bring any competitor quote of $3,000 or more to Express Kitchens and get plywood cabinets, soft-close hinges and full-extension glides at no extra charge before we match it. Offer valid until November 30, 2026.",
        }}
        details={{
          rows: [
            ['You get', "We beat a competitor's quote, or give you a $500 credit"],
            [
              'Upgrades included',
              'Plywood boxes, soft-close hinges and full-extension glides, at no extra charge',
            ],
            ['Quotes that qualify', 'Written competitor quotes of $3,000 or more'],
            ['On', 'Star Cabinetry cabinets and countertops'],
            ['Where', 'In person at any of our six showrooms'],
            ['Valid until', 'November 30, 2026'],
          ],
        }}
        faq={[
          {
            q: 'What does "beat it" mean?',
            a: 'We price the same kitchen for less than their quote, with plywood boxes, soft-close hinges and full-extension glides included.',
          },
          {
            q: 'How do I get the $500?',
            a: "If we can't beat the quote, you get a $500 credit toward your Express Kitchens order. It's a credit, not cash.",
          },
          {
            q: 'Can I use it on an online order?',
            a: 'No. The price match applies to purchases in our showrooms. Planned online? Bring your quote to a showroom and order there.',
          },
          {
            q: 'Does the Factory Outlet take part?',
            a: "No. The Factory Outlet isn't a showroom.",
          },
          {
            q: 'What counts as a quote?',
            a: 'A current, written quote from another seller, of $3,000 or more. Bring it on paper or on your phone.',
          },
        ]}
        faqHeadline="Questions about the price match"
        terms={[
          'Bring a current, written competitor quote of $3,000 or more to any of our six showrooms.',
          "We price the same kitchen with plywood boxes, soft-close hinges and full-extension glides, and beat the quote. If we can't, you get a $500 credit toward your Express Kitchens order.",
          'The $500 is a credit, not cash.',
          'Covers Star Cabinetry cabinets and countertops.',
          'Not valid on online orders, other cabinet lines or other products, or at the Factory Outlet.',
          'Valid on purchases made by November 30, 2026. Express Kitchens may change or end the offer at any time. Orders already placed are honored.',
        ]}
        title="Price match guarantee: we'll beat any quote, or give you a $500 credit"
      >
        <Prose
          body={[
            "A lower price often means a particleboard box, hinges that slam, or drawers that only open part of the way. We match on the same layout, with a plywood box, soft-close hinges and full-extension glides, so you're getting more cabinet for the same money.",
          ]}
          className="bg-[#fdf3f5]"
          image={{
            src: '/images/pages/price-match/box-comparison.jpg',
            alt: 'A plywood cabinet box beside a particleboard one, both cut open',
          }}
          kicker="Why the upgrades matter"
          title="A cheaper quote is often a different cabinet"
        />
        <ClosingBand
          description="Walk into any of our six showrooms, or book a visit so a Project Manager is ready for you."
          primary={{ label: 'Book a visit', href: '/book' }}
          showrooms={SHOWROOMS}
          title="Got a quote? Bring it in."
        />
      </OfferPage>
    </>
  );
}
