import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ClosingBand } from '@/vibes/soul/sections/closing-band';
import { PageBreadcrumbs, PageHero, StatsRow } from '@/vibes/soul/sections/page-kit';
import { ReviewGrid } from '@/vibes/soul/sections/page-kit/media';
import { FREE_DESIGN_HREF, HOME_REVIEWS, SHOWROOMS } from '~/lib/home/home-content';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Every review is from a real Express Kitchens order. 4.5 out of 5 from 360+ Google reviews across Connecticut.',
};

export default async function Reviews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <PageBreadcrumbs
        breadcrumbs={[
          { label: 'Inspiration', href: '/inspiration' },
          { label: 'Reviews', href: '/reviews' },
        ]}
      />
      <PageHero
        actions={[
          { label: 'Free design consult', href: FREE_DESIGN_HREF, primary: true },
          { label: 'Watch the video testimonials', href: '/testimonials' },
        ]}
        description="Every review here came from a real order, and we keep the critical ones too, because a page of nothing but five stars reads as fake. Read what people say about the designers, the delivery, the price and the cabinets themselves, and then decide for yourself."
        imageLabel="A family in their new kitchen"
        kicker="Reviews"
        title="4.5 out of 5, from 360+ Connecticut kitchens"
      />
      <StatsRow
        stats={[
          { value: '4.5 ★', label: 'average rating' },
          { value: '360+', label: 'Google reviews' },
          { value: '6', label: 'showrooms reviewed' },
          { value: '100,000+', label: 'kitchens delivered' },
          { value: '110', label: 'years in Connecticut' },
        ]}
        tint
      />
      <ReviewGrid
        description="Stars, the review, the name and the showroom. Source: Google."
        reviews={HOME_REVIEWS}
        title="What customers say"
      />
      <ClosingBand
        primary={{ label: 'Free design consult', href: FREE_DESIGN_HREF }}
        showrooms={SHOWROOMS}
        tint
        title="Ready to add yours?"
      />
    </>
  );
}
