import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { CabinetLineCard } from '@/vibes/soul/sections/cabinet-lines';
import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { HomeSection } from '@/vibes/soul/sections/home-section';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Best-Selling Kitchen Designs',
  description:
    'The kitchens people order most, ranked by what actually ships. Each one is a collection and finish with its 10×10 price and delivery time.',
};

export default async function BestSellers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const lines = await getCabinetLines('assembled');

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Inspiration', href: '/inspiration' },
          { label: 'Best-selling designs', href: '/inspiration/best-sellers' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Shop all collections', href: '/cabinets/assembled-cabinets', primary: true },
        ]}
        description="If you'd like to know what other people chose, this is the honest answer: the collections ranked by what actually ships from Bristol, not by what we'd most like to sell. Each card shows the collection and finish, its 10×10 price and how soon it can be with you, so you can compare them on the same basis."
        imageLabel="The most-ordered kitchen, Avon in white"
        kicker="Best-selling designs"
        title="The kitchens people order most"
      />
      <HomeSection
        description="Three to a row so each one has room to breathe. Open a collection for the full cabinet list, finishes and samples."
        tint
        title="Best sellers"
      >
        {lines.length === 0 ? (
          <p className="text-contrast-500">Collections will appear here as they are added.</p>
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
            {lines.map((line) => (
              <CabinetLineCard key={line.entityId} line={line} />
            ))}
          </div>
        )}
      </HomeSection>
      <ReviewMarquee
        action={{ label: 'Read all reviews', href: '/reviews' }}
        reviews={HOME_REVIEWS}
        summary="4.5 · 360+ Google reviews"
        title="In their words"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
      />
    </>
  );
}
