import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { KitchenGallery } from '@/vibes/soul/sections/kitchen-gallery';
import { PageBreadcrumbs, PageHero } from '@/vibes/soul/sections/page-kit';
import { ReviewMarquee } from '@/vibes/soul/sections/review-marquee';
import { getCabinetLines } from '~/lib/cabinets/cabinet-lines-data';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';
import { galleryKitchens } from '~/lib/inspiration/kitchen-gallery-data';

export const metadata: Metadata = {
  title: 'Best-Selling Kitchen Designs',
  description:
    'The kitchens people order most, as a gallery. Tap any kitchen for the collection, finish and how it’s built, then open the collection.',
};

export default async function BestSellers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  const kitchens = galleryKitchens(await getCabinetLines('assembled'));

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
        description="If you'd like to know what other people chose, this is the honest answer: the collections that actually ship from Bristol, not the ones we'd most like to sell. Scroll through the kitchens, tap one for the collection, finish and how it's built, then open the collection for prices and samples."
        kicker="Best-selling designs"
        textOnly
        title="The kitchens people order most"
      />
      {kitchens.length === 0 ? (
        <p className="mx-auto max-w-screen-2xl px-6 py-10 text-contrast-500">
          Kitchens will appear here as collections are added.
        </p>
      ) : (
        <KitchenGallery kitchens={kitchens} />
      )}
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
