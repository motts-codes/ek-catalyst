import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CardsRow } from '@/vibes/soul/sections/cards-row';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { FinePrint, PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { FREE_DESIGN_HREF, SAMPLES_HREF, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Current Offers',
  description: 'What each offer is, who qualifies, how to redeem it and when it ends.',
};

export default async function Promotions({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs breadcrumbs={[{ label: 'Promotions', href: '/promotions' }]} />
      <PageHero
        description="Everything we're offering right now, in one place: what it is, who qualifies, how to claim it and when it ends. Each one takes you straight to the page where it applies."
        imageLabel="A kitchen with an offer tag in the corner"
        kicker="Promotions"
        title="Current offers"
      />
      <CardsRow
        cards={[
          {
            title: 'Replacement windows — $179.99, any size up to 101 UI',
            description: 'Any homeowner · pickup from Bristol · ends [date]',
            ctaLabel: 'See the offer',
            href: '/windows',
            primary: true,
            imageLabel: 'A white double-hung window',
          },
          {
            title: '[Collection] — [X]% off',
            description: 'Online and in the showroom · ends [date]',
            ctaLabel: 'Shop the sale',
            href: '/sale',
            imageLabel: 'The collection, sale-tagged',
          },
          {
            title: '0% financing over [X] months',
            description: 'On purchases over $[X] · subject to approval',
            ctaLabel: 'Check my rate',
            href: '/financing',
            imageLabel: 'A finished kitchen, family at the island',
          },
          {
            title: 'First two door samples free',
            description: 'Quarter-door samples · code FREESAMPLES at checkout',
            ctaLabel: 'Order samples',
            href: SAMPLES_HREF,
            imageLabel: 'Two quarter-door samples',
          },
          {
            title: "Bring your quote, we'll beat it",
            description:
              "Competitor cabinet quotes of $3,000+ · free upgrades · $500 if we can't match",
            ctaLabel: 'Price match',
            href: '/price-match-guarantee',
            imageLabel: 'The Bring Your Quote banner',
          },
          {
            title: 'Free design consult',
            description: 'A Project Manager plans and prices your kitchen · no deposit',
            ctaLabel: 'Book a consult',
            href: FREE_DESIGN_HREF,
            imageLabel: 'A designer with a homeowner',
          },
        ]}
        columns={3}
        kicker="Active offers"
        tint
        title="Six ways to save right now"
      />
      <FinePrint>Fine print per offer to be supplied by Express Kitchens.</FinePrint>
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
      />
    </>
  );
}
