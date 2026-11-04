import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetFaq } from '@/vibes/soul/sections/cabinet-faq';
import { CategoryPoints } from '@/vibes/soul/sections/category-hero';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import {
  CheckTable,
  PageBreadcrumbs,
  PageHero,
  Prose,
  StepsRow,
} from '@/vibes/soul/sections/page-kit';
import { SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Price Match Guarantee',
  description:
    "Bring any competitor cabinet quote of $3,000 or more to an Express Kitchens showroom. We'll price the same kitchen with plywood boxes, soft-close hinges and full-extension glides, and beat their price. If we can't, you get a $500 credit.",
};

// The live offer (until Nov 30, 2026): in-store, at the showrooms, on Star Cabinetry cabinets
// and countertops. The "upgrades" are EK's standard features priced against the competitor's
// quote, not paid extras. No online claim form: the match happens in a showroom.
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
      <PageHero
        actions={[
          { label: 'Find a showroom', href: '/showrooms', primary: true },
          { label: 'How it works', href: '#how-it-works' },
        ]}
        description="Bring any competitor cabinet quote of $3,000 or more to an Express Kitchens showroom. We'll price the same kitchen with plywood boxes, soft-close hinges and full-extension glides, and beat their price. If we can't, you get a $500 credit toward your order."
        imageLabel="A homeowner handing a competitor quote across a showroom desk"
        kicker="Price match guarantee · Until Nov 30, 2026"
        title="Bring your quote. We'll beat it, or give you a $500 credit."
      />
      <CategoryPoints
        fine="Competitor quotes of $3,000 or more. In-store at our showrooms. Offer ends Nov 30, 2026."
        points={[
          { icon: 'plywood', label: 'Plywood boxes, at their price' },
          { icon: 'returns', label: 'Soft-close hinges included' },
          { icon: 'zap', label: 'Full-extension glides included' },
          { icon: 'price', label: "Can't beat it? $500 credit toward your order" },
        ]}
      />
      <div id="how-it-works" />
      <StepsRow
        kicker="How it works"
        look="red-box"
        steps={[
          {
            title: 'Bring your quote',
            description:
              'A current written quote of $3,000 or more from another seller. Bring it to any of our six showrooms.',
          },
          {
            title: 'We price the same kitchen',
            description:
              "Your Project Manager prices the same layout, with plywood boxes, soft-close hinges and full-extension glides, even if their quote doesn't include them.",
          },
          {
            title: 'We beat it, or give you $500',
            description:
              "You get a better kitchen for less than their price. If we can't beat it, you get a $500 credit toward your Express Kitchens order.",
          },
        ]}
        title="Three steps, in any showroom"
      />
      <HomeSection id="qualifies" kicker="The details" title="What qualifies">
        <div className="grid gap-8 @xl:grid-cols-2 @xl:gap-12">
          <CheckTable
            items={[
              'Written competitor quotes of $3,000 or more',
              'Star Cabinetry cabinets and countertops',
              'Purchases made in person at any of our six showrooms',
              'Until Nov 30, 2026',
            ]}
            title="Covered"
          />
          <CheckTable
            items={[
              { text: 'Online orders', no: true },
              { text: 'Other cabinet lines and other products', no: true },
              { text: "Purchases at our Factory Outlet, which isn't a showroom", no: true },
            ]}
            title="Not covered"
          />
        </div>
      </HomeSection>
      <Prose
        body={[
          "A lower price often means a particleboard box, hinges that slam, or drawers that only open part of the way. We match on the same layout, with a plywood box, soft-close hinges and full-extension glides, so you're getting more cabinet for the same money.",
        ]}
        image={{
          src: '/images/pages/price-match/box-comparison.jpg',
          alt: 'A plywood cabinet box beside a particleboard one, both cut open',
        }}
        kicker="Compare like for like"
        tint
        title="A cheaper quote is often a different cabinet"
      />
      <CabinetFaq
        data={{
          headline: 'Questions about the price match',
          items: [
            {
              q: 'What does "beat it" mean?',
              a: 'We price the same kitchen for less than their quote, with plywood boxes, soft-close hinges and full-extension glides included.',
            },
            {
              q: 'How do I get the $500?',
              a: "It's a $500 credit toward your Express Kitchens order.",
            },
            {
              q: 'Can I use it on an online order?',
              a: 'No. The guarantee applies to purchases made in our showrooms. Planned online? Bring your quote to a showroom and order there.',
            },
            {
              q: 'Does the Factory Outlet take part?',
              a: "No. The Factory Outlet isn't a showroom.",
            },
            {
              q: 'What counts as a quote?',
              a: 'A current, written quote from another seller, of $3,000 or more. Bring it on paper or on your phone.',
            },
          ],
        }}
      />
      <ClosingBand
        description="Walk into any of our six showrooms, or book a visit so a Project Manager is ready for you."
        primary={{ label: 'Find a showroom', href: '/showrooms' }}
        secondary={{ label: 'Book a visit', href: '/book' }}
        showrooms={SHOWROOMS}
        title="Got a quote? Bring it in."
      />
    </>
  );
}
